// Observatory routes (mounted at /api/v1/observatories).
//   GET  /check/:name  — public name availability (ISSUE-05)
//   GET  /             — public list for discovery (PATCH-PIVOT-06, DL-46)
//   POST /             — create the caller's observatory (PP-04, DL-41)

import type { FastifyInstance } from 'fastify';
import {
  isReserved,
  normalizeObservatoryName,
  validateObservatoryNameFormat,
} from '@rai/shared';
import { prisma } from '../lib/prisma.js';
import type { Prisma } from '../../prisma/generated/prisma/client/client.js';
import {
  OBSERVATORY_TYPES,
  type ObservatoryTypeInput,
  isPrismaUniqueViolation,
  validateSocialLinks,
  validateVisualSignature,
} from '../lib/observatory-validation.js';

// Base public fields for discovery — never leaks private columns.
const PUBLIC_LIST_SELECT = {
  id: true,
  name: true,
  displayName: true,
  type: true,
  domainIds: true,
  visualSignature: true,
  reputationScore: true,
  publicationsCount: true,
} as const;

const PUBLIC_LIST_LIMIT = 500;

export default async function observatoriesRoutes(server: FastifyInstance) {
  // GET /check/:name — availability.
  server.get<{ Params: { name: string } }>(
    '/check/:name',
    { preHandler: server.observatoryRateLimit },
    async (request, reply) => {
      const normalized = normalizeObservatoryName(request.params.name);

      const formatCheck = validateObservatoryNameFormat(normalized);
      // Narrow via `in`: the `reason` property only exists on the invalid
      // variant of the discriminated union, so this is semantically equal
      // to `!formatCheck.valid` but narrows reliably across TS configs.
      if ('reason' in formatCheck) {
        reply.status(400).send({ available: false, reason: formatCheck.reason });
        return;
      }

      if (isReserved(normalized)) {
        reply.status(400).send({ available: false, reason: 'reserved' });
        return;
      }

      const existing = await prisma.observatory.findUnique({
        where: { name: normalized },
        select: { id: true },
      });
      if (existing) {
        reply.status(409).send({ available: false, reason: 'taken' });
        return;
      }

      return { available: true };
    },
  );

  // GET / — public list for the Explore graph (PATCH-PIVOT-06, DL-46).
  // No auth: public discovery. Only publicMode observatories, base fields
  // only, capped. Rate-limited via the existing observatory limiter.
  server.get(
    '/',
    { preHandler: server.observatoryRateLimit },
    async () => {
      const observatories = await prisma.observatory.findMany({
        where: { publicMode: true },
        select: PUBLIC_LIST_SELECT,
        orderBy: [{ reputationScore: 'desc' }, { createdAt: 'asc' }],
        take: PUBLIC_LIST_LIMIT,
      });
      return { observatories };
    },
  );

  // POST / — create (PATCH-PIVOT-04, DL-41). Defined below; function
  // declarations hoist, so the same registered plugin wires all routes.
  await observatoryCreateRoutes(server);
}

// ---------------------------------------------------------------------------
// Observatory create (PATCH-PIVOT-04, DL-41).
//
// POST /api/v1/observatories   (auth required — same context as /api/me)
//   201 { id, name, displayName, type, publicMode, domainIds, bio,
//         socialLinks, visualSignature }
//   400 { error, field?, reason? }   validation failure
//   401 { error }                    no session
//   409 { error, reason: 'already_exists' | 'taken' }
//   429                              rate limited (10/min/IP)
//
// Persists BASE FIELDS ONLY — the studio's board, photos, and `world`
// choice are local drafts until the content model and storage provider
// land (DL-39/DL-42). No schema change: every column pre-exists.
// One-per-user is enforced twice: the handler guard below and the
// `Observatory.userId @unique` DB backstop (P2002 → 409). No credit cost.
// ---------------------------------------------------------------------------

interface CreateObservatoryBody {
  name?: unknown;
  displayName?: unknown;
  type?: unknown;
  bio?: unknown;
  domainIds?: unknown;
  socialLinks?: unknown;
  visualSignature?: unknown;
  publicMode?: unknown;
}

export async function observatoryCreateRoutes(server: FastifyInstance) {
  server.post<{ Body: CreateObservatoryBody }>(
    '/',
    { preHandler: [server.requireAuth, server.observatoryCreateRateLimit] },
    async (request, reply) => {
      const userId = request.user?.id;
      if (!userId) {
        reply.status(401).send({ error: 'Unauthorized' });
        return;
      }

      // One-per-user, handler guard (DB @unique is the backstop below).
      const existing = await prisma.observatory.findUnique({
        where: { userId },
        select: { id: true },
      });
      if (existing) {
        reply.status(409).send({
          error: 'You already have an observatory',
          reason: 'already_exists',
        });
        return;
      }

      const body = request.body ?? {};

      // name — shared normalize/validate/reserved (ISSUE-05 utilities).
      if (typeof body.name !== 'string') {
        reply.status(400).send({ error: 'name is required', field: 'name' });
        return;
      }
      const name = normalizeObservatoryName(body.name);
      const formatCheck = validateObservatoryNameFormat(name);
      if ('reason' in formatCheck) {
        reply
          .status(400)
          .send({ error: 'Invalid observatory name', field: 'name', reason: formatCheck.reason });
        return;
      }
      if (isReserved(name)) {
        reply
          .status(400)
          .send({ error: 'This name is reserved', field: 'name', reason: 'reserved' });
        return;
      }
      const taken = await prisma.observatory.findUnique({
        where: { name },
        select: { id: true },
      });
      if (taken) {
        reply
          .status(409)
          .send({ error: 'This name is already taken', field: 'name', reason: 'taken' });
        return;
      }

      // displayName
      if (
        typeof body.displayName !== 'string' ||
        body.displayName.trim().length === 0 ||
        body.displayName.trim().length > 60
      ) {
        reply
          .status(400)
          .send({ error: 'displayName is required (1–60 chars)', field: 'displayName' });
        return;
      }
      const displayName = body.displayName.trim();

      // type
      if (
        typeof body.type !== 'string' ||
        !OBSERVATORY_TYPES.includes(body.type as ObservatoryTypeInput)
      ) {
        reply
          .status(400)
          .send({ error: 'type must be individual, studio, or product', field: 'type' });
        return;
      }
      const type = body.type as ObservatoryTypeInput;

      // bio (optional, ≤160)
      let bio: string | null = null;
      if (body.bio !== undefined && body.bio !== null) {
        if (typeof body.bio !== 'string' || body.bio.length > 160) {
          reply.status(400).send({ error: 'bio must be at most 160 characters', field: 'bio' });
          return;
        }
        bio = body.bio;
      }

      // domainIds (optional, 0–2, each an existing ACTIVE domain)
      let domainIds: string[] = [];
      if (body.domainIds !== undefined && body.domainIds !== null) {
        if (
          !Array.isArray(body.domainIds) ||
          body.domainIds.length > 2 ||
          !body.domainIds.every((id) => typeof id === 'string')
        ) {
          reply
            .status(400)
            .send({ error: 'domainIds must be up to 2 domain ids', field: 'domainIds' });
          return;
        }
        domainIds = [...new Set(body.domainIds as string[])];
        if (domainIds.length > 0) {
          const found = await prisma.domain.findMany({
            where: { id: { in: domainIds }, active: true },
            select: { id: true },
          });
          if (found.length !== domainIds.length) {
            reply.status(400).send({
              error: 'domainIds must reference active domains',
              field: 'domainIds',
            });
            return;
          }
        }
      }

      // socialLinks (optional, known keys only, url/email shape)
      let socialLinks: Record<string, string> | null = null;
      if (body.socialLinks !== undefined && body.socialLinks !== null) {
        const result = validateSocialLinks(body.socialLinks);
        if ('error' in result) {
          reply.status(400).send({ error: result.error, field: 'socialLinks' });
          return;
        }
        socialLinks = Object.keys(result.links).length > 0 ? result.links : null;
      }

      // visualSignature (optional)
      let visualSignature: Record<string, unknown> | null = null;
      if (body.visualSignature !== undefined && body.visualSignature !== null) {
        const sigError = validateVisualSignature(body.visualSignature);
        if (sigError) {
          reply.status(400).send({ error: sigError, field: 'visualSignature' });
          return;
        }
        visualSignature = body.visualSignature as Record<string, unknown>;
      }

      // publicMode (optional, default true)
      let publicMode = true;
      if (body.publicMode !== undefined && body.publicMode !== null) {
        if (typeof body.publicMode !== 'boolean') {
          reply
            .status(400)
            .send({ error: 'publicMode must be a boolean', field: 'publicMode' });
          return;
        }
        publicMode = body.publicMode;
      }

      try {
        const created = await prisma.observatory.create({
          data: {
            userId,
            name,
            displayName,
            type,
            publicMode,
            domainIds,
            bio,
            socialLinks: socialLinks ?? undefined,
            visualSignature: (visualSignature as Prisma.InputJsonValue | null) ?? undefined,
          },
          select: {
            id: true,
            name: true,
            displayName: true,
            type: true,
            publicMode: true,
            domainIds: true,
            bio: true,
            socialLinks: true,
            visualSignature: true,
          },
        });
        reply.status(201).send(created);
      } catch (err) {
        // DB backstops: userId @unique (raced double-create) and
        // name @unique (raced name claim) both surface as P2002.
        const unique = isPrismaUniqueViolation(err);
        if (unique) {
          if (unique.target.includes('userId')) {
            reply.status(409).send({
              error: 'You already have an observatory',
              reason: 'already_exists',
            });
            return;
          }
          reply
            .status(409)
            .send({ error: 'This name is already taken', field: 'name', reason: 'taken' });
          return;
        }
        throw err;
      }
    },
  );
}

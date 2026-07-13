// Observatory routes (mounted at /api/v1/observatories) — API v2 core
// (GENESIS R-01).
//   GET  /check/:name   — public name availability (unchanged)
//   GET  /              — public GRAPH LIST: visibility=public only, no content
//   GET  /by-name/:name — resolve a world for its public page (/@name)
//   POST /              — create the caller's world (always unpublished)

import type { FastifyInstance, FastifyRequest } from 'fastify';
import { fromNodeHeaders } from 'better-auth/node';
import {
  isReserved,
  normalizeObservatoryName,
  validateObservatoryNameFormat,
} from '@rai/shared';
import { auth } from '../lib/auth.js';
import { prisma } from '../lib/prisma.js';
import type { Prisma } from '../../prisma/generated/prisma/client/client.js';
import {
  OBSERVATORY_TYPES,
  type ObservatoryTypeInput,
  isPrismaUniqueViolation,
  validateContent,
  validateSocialLinks,
  validateVisualSignature,
} from '../lib/observatory-validation.js';

// Graph-list fields (R-01 §4): identity + signature + freshness only —
// never content, never private columns.
const GRAPH_LIST_SELECT = {
  id: true,
  name: true,
  displayName: true,
  type: true,
  visualSignature: true,
  publishedAt: true,
  updatedAt: true,
} as const;

const GRAPH_LIST_LIMIT = 500;

// The full world as its public page renders it (by-name). userId is
// selected for the owner check only and is stripped before send.
const WORLD_SELECT = {
  id: true,
  userId: true,
  name: true,
  displayName: true,
  type: true,
  visibility: true,
  content: true,
  visualSignature: true,
  bio: true,
  socialLinks: true,
  publishedAt: true,
  createdAt: true,
  updatedAt: true,
} as const;

// Resolve the caller's user id if a session cookie is present; null
// otherwise. The optional-auth counterpart of the auth-guard plugin's
// requireAuth (same Better Auth session lookup, no 401).
async function optionalUserId(request: FastifyRequest): Promise<string | null> {
  try {
    const session = await auth.api.getSession({
      headers: fromNodeHeaders(request.headers),
    });
    return session?.user?.id ?? null;
  } catch {
    return null;
  }
}

export default async function observatoriesRoutes(server: FastifyInstance) {
  // GET /check/:name — availability (unchanged from ISSUE-05).
  server.get<{ Params: { name: string } }>(
    '/check/:name',
    { preHandler: server.observatoryRateLimit },
    async (request, reply) => {
      const normalized = normalizeObservatoryName(request.params.name);

      const formatCheck = validateObservatoryNameFormat(normalized);
      // Narrow via `in`: the `reason` property only exists on the invalid
      // variant of the discriminated union.
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

  // GET / — the public graph list (R-01 §4). ONLY public worlds, no
  // content. Feeds the Explore universe.
  server.get(
    '/',
    { preHandler: server.observatoryRateLimit },
    async () => {
      const observatories = await prisma.observatory.findMany({
        where: { visibility: 'public' },
        select: GRAPH_LIST_SELECT,
        orderBy: { createdAt: 'asc' },
        take: GRAPH_LIST_LIMIT,
      });
      return { observatories };
    },
  );

  // GET /by-name/:name — resolve a world for its public page (R-01 §4).
  // Visibility guard:
  //   public | private → 200 for anyone (private is URL-only: it simply
  //                      never appears on the graph list above)
  //   unpublished      → 200 ONLY for the authenticated owner, else 404
  //                      (404, not 403 — existence is not disclosed)
  server.get<{ Params: { name: string } }>(
    '/by-name/:name',
    { preHandler: server.observatoryRateLimit },
    async (request, reply) => {
      const name = normalizeObservatoryName(request.params.name);
      const row = await prisma.observatory.findUnique({
        where: { name },
        select: WORLD_SELECT,
      });
      if (!row) {
        reply.status(404).send({ error: 'No such world' });
        return;
      }
      // userId never leaves the server — split it off the payload here
      // and use it only for the unpublished owner check.
      const { userId: ownerId, ...world } = row;
      if (world.visibility === 'unpublished') {
        const viewerId = await optionalUserId(request);
        if (!viewerId || viewerId !== ownerId) {
          reply.status(404).send({ error: 'No such world' });
          return;
        }
      }
      return { observatory: world };
    },
  );

  await observatoryCreateRoutes(server);
}

// ---------------------------------------------------------------------------
// Observatory create (DL-41, evolved at GENESIS R-01).
//
// POST /api/v1/observatories   (auth required — same context as /api/me)
//   201 { id, name, displayName, type, visibility, content, bio,
//         socialLinks, visualSignature, publishedAt, createdAt, updatedAt }
//   400 { error, field?, reason? }   validation failure
//   401 { error }                    no session
//   409 { error, reason: 'already_exists' | 'taken' }
//   429                              rate limited (10/min/IP)
//
// R-01 contract: every world is created `unpublished` — client-sent
// visibility is IGNORED. Optional `content` (the studio board) is
// validated + cleaned per observatory-validation caps. One-per-user is
// enforced twice: the handler guard and the `userId @unique` DB backstop.
// ---------------------------------------------------------------------------

interface CreateObservatoryBody {
  name?: unknown;
  displayName?: unknown;
  type?: unknown;
  bio?: unknown;
  socialLinks?: unknown;
  visualSignature?: unknown;
  content?: unknown;
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

      // content (optional — the studio board; validated + cleaned, R-01 §2.5)
      let content: Prisma.InputJsonValue | undefined;
      if (body.content !== undefined && body.content !== null) {
        const result = validateContent(body.content);
        if ('error' in result) {
          reply.status(400).send({ error: result.error, field: 'content' });
          return;
        }
        content = result.blocks as unknown as Prisma.InputJsonValue;
      }

      try {
        const created = await prisma.observatory.create({
          data: {
            userId,
            name,
            displayName,
            type,
            // R-01 contract: worlds are born unpublished; publishing is a
            // deliberate PATCH from the dashboard. Client-sent visibility
            // is ignored by design.
            visibility: 'unpublished',
            bio,
            socialLinks: socialLinks ?? undefined,
            visualSignature: (visualSignature as Prisma.InputJsonValue | null) ?? undefined,
            content,
          },
          select: {
            id: true,
            name: true,
            displayName: true,
            type: true,
            visibility: true,
            content: true,
            bio: true,
            socialLinks: true,
            visualSignature: true,
            publishedAt: true,
            createdAt: true,
            updatedAt: true,
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

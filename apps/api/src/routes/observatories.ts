// Observatory name availability check.
// Public endpoint — no auth required. Rate limited to 30 req/min per IP.
//
// GET /api/v1/observatories/check/:name
//   200 { available: true }
//   400 { available: false, reason: 'invalid_length' | 'invalid_format' | 'reserved' }
//   409 { available: false, reason: 'taken' }
//   429 { error, retryAfter }    (from rate-limit plugin)

import type { FastifyInstance } from 'fastify';
import {
  isReserved,
  normalizeObservatoryName,
  validateObservatoryNameFormat,
} from '@rai/shared';
import { prisma } from '../lib/prisma.js';
import type { Prisma } from '../../prisma/generated/prisma/client/client.js';

export default async function observatoriesRoutes(server: FastifyInstance) {
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

  // POST / — create (PATCH-PIVOT-04, DL-41). Defined below; function
  // declarations hoist, so the same registered plugin wires both.
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

const OBSERVATORY_TYPES = ['individual', 'studio', 'product'] as const;
type ObservatoryTypeInput = (typeof OBSERVATORY_TYPES)[number];

const SOCIAL_KEYS = ['github', 'x', 'telegram', 'linkedin', 'email', 'website'] as const;

const AMBIENT_EFFECTS = ['glow', 'pulse', 'static', 'drift'];
const SURFACE_STYLES = ['smooth', 'grain', 'mesh', 'void'];
const NODE_STYLES = ['point', 'ring', 'pulse', 'cross'];
const HEX_COLOR = /^#(?:[0-9a-f]{3}|[0-9a-f]{6}|[0-9a-f]{8})$/i;
const EMAIL_SHAPE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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

function isValidHttpUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

// Validates the VisualSignature shape (mirrors @rai/shared
// types/visual-signature.ts). Returns an error string or null.
function validateVisualSignature(value: unknown): string | null {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    return 'visualSignature must be an object';
  }
  const sig = value as Record<string, unknown>;
  for (const key of ['primaryColor', 'secondaryColor', 'accentColor']) {
    if (typeof sig[key] !== 'string' || !HEX_COLOR.test(sig[key] as string)) {
      return `visualSignature.${key} must be a hex color`;
    }
  }
  const angle = sig.gradientAngle;
  if (typeof angle !== 'number' || !Number.isFinite(angle) || angle < 0 || angle > 360) {
    return 'visualSignature.gradientAngle must be a number between 0 and 360';
  }
  const intensity = sig.effectIntensity;
  if (
    typeof intensity !== 'number' ||
    !Number.isFinite(intensity) ||
    intensity < 0 ||
    intensity > 1
  ) {
    return 'visualSignature.effectIntensity must be a number between 0 and 1';
  }
  if (typeof sig.ambientEffect !== 'string' || !AMBIENT_EFFECTS.includes(sig.ambientEffect)) {
    return 'visualSignature.ambientEffect is invalid';
  }
  if (typeof sig.surfaceStyle !== 'string' || !SURFACE_STYLES.includes(sig.surfaceStyle)) {
    return 'visualSignature.surfaceStyle is invalid';
  }
  if (typeof sig.nodeStyle !== 'string' || !NODE_STYLES.includes(sig.nodeStyle)) {
    return 'visualSignature.nodeStyle is invalid';
  }
  return null;
}

function isPrismaUniqueViolation(err: unknown): { target: string } | null {
  if (typeof err !== 'object' || err === null) return null;
  const maybe = err as { code?: unknown; meta?: { target?: unknown } };
  if (maybe.code !== 'P2002') return null;
  const target = maybe.meta?.target;
  if (Array.isArray(target)) return { target: target.join(',') };
  if (typeof target === 'string') return { target };
  return { target: '' };
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
        if (typeof body.socialLinks !== 'object' || Array.isArray(body.socialLinks)) {
          reply
            .status(400)
            .send({ error: 'socialLinks must be an object', field: 'socialLinks' });
          return;
        }
        const links: Record<string, string> = {};
        for (const [key, value] of Object.entries(body.socialLinks as Record<string, unknown>)) {
          if (!(SOCIAL_KEYS as readonly string[]).includes(key)) {
            reply
              .status(400)
              .send({ error: `Unknown social link: ${key}`, field: 'socialLinks' });
            return;
          }
          if (typeof value !== 'string' || value.length === 0) continue;
          if (key === 'email') {
            if (!EMAIL_SHAPE.test(value)) {
              reply
                .status(400)
                .send({ error: 'socialLinks.email must be an email', field: 'socialLinks' });
              return;
            }
          } else if (!isValidHttpUrl(value)) {
            reply
              .status(400)
              .send({ error: `socialLinks.${key} must be a URL`, field: 'socialLinks' });
            return;
          }
          links[key] = value;
        }
        socialLinks = Object.keys(links).length > 0 ? links : null;
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

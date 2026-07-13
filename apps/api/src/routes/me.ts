// Protected user + owner-observatory endpoints.
//   GET   /api/me                  — account summary (observatory {id,name}|null)
//   GET   /api/v1/me/observatory   — the caller's full world or 404 (DL-47, R-01 shape)
//   PATCH /api/v1/me/observatory   — update base fields + visibility + content;
//                                    `name` immutable (DL-47, GENESIS R-01)

import type { FastifyInstance } from 'fastify';
import { prisma } from '../lib/prisma.js';
// Value import: `Prisma.DbNull` is a runtime value (used to clear JSON
// columns), alongside the `Prisma.*` types.
import { Prisma } from '../../prisma/generated/prisma/client/client.js';
import { normalizeObservatoryName } from '@rai/shared';
import {
  OBSERVATORY_TYPES,
  OBSERVATORY_VISIBILITIES,
  type ObservatoryTypeInput,
  type ObservatoryVisibilityInput,
  validateContent,
  validateSocialLinks,
  validateVisualSignature,
} from '../lib/observatory-validation.js';

// Full owner shape (Dashboard, DL-47 — evolved at R-01: visibility,
// content, publishedAt, updatedAt; the retired v1 fields are gone).
const OWNER_SELECT = {
  id: true,
  name: true,
  displayName: true,
  type: true,
  visibility: true,
  content: true,
  bio: true,
  socialLinks: true,
  visualSignature: true,
  reputationScore: true,
  publicationsCount: true,
  publishedAt: true,
  createdAt: true,
  updatedAt: true,
} as const;

interface PatchObservatoryBody {
  name?: unknown;
  displayName?: unknown;
  type?: unknown;
  bio?: unknown;
  socialLinks?: unknown;
  visualSignature?: unknown;
  visibility?: unknown;
  content?: unknown;
}

export default async function meRoutes(server: FastifyInstance) {
  server.get('/api/me', { preHandler: server.requireAuth }, async (request, reply) => {
    const userId = request.user?.id;
    if (!userId) {
      reply.status(401).send({ error: 'Unauthorized' });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        planTier: true,
        creditsBalance: true,
        createdAt: true,
        observatory: {
          select: { id: true, name: true },
        },
      },
    });

    if (!user) {
      reply.status(404).send({ error: 'User not found' });
      return;
    }

    return {
      ...user,
      observatory: user.observatory ?? null,
    };
  });

  // GET /api/v1/me/observatory — the caller's full world (DL-47/R-01).
  server.get(
    '/api/v1/me/observatory',
    { preHandler: server.requireAuth },
    async (request, reply) => {
      const userId = request.user?.id;
      if (!userId) {
        reply.status(401).send({ error: 'Unauthorized' });
        return;
      }
      const observatory = await prisma.observatory.findUnique({
        where: { userId },
        select: OWNER_SELECT,
      });
      if (!observatory) {
        reply.status(404).send({ error: 'No observatory', reason: 'none' });
        return;
      }
      return { observatory };
    },
  );

  // PATCH /api/v1/me/observatory — update base fields, visibility
  // transitions, and content replacement (DL-47, R-01).
  // `name` is immutable post-creation; validation mirrors the create route.
  server.patch<{ Body: PatchObservatoryBody }>(
    '/api/v1/me/observatory',
    { preHandler: [server.requireAuth, server.observatoryRateLimit] },
    async (request, reply) => {
      const userId = request.user?.id;
      if (!userId) {
        reply.status(401).send({ error: 'Unauthorized' });
        return;
      }

      const existing = await prisma.observatory.findUnique({
        where: { userId },
        select: { id: true, name: true, visibility: true, publishedAt: true },
      });
      if (!existing) {
        reply.status(404).send({ error: 'No observatory', reason: 'none' });
        return;
      }

      const body = request.body ?? {};
      const data: Prisma.ObservatoryUpdateInput = {};

      // name is immutable — reject any attempt to change it.
      if (body.name !== undefined && body.name !== null) {
        const requested =
          typeof body.name === 'string' ? normalizeObservatoryName(body.name) : '';
        if (requested !== existing.name) {
          reply.status(400).send({
            error: 'name cannot be changed',
            field: 'name',
            reason: 'immutable',
          });
          return;
        }
      }

      if (body.displayName !== undefined) {
        if (
          typeof body.displayName !== 'string' ||
          body.displayName.trim().length === 0 ||
          body.displayName.trim().length > 60
        ) {
          reply
            .status(400)
            .send({ error: 'displayName must be 1–60 chars', field: 'displayName' });
          return;
        }
        data.displayName = body.displayName.trim();
      }

      if (body.type !== undefined) {
        if (
          typeof body.type !== 'string' ||
          !OBSERVATORY_TYPES.includes(body.type as ObservatoryTypeInput)
        ) {
          reply
            .status(400)
            .send({ error: 'type must be individual, studio, or product', field: 'type' });
          return;
        }
        data.type = body.type as ObservatoryTypeInput;
      }

      if (body.bio !== undefined) {
        if (body.bio === null || body.bio === '') {
          data.bio = null;
        } else if (typeof body.bio !== 'string' || body.bio.length > 160) {
          reply.status(400).send({ error: 'bio must be at most 160 characters', field: 'bio' });
          return;
        } else {
          data.bio = body.bio;
        }
      }

      if (body.socialLinks !== undefined) {
        if (body.socialLinks === null) {
          data.socialLinks = Prisma.DbNull;
        } else {
          const result = validateSocialLinks(body.socialLinks);
          if ('error' in result) {
            reply.status(400).send({ error: result.error, field: 'socialLinks' });
            return;
          }
          data.socialLinks = Object.keys(result.links).length > 0 ? result.links : Prisma.DbNull;
        }
      }

      if (body.visualSignature !== undefined) {
        if (body.visualSignature === null) {
          data.visualSignature = Prisma.DbNull;
        } else {
          const sigError = validateVisualSignature(body.visualSignature);
          if (sigError) {
            reply.status(400).send({ error: sigError, field: 'visualSignature' });
            return;
          }
          data.visualSignature = body.visualSignature as Prisma.InputJsonValue;
        }
      }

      // visibility transition (R-01 §4). publishedAt is stamped on the
      // FIRST transition to public and never reset afterwards.
      if (body.visibility !== undefined) {
        if (
          typeof body.visibility !== 'string' ||
          !OBSERVATORY_VISIBILITIES.includes(body.visibility as ObservatoryVisibilityInput)
        ) {
          reply.status(400).send({
            error: 'visibility must be unpublished, private, or public',
            field: 'visibility',
          });
          return;
        }
        const next = body.visibility as ObservatoryVisibilityInput;
        data.visibility = next;
        if (next === 'public' && existing.publishedAt === null) {
          data.publishedAt = new Date();
        }
      }

      // content replacement (R-01 §4) — validated + cleaned; null clears.
      if (body.content !== undefined) {
        if (body.content === null) {
          data.content = Prisma.DbNull;
        } else {
          const result = validateContent(body.content);
          if ('error' in result) {
            reply.status(400).send({ error: result.error, field: 'content' });
            return;
          }
          data.content = result.blocks as unknown as Prisma.InputJsonValue;
        }
      }

      const updated = await prisma.observatory.update({
        where: { userId },
        data,
        select: OWNER_SELECT,
      });
      return { observatory: updated };
    },
  );
}

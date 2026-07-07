// Protected user + owner-observatory endpoints.
//   GET   /api/me                  — account summary (observatory {id,name}|null)
//   GET   /api/v1/me/observatory   — the caller's full observatory or 404 (DL-47)
//   PATCH /api/v1/me/observatory   — update base fields; `name` immutable (DL-47)

import type { FastifyInstance } from 'fastify';
import { prisma } from '../lib/prisma.js';
// Value import: `Prisma.DbNull` is a runtime value (used to clear JSON
// columns), alongside the `Prisma.*` types.
import { Prisma } from '../../prisma/generated/prisma/client/client.js';
import { normalizeObservatoryName } from '@rai/shared';
import {
  OBSERVATORY_TYPES,
  type ObservatoryTypeInput,
  validateSocialLinks,
  validateVisualSignature,
} from '../lib/observatory-validation.js';

// Full base fields returned to the owner (Dashboard, DL-47).
const OWNER_SELECT = {
  id: true,
  name: true,
  displayName: true,
  type: true,
  publicMode: true,
  domainIds: true,
  bio: true,
  socialLinks: true,
  visualSignature: true,
  reputationScore: true,
  publicationsCount: true,
  createdAt: true,
} as const;

interface PatchObservatoryBody {
  name?: unknown;
  displayName?: unknown;
  type?: unknown;
  bio?: unknown;
  domainIds?: unknown;
  socialLinks?: unknown;
  visualSignature?: unknown;
  publicMode?: unknown;
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

  // GET /api/v1/me/observatory — the caller's full observatory (DL-47).
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

  // PATCH /api/v1/me/observatory — update base fields (DL-47).
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
        select: { id: true, name: true },
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

      if (body.domainIds !== undefined) {
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
        const domainIds = [...new Set(body.domainIds as string[])];
        if (domainIds.length > 0) {
          const found = await prisma.domain.findMany({
            where: { id: { in: domainIds }, active: true },
            select: { id: true },
          });
          if (found.length !== domainIds.length) {
            reply
              .status(400)
              .send({ error: 'domainIds must reference active domains', field: 'domainIds' });
            return;
          }
        }
        data.domainIds = domainIds;
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

      if (body.publicMode !== undefined) {
        if (typeof body.publicMode !== 'boolean') {
          reply.status(400).send({ error: 'publicMode must be a boolean', field: 'publicMode' });
          return;
        }
        data.publicMode = body.publicMode;
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

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

export default async function observatoriesRoutes(server: FastifyInstance) {
  server.get<{ Params: { name: string } }>(
    '/check/:name',
    { preHandler: server.observatoryRateLimit },
    async (request, reply) => {
      const normalized = normalizeObservatoryName(request.params.name);

      const formatCheck = validateObservatoryNameFormat(normalized);
      if (!formatCheck.valid) {
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
}

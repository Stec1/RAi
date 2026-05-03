// Public Domains list — used by the intelligence topology on /explore.
// Read-only, no auth, no rate limit. Mirrors the simplicity of routes/health.ts.
//
// GET /api/v1/domains
//   200 { domains: Domain[] }
//
// Returns all 7 seeded Domains. The shape projected here matches the shared
// Domain type in packages/shared/src/types/domain.ts exactly.

import type { FastifyInstance } from 'fastify';
import { prisma } from '../lib/prisma.js';

export default async function domainsRoutes(server: FastifyInstance) {
  server.get('/', async () => {
    const domains = await prisma.domain.findMany({
      orderBy: { name: 'asc' },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        theme: true,
        positionX: true,
        positionY: true,
        active: true,
        createdAt: true,
      },
    });

    return { domains };
  });
}

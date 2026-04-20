// Protected user profile endpoint.
// Returns the authenticated user's basic account information.

import type { FastifyInstance } from 'fastify';
import { prisma } from '../lib/prisma.js';

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
}

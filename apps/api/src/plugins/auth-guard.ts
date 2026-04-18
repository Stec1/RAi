// Auth guard — decorates the Fastify instance with `requireAuth` preHandler.
// Usage:
//   server.get('/api/me', { preHandler: server.requireAuth }, handler)

import fp from 'fastify-plugin';
import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { fromNodeHeaders } from 'better-auth/node';
import { auth } from '../lib/auth.js';

declare module 'fastify' {
  interface FastifyRequest {
    user?: { id: string; email: string; name: string };
  }
  interface FastifyInstance {
    requireAuth: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
  }
}

async function authGuard(server: FastifyInstance) {
  server.decorate('requireAuth', async function requireAuth(request: FastifyRequest, reply: FastifyReply) {
    const session = await auth.api.getSession({
      headers: fromNodeHeaders(request.headers),
    });

    if (!session?.user) {
      reply.status(401).send({ error: 'Unauthorized' });
      return;
    }

    request.user = {
      id: session.user.id,
      email: session.user.email,
      name: session.user.name,
    };
  });
}

export default fp(authGuard, { name: 'auth-guard' });

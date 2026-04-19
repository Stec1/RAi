// Better Auth handler mounted at /api/auth/*
// Supports sign-up/email, sign-in/email, sign-out, get-session, etc.

import type { FastifyInstance } from 'fastify';
import { fromNodeHeaders } from 'better-auth/node';
import { auth } from '../lib/auth.js';

// Structural type to avoid environment-specific narrowing of the global
// Fetch `Response` / `Request` (e.g. some @types/node resolutions collapse
// them to `{}` when DOM-like globals are present).
type FetchLike = {
  status: number;
  headers: { forEach(cb: (value: string, key: string) => void): void };
  body: unknown;
  text(): Promise<string>;
};

export default async function authRoutes(server: FastifyInstance) {
  server.route({
    method: ['GET', 'POST'],
    url: '/api/auth/*',
    async handler(request, reply) {
      try {
        const url = new URL(request.url, `http://${request.headers.host}`);
        const headers = fromNodeHeaders(request.headers);
        const req = new Request(url.toString(), {
          method: request.method,
          headers,
          ...(request.body ? { body: JSON.stringify(request.body) } : {}),
        });

        const response = (await auth.handler(req)) as unknown as FetchLike;
        reply.status(response.status);
        response.headers.forEach((value, key) => {
          reply.header(key, value);
        });
        reply.send(response.body ? await response.text() : null);
      } catch (error) {
        server.log.error({ err: error }, 'auth handler error');
        reply.status(500).send({ error: 'Internal authentication error' });
      }
    },
  });
}

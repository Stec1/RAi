import type { FastifyInstance } from 'fastify';

export default async function healthRoutes(server: FastifyInstance) {
  server.get('/api/health', async (_request, _reply) => {
    return { status: 'ok', timestamp: new Date().toISOString() };
  });
}

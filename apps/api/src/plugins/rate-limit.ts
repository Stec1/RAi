// Redis-backed sliding window rate limiter for auth endpoints.
// Key format:  rl:auth:{ip}
// Limit:       5 requests per 60 seconds per IP
// On exceed:   429 { error, retryAfter }

import fp from 'fastify-plugin';
import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { redis } from '../lib/redis.js';

const WINDOW_SECONDS = 60;
const MAX_REQUESTS = 5;

async function checkRateLimit(ip: string): Promise<{ allowed: boolean; retryAfter: number }> {
  const now = Date.now();
  const key = `rl:auth:${ip}`;
  const windowStart = now - WINDOW_SECONDS * 1000;

  // Sliding-window via sorted set: score = timestamp, member = unique token
  const pipeline = redis.multi();
  pipeline.zremrangebyscore(key, 0, windowStart);
  pipeline.zadd(key, now, `${now}-${Math.random()}`);
  pipeline.zcard(key);
  pipeline.expire(key, WINDOW_SECONDS);
  const results = await pipeline.exec();

  if (!results) {
    return { allowed: true, retryAfter: 0 };
  }

  const count = results[2]?.[1] as number;
  if (typeof count === 'number' && count > MAX_REQUESTS) {
    // Look up the oldest entry in the window to calculate retryAfter.
    const oldest = await redis.zrange(key, 0, 0, 'WITHSCORES');
    const oldestScore = oldest.length >= 2 ? Number(oldest[1]) : now;
    const retryAfter = Math.max(1, Math.ceil((oldestScore + WINDOW_SECONDS * 1000 - now) / 1000));
    return { allowed: false, retryAfter };
  }

  return { allowed: true, retryAfter: 0 };
}

async function rateLimitPlugin(server: FastifyInstance) {
  server.decorate('authRateLimit', async function authRateLimit(request: FastifyRequest, reply: FastifyReply) {
    const ip = request.ip;
    const { allowed, retryAfter } = await checkRateLimit(ip);

    if (!allowed) {
      reply.header('Retry-After', String(retryAfter));
      reply.status(429).send({ error: 'Too many requests', retryAfter });
      return;
    }
  });

  // Apply as onRequest hook only for auth routes (path starts with /api/auth/)
  server.addHook('onRequest', async (request, reply) => {
    if (request.url.startsWith('/api/auth/')) {
      await server.authRateLimit(request, reply);
    }
  });
}

declare module 'fastify' {
  interface FastifyInstance {
    authRateLimit: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
  }
}

export default fp(rateLimitPlugin, { name: 'rate-limit' });

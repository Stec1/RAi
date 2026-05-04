// Redis-backed sliding-window rate limiter.
// Key format:  rl:{scope}:{ip}
// Scopes:
//   auth         — 5 req / 60s per IP (applied to /api/auth/*)
//   observatory  — 30 req / 60s per IP (applied per-route via preHandler)
// On exceed:   429 { error, retryAfter }
//
// Fail-open: if Redis is unreachable (no REDIS_URL on the deploy environment,
// connection lost, ioredis exhausted retries), the rate limiter logs the error
// server-side and allows the request to proceed. This prevents raw ioredis
// "Reached the max retries per request limit" messages from leaking to end
// users on /api/auth/* (signup/login). Better Auth retains its own
// per-account brute-force protections, so failing open here is safe for MVP.

import fp from 'fastify-plugin';
import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { redis } from '../lib/redis.js';

const WINDOW_SECONDS = 60;
const AUTH_MAX = 5;
const OBSERVATORY_MAX = 30;

interface RateLimitDecision {
  allowed: boolean;
  retryAfter: number;
}

async function checkRateLimit(
  scope: string,
  ip: string,
  max: number,
): Promise<RateLimitDecision> {
  const now = Date.now();
  const key = `rl:${scope}:${ip}`;
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
  if (typeof count === 'number' && count > max) {
    // Look up the oldest entry in the window to calculate retryAfter.
    const oldest = await redis.zrange(key, 0, 0, 'WITHSCORES');
    const oldestScore = oldest.length >= 2 ? Number(oldest[1]) : now;
    const retryAfter = Math.max(1, Math.ceil((oldestScore + WINDOW_SECONDS * 1000 - now) / 1000));
    return { allowed: false, retryAfter };
  }

  return { allowed: true, retryAfter: 0 };
}

async function safeCheckRateLimit(
  server: FastifyInstance,
  scope: string,
  ip: string,
  max: number,
): Promise<RateLimitDecision> {
  try {
    return await checkRateLimit(scope, ip, max);
  } catch (err) {
    // Redis unreachable / ioredis retry exhaustion — log and fail open.
    server.log.error(
      { err, scope },
      'rate-limit Redis check failed; allowing request',
    );
    return { allowed: true, retryAfter: 0 };
  }
}

async function rateLimitPlugin(server: FastifyInstance) {
  server.decorate(
    'authRateLimit',
    async function authRateLimit(request: FastifyRequest, reply: FastifyReply) {
      const { allowed, retryAfter } = await safeCheckRateLimit(
        server,
        'auth',
        request.ip,
        AUTH_MAX,
      );
      if (!allowed) {
        reply.header('Retry-After', String(retryAfter));
        reply.status(429).send({ error: 'Too many requests', retryAfter });
      }
    },
  );

  server.decorate(
    'observatoryRateLimit',
    async function observatoryRateLimit(request: FastifyRequest, reply: FastifyReply) {
      const { allowed, retryAfter } = await safeCheckRateLimit(
        server,
        'obs',
        request.ip,
        OBSERVATORY_MAX,
      );
      if (!allowed) {
        reply.header('Retry-After', String(retryAfter));
        reply.status(429).send({ error: 'Too many requests', retryAfter });
      }
    },
  );

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
    observatoryRateLimit: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
  }
}

export default fp(rateLimitPlugin, { name: 'rate-limit' });

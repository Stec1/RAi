// Redis singleton — the only place ioredis client is instantiated.
// Used by rate limiting and (future) BullMQ queues.

import Redis from 'ioredis';

const url = process.env.REDIS_URL;

if (!url) {
  // Fail fast at import time in non-test environments missing REDIS_URL
  // is a configuration error. Tests that don't need Redis should not import this.
  throw new Error('REDIS_URL environment variable is required');
}

export const redis = new Redis(url, {
  maxRetriesPerRequest: 3,
  enableReadyCheck: true,
});

redis.on('error', (err) => {
  // Use console here because lib/logger.ts is not yet in scope for this issue
  console.error('[redis] connection error:', err.message);
});

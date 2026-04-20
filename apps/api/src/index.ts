import Fastify from 'fastify';
import cors from '@fastify/cors';
import healthRoutes from './routes/health.js';
import authRoutes from './routes/auth.js';
import meRoutes from './routes/me.js';
import observatoriesRoutes from './routes/observatories.js';
import authGuard from './plugins/auth-guard.js';
import rateLimit from './plugins/rate-limit.js';

const server = Fastify({
  logger: true,
});

// CORS — cross-origin cookie auth requires credentials + explicit origin.
await server.register(cors, {
  origin: process.env.WEB_URL || 'http://localhost:3000',
  credentials: true,
});

// Plugins (decorate before routes that use them)
await server.register(authGuard);
await server.register(rateLimit);

// Routes
await server.register(healthRoutes);
await server.register(authRoutes);
await server.register(meRoutes);
await server.register(observatoriesRoutes, { prefix: '/api/v1/observatories' });

const start = async () => {
  try {
    const port = Number(process.env.PORT) || 3001;
    await server.listen({ port, host: '0.0.0.0' });
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};

start();

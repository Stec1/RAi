import Fastify from 'fastify';
import healthRoutes from './routes/health.js';

const server = Fastify({
  logger: true,
});

await server.register(healthRoutes);

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

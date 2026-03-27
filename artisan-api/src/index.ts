import 'dotenv/config';
import Fastify from 'fastify';
import cors from '@fastify/cors';
import jwt from '@fastify/jwt';
import rateLimit from '@fastify/rate-limit';

import healthRoutes from './routes/health';
import authRoutes from './routes/auth';

const server = Fastify({ logger: true });

const start = async () => {
  await server.register(cors, { origin: true });

  await server.register(jwt, {
    secret: process.env.JWT_SECRET as string,
  });

  await server.register(rateLimit, {
    max: 100,
    timeWindow: '1 minute',
  });

  server.register(healthRoutes);
  server.register(authRoutes, { prefix: '/auth' });

  const port = Number(process.env.PORT) || 3000;

  await server.listen({ host: '0.0.0.0', port });
  server.log.info(`Server running on port ${port}`);
};

start().catch((err) => {
  console.error(err);
  process.exit(1);
});

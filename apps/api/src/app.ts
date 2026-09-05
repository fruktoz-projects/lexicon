import fastify, { FastifyInstance } from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import prismaPlugin from './plugins/prisma';
import authPlugin from './plugins/auth';
import swaggerPlugin from './plugins/swagger';
import { authRoutes } from './routes/auth.routes';
import { adminRoutes } from './routes/admin.routes';
import { learningPackRoutes } from './routes/learning-pack.routes';
import { practiceRoutes } from './routes/practice.routes';
import { writingRoutes } from './routes/writing.routes';
import { analyticsRoutes } from './routes/analytics.routes';
import { placementRoutes } from './routes/placement.routes';

export async function buildApp(): Promise<FastifyInstance> {
  const app = fastify({
    logger: {
      level: process.env.NODE_ENV === 'test' ? 'silent' : 'info',
    },
  });

  // Global security & CORS
  await app.register(cors, {
    origin: true,
    credentials: true,
  });

  await app.register(helmet, {
    contentSecurityPolicy: false, // relaxed for Swagger & development
  });

  // Core Plugins
  await app.register(prismaPlugin);
  await app.register(authPlugin);
  await app.register(swaggerPlugin);

  // Health check
  app.get('/health', async () => {
    return { status: 'ok', timestamp: new Date().toISOString(), service: 'lexicon-api' };
  });

  // API v1 Routes
  await app.register(authRoutes, { prefix: '/api/v1/auth' });
  await app.register(adminRoutes, { prefix: '/api/v1/admin' });
  await app.register(learningPackRoutes, { prefix: '/api/v1/learning-packs' });
  await app.register(practiceRoutes, { prefix: '/api/v1/practice' });
  await app.register(writingRoutes, { prefix: '/api/v1/writing' });
  await app.register(analyticsRoutes, { prefix: '/api/v1/analytics' });
  await app.register(placementRoutes, { prefix: '/api/v1/placement' });

  return app;
}

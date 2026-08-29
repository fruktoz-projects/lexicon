import { FastifyPluginAsync } from 'fastify';
import { AnalyticsService } from '../services/analytics.service';

export const analyticsRoutes: FastifyPluginAsync = async (fastify) => {
  const analyticsService = new AnalyticsService(fastify.prisma);

  fastify.get('/overview', { preHandler: [fastify.authenticate] }, async (request, reply) => {
    try {
      const overview = await analyticsService.getOverview(request.user.id);
      return reply.send(overview);
    } catch (err: any) {
      return reply.status(500).send({ error: err.message || 'Failed to retrieve analytics' });
    }
  });
};

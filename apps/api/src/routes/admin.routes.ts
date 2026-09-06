import { FastifyPluginAsync } from 'fastify';
import { GeneratePackRequestSchema } from '@lexicon/types';
import { AiGatewayService } from '../services/ai-gateway.service';
import { LearningPackService } from '../services/learning-pack.service';

export const adminRoutes: FastifyPluginAsync = async (fastify) => {
  const aiGateway = new AiGatewayService();
  const packService = new LearningPackService(fastify.prisma);

  const isAdmin = (request: any, reply: any, done: any) => {
    if (request.user?.role !== 'ADMIN') {
      return reply.status(403).send({ error: 'Forbidden: Admin access required' });
    }
    done();
  };

  fastify.post('/generate-pack', { preHandler: [fastify.authenticate, isAdmin] }, async (request, reply) => {
    const parse = GeneratePackRequestSchema.safeParse(request.body);
    if (!parse.success) {
      return reply.status(400).send({ error: 'Validation Error', issues: parse.error.issues });
    }

    try {
      // 1. Generate via AI Gateway
      const generatedDto = await aiGateway.generateLearningPack(parse.data);

      // 2. Persist in database using Prisma transaction
      const pack = await packService.createPackFromDto(generatedDto);

      return reply.status(201).send(pack);
    } catch (err: any) {
      request.log.error(err);
      return reply.status(500).send({ error: err.message || 'Failed to generate pack' });
    }
  });

  fastify.get('/packs', { preHandler: [fastify.authenticate, isAdmin] }, async (request, reply) => {
    try {
      const packs = await packService.listPacks({ limit: 100 });
      return reply.send(packs);
    } catch (err: any) {
      request.log.error(err);
      return reply.status(500).send({ error: err.message || 'Failed to fetch packs' });
    }
  });

  fastify.put('/packs/:id', { preHandler: [fastify.authenticate, isAdmin] }, async (request: any, reply) => {
    try {
      const updated = await packService.updatePack(request.params.id, request.body as any);
      return reply.send(updated);
    } catch (err: any) {
      request.log.error(err);
      return reply.status(500).send({ error: err.message || 'Failed to update pack' });
    }
  });

  fastify.delete('/packs/:id', { preHandler: [fastify.authenticate, isAdmin] }, async (request: any, reply) => {
    try {
      await packService.deletePack(request.params.id);
      return reply.status(204).send();
    } catch (err: any) {
      request.log.error(err);
      return reply.status(500).send({ error: err.message || 'Failed to delete pack' });
    }
  });
};

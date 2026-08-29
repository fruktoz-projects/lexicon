import { FastifyPluginAsync } from 'fastify';
import { LearningPackService } from '../services/learning-pack.service';
import { CreateRemixPackPayload } from '@lexicon/types';

export const learningPackRoutes: FastifyPluginAsync = async (fastify) => {
  const packService = new LearningPackService(fastify.prisma);

  fastify.get('/', { preHandler: [fastify.authenticate] }, async (request, reply) => {
    const { zone, cefr, limit, offset } = request.query as any;

    try {
      const result = await packService.listPacks({
        zone,
        cefr,
        limit: limit ? parseInt(limit, 10) : 50,
        offset: offset ? parseInt(offset, 10) : 0,
      });

      return reply.send(result);
    } catch (err: any) {
      return reply.status(500).send({ error: err.message || 'Failed to list packs' });
    }
  });

  fastify.get('/:id', { preHandler: [fastify.authenticate] }, async (request, reply) => {
    const { id } = request.params as { id: string };

    try {
      const pack = await packService.getPackById(id);
      return reply.send(pack);
    } catch (err: any) {
      return reply.status(404).send({ error: err.message || 'Learning pack not found' });
    }
  });

  // POST /api/v1/learning-packs/remix - Assembles a modular synthesized knowledge remix pack
  fastify.post('/remix', { preHandler: [fastify.authenticate] }, async (request, reply) => {
    const body = request.body as CreateRemixPackPayload;

    try {
      const pack = await packService.createRemixPack(body);
      return reply.status(201).send(pack);
    } catch (err: any) {
      return reply.status(400).send({ error: err.message || 'Failed to create remix pack' });
    }
  });
};

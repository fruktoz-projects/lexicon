import { FastifyPluginAsync } from 'fastify';
import { LearningPackService } from '../services/learning-pack.service';
import { AiGatewayService } from '../services/ai-gateway.service';
import { CreateRemixPackPayload, GeneratePackRequestSchema } from '@lexicon/types';

export const learningPackRoutes: FastifyPluginAsync = async (fastify) => {
  const packService = new LearningPackService(fastify.prisma);
  const aiGateway = new AiGatewayService();

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

  // GET /api/v1/learning-packs/:id/progress - Aggregated progress for a specific pack
  fastify.get('/:id/progress', { preHandler: [fastify.authenticate] }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const userId = request.user.id;

    try {
      const prisma = fastify.prisma;

      // Get all item IDs from this pack
      const [exercises, vocab, chunks] = await Promise.all([
        prisma.exercise.findMany({ where: { packId: id }, select: { id: true } }),
        prisma.vocabularyItem.findMany({ where: { packId: id }, select: { id: true } }),
        prisma.chunk.findMany({ where: { packId: id }, select: { id: true } }),
      ]);

      const allItemIds = [
        ...exercises.map(e => e.id),
        ...vocab.map(v => v.id),
        ...chunks.map(c => c.id),
      ];

      const totalItems = allItemIds.length;

      if (totalItems === 0) {
        return reply.send({ totalItems: 0, practicedCount: 0, masteredCount: 0, completionPercent: 0 });
      }

      // Get progress records for all these items
      const progressRecords = await prisma.userProgress.findMany({
        where: {
          userId,
          itemId: { in: allItemIds },
        },
        select: { itemId: true, srsStage: true, totalAttempts: true },
      });

      const practicedCount = progressRecords.length;
      // "Mastered" = srsStage >= 4 (reviewed correctly at least 4 times)
      const masteredCount = progressRecords.filter(p => p.srsStage >= 4).length;
      const completionPercent = Math.round((practicedCount / totalItems) * 100);

      return reply.send({
        totalItems,
        practicedCount,
        masteredCount,
        completionPercent,
      });
    } catch (err: any) {
      return reply.status(500).send({ error: err.message || 'Failed to get pack progress' });
    }
  });

  // POST /api/v1/learning-packs/generate - AI-powered learning pack generation
  fastify.post('/generate', { preHandler: [fastify.authenticate] }, async (request, reply) => {

    const parse = GeneratePackRequestSchema.safeParse(request.body);
    if (!parse.success) {
      return reply.status(400).send({ error: 'Validation Error', issues: parse.error.issues });
    }

    try {
      const generatedDto = await aiGateway.generateLearningPack({
        topic: parse.data.topic,
        cefr: parse.data.cefr,
        zone: parse.data.zone,
        customFocus: parse.data.customFocus,
      });

      const pack = await packService.createPackFromDto(generatedDto);
      return reply.status(201).send(pack);
    } catch (err: any) {
      return reply.status(500).send({ error: err.message || 'Failed to generate learning pack' });
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

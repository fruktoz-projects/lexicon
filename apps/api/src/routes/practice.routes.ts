import { FastifyPluginAsync } from 'fastify';
import { PracticeSubmitSchema } from '@lexicon/types';
import { SrsPracticeService } from '../services/srs-practice.service';

export const practiceRoutes: FastifyPluginAsync = async (fastify) => {
  const practiceService = new SrsPracticeService(fastify.prisma);

  fastify.get('/session', { preHandler: [fastify.authenticate] }, async (request, reply) => {
    const { limit } = request.query as any;

    try {
      const session = await practiceService.assembleSession(
        request.user.id,
        limit ? parseInt(limit, 10) : 10
      );
      return reply.send(session);
    } catch (err: any) {
      return reply.status(500).send({ error: err.message || 'Failed to assemble session' });
    }
  });

  fastify.post('/submit', { preHandler: [fastify.authenticate] }, async (request, reply) => {
    const parse = PracticeSubmitSchema.safeParse(request.body);
    if (!parse.success) {
      return reply.status(400).send({ error: 'Validation Error', issues: parse.error.issues });
    }

    try {
      const result = await practiceService.submitAnswer({
        userId: request.user.id,
        itemId: parse.data.itemId,
        itemType: parse.data.itemType,
        userAnswer: parse.data.userAnswer,
        helpUsed: parse.data.helpUsed,
      });

      return reply.send(result);
    } catch (err: any) {
      return reply.status(500).send({ error: err.message || 'Failed to submit answer' });
    }
  });
};

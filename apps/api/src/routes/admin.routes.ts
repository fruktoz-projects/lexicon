import { FastifyPluginAsync } from 'fastify';
import { GeneratePackRequestSchema } from '@lexicon/types';
import { AiGatewayService } from '../services/ai-gateway.service';
import { LearningPackService } from '../services/learning-pack.service';

export const adminRoutes: FastifyPluginAsync = async (fastify) => {
  const aiGateway = new AiGatewayService();
  const packService = new LearningPackService(fastify.prisma);

  fastify.post('/generate-pack', { preHandler: [fastify.authenticate] }, async (request, reply) => {
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
};

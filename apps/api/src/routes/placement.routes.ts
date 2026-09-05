import { FastifyPluginAsync } from 'fastify';
import { EvaluatePlacementTestRequestSchema } from '@lexicon/types';
import { PlacementService } from '../services/placement.service';
import { AiGatewayService } from '../services/ai-gateway.service';

export const placementRoutes: FastifyPluginAsync = async (fastify) => {
  const aiGateway = new AiGatewayService();
  const placementService = new PlacementService(fastify.prisma, aiGateway);

  fastify.post('/generate', { preHandler: [fastify.authenticate] }, async (request, reply) => {
    try {
      const test = await placementService.generateTest(request.user.id);
      return reply.status(201).send(test);
    } catch (err: any) {
      return reply.status(500).send({ error: err.message || 'Failed to generate placement test' });
    }
  });

  fastify.post('/evaluate', { preHandler: [fastify.authenticate] }, async (request, reply) => {
    const parse = EvaluatePlacementTestRequestSchema.safeParse(request.body);
    if (!parse.success) {
      return reply.status(400).send({ error: parse.error.issues[0].message });
    }

    try {
      const result = await placementService.evaluateTest(parse.data.testId, request.user.id, parse.data.answers);
      return reply.send(result);
    } catch (err: any) {
      return reply.status(400).send({ error: err.message || 'Failed to evaluate placement test' });
    }
  });
};

import { FastifyPluginAsync } from 'fastify';
import { WritingEvaluateSchema } from '@lexicon/types';
import { AiGatewayService } from '../services/ai-gateway.service';
import { WritingService } from '../services/writing.service';

export const writingRoutes: FastifyPluginAsync = async (fastify) => {
  const aiGateway = new AiGatewayService();
  const writingService = new WritingService(fastify.prisma, aiGateway);

  fastify.post('/evaluate', { preHandler: [fastify.authenticate] }, async (request, reply) => {
    const parse = WritingEvaluateSchema.safeParse(request.body);
    if (!parse.success) {
      return reply.status(400).send({ error: 'Validation Error', issues: parse.error.issues });
    }

    try {
      const submission = await writingService.submitAndEvaluate({
        userId: request.user.id,
        promptText: parse.data.promptText,
        submittedText: parse.data.submittedText,
        targetCefr: parse.data.targetCefr,
      });

      return reply.status(201).send(submission);
    } catch (err: any) {
      return reply.status(500).send({ error: err.message || 'Failed to evaluate writing' });
    }
  });

  fastify.get('/history', { preHandler: [fastify.authenticate] }, async (request, reply) => {
    const { limit } = request.query as any;

    try {
      const history = await writingService.getUserSubmissions(
        request.user.id,
        limit ? parseInt(limit, 10) : 20
      );
      return reply.send(history);
    } catch (err: any) {
      return reply.status(500).send({ error: err.message || 'Failed to retrieve writing history' });
    }
  });
};

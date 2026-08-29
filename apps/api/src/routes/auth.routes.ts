import { FastifyPluginAsync } from 'fastify';
import { LoginRequestSchema, RegisterRequestSchema } from '@lexicon/types';
import { AuthService } from '../services/auth.service';

export const authRoutes: FastifyPluginAsync = async (fastify) => {
  const authService = new AuthService(fastify.prisma);

  fastify.post('/register', async (request, reply) => {
    const parse = RegisterRequestSchema.safeParse(request.body);
    if (!parse.success) {
      return reply.status(400).send({ error: 'Validation Error', issues: parse.error.issues });
    }

    try {
      const user = await authService.register(parse.data);
      const token = fastify.jwt.sign({ id: user.id, email: user.email });
      return reply.status(201).send({ user, token });
    } catch (err: any) {
      return reply.status(400).send({ error: err.message || 'Registration failed' });
    }
  });

  fastify.post('/login', async (request, reply) => {
    const parse = LoginRequestSchema.safeParse(request.body);
    if (!parse.success) {
      return reply.status(400).send({ error: 'Validation Error', issues: parse.error.issues });
    }

    try {
      const user = await authService.login(parse.data);
      const token = fastify.jwt.sign({ id: user.id, email: user.email });
      return reply.send({ user, token });
    } catch (err: any) {
      return reply.status(401).send({ error: err.message || 'Authentication failed' });
    }
  });

  fastify.get('/me', { preHandler: [fastify.authenticate] }, async (request, reply) => {
    try {
      const user = await authService.getMe(request.user.id);
      return reply.send(user);
    } catch (err: any) {
      return reply.status(404).send({ error: err.message || 'User not found' });
    }
  });
};

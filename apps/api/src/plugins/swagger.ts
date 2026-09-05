import { FastifyPluginAsync } from 'fastify';
import fp from 'fastify-plugin';
import fastifySwagger from '@fastify/swagger';
import fastifySwaggerUi from '@fastify/swagger-ui';

const swaggerPlugin: FastifyPluginAsync = async (fastify) => {
  await fastify.register(fastifySwagger, {
    openapi: {
      info: {
        title: 'Lexicon: English Expedition Log API',
        description: 'Contrastive HU -> EN pedagogical learning backend & SRS engine',
        version: '1.3.0',
      },
      servers: [
        {
          url: '/',
          description: 'Current Host',
        },
      ],
      components: {
        securitySchemes: {
          bearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
          },
        },
      },
      security: [{ bearerAuth: [] }],
    },
  });

  await fastify.register(fastifySwaggerUi, {
    routePrefix: '/docs',
    uiConfig: {
      docExpansion: 'list',
      deepLinking: false,
    },
    staticCSP: true,
  });
};

export default fp(swaggerPlugin, { name: 'swagger-plugin' });

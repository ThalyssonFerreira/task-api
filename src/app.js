import Fastify from 'fastify';
import cors from '@fastify/cors';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import jwt from '@fastify/jwt';
import { registerDocs } from '../docs/openapi.js';

import authRoutes from './routes/auth.routes.js';
import tasksRoutes from './routes/tasks.routes.js';

export async function buildApp() {
  const app = Fastify({
    logger: { transport: { target: 'pino-pretty' } }
  });

  await app.register(cors, { origin: true });

  await app.register(swagger, {
    openapi: {
      openapi: '3.0.0',
      info: { title: 'Task API', version: '1.0.0' },
      tags: [{ name: 'Auth' }, { name: 'Tasks' }],
      components: {
        securitySchemes: {
          bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' }
        }
      },
      security: [{ bearerAuth: [] }]
    }
  });

  await app.register(swaggerUi, { routePrefix: '/docs' });

  await app.register(jwt, {
    secret: process.env.JWT_SECRET || 'change-me',
    sign: { expiresIn: process.env.JWT_EXPIRES_IN || '15m' }
  });

  // registra schemas reutilizáveis para o Swagger
  await registerDocs(app);

  app.decorate('authenticate', async function (req, reply) {
    try {
      await req.jwtVerify();
    } catch {
      return reply.code(401).send({ error: 'unauthorized' });
    }
  });

  app.get('/health', async () => ({ status: 'ok' }));

  // Rotas
  app.register(authRoutes, { prefix: '/auth' });
  app.register(tasksRoutes, { prefix: '/tasks' });

  return app;
}

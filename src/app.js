import Fastify from 'fastify';
import cors from '@fastify/cors';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';

export async function buildApp() {
  const app = Fastify({
    logger: { transport: { target: 'pino-pretty' } }
  });

  await app.register(cors, { origin: true });

  await app.register(swagger, {
    openapi: {
      openapi: '3.0.0',
      info: { title: 'Task API', version: '1.0.0' }
    }
  });
  await app.register(swaggerUi, { routePrefix: '/docs' });

  app.get('/health', async () => ({ status: 'ok' }));

  return app;
}

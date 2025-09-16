import { createTaskCtrl, listTasksCtrl, getTaskCtrl, updateTaskCtrl, deleteTaskCtrl } from '../controllers/tasks.controller.js';

export default async function tasksRoutes(app) {
  // todas exigem autenticação
  const auth = [app.authenticate];

  app.post('/', {
    schema: {
      tags: ['Tasks'],
      body: {
        type: 'object',
        required: ['title'],
        properties: {
          title: { type: 'string' },
          description: { type: 'string' },
          status: { type: 'string', enum: ['pending', 'in_progress', 'done'] }
        }
      }
    },
    preHandler: auth
  }, createTaskCtrl);

  app.get('/', {
    schema: {
      tags: ['Tasks'],
      querystring: {
        type: 'object',
        properties: {
          page: { type: 'integer', minimum: 1, default: 1 },
          limit: { type: 'integer', minimum: 1, maximum: 100, default: 10 },
          status: { type: 'string', enum: ['pending', 'in_progress', 'done'] },
          q: { type: 'string' },
          scope: { type: 'string', enum: ['mine', 'all'], default: 'mine' }
        }
      }
    },
    preHandler: auth
  }, listTasksCtrl);

  app.get('/:id', {
    schema: { tags: ['Tasks'], params: { type: 'object', properties: { id: { type: 'integer' } } } },
    preHandler: auth
  }, getTaskCtrl);

  app.put('/:id', {
    schema: {
      tags: ['Tasks'],
      params: { type: 'object', properties: { id: { type: 'integer' } } },
      body: {
        type: 'object',
        properties: {
          title: { type: 'string' },
          description: { type: 'string' },
          status: { type: 'string', enum: ['pending', 'in_progress', 'done'] }
        }
      }
    },
    preHandler: auth
  }, updateTaskCtrl);

  app.delete('/:id', {
    schema: { tags: ['Tasks'], params: { type: 'object', properties: { id: { type: 'integer' } } } },
    preHandler: auth
  }, deleteTaskCtrl);
}

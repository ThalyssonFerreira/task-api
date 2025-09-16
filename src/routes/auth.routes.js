
import { registerCtrl, loginCtrl, refreshCtrl, meCtrl, logoutCtrl } from '../controllers/auth.controller.js';

export default async function authRoutes(app) {
  app.post('/register', {
    schema: {
      tags: ['Auth'],
      body: {
        type: 'object',
        required: ['name', 'email', 'password'],
        properties: {
          name: { type: 'string' },
          email: { type: 'string', format: 'email' },
          password: { type: 'string', minLength: 6 }
        }
      }
    }
  }, registerCtrl);

  app.post('/login', {
    schema: {
      tags: ['Auth'],
      body: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: { type: 'string', format: 'email' },
          password: { type: 'string', minLength: 6 }
        }
      }
    }
  }, loginCtrl);

  app.post('/refresh', {
    schema: {
      tags: ['Auth'],
      body: {
        type: 'object',
        required: ['refreshToken'],
        properties: { refreshToken: { type: 'string' } }
      }
    }
  }, refreshCtrl);

  app.get('/me', {
    schema: { tags: ['Auth'] },
    preHandler: [app.authenticate] 
  }, meCtrl);

  app.post('/logout', {
    schema: {
      tags: ['Auth'],
      body: {
        type: 'object',
        properties: { refreshToken: { type: 'string' } }
      }
    },
    preHandler: [app.authenticate]
  }, logoutCtrl);
}

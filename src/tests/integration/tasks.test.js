import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import request from 'supertest';
import { makeApp, closeApp, resetDb } from '../helpers/test-app.js';
import { query } from '../../config/db.js';

let app;

async function registerAndLogin(email = 'u@example.com') {
  const r = await request(app.server)
    .post('/auth/register')
    .send({ name: 'User', email, password: '123456' })
    .expect(201);
  return { access: r.body.accessToken, user: r.body.user };
}

describe('Tasks + RBAC', () => {
  beforeAll(async () => { app = await makeApp(); });
  beforeEach(async () => { await resetDb(); });
  afterAll(async () => { await closeApp(app); });

  it('user should CRUD only own tasks', async () => {
    const a = await registerAndLogin('a@example.com');
    const b = await registerAndLogin('b@example.com');

    const created = await request(app.server)
      .post('/tasks')
      .set('Authorization', `Bearer ${a.access}`)
      .send({ title: 'Estudar Fastify', description: 'JWT + RBAC' })
      .expect(201);

    expect(created.body.title).toBe('Estudar Fastify');

    await request(app.server)
      .get(`/tasks/${created.body.id}`)
      .set('Authorization', `Bearer ${b.access}`)
      .expect(403);

    const updated = await request(app.server)
      .put(`/tasks/${created.body.id}`)
      .set('Authorization', `Bearer ${a.access}`)
      .send({ status: 'done' })
      .expect(200);

    expect(updated.body.status).toBe('done');

    const listA = await request(app.server)
      .get('/tasks?scope=mine')
      .set('Authorization', `Bearer ${a.access}`)
      .expect(200);

    expect(listA.body.total).toBe(1);

    await request(app.server)
      .delete(`/tasks/${created.body.id}`)
      .set('Authorization', `Bearer ${b.access}`)
      .expect(403);
  });

  it('admin can list all tasks', async () => {
    const a = await registerAndLogin('aa@example.com');
    await request(app.server)
      .post('/tasks')
      .set('Authorization', `Bearer ${a.access}`)
      .send({ title: 'Task A' })
      .expect(201);
    await query(`UPDATE users SET role='admin' WHERE email=$1;`, ['aa@example.com']);

    const adminLogin = await request(app.server)
      .post('/auth/login')
      .send({ email: 'aa@example.com', password: '123456' })
      .expect(200);

    const adminAccess = adminLogin.body.accessToken;

    const listAll = await request(app.server)
      .get('/tasks?scope=all')
      .set('Authorization', `Bearer ${adminAccess}`)
      .expect(200);

    expect(listAll.body.total).toBeGreaterThanOrEqual(1);
  });
});

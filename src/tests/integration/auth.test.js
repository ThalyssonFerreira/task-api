import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import request from 'supertest';
import { makeApp, closeApp, resetDb } from '../helpers/test-app.js';

let app;

describe('Auth flow', () => {
  beforeAll(async () => { app = await makeApp(); });
  beforeEach(async () => { await resetDb(); });
  afterAll(async () => { await closeApp(app); });

  it('should register, login, get me and refresh', async () => {
    const reg = await request(app.server)
      .post('/auth/register')
      .send({ name: 'Alice', email: 'alice@example.com', password: '123456' })
      .expect(201);

    expect(reg.body.user.email).toBe('alice@example.com');
    expect(reg.body.accessToken).toBeTypeOf('string');
    expect(reg.body.refreshToken).toBeTypeOf('string');

    const access = reg.body.accessToken;
    const refresh = reg.body.refreshToken;

    const me = await request(app.server)
      .get('/auth/me')
      .set('Authorization', `Bearer ${access}`)
      .expect(200);

    expect(me.body.email).toBe('alice@example.com');

    const login = await request(app.server)
      .post('/auth/login')
      .send({ email: 'alice@example.com', password: '123456' })
      .expect(200);

    expect(login.body.user.name).toBe('Alice');

    const ref = await request(app.server)
      .post('/auth/refresh')
      .send({ refreshToken: refresh })
      .expect(200);

    expect(ref.body.accessToken).toBeTypeOf('string');
    expect(ref.body.refreshToken).toBeTypeOf('string');
  });

  it('should reject wrong password', async () => {
    await request(app.server)
      .post('/auth/register')
      .send({ name: 'Bob', email: 'bob@example.com', password: '123456' })
      .expect(201);

    await request(app.server)
      .post('/auth/login')
      .send({ email: 'bob@example.com', password: 'wrongpw' })
      .expect(401);
  });
});

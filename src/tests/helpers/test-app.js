import 'dotenv/config';
import { buildApp } from '../../app.js';
import { query } from '../../config/db.js';

export async function makeApp() {
  const app = await buildApp();
  await app.ready();
  return app;
}

export async function closeApp(app) {
  await app.close();
}

export async function resetDb() {
  await query('TRUNCATE TABLE refresh_tokens, tasks, users RESTART IDENTITY CASCADE;');
}

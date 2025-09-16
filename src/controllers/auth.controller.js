import { registerSchema, loginSchema, refreshSchema } from '../schemas/auth.schema.js';
import { registerService, loginService, refreshService, meService, logoutService } from '../services/auth.service.js';

export async function registerCtrl(req, reply) {
  const app = req.server;
  const data = registerSchema.parse(req.body);
  const result = await registerService(app, data);
  return reply.code(201).send(result);
}

export async function loginCtrl(req, reply) {
  const app = req.server;
  const data = loginSchema.parse(req.body);
  const result = await loginService(app, data);
  return reply.send(result);
}

export async function refreshCtrl(req, reply) {
  const app = req.server;
  const data = refreshSchema.parse(req.body);
  const result = await refreshService(app, data);
  return reply.send(result);
}

export async function meCtrl(req, reply) {
  // req.user vem do jwtVerify()
  const result = await meService(req.user.sub);
  return reply.send(result);
}

export async function logoutCtrl(req, reply) {
  const { refreshToken } = req.body ?? {};
  const payload = { refreshToken, userId: req.user?.sub };
  const result = await logoutService(payload);
  return reply.send(result);
}

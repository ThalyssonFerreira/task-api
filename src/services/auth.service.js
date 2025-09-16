import { hashPassword, comparePassword } from '../utils/password.js';
import { signAccessToken, signRefreshToken } from '../utils/jwt.js';
import { createUser, findUserByEmail, findUserById } from '../repositories/users.repo.js';
import {
  addRefreshToken,
  findRefreshToken,
  revokeRefreshToken,
  revokeAllFromUser
} from '../repositories/refreshTokens.repo.js';

function msFromShort(str) {
  // suporta "15m", "1h", "7d"...
  const m = /^(\d+)([smhd])$/.exec(str ?? '');
  if (!m) return 7 * 24 * 3600 * 1000;
  const n = Number(m[1]);
  const mult = m[2] === 's' ? 1 : m[2] === 'm' ? 60 : m[2] === 'h' ? 3600 : 86400;
  return n * mult * 1000;
}

function sanitizeUser(u) {
  return { id: u.id, name: u.name, email: u.email, role: u.role };
}

async function issueTokens(app, user) {
  const payload = { sub: user.id, email: user.email, role: user.role };
  const accessToken = signAccessToken(app, payload);
  const refreshToken = signRefreshToken(app, payload);
  const expiresAt = new Date(Date.now() + msFromShort(process.env.REFRESH_EXPIRES_IN || '7d'));
  await addRefreshToken({ userId: user.id, token: refreshToken, expiresAt });
  return { accessToken, refreshToken };
}

export async function registerService(app, { name, email, password }) {
  const exists = await findUserByEmail(email);
  if (exists) {
    const err = new Error('email já cadastrado');
    err.statusCode = 409;
    throw err;
  }
  const passwordHash = await hashPassword(password);
  const user = await createUser({ name, email, password: passwordHash, role: 'user' });
  const tokens = await issueTokens(app, user);
  return { user: sanitizeUser(user), ...tokens };
}

export async function loginService(app, { email, password }) {
  const user = await findUserByEmail(email);
  if (!user) {
    const err = new Error('credenciais inválidas');
    err.statusCode = 401;
    throw err;
  }
  const ok = await comparePassword(password, user.password);
  if (!ok) {
    const err = new Error('credenciais inválidas');
    err.statusCode = 401;
    throw err;
  }
  const tokens = await issueTokens(app, user);
  return { user: sanitizeUser(user), ...tokens };
}

export async function refreshService(app, { refreshToken }) {
  //  token precisa existir no banco
  const saved = await findRefreshToken(refreshToken);
  if (!saved) {
    const err = new Error('refresh token inválido');
    err.statusCode = 401;
    throw err;
  }
  // precisa estar válido criptograficamente
  let payload;
  try {
    payload = app.jwt.verify(refreshToken);
  } catch {
    await revokeRefreshToken(refreshToken);
    const err = new Error('refresh token expirado/inválido');
    err.statusCode = 401;
    throw err;
  }
  // checar expiração de linha (belt & suspenders)
  if (new Date(saved.expires_at).getTime() < Date.now()) {
    await revokeRefreshToken(refreshToken);
    const err = new Error('refresh token expirado');
    err.statusCode = 401;
    throw err;
  }
  //  gerar novos tokens 
  const user = await findUserById(payload.sub);
  if (!user) {
    await revokeRefreshToken(refreshToken);
    const err = new Error('usuário não encontrado');
    err.statusCode = 401;
    throw err;
  }
  await revokeRefreshToken(refreshToken);
  const tokens = await issueTokens(app, user);
  return { user: sanitizeUser(user), ...tokens };
}

export async function meService(userId) {
  const user = await findUserById(userId);
  if (!user) {
    const err = new Error('não encontrado');
    err.statusCode = 404;
    throw err;
  }
  return sanitizeUser(user);
}

export async function logoutService({ refreshToken, userId }) {
  if (refreshToken) await revokeRefreshToken(refreshToken);
  else if (userId) await revokeAllFromUser(userId);
  return { success: true };
}

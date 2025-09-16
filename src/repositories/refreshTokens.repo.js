import { query } from '../config/db.js';

export async function addRefreshToken({ userId, token, expiresAt }) {
  const sql = `
    INSERT INTO refresh_tokens (user_id, token, expires_at)
    VALUES ($1, $2, $3)
    RETURNING id, user_id, token, expires_at, created_at
  `;
  const { rows } = await query(sql, [userId, token, expiresAt]);
  return rows[0];
}

export async function findRefreshToken(token) {
  const { rows } = await query('SELECT * FROM refresh_tokens WHERE token = $1', [token]);
  return rows[0] ?? null;
}

export async function revokeRefreshToken(token) {
  await query('DELETE FROM refresh_tokens WHERE token = $1', [token]);
}

export async function revokeAllFromUser(userId) {
  await query('DELETE FROM refresh_tokens WHERE user_id = $1', [userId]);
}

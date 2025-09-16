import { query } from '../config/db.js';

export async function createUser({ name, email, password, role = 'user' }) {
  const sql = `
    INSERT INTO users (name, email, password, role)
    VALUES ($1, $2, $3, $4)
    RETURNING id, name, email, role, created_at
  `;
  const params = [name, email, password, role];
  const { rows } = await query(sql, params);
  return rows[0];
}

export async function findUserByEmail(email) {
  const { rows } = await query('SELECT * FROM users WHERE email = $1', [email]);
  return rows[0] || null;
}

export async function findUserById(id) {
  const { rows } = await query('SELECT id, name, email, role FROM users WHERE id = $1', [id]);
  return rows[0] || null;
}

import { query } from '../config/db.js';

export async function createTask({ userId, title, description, status = 'pending' }) {
  const sql = `
    INSERT INTO tasks (user_id, title, description, status)
    VALUES ($1, $2, $3, $4)
    RETURNING id, user_id, title, description, status, created_at, updated_at
  `;
  const { rows } = await query(sql, [userId, title, description ?? null, status]);
  return rows[0];
}

function buildFilters({ userId, q, status }) {
  const where = [];
  const params = [];
  if (userId) {
    params.push(userId);
    where.push(`user_id = $${params.length}`);
  }
  if (status) {
    params.push(status);
    where.push(`status = $${params.length}`);
  }
  if (q) {
    params.push(`%${q}%`);
    where.push(`(title ILIKE $${params.length} OR description ILIKE $${params.length})`);
  }
  return { where: where.length ? `WHERE ${where.join(' AND ')}` : '', params };
}

export async function listTasks({ userId, q, status, limit, offset }) {
  const { where, params } = buildFilters({ userId, q, status });
  const countSql = `SELECT COUNT(*)::int AS total FROM tasks ${where}`;
  const listSql = `
    SELECT id, user_id, title, description, status, created_at, updated_at
    FROM tasks
    ${where}
    ORDER BY created_at DESC
    LIMIT $${params.length + 1} OFFSET $${params.length + 2}
  `;
  const [{ rows: countRows }, { rows }] = await Promise.all([
    query(countSql, params),
    query(listSql, [...params, limit, offset])
  ]);
  return { rows, total: countRows[0].total };
}

export async function listAllTasks(args) {
  // mesma função, mas sem filtrar por userId
  return listTasks({ ...args, userId: undefined });
}

export async function getTaskById(id) {
  const { rows } = await query(
    `SELECT id, user_id, title, description, status, created_at, updated_at FROM tasks WHERE id = $1`,
    [id]
  );
  return rows[0] ?? null;
}

export async function updateTask({ id, title, description, status }) {
  const sets = [];
  const params = [];
  if (title !== undefined) { params.push(title); sets.push(`title = $${params.length}`); }
  if (description !== undefined) { params.push(description); sets.push(`description = $${params.length}`); }
  if (status !== undefined) { params.push(status); sets.push(`status = $${params.length}`); }
  params.push(id);
  const sql = `
    UPDATE tasks SET ${sets.join(', ')}, updated_at = now()
    WHERE id = $${params.length}
    RETURNING id, user_id, title, description, status, created_at, updated_at
  `;
  const { rows } = await query(sql, params);
  return rows[0] ?? null;
}

export async function deleteTask(id) {
  const { rows } = await query(
    `DELETE FROM tasks WHERE id = $1 RETURNING id`,
    [id]
  );
  return rows[0] ?? null;
}

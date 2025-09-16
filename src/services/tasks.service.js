import {
  createTask, listTasks, listAllTasks,
  getTaskById, updateTask as repoUpdate, deleteTask as repoDelete
} from '../repositories/tasks.repo.js';

function canAccessTask({ task, userId, role }) {
  return role === 'admin' || task.user_id === userId;
}

export async function createTaskService({ userId, data }) {
  return createTask({ userId, ...data });
}

export async function listTasksService({ userId, role, qp }) {
  const { page, limit, status, q, scope } = qp;
  const offset = (page - 1) * limit;

  if (scope === 'all') {
    if (role !== 'admin') {
      const err = new Error('forbidden');
      err.statusCode = 403;
      throw err;
    }
    return listAllTasks({ q, status, limit, offset });
  }

  return listTasks({ userId, q, status, limit, offset });
}

export async function getTaskService({ id, userId, role }) {
  const task = await getTaskById(id);
  if (!task) {
    const err = new Error('task não encontrada');
    err.statusCode = 404;
    throw err;
  }
  if (!canAccessTask({ task, userId, role })) {
    const err = new Error('forbidden');
    err.statusCode = 403;
    throw err;
  }
  return task;
}

export async function updateTaskService({ id, userId, role, data }) {
  const task = await getTaskById(id);
  if (!task) {
    const err = new Error('task não encontrada');
    err.statusCode = 404;
    throw err;
  }
  if (!canAccessTask({ task, userId, role })) {
    const err = new Error('forbidden');
    err.statusCode = 403;
    throw err;
  }
  const updated = await repoUpdate({ id, ...data });
  return updated;
}

export async function deleteTaskService({ id, userId, role }) {
  const task = await getTaskById(id);
  if (!task) {
    const err = new Error('task não encontrada');
    err.statusCode = 404;
    throw err;
  }
  if (!canAccessTask({ task, userId, role })) {
    const err = new Error('forbidden');
    err.statusCode = 403;
    throw err;
  }
  await repoDelete(id);
  return { success: true };
}

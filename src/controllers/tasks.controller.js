import { createTaskSchema, updateTaskSchema, listTasksQuerySchema } from '../schemas/task.schema.js';
import {
  createTaskService, listTasksService, getTaskService,
  updateTaskService, deleteTaskService
} from '../services/tasks.service.js';

export async function createTaskCtrl(req, reply) {
  const data = createTaskSchema.parse(req.body);
  const task = await createTaskService({ userId: req.user.sub, data });
  return reply.code(201).send(task);
}

export async function listTasksCtrl(req, reply) {
  const qp = listTasksQuerySchema.parse(req.query);
  const result = await listTasksService({
    userId: req.user.sub,
    role: req.user.role,
    qp
  });
  return reply.send({
    data: result.rows,
    total: result.total,
    page: qp.page,
    limit: qp.limit
  });
}

export async function getTaskCtrl(req, reply) {
  const id = Number(req.params.id);
  const task = await getTaskService({ id, userId: req.user.sub, role: req.user.role });
  return reply.send(task);
}

export async function updateTaskCtrl(req, reply) {
  const id = Number(req.params.id);
  const data = updateTaskSchema.parse(req.body);
  const task = await updateTaskService({ id, userId: req.user.sub, role: req.user.role, data });
  return reply.send(task);
}

export async function deleteTaskCtrl(req, reply) {
  const id = Number(req.params.id);
  const out = await deleteTaskService({ id, userId: req.user.sub, role: req.user.role });
  return reply.send(out);
}

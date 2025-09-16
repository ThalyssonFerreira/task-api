import { z } from 'zod';

export const TaskStatus = z.enum(['pending', 'in_progress', 'done']);

export const createTaskSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  status: TaskStatus.default('pending').optional()
});

export const updateTaskSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  status: TaskStatus.optional()
}).refine((d) => Object.keys(d).length > 0, { message: 'nada para atualizar' });

export const listTasksQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
  status: TaskStatus.optional(),
  q: z.string().optional(),
  scope: z.enum(['mine', 'all']).default('mine') // 'all' só para admin
});

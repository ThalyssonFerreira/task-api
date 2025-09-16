import { z } from 'zod';

export const registerSchema = z.object({
  name: z.string().min(2, 'nome muito curto'),
  email: z.string().email(),
  password: z.string().min(6, 'mínimo 6 caracteres')
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6)
});

export const refreshSchema = z.object({
  refreshToken: z.string().min(1)
});

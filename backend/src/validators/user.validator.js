import { z } from 'zod';

export const createUserSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z
    .string()
    .min(6, 'La contraseña debe tener al menos 6 caracteres'),
  first_name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  last_name: z.string().min(2, 'El apellido debe tener al menos 2 caracteres'),
  role: z.enum(['admin', 'professor', 'student'], {
    errorMap: () => ({ message: 'Rol inválido' }),
  }),
});

export const updateUserSchema = z.object({
  email: z.string().email('Email inválido').optional(),
  first_name: z.string().min(2).optional(),
  last_name: z.string().min(2).optional(),
  role: z.enum(['admin', 'professor', 'student']).optional(),
  is_active: z.number().min(0).max(1).optional(),
});

export const assignGroupSchema = z.object({
  group_id: z.number().int().positive('ID de grupo inválido'),
});

export const assignSubjectSchema = z.object({
  subject_id: z.number().int().positive('ID de materia inválido'),
  group_id: z.number().int().positive('ID de grupo inválido'),
});

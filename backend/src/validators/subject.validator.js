import { z } from 'zod';

export const createSubjectSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  description: z.string().optional(),
});

export const updateSubjectSchema = z.object({
  name: z.string().min(2).optional(),
  description: z.string().optional(),
});

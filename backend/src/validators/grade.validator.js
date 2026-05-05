import { z } from 'zod';

export const createGradeSchema = z.object({
  student_id: z.number().int().positive(),
  subject_id: z.number().int().positive(),
  group_id: z.number().int().positive(),
  period_id: z.number().int().positive(),
  grade: z.number().min(0, 'La nota mínima es 0').max(100, 'La nota máxima es 100'),
  comments: z.string().optional().nullable(),
});

export const updateGradeSchema = z.object({
  grade: z.number().min(0).max(100),
  comments: z.string().optional().nullable(),
});

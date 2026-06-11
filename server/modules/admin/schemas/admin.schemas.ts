import { z } from 'zod';

export const createGroupSchema = z.object({
  name: z.string('Informe o nome do grupo').trim().min(2, 'O nome deve ter ao menos 2 caracteres'),
  icon: z.string().trim().optional(),
});

export const updateGroupSchema = z.object({
  name: z.string().trim().min(2, 'O nome deve ter ao menos 2 caracteres').optional(),
  icon: z.string().trim().nullable().optional(),
  sortOrder: z.number().int().optional(),
});

export const moveModuleSchema = z.object({
  groupId: z.number('groupId deve ser um número ou null').int().nullable(),
});

export type CreateGroupInput = z.infer<typeof createGroupSchema>;
export type UpdateGroupInput = z.infer<typeof updateGroupSchema>;
export type MoveModuleInput = z.infer<typeof moveModuleSchema>;

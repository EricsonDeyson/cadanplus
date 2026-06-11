import { z } from 'zod';

export const loginSchema = z.object({
  username: z.string('Informe o usuário').trim().min(1, 'Informe o usuário'),
  password: z.string('Informe a senha').min(1, 'Informe a senha'),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string('Informe a senha atual').min(1, 'Informe a senha atual'),
  newPassword: z
    .string('Informe a nova senha')
    .min(8, 'A nova senha deve ter no mínimo 8 caracteres'),
});

export const avatarSchema = z.object({
  dataUrl: z
    .string('Envie a imagem no campo dataUrl')
    .startsWith('data:image/', 'Formato de imagem inválido'),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
export type AvatarInput = z.infer<typeof avatarSchema>;

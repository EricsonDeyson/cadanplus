import type { Request, Response } from 'express';
import { validate } from '../../../utils/validate';
import { avatarSchema, changePasswordSchema, loginSchema } from '../schemas/auth.schemas';
import * as authService from '../services/auth.service';

export async function login(req: Request, res: Response) {
  const { username, password } = validate(loginSchema, req.body);
  const result = await authService.login(username, password);
  res.json(result);
}

export async function me(req: Request, res: Response) {
  const profile = await authService.getProfile(req.user!.id);
  res.json({ profile });
}

export async function changePassword(req: Request, res: Response) {
  const { currentPassword, newPassword } = validate(changePasswordSchema, req.body);
  await authService.changePassword(req.user!.id, currentPassword, newPassword);
  res.json({ message: 'Senha alterada com sucesso' });
}

export async function updateAvatar(req: Request, res: Response) {
  const { dataUrl } = validate(avatarSchema, req.body);
  const profile = await authService.updateAvatar(req.user!.id, dataUrl);
  res.json({ profile });
}

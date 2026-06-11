import type { NextFunction, Request, Response } from 'express';
import { findProfileById } from '../modules/auth/repositories/profile.repository';
import { forbidden, unauthorized } from '../utils/httpError';

/** Exige papel admin. Usar sempre depois de requireAuth. */
export async function requireAdmin(req: Request, _res: Response, next: NextFunction) {
  if (!req.user) throw unauthorized();

  const profile = await findProfileById(req.user.id);
  if (profile?.role?.slug !== 'admin') {
    throw forbidden('Apenas administradores podem acessar este recurso');
  }
  next();
}

import type { NextFunction, Request, Response } from 'express';
import { supabaseAdmin } from '../clients/supabase';
import { unauthorized } from '../utils/httpError';

/**
 * Valida o JWT do Supabase enviado em `Authorization: Bearer <token>`
 * e popula req.user / req.accessToken.
 */
export async function requireAuth(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    throw unauthorized('Token de acesso não informado');
  }

  const token = header.slice('Bearer '.length);
  const { data, error } = await supabaseAdmin.auth.getUser(token);
  if (error || !data.user) {
    throw unauthorized('Sessão inválida ou expirada');
  }

  req.user = { id: data.user.id, email: data.user.email ?? '' };
  req.accessToken = token;
  next();
}

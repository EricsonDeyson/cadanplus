import type { NextFunction, Request, Response } from 'express';
import { supabaseAdmin } from '../clients/supabase';
import { findProfileById } from '../modules/auth/repositories/profile.repository';
import { forbidden, unauthorized } from '../utils/httpError';

/**
 * Exige que o papel do usuário tenha can_view no módulo informado.
 * Usar sempre depois de requireAuth.
 */
export function requireModule(slug: string) {
  return async (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) throw unauthorized();

    const profile = await findProfileById(req.user.id);
    const roleId = profile?.role?.id;
    if (!roleId) throw forbidden('Você não tem acesso a este módulo');

    const { data, error } = await supabaseAdmin
      .from('role_permissions')
      .select('can_view, module:modules!inner(slug)')
      .eq('role_id', roleId)
      .eq('module.slug', slug)
      .eq('can_view', true)
      .limit(1);

    if (error) throw new Error(`Erro ao verificar permissão: ${error.message}`);
    if (!data?.length) throw forbidden('Você não tem acesso a este módulo');
    next();
  };
}

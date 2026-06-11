import { findProfileById } from '../../auth/repositories/profile.repository';
import { unauthorized } from '../../../utils/httpError';
import type { ModuleDto } from '../dto/modules.dto';
import { findModulesForRole } from '../repositories/modules.repository';

/** Lista os módulos que o usuário autenticado pode ver (sidebar e busca). */
export async function listModulesForUser(userId: string): Promise<ModuleDto[]> {
  const profile = await findProfileById(userId);
  if (!profile) throw unauthorized('Perfil não encontrado');
  return findModulesForRole(profile.role?.id ?? null);
}

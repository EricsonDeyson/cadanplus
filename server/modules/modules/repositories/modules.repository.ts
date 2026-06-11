import { supabaseAdmin } from '../../../clients/supabase';
import type { ModuleDto, ModuleGroupDto } from '../dto/modules.dto';

function mapGroup(raw: any): ModuleGroupDto | null {
  const group = Array.isArray(raw) ? raw[0] : raw;
  if (!group) return null;
  return {
    id: group.id,
    slug: group.slug,
    name: group.name,
    icon: group.icon,
    sortOrder: group.sort_order,
  };
}

/** Módulos visíveis para um papel (role), ordenados para o sidebar. */
export async function findModulesForRole(roleId: number | null): Promise<ModuleDto[]> {
  if (!roleId) return [];

  const { data, error } = await supabaseAdmin
    .from('role_permissions')
    .select(
      'can_edit, module:modules(id, slug, name, description, icon, route, sort_order, is_active, group:module_groups(id, slug, name, icon, sort_order))',
    )
    .eq('role_id', roleId)
    .eq('can_view', true);

  if (error) throw new Error(`Erro ao buscar módulos: ${error.message}`);

  return (data ?? [])
    .flatMap((row: any) => {
      const m = Array.isArray(row.module) ? row.module[0] : row.module;
      if (!m || !m.is_active) return [];
      return [
        {
          id: m.id,
          slug: m.slug,
          name: m.name,
          description: m.description,
          icon: m.icon,
          route: m.route,
          sortOrder: m.sort_order,
          canEdit: row.can_edit,
          group: mapGroup(m.group),
        } satisfies ModuleDto,
      ];
    })
    .sort((a, b) => a.sortOrder - b.sortOrder);
}

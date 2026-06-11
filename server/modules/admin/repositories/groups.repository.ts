import { supabaseAdmin } from '../../../clients/supabase';
import type { AdminModuleDto, GroupDto } from '../dto/admin.dto';

function mapGroup(raw: any): GroupDto {
  return { id: raw.id, slug: raw.slug, name: raw.name, icon: raw.icon, sortOrder: raw.sort_order };
}

export async function findAllGroups(): Promise<GroupDto[]> {
  const { data, error } = await supabaseAdmin
    .from('module_groups')
    .select('id, slug, name, icon, sort_order')
    .order('sort_order');
  if (error) throw new Error(`Erro ao listar grupos: ${error.message}`);
  return (data ?? []).map(mapGroup);
}

export async function findAllModules(): Promise<AdminModuleDto[]> {
  const { data, error } = await supabaseAdmin
    .from('modules')
    .select('id, slug, name, description, icon, route, sort_order, is_active, group_id')
    .order('sort_order');
  if (error) throw new Error(`Erro ao listar módulos: ${error.message}`);
  return (data ?? []).map((m: any) => ({
    id: m.id,
    slug: m.slug,
    name: m.name,
    description: m.description,
    icon: m.icon,
    route: m.route,
    sortOrder: m.sort_order,
    isActive: m.is_active,
    groupId: m.group_id,
  }));
}

export async function insertGroup(input: {
  slug: string;
  name: string;
  icon: string | null;
  sortOrder: number;
}): Promise<GroupDto> {
  const { data, error } = await supabaseAdmin
    .from('module_groups')
    .insert({ slug: input.slug, name: input.name, icon: input.icon, sort_order: input.sortOrder })
    .select('id, slug, name, icon, sort_order')
    .single();
  if (error) {
    if (error.code === '23505') throw new Error('DUPLICATE_GROUP');
    throw new Error(`Erro ao criar grupo: ${error.message}`);
  }
  return mapGroup(data);
}

export async function updateGroup(
  id: number,
  patch: { name?: string; icon?: string | null; sort_order?: number },
): Promise<GroupDto | null> {
  const { data, error } = await supabaseAdmin
    .from('module_groups')
    .update(patch)
    .eq('id', id)
    .select('id, slug, name, icon, sort_order')
    .maybeSingle();
  if (error) throw new Error(`Erro ao atualizar grupo: ${error.message}`);
  return data ? mapGroup(data) : null;
}

export async function deleteGroup(id: number): Promise<boolean> {
  // modules.group_id tem ON DELETE SET NULL — dashboards voltam para "sem grupo"
  const { data, error } = await supabaseAdmin
    .from('module_groups')
    .delete()
    .eq('id', id)
    .select('id')
    .maybeSingle();
  if (error) throw new Error(`Erro ao excluir grupo: ${error.message}`);
  return !!data;
}

export async function setModuleGroup(moduleId: number, groupId: number | null): Promise<boolean> {
  const { data, error } = await supabaseAdmin
    .from('modules')
    .update({ group_id: groupId })
    .eq('id', moduleId)
    .select('id')
    .maybeSingle();
  if (error) throw new Error(`Erro ao mover módulo: ${error.message}`);
  return !!data;
}

export async function groupExists(id: number): Promise<boolean> {
  const { data, error } = await supabaseAdmin
    .from('module_groups')
    .select('id')
    .eq('id', id)
    .maybeSingle();
  if (error) throw new Error(`Erro ao buscar grupo: ${error.message}`);
  return !!data;
}

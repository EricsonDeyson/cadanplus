import { badRequest, notFound } from '../../../utils/httpError';
import type { GroupDto, GroupsOverviewDto } from '../dto/admin.dto';
import * as groupsRepository from '../repositories/groups.repository';
import type { CreateGroupInput, UpdateGroupInput } from '../schemas/admin.schemas';

/** Gera slug a partir do nome: "Grupo de Compras" → "grupo-de-compras". */
function slugify(name: string): string {
  return name
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export async function getGroupsOverview(): Promise<GroupsOverviewDto> {
  const [groups, modules] = await Promise.all([
    groupsRepository.findAllGroups(),
    groupsRepository.findAllModules(),
  ]);
  return { groups, modules };
}

export async function createGroup(input: CreateGroupInput): Promise<GroupDto> {
  const slug = slugify(input.name);
  if (!slug) throw badRequest('Nome de grupo inválido');

  const groups = await groupsRepository.findAllGroups();
  const maxSort = groups.reduce((max, g) => Math.max(max, g.sortOrder), 0);

  try {
    return await groupsRepository.insertGroup({
      slug,
      name: input.name,
      icon: input.icon ?? null,
      sortOrder: maxSort + 10,
    });
  } catch (err) {
    if (err instanceof Error && err.message === 'DUPLICATE_GROUP') {
      throw badRequest(`Já existe um grupo com o nome "${input.name}"`);
    }
    throw err;
  }
}

export async function updateGroup(id: number, input: UpdateGroupInput): Promise<GroupDto> {
  const patch: { name?: string; icon?: string | null; sort_order?: number } = {};
  if (input.name !== undefined) patch.name = input.name;
  if (input.icon !== undefined) patch.icon = input.icon;
  if (input.sortOrder !== undefined) patch.sort_order = input.sortOrder;
  if (!Object.keys(patch).length) throw badRequest('Nada para atualizar');

  const updated = await groupsRepository.updateGroup(id, patch);
  if (!updated) throw notFound('Grupo não encontrado');
  return updated;
}

export async function deleteGroup(id: number): Promise<void> {
  const deleted = await groupsRepository.deleteGroup(id);
  if (!deleted) throw notFound('Grupo não encontrado');
}

export async function moveModule(moduleId: number, groupId: number | null): Promise<void> {
  if (groupId !== null && !(await groupsRepository.groupExists(groupId))) {
    throw notFound('Grupo não encontrado');
  }
  const moved = await groupsRepository.setModuleGroup(moduleId, groupId);
  if (!moved) throw notFound('Módulo não encontrado');
}

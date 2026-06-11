import type { Request, Response } from 'express';
import { badRequest } from '../../../utils/httpError';
import { validate } from '../../../utils/validate';
import { createGroupSchema, moveModuleSchema, updateGroupSchema } from '../schemas/admin.schemas';
import * as adminService from '../services/admin.service';

function intParam(req: Request, name: string): number {
  const value = Number(req.params[name]);
  if (!Number.isInteger(value) || value <= 0) throw badRequest(`Parâmetro ${name} inválido`);
  return value;
}

export async function getGroups(_req: Request, res: Response) {
  res.json(await adminService.getGroupsOverview());
}

export async function createGroup(req: Request, res: Response) {
  const input = validate(createGroupSchema, req.body);
  const group = await adminService.createGroup(input);
  res.status(201).json({ group });
}

export async function updateGroup(req: Request, res: Response) {
  const input = validate(updateGroupSchema, req.body);
  const group = await adminService.updateGroup(intParam(req, 'id'), input);
  res.json({ group });
}

export async function deleteGroup(req: Request, res: Response) {
  await adminService.deleteGroup(intParam(req, 'id'));
  res.json({ message: 'Grupo excluído' });
}

export async function moveModule(req: Request, res: Response) {
  const { groupId } = validate(moveModuleSchema, req.body);
  await adminService.moveModule(intParam(req, 'id'), groupId);
  res.json({ message: 'Módulo movido' });
}

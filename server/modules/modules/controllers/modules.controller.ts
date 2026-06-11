import type { Request, Response } from 'express';
import * as modulesService from '../services/modules.service';

export async function listModules(req: Request, res: Response) {
  const modules = await modulesService.listModulesForUser(req.user!.id);
  res.json({ modules });
}

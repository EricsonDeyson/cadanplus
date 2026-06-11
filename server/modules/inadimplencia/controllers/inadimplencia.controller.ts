import type { Request, Response } from 'express';
import { badRequest } from '../../../utils/httpError';
import { validate } from '../../../utils/validate';
import { periodoSchema, topClientesSchema } from '../schemas/inadimplencia.schemas';
import * as inadimplenciaService from '../services/inadimplencia.service';

function intParam(req: Request, name: string): number {
  const value = Number(req.params[name]);
  if (!Number.isInteger(value)) throw badRequest(`Parâmetro ${name} inválido`);
  return value;
}

export async function overview(req: Request, res: Response) {
  const { from, to, limit } = validate(topClientesSchema, req.query);
  res.json(await inadimplenciaService.getOverview({ from, to }, limit));
}

export async function equipes(req: Request, res: Response) {
  const periodo = validate(periodoSchema, req.query);
  res.json({ equipes: await inadimplenciaService.getEquipes(periodo) });
}

export async function representantesByEquipe(req: Request, res: Response) {
  const periodo = validate(periodoSchema, req.query);
  const equipeId = intParam(req, 'equipeId');
  res.json({
    representantes: await inadimplenciaService.getRepresentantesByEquipe(equipeId, periodo),
  });
}

export async function clientesByRepresentante(req: Request, res: Response) {
  const periodo = validate(periodoSchema, req.query);
  const representanteId = intParam(req, 'representanteId');
  const equipeId = req.query.equipeId !== undefined ? Number(req.query.equipeId) : null;
  if (equipeId !== null && !Number.isInteger(equipeId)) throw badRequest('equipeId inválido');

  res.json({
    clientes: await inadimplenciaService.getClientesByRepresentante(
      representanteId,
      equipeId,
      periodo,
    ),
  });
}

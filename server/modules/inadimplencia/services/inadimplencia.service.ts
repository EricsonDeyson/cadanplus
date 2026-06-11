import type { OverviewDto } from '../dto/inadimplencia.dto';
import * as repository from '../repositories/inadimplencia.repository';

type Periodo = { from?: string; to?: string };

/** Visão Gerencial: cards, aging, série mensal (ano contra ano) e top clientes. */
export async function getOverview(periodo: Periodo, topLimit: number): Promise<OverviewDto> {
  const [resumo, aging, porMes, topClientes] = await Promise.all([
    repository.fetchResumo(periodo),
    repository.fetchAging(periodo),
    repository.fetchPorMes(periodo),
    repository.fetchTopClientes(periodo, topLimit),
  ]);
  return { resumo, aging, porMes, topClientes };
}

export const getEquipes = repository.fetchEquipes;
export const getRepresentantesByEquipe = repository.fetchRepresentantesByEquipe;
export const getClientesByRepresentante = repository.fetchClientesByRepresentante;

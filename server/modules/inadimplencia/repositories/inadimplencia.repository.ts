import { env } from '../../../config/env';
import { queryPbi } from '../../../postgres';
import type {
  AgingFaixaDto,
  ClienteInadimplenciaDto,
  EquipeInadimplenciaDto,
  PorMesDto,
  RepresentanteInadimplenciaDto,
  ResumoDto,
  TopClienteDto,
} from '../dto/inadimplencia.dto';

const S = env.DB_SCHEMA;

/**
 * Filtro de período sobre a Data de Vencimento ($1 = from, $2 = to).
 * Todas as queries deste módulo usam os dois primeiros parâmetros para isso.
 */
const PERIODO = `($1::date is null or i."Data Vencimento" >= $1::date)
             and ($2::date is null or i."Data Vencimento" <= $2::date)`;

type Periodo = { from?: string; to?: string };

function periodoParams({ from, to }: Periodo): (string | null)[] {
  return [from ?? null, to ?? null];
}

export async function fetchResumo(periodo: Periodo): Promise<ResumoDto> {
  const [row] = await queryPbi<any>(
    `select count(*)::int                                            as titulos,
            count(distinct i."Cliente.Id")::int                      as clientes,
            coalesce(sum(i."Valor Original"), 0)::float8             as valor_original,
            coalesce(sum(i."Valor Juros Mora"), 0)::float8           as valor_juros,
            coalesce(sum(i."Valor Multa"), 0)::float8                as valor_multa,
            coalesce(round(avg(i."Dias Atraso")), 0)::int            as atraso_medio,
            coalesce(sum(i."Valor Original" * i."Dias Atraso")
                     / nullif(sum(i."Valor Original"), 0), 0)::float8 as atraso_ponderado,
            coalesce(sum(i."Valor Original")
                     filter (where i."Dias Atraso" > 90), 0)::float8 as valor_acima_90
       from ${S}."dimClientesInadimplencias" i
      where ${PERIODO}`,
    periodoParams(periodo),
  );

  const valorTotal = row.valor_original + row.valor_juros + row.valor_multa;
  return {
    valorOriginal: row.valor_original,
    valorJuros: row.valor_juros,
    valorMulta: row.valor_multa,
    valorTotal,
    titulos: row.titulos,
    clientes: row.clientes,
    atrasoMedioDias: row.atraso_medio,
    atrasoMedioPonderado: Math.round(row.atraso_ponderado),
    valorAcima90: row.valor_acima_90,
    pctAcima90: row.valor_original > 0 ? (row.valor_acima_90 / row.valor_original) * 100 : 0,
  };
}

export async function fetchAging(periodo: Periodo): Promise<AgingFaixaDto[]> {
  return queryPbi<AgingFaixaDto & any>(
    `select case
              when i."Dias Atraso" <= 30  then '1-30 dias'
              when i."Dias Atraso" <= 60  then '31-60 dias'
              when i."Dias Atraso" <= 90  then '61-90 dias'
              when i."Dias Atraso" <= 180 then '91-180 dias'
              when i."Dias Atraso" <= 365 then '181-365 dias'
              else 'Acima de 1 ano'
            end                                       as faixa,
            count(*)::int                             as titulos,
            coalesce(sum(i."Valor Original"), 0)::float8 as valor
       from ${S}."dimClientesInadimplencias" i
      where ${PERIODO}
      group by 1
      order by min(i."Dias Atraso")`,
    periodoParams(periodo),
  );
}

export async function fetchPorMes(periodo: Periodo): Promise<PorMesDto[]> {
  return queryPbi<PorMesDto & any>(
    `select extract(year from i."Data Vencimento")::int  as ano,
            extract(month from i."Data Vencimento")::int as mes,
            count(*)::int                                as titulos,
            coalesce(sum(i."Valor Original"), 0)::float8 as valor
       from ${S}."dimClientesInadimplencias" i
      where ${PERIODO}
      group by 1, 2
      order by 1, 2`,
    periodoParams(periodo),
  );
}

export async function fetchTopClientes(periodo: Periodo, limit: number): Promise<TopClienteDto[]> {
  const rows = await queryPbi<any>(
    `select i."Cliente.Id"                                              as cliente_id,
            coalesce(nullif(trim(c."Nome Fantasia"), ''),
                     c."Nome Razao Social",
                     'Cliente ' || i."Cliente.Id")                      as nome,
            c."Nome Razao Social"                                      as razao_social,
            c."Cidade Nome"                                            as cidade,
            count(*)::int                                              as titulos,
            coalesce(sum(i."Valor Original"), 0)::float8               as valor,
            max(i."Dias Atraso")::int                                  as maior_atraso
       from ${S}."dimClientesInadimplencias" i
       left join ${S}."dimClientes" c on c."Cliente.Id" = i."Cliente.Id"
      where ${PERIODO}
      group by 1, 2, 3, 4
      order by valor desc
      limit $3`,
    [...periodoParams(periodo), limit],
  );
  return rows.map((r) => ({
    clienteId: r.cliente_id,
    nome: r.nome,
    razaoSocial: r.razao_social,
    cidade: r.cidade,
    titulos: r.titulos,
    valor: r.valor,
    maiorAtraso: r.maior_atraso,
  }));
}

export async function fetchEquipes(periodo: Periodo): Promise<EquipeInadimplenciaDto[]> {
  const rows = await queryPbi<any>(
    `select i."Equipe.Id"                                              as equipe_id,
            coalesce(e."Descricao", 'Sem equipe')                      as equipe,
            count(distinct i."Representante.Id")::int                  as representantes,
            count(distinct i."Cliente.Id")::int                       as clientes,
            count(*)::int                                              as titulos,
            coalesce(sum(i."Valor Original"), 0)::float8               as valor,
            max(i."Dias Atraso")::int                                  as maior_atraso
       from ${S}."dimClientesInadimplencias" i
       left join ${S}."dimEquipes" e on e."Equipe.Id" = i."Equipe.Id"
      where ${PERIODO}
      group by 1, 2
      order by valor desc`,
    periodoParams(periodo),
  );
  return rows.map((r) => ({
    equipeId: r.equipe_id,
    equipe: r.equipe,
    representantes: r.representantes,
    clientes: r.clientes,
    titulos: r.titulos,
    valor: r.valor,
    maiorAtraso: r.maior_atraso,
  }));
}

export async function fetchRepresentantesByEquipe(
  equipeId: number,
  periodo: Periodo,
): Promise<RepresentanteInadimplenciaDto[]> {
  const rows = await queryPbi<any>(
    `select i."Representante.Id"                                       as representante_id,
            coalesce(nullif(trim(r."Apelido"), ''),
                     'Representante ' || i."Representante.Id")         as representante,
            count(distinct i."Cliente.Id")::int                       as clientes,
            count(*)::int                                              as titulos,
            coalesce(sum(i."Valor Original"), 0)::float8               as valor,
            max(i."Dias Atraso")::int                                  as maior_atraso
       from ${S}."dimClientesInadimplencias" i
       left join ${S}."dimRepresentantes" r on r."Representante.Id" = i."Representante.Id"
      where ${PERIODO} and i."Equipe.Id" = $3
      group by 1, 2
      order by valor desc`,
    [...periodoParams(periodo), equipeId],
  );
  return rows.map((r) => ({
    representanteId: r.representante_id,
    representante: r.representante,
    clientes: r.clientes,
    titulos: r.titulos,
    valor: r.valor,
    maiorAtraso: r.maior_atraso,
  }));
}

export async function fetchClientesByRepresentante(
  representanteId: number,
  equipeId: number | null,
  periodo: Periodo,
): Promise<ClienteInadimplenciaDto[]> {
  const rows = await queryPbi<any>(
    `select i."Cliente.Id"                                             as cliente_id,
            coalesce(nullif(trim(c."Nome Fantasia"), ''),
                     c."Nome Razao Social",
                     'Cliente ' || i."Cliente.Id")                     as nome,
            c."Nome Razao Social"                                      as razao_social,
            c."Cidade Nome"                                            as cidade,
            count(*)::int                                              as titulos,
            coalesce(sum(i."Valor Original"), 0)::float8               as valor,
            max(i."Dias Atraso")::int                                  as maior_atraso
       from ${S}."dimClientesInadimplencias" i
       left join ${S}."dimClientes" c on c."Cliente.Id" = i."Cliente.Id"
      where ${PERIODO}
        and i."Representante.Id" = $3
        and ($4::int is null or i."Equipe.Id" = $4::int)
      group by 1, 2, 3, 4
      order by valor desc`,
    [...periodoParams(periodo), representanteId, equipeId],
  );
  return rows.map((r) => ({
    clienteId: r.cliente_id,
    nome: r.nome,
    razaoSocial: r.razao_social,
    cidade: r.cidade,
    titulos: r.titulos,
    valor: r.valor,
    maiorAtraso: r.maior_atraso,
  }));
}

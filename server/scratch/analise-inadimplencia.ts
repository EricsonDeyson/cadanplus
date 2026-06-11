/**
 * Análise exploratória da dimClientesInadimplencias — ranges, faixas de
 * atraso, integridade dos joins. Base para as queries da Visão Gerencial.
 */
import { env } from '../config/env';
import { pbiPool } from '../postgres';

const S = env.DB_SCHEMA;

async function run(label: string, sql: string) {
  console.log(`\n--- ${label} ---`);
  const { rows } = await pbiPool.query(sql);
  console.log(JSON.stringify(rows, null, 1).slice(0, 3000));
}

async function main() {
  await run('Ranges gerais', `
    select min("Data Vencimento")::date as venc_min,
           max("Data Vencimento")::date as venc_max,
           min("Dias Atraso") as atraso_min,
           max("Dias Atraso") as atraso_max,
           count(*)::int as titulos,
           count(distinct "Cliente.Id")::int as clientes,
           sum("Valor Original")::numeric(14,2) as valor_original,
           sum("Valor Juros Mora")::numeric(14,2) as juros,
           sum("Valor Multa")::numeric(14,2) as multa
      from ${S}."dimClientesInadimplencias"`);

  await run('Por ano de vencimento', `
    select extract(year from "Data Vencimento")::int as ano,
           count(*)::int as titulos,
           sum("Valor Original")::numeric(14,2) as valor
      from ${S}."dimClientesInadimplencias"
     group by 1 order by 1`);

  await run('Faixas de dias de atraso', `
    select case
             when "Dias Atraso" <= 0 then 'a vencer (<=0)'
             when "Dias Atraso" <= 30 then '1-30'
             when "Dias Atraso" <= 60 then '31-60'
             when "Dias Atraso" <= 90 then '61-90'
             when "Dias Atraso" <= 180 then '91-180'
             when "Dias Atraso" <= 365 then '181-365'
             else '> 365'
           end as faixa,
           count(*)::int as titulos,
           sum("Valor Original")::numeric(14,2) as valor
      from ${S}."dimClientesInadimplencias"
     group by 1 order by min("Dias Atraso")`);

  await run('Joins sem correspondência', `
    select
      (select count(*)::int from ${S}."dimClientesInadimplencias" i
        left join ${S}."dimClientes" c on c."Cliente.Id" = i."Cliente.Id"
       where c."Cliente.Id" is null) as sem_cliente,
      (select count(*)::int from ${S}."dimClientesInadimplencias" i
        left join ${S}."dimEquipes" e on e."Equipe.Id" = i."Equipe.Id"
       where e."Equipe.Id" is null) as sem_equipe,
      (select count(*)::int from ${S}."dimClientesInadimplencias" i
        left join ${S}."dimRepresentantes" r on r."Representante.Id" = i."Representante.Id"
       where r."Representante.Id" is null) as sem_representante`);

  await run('Top 5 equipes por valor', `
    select e."Descricao" as equipe, count(*)::int as titulos,
           sum(i."Valor Original")::numeric(14,2) as valor
      from ${S}."dimClientesInadimplencias" i
      left join ${S}."dimEquipes" e on e."Equipe.Id" = i."Equipe.Id"
     group by 1 order by 3 desc limit 5`);

  await run('Duplicidade de título+parcela', `
    select count(*)::int as repetidos from (
      select "Titulo", "Parcela", "Cliente.Id", count(*)
        from ${S}."dimClientesInadimplencias"
       group by 1,2,3 having count(*) > 1) d`);
}

main()
  .catch((err) => {
    console.error('❌', err.message);
    process.exitCode = 1;
  })
  .finally(() => pbiPool.end());

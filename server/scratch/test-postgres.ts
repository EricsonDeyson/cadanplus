/**
 * Exploração das views de inadimplência do PBICadan.
 * Mostra colunas/tipos, contagem, amostra de dados e ranges úteis
 * para desenhar as queries da Visão Gerencial.
 *
 * Uso: npx tsx scratch/test-postgres.ts [view ...]
 */
import { env } from '../config/env';
import { pbiPool } from '../postgres';

const DEFAULT_VIEWS = [
  'dimClientes',
  'dimClientesInadimplencias',
  'dimEquipes',
  'dimRepresentantes',
];

async function describeView(view: string) {
  console.log('\n' + '='.repeat(80));
  console.log(`📄 ${env.DB_SCHEMA}."${view}"`);
  console.log('='.repeat(80));

  const columns = await pbiPool.query(
    `select column_name, data_type, is_nullable
       from information_schema.columns
      where table_schema = $1 and table_name = $2
      order by ordinal_position`,
    [env.DB_SCHEMA, view],
  );
  console.log('\nColunas:');
  for (const c of columns.rows) {
    console.log(`  ${c.column_name.padEnd(40)} ${c.data_type.padEnd(28)} ${c.is_nullable === 'YES' ? 'null' : 'not null'}`);
  }

  const count = await pbiPool.query(`select count(*)::int as n from ${env.DB_SCHEMA}."${view}"`);
  console.log(`\nTotal de linhas: ${count.rows[0].n}`);

  const sample = await pbiPool.query(`select * from ${env.DB_SCHEMA}."${view}" limit 3`);
  console.log('\nAmostra (3 linhas):');
  console.log(JSON.stringify(sample.rows, null, 2).slice(0, 4_000));
}

async function main() {
  const views = process.argv.slice(2).length ? process.argv.slice(2) : DEFAULT_VIEWS;
  for (const view of views) {
    await describeView(view);
  }
}

main()
  .catch((err) => {
    console.error('❌', err.message);
    process.exitCode = 1;
  })
  .finally(() => pbiPool.end());

/**
 * Teste rápido de conectividade com o PBICadan.
 * Uso: npm run test:postgres
 */
import { env } from './config/env';
import { pbiPool } from './postgres';

async function main() {
  console.log(`Conectando em ${env.DB_HOST}:${env.DB_PORT}/${env.DB_NAME} (schema ${env.DB_SCHEMA})...`);

  const version = await pbiPool.query('select version()');
  console.log('✅ Conectado:', version.rows[0].version);

  const views = await pbiPool.query(
    `select table_name
       from information_schema.views
      where table_schema = $1
      order by table_name`,
    [env.DB_SCHEMA],
  );
  console.log(`\nViews disponíveis no schema "${env.DB_SCHEMA}" (${views.rowCount}):`);
  for (const row of views.rows) console.log(`  - ${row.table_name}`);
}

main()
  .catch((err) => {
    console.error('❌ Falha na conexão:', err.message);
    process.exitCode = 1;
  })
  .finally(() => pbiPool.end());

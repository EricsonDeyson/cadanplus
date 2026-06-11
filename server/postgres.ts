import pg from 'pg';
import { env } from './config/env';

/**
 * Pool de conexões com o PBICadan — banco de views consumidas
 * pelos dashboards. Somente leitura na prática (usuário powerbi).
 */
export const pbiPool = new pg.Pool({
  host: env.DB_HOST,
  port: env.DB_PORT,
  database: env.DB_NAME,
  user: env.DB_USER,
  password: env.DB_PASSWORD,
  max: 10,
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 10_000,
  options: `-c search_path=${env.DB_SCHEMA},public`,
});

export async function queryPbi<T extends pg.QueryResultRow = pg.QueryResultRow>(
  text: string,
  params?: unknown[],
): Promise<T[]> {
  const result = await pbiPool.query<T>(text, params as any[]);
  return result.rows;
}

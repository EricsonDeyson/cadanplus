import 'dotenv/config';
import { z } from 'zod';

const envSchema = z.object({
  APP_NAME: z.string().default('cadanplus'),
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),

  API_PORT: z.coerce.number().default(3001),
  API_HOST: z.string().default('localhost'),
  CORS_ORIGIN: z.string().default('http://localhost:5173'),

  // PostgreSQL PBICadan (views dos dashboards)
  DB_HOST: z.string(),
  DB_PORT: z.coerce.number(),
  DB_NAME: z.string(),
  DB_USER: z.string(),
  DB_PASSWORD: z.string(),
  DB_SCHEMA: z.string().default('pbi'),
  DATABASE_URL: z.string(),

  // Supabase
  SUPABASE_URL: z.url(),
  SUPABASE_PUBLISHABLE_KEY: z.string(),
  SUPABASE_SERVICE_ROLE: z.string(),
  SUPABASE_ANON_KEY: z.string().optional(),
  SUPABASE_SECRET_KEY: z.string().optional(),
  SUPABASE_DB_PASSWORD: z.string().optional(),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('❌ Variáveis de ambiente inválidas:');
  console.error(z.prettifyError(parsed.error));
  process.exit(1);
}

export const env = parsed.data;

/** Ref do projeto Supabase, ex.: "mbstaipjsrwcdwwkewjz" */
export const supabaseProjectRef = new URL(env.SUPABASE_URL).hostname.split('.')[0];

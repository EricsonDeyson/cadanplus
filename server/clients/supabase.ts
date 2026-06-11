import { createClient } from '@supabase/supabase-js';
import { env } from '../config/env';

/**
 * Cliente administrativo — usa a service role e BYPASSA o RLS.
 * Uso exclusivo no backend. Nunca expor esta chave ao frontend.
 */
export const supabaseAdmin = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE, {
  auth: { autoRefreshToken: false, persistSession: false },
});

/**
 * Cliente público — usado apenas para validar credenciais
 * (signInWithPassword) e operações sujeitas a RLS.
 */
export const supabaseAuth = createClient(env.SUPABASE_URL, env.SUPABASE_PUBLISHABLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

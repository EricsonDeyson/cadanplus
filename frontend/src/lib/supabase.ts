import { createClient } from '@supabase/supabase-js';

/**
 * Cliente Supabase do frontend — usado SOMENTE para gerenciar a sessão
 * (persistência e refresh automático do JWT). Os dados sempre passam
 * pela API Express; nenhuma chave secreta vive aqui.
 */
export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
);

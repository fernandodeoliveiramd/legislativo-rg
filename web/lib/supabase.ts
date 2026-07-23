import { createClient } from '@supabase/supabase-js';

// Cliente server-side, somente leitura (chave anon + RLS do banco garantem
// que não dá pra escrever a partir daqui). Usado dentro de Server Components.
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  { auth: { persistSession: false } }
);

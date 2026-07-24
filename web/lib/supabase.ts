import { createClient } from '@supabase/supabase-js';

// Algumas envs (ex: secrets colados de arquivos salvos no Windows) vêm com um
// BOM (U+FEFF) na frente, o que quebra os headers HTTP do fetch.
const BOM = String.fromCharCode(0xfeff);
const clean = (value: string) => value.split(BOM).join('').trim();

// Cliente server-side, somente leitura (chave anon + RLS do banco garantem
// que não dá pra escrever a partir daqui). Usado dentro de Server Components.
export const supabase = createClient(
  clean(process.env.NEXT_PUBLIC_SUPABASE_URL!),
  clean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!),
  { auth: { persistSession: false } }
);

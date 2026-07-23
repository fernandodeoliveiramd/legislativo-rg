import { supabase } from '@/lib/supabase';
import { SessaoCard } from '@/components/SessaoCard';
import type { Sessao } from '@/lib/types';

export const revalidate = 900;

export default async function SessoesPage() {
  const { data: sessoes, error } = await supabase
    .from('sessoes')
    .select('*')
    .order('data_sessao', { ascending: false })
    .limit(50);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Sessões plenárias</h1>
        <p className="mt-1 text-gray-600">
          Data, duração e o que foi discutido em cada sessão da Câmara.
        </p>
      </div>

      {error && (
        <p className="text-sm text-red-600">
          Não foi possível carregar as sessões agora. Tente novamente em instantes.
        </p>
      )}

      <div className="grid gap-3 sm:grid-cols-2">
        {(sessoes as Sessao[] | null)?.map((s) => (
          <SessaoCard key={s.id} sessao={s} />
        ))}
        {!error && !sessoes?.length && (
          <p className="text-sm text-gray-500">Nenhuma sessão sincronizada ainda.</p>
        )}
      </div>
    </div>
  );
}

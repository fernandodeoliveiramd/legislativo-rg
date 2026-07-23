import { supabase } from '@/lib/supabase';
import { ProposicaoCard } from '@/components/ProposicaoCard';
import { ProposicoesFiltro } from '@/components/ProposicoesFiltro';
import type { Proposicao } from '@/lib/types';

export const revalidate = 900; // 15 min

export default async function ProposicoesPage({
  searchParams,
}: {
  searchParams: { q?: string; tipo?: string; status?: string };
}) {
  const { q, tipo, status } = searchParams;

  let query = supabase
    .from('proposicoes')
    .select('*')
    .order('data_protocolo', { ascending: false })
    .limit(50);

  if (q) {
    query = query.textSearch('busca', q, { type: 'websearch', config: 'portuguese' });
  }
  if (tipo) {
    query = query.eq('tipo', tipo);
  }
  if (status) {
    query = query.eq('status_tramitacao', status);
  }

  const { data: proposicoes, error } = await query;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Proposições</h1>
        <p className="mt-1 text-gray-600">
          Projetos de lei, indicações, requerimentos e outros processos legislativos.
        </p>
      </div>

      <ProposicoesFiltro q={q} tipo={tipo} status={status} />

      {error && (
        <p className="text-sm text-red-600">
          Não foi possível carregar as proposições agora. Tente novamente em instantes.
        </p>
      )}

      <div className="grid gap-3">
        {(proposicoes as Proposicao[] | null)?.map((p) => (
          <ProposicaoCard key={p.id} proposicao={p} />
        ))}
        {!error && !proposicoes?.length && (
          <p className="text-sm text-gray-500">Nenhuma proposição encontrada com esses filtros.</p>
        )}
      </div>
    </div>
  );
}

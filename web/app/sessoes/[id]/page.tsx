import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { supabase } from '@/lib/supabase';
import { formatDateTime } from '@/lib/constants';
import { StatusBadge } from '@/components/StatusBadge';
import type { Sessao, SessaoAtividade, Proposicao } from '@/lib/types';

export const revalidate = 900;

async function getSessao(id: string): Promise<Sessao | null> {
  const { data } = await supabase.from('sessoes').select('*').eq('id', id).maybeSingle();
  return data;
}

async function getAtividades(sessaoId: string) {
  const { data } = await supabase
    .from('sessao_atividades')
    .select('*, proposicoes(id, titulo, tipo)')
    .eq('sessao_id', sessaoId)
    .order('inicio', { ascending: true });
  return (data ?? []) as (SessaoAtividade & { proposicoes: Pick<Proposicao, 'id' | 'titulo' | 'tipo'> | null })[];
}

export async function generateMetadata({
  params,
}: {
  params: { id: string };
}): Promise<Metadata> {
  const sessao = await getSessao(params.id);
  if (!sessao) return {};
  return { title: `${sessao.titulo ?? `Sessão #${sessao.id}`} — Legislativo RG` };
}

export default async function SessaoDetalhePage({ params }: { params: { id: string } }) {
  const sessao = await getSessao(params.id);
  if (!sessao) notFound();

  const atividades = await getAtividades(params.id);

  return (
    <article className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-brand-600">{sessao.tipo ?? 'Sessão plenária'}</p>
          <h1 className="text-2xl font-bold text-gray-900">
            {sessao.titulo ?? `Sessão #${sessao.id}`}
          </h1>
        </div>
        <StatusBadge status={sessao.status} descricao={sessao.status} />
      </div>

      <dl className="grid grid-cols-1 gap-4 rounded-lg border border-gray-200 bg-white p-4 text-sm sm:grid-cols-3">
        <div>
          <dt className="text-gray-500">Início</dt>
          <dd className="font-medium text-gray-900">{formatDateTime(sessao.inicio)}</dd>
        </div>
        <div>
          <dt className="text-gray-500">Fim</dt>
          <dd className="font-medium text-gray-900">{formatDateTime(sessao.fim)}</dd>
        </div>
        <div>
          <dt className="text-gray-500">Duração</dt>
          <dd className="font-medium text-gray-900">{sessao.duracao_formatada ?? '—'}</dd>
        </div>
      </dl>

      {sessao.video_url && (
        <a
          href={sessao.video_url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block rounded-md bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
        >
          Assistir gravação da sessão
        </a>
      )}

      <div>
        <h2 className="mb-3 text-lg font-semibold text-gray-900">Pauta da sessão</h2>
        {atividades.length === 0 && (
          <p className="text-sm text-gray-500">
            A pauta detalhada ainda não foi disponibilizada pela fonte oficial para esta sessão.
          </p>
        )}
        <ul className="space-y-2">
          {atividades.map((a) => (
            <li key={a.id} className="rounded-lg border border-gray-200 bg-white p-3 text-sm">
              {a.proposicoes ? (
                <Link href={`/proposicoes/${a.proposicoes.id}`} className="font-medium text-brand-600 hover:underline">
                  {a.proposicoes.titulo}
                </Link>
              ) : (
                <span className="font-medium text-gray-700">Item da pauta</span>
              )}
              {a.votacao_resultado && (
                <p className="mt-1 text-xs text-gray-500">
                  Resultado: {a.votacao_resultado} — {a.votacao_favoraveis ?? 0} favoráveis,{' '}
                  {a.votacao_contrarios ?? 0} contrários, {a.votacao_abstidos ?? 0} abstenções
                </p>
              )}
            </li>
          ))}
        </ul>
      </div>
    </article>
  );
}

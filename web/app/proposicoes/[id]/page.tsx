import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { supabase } from '@/lib/supabase';
import { formatDate } from '@/lib/constants';
import { StatusBadge } from '@/components/StatusBadge';
import type { Proposicao } from '@/lib/types';

export const revalidate = 900;

async function getProposicao(id: string): Promise<Proposicao | null> {
  const { data } = await supabase.from('proposicoes').select('*').eq('id', id).maybeSingle();
  return data;
}

export async function generateMetadata({
  params,
}: {
  params: { id: string };
}): Promise<Metadata> {
  const proposicao = await getProposicao(params.id);
  if (!proposicao) return {};
  return {
    title: `${proposicao.titulo} — Legislativo RG`,
    description: proposicao.ementa ?? undefined,
  };
}

export default async function ProposicaoDetalhePage({ params }: { params: { id: string } }) {
  const proposicao = await getProposicao(params.id);
  if (!proposicao) notFound();

  return (
    <article className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-brand-600">{proposicao.tipo ?? 'Proposição'}</p>
          <h1 className="text-2xl font-bold text-gray-900">{proposicao.titulo}</h1>
        </div>
        <StatusBadge
          status={proposicao.status_tramitacao}
          descricao={proposicao.status_tramitacao_descricao}
        />
      </div>

      {proposicao.ementa && (
        <p className="whitespace-pre-line rounded-lg border border-gray-200 bg-white p-4 text-gray-800">
          {proposicao.ementa}
        </p>
      )}

      <dl className="grid grid-cols-1 gap-4 rounded-lg border border-gray-200 bg-white p-4 text-sm sm:grid-cols-2">
        <div>
          <dt className="text-gray-500">Autoria</dt>
          <dd className="font-medium text-gray-900">{proposicao.autor_principal ?? '—'}</dd>
        </div>
        <div>
          <dt className="text-gray-500">Protocolo</dt>
          <dd className="font-medium text-gray-900">
            {proposicao.protocolo_numero ?? '—'} em {formatDate(proposicao.data_protocolo)}
          </dd>
        </div>
        <div>
          <dt className="text-gray-500">Publicação</dt>
          <dd className="font-medium text-gray-900">{formatDate(proposicao.data_publicacao)}</dd>
        </div>
        <div>
          <dt className="text-gray-500">Situação</dt>
          <dd className="font-medium text-gray-900">
            {proposicao.status_descricao ?? proposicao.status ?? '—'}
          </dd>
        </div>
      </dl>

      <p className="text-sm text-gray-500">
        O documento oficial (PDF) desta proposição pode ser consultado no{' '}
        <a
          href="https://cmriogrande.cittatec.com.br/portal-legislativo/proposicoes/consulta"
          target="_blank"
          rel="noopener noreferrer"
          className="text-brand-600 underline"
        >
          portal legislativo oficial
        </a>
        , buscando pelo protocolo {proposicao.protocolo_numero ?? ''}.
      </p>
    </article>
  );
}

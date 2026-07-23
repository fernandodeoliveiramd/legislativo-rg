import Link from 'next/link';
import { formatDate } from '@/lib/constants';
import { StatusBadge } from './StatusBadge';
import type { Proposicao } from '@/lib/types';

export function ProposicaoCard({ proposicao }: { proposicao: Proposicao }) {
  return (
    <Link
      href={`/proposicoes/${proposicao.id}`}
      className="block rounded-lg border border-gray-200 p-4 transition hover:border-brand-600 hover:shadow-sm"
    >
      <div className="flex items-start justify-between gap-3">
        <h3 className="font-semibold text-gray-900">{proposicao.titulo}</h3>
        <StatusBadge
          status={proposicao.status_tramitacao}
          descricao={proposicao.status_tramitacao_descricao}
        />
      </div>
      {proposicao.ementa && (
        <p className="mt-2 line-clamp-2 text-sm text-gray-600">{proposicao.ementa}</p>
      )}
      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500">
        {proposicao.autor_principal && <span>Autoria: {proposicao.autor_principal}</span>}
        <span>Protocolo em {formatDate(proposicao.data_protocolo)}</span>
      </div>
    </Link>
  );
}

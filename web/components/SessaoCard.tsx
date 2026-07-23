import Link from 'next/link';
import { formatDate } from '@/lib/constants';
import { StatusBadge } from './StatusBadge';
import type { Sessao } from '@/lib/types';

export function SessaoCard({ sessao }: { sessao: Sessao }) {
  return (
    <Link
      href={`/sessoes/${sessao.id}`}
      className="block rounded-lg border border-gray-200 p-4 transition hover:border-brand-600 hover:shadow-sm"
    >
      <div className="flex items-start justify-between gap-3">
        <h3 className="font-semibold text-gray-900">{sessao.titulo ?? `Sessão #${sessao.id}`}</h3>
        <StatusBadge status={sessao.status} descricao={sessao.status} />
      </div>
      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500">
        <span>{formatDate(sessao.data_sessao)}</span>
        {sessao.duracao_formatada && <span>Duração: {sessao.duracao_formatada}</span>}
        {sessao.video_url && <span>Vídeo disponível</span>}
      </div>
    </Link>
  );
}

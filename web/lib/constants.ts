// Tipos de proposição mais comuns (vindos de classificacoes da API de origem).
// É uma lista fixa pra alimentar o filtro sem precisar de uma query extra —
// se a Câmara passar a usar um tipo novo, ele ainda aparece nos resultados,
// só não some como opção de filtro até essa lista ser atualizada.
export const TIPOS_PROPOSICAO = [
  'INDICAÇÃO',
  'PROJETO DE LEI DE VEREADOR',
  'PROJETO DE LEI - EXECUTIVO',
  'PROJETO DE DECRETO LEGISLATIVO',
  'PROJETO DE RESOLUÇÃO',
  'REQUERIMENTO',
  'REQUERIMENTO DE VIAGEM',
  'MOÇÃO',
  'VETO',
];

export function formatDate(iso: string | null): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('pt-BR', { timeZone: 'UTC' });
}

export function formatDateTime(iso: string | null): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('pt-BR');
}

const STATUS_LABELS: Record<string, string> = {
  EM_ANDAMENTO: 'Em andamento',
  CONCLUIDO: 'Concluída',
  ENCERRADA: 'Encerrada',
  EM_ANALISE: 'Em análise',
};

export function statusLabel(status: string | null, fallback: string | null): string {
  if (status && STATUS_LABELS[status]) return STATUS_LABELS[status];
  return fallback ?? status ?? 'Sem status';
}

export function statusColor(status: string | null): string {
  switch (status) {
    case 'EM_ANDAMENTO':
    case 'EM_ANALISE':
      return 'bg-blue-100 text-blue-800';
    case 'CONCLUIDO':
      return 'bg-green-100 text-green-800';
    case 'ENCERRADA':
      return 'bg-gray-200 text-gray-700';
    default:
      return 'bg-gray-100 text-gray-700';
  }
}

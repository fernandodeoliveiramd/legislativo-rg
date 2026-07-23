import { statusColor, statusLabel } from '@/lib/constants';

export function StatusBadge({
  status,
  descricao,
}: {
  status: string | null;
  descricao: string | null;
}) {
  return (
    <span
      className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${statusColor(status)}`}
    >
      {statusLabel(status, descricao)}
    </span>
  );
}

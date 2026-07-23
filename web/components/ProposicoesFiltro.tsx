import { TIPOS_PROPOSICAO } from '@/lib/constants';

// Form GET simples, sem JS no cliente: a navegação com querystring já
// aciona o Server Component da página de listagem com os filtros aplicados.
export function ProposicoesFiltro({
  q,
  tipo,
  status,
}: {
  q?: string;
  tipo?: string;
  status?: string;
}) {
  return (
    <form method="get" className="flex flex-wrap gap-3 rounded-lg border border-gray-200 p-4">
      <input
        type="text"
        name="q"
        defaultValue={q}
        placeholder="Buscar por texto ou ementa..."
        className="min-w-[220px] flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm"
      />
      <select
        name="tipo"
        defaultValue={tipo ?? ''}
        className="rounded-md border border-gray-300 px-3 py-2 text-sm"
      >
        <option value="">Todos os tipos</option>
        {TIPOS_PROPOSICAO.map((t) => (
          <option key={t} value={t}>
            {t}
          </option>
        ))}
      </select>
      <select
        name="status"
        defaultValue={status ?? ''}
        className="rounded-md border border-gray-300 px-3 py-2 text-sm"
      >
        <option value="">Qualquer situação</option>
        <option value="EM_ANDAMENTO">Em andamento</option>
        <option value="CONCLUIDO">Concluída</option>
        <option value="ENCERRADA">Encerrada</option>
      </select>
      <button
        type="submit"
        className="rounded-md bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
      >
        Filtrar
      </button>
    </form>
  );
}

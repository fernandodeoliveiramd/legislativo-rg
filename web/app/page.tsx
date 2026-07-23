import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { ProposicaoCard } from '@/components/ProposicaoCard';
import { SessaoCard } from '@/components/SessaoCard';
import type { Proposicao, Sessao } from '@/lib/types';

export const revalidate = 900; // 15 min

export default async function HomePage() {
  const [{ data: sessoes }, { data: proposicoes }] = await Promise.all([
    supabase
      .from('sessoes')
      .select('*')
      .order('data_sessao', { ascending: false })
      .limit(4),
    supabase
      .from('proposicoes')
      .select('*')
      .order('data_protocolo', { ascending: false })
      .limit(6),
  ]);

  return (
    <div className="space-y-12">
      <section>
        <h1 className="text-2xl font-bold text-gray-900">
          Acompanhe o que a Câmara de Rio Grande está discutindo
        </h1>
        <p className="mt-2 text-gray-600">
          Projetos de lei, indicações, requerimentos e o conteúdo de cada sessão plenária, em um
          só lugar e com busca por texto.
        </p>
      </section>

      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Sessões recentes</h2>
          <Link href="/sessoes" className="text-sm font-medium text-brand-600 hover:underline">
            Ver todas
          </Link>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {(sessoes as Sessao[] | null)?.map((s) => (
            <SessaoCard key={s.id} sessao={s} />
          ))}
          {!sessoes?.length && (
            <p className="text-sm text-gray-500">Nenhuma sessão sincronizada ainda.</p>
          )}
        </div>
      </section>

      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Proposições recentes</h2>
          <Link
            href="/proposicoes"
            className="text-sm font-medium text-brand-600 hover:underline"
          >
            Ver todas
          </Link>
        </div>
        <div className="grid gap-3">
          {(proposicoes as Proposicao[] | null)?.map((p) => (
            <ProposicaoCard key={p.id} proposicao={p} />
          ))}
          {!proposicoes?.length && (
            <p className="text-sm text-gray-500">Nenhuma proposição sincronizada ainda.</p>
          )}
        </div>
      </section>
    </div>
  );
}

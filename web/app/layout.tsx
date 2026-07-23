import type { Metadata } from 'next';
import Link from 'next/link';
import './globals.css';

export const metadata: Metadata = {
  title: 'Legislativo RG — Transparência da Câmara de Rio Grande',
  description:
    'Acompanhe proposições e sessões da Câmara Municipal de Rio Grande (RS) de forma simples e pesquisável.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className="flex min-h-screen flex-col bg-gray-50">
        <header className="border-b border-gray-200 bg-white">
          <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
            <Link href="/" className="text-lg font-bold text-gray-900">
              Legislativo RG
            </Link>
            <nav className="flex gap-6 text-sm font-medium text-gray-600">
              <Link href="/proposicoes" className="hover:text-brand-600">
                Proposições
              </Link>
              <Link href="/sessoes" className="hover:text-brand-600">
                Sessões
              </Link>
            </nav>
          </div>
        </header>

        <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8">{children}</main>

        <footer className="border-t border-gray-200 bg-white">
          <div className="mx-auto max-w-5xl px-4 py-6 text-xs text-gray-500">
            <p>
              Projeto independente de transparência legislativa, sem vínculo oficial com a Câmara
              Municipal de Rio Grande. Dados públicos obtidos do{' '}
              <a
                href="https://cmriogrande.cittatec.com.br/portal-legislativo/proposicoes/consulta"
                target="_blank"
                rel="noopener noreferrer"
                className="underline"
              >
                portal legislativo oficial
              </a>
              .
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}

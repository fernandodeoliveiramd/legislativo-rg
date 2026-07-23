# Legislativo RG

Plataforma independente de transparência legislativa da Câmara Municipal de Rio Grande (RS).
Publica proposições e o conteúdo de cada sessão plenária a partir dos dados públicos do portal
oficial (EPROCLEG/Cittatec), sem exigir login.

## Como funciona

```
API GraphQL da Câmara  →  sync/ (GitHub Actions, a cada 4h)  →  Supabase (Postgres)  →  web/ (Next.js na Vercel)
```

- **`sync/`** — script Node que busca proposições e sessões na API pública da Câmara e grava no
  Supabase. Roda sozinho via GitHub Actions; também dá pra rodar manualmente.
- **`supabase/migrations/`** — schema SQL do banco (tabelas, índices de busca, permissões).
- **`web/`** — site público em Next.js, lê os dados do Supabase (somente leitura).

Tudo nesse stack roda no free tier: Supabase, Vercel e GitHub Actions.

## Pré-requisitos

- Conta no [Supabase](https://supabase.com) (free tier)
- Conta no [Vercel](https://vercel.com) (free tier)
- Repositório no GitHub (pra rodar o sync agendado)
- [Node.js](https://nodejs.org) 18+ instalado, se for rodar/testar localmente

> Esta máquina não tinha Node.js instalado durante o desenvolvimento, então o código foi escrito
> com base nas queries já validadas manualmente contra a API de origem, mas **ainda não foi
> rodado localmente**. Antes de confiar no deploy, vale rodar `npm install` em `sync/` e `web/`
> pra pegar qualquer erro de sintaxe/dependência cedo.

## 1. Criar o banco (Supabase)

1. Crie um projeto novo no Supabase.
2. Vá em **SQL Editor** e rode o conteúdo de `supabase/migrations/0001_init.sql`.
3. Em **Project Settings > API**, anote:
   - `Project URL`
   - `anon` `public` key (vai no frontend)
   - `service_role` key (vai **só** no job de sync — nunca no frontend)

## 2. Rodar a sincronização inicial (backfill)

```bash
cd sync
cp .env.example .env      # preencha SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY
npm install
npm run sync:backfill     # sincroniza 2023–2026 (ajuste os anos em package.json se quiser)
```

Isso popula o banco com o histórico. Depois disso, o normal é deixar o GitHub Actions rodar
sozinho (só o ano corrente, a cada 4h — barato e suficiente pra pegar itens novos e mudanças de
status).

## 3. Configurar o sync automático (GitHub Actions)

1. Suba este repositório pro GitHub.
2. Em **Settings > Secrets and variables > Actions**, crie:
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
3. O workflow `.github/workflows/sync.yml` já roda a cada 4h. Pra disparar manualmente (útil pra
   testar ou refazer um backfill), vá em **Actions > Sincronizar dados da Câmara > Run workflow**
   e opcionalmente informe os anos.

## 4. Rodar o frontend localmente

```bash
cd web
cp .env.example .env.local   # preencha NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY
npm install
npm run dev
```

## 5. Deploy do frontend (Vercel)

1. Importe o repositório na Vercel.
2. Configure **Root Directory** para `web`.
3. Adicione as env vars `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
4. Deploy. O domínio gratuito (`*.vercel.app`) já serve pra começar.

## Notas técnicas sobre a fonte de dados

Achados durante a engenharia reversa da API pública, pra quem for mexer em `sync/` no futuro:

- A API GraphQL (`/api/open-data-leg/public/graphql`) exige o header `ID-Tenant: cmriogrande` —
  sem ele, qualquer query retorna um genérico "Internal Server Error" em vez de um erro claro.
- O filtro `ANO` tem formato **diferente** entre queries: em `proposicoes` é um range em string
  (`"[2026,2026]"`); em `sessoes` é um valor único (`"2026"`). Usar o formato errado também
  resulta em "Internal Server Error".
- O campo `atividades` (pauta) de `SessaoPlenaria` sempre voltou vazio nos testes — o schema já
  está pronto pra quando a Câmara passar a preencher isso, mas não force esse dado.
- Não confirmamos uma URL direta de download de PDF (`documento.id` é um UUID, mas nenhum padrão
  de endpoint testado funcionou) — por isso as páginas de proposição linkam de volta ao portal
  oficial em vez de tentar montar esse link.

## Roadmap (não implementado ainda)

- Cadastro de vereadores + presença por sessão (a tabela `vereadores`/`sessao_presencas` já existe
  no schema, mas o sync ainda não popula — precisa investigar o filtro da query
  `parlamentaresSessao`).
- Inscrição/notificação por proposição (o portal oficial já tem um botão "Inscrever-se" — dá pra
  inspirar uma função parecida usando Supabase Auth, que é free tier também).
- Domínio próprio.

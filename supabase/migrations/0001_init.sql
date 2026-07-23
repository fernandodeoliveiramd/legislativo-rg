-- Câmara RG — schema inicial
-- Fonte dos dados: API pública GraphQL da EPROCLEG (Cittatec), tenant cmriogrande.
-- Convenção: os IDs são os mesmos IDs retornados pela API de origem (não gerados aqui),
-- o que torna o upsert do job de sync idempotente.

create extension if not exists pg_trgm;

-- ========== VEREADORES ==========

create table if not exists vereadores (
  id bigint primary key,               -- Pessoa.id na origem
  nome text not null,
  partido_sigla text,
  partido_nome text,
  imagem text,
  biografia text,
  raw jsonb,
  atualizado_em timestamptz not null default now()
);

-- ========== PROPOSIÇÕES ==========

create table if not exists proposicoes (
  id bigint primary key,               -- ProcessoLegislativo.id na origem
  processo_id bigint,                  -- Processo.id (normalmente igual ao id acima)
  tipo text,                           -- classificacao.descricao (ex: "INDICAÇÃO")
  titulo text not null,                -- ex: "INDICAÇÃO Nº 306/2026"
  ementa text,                         -- descricao
  protocolo_numero integer,
  data_protocolo timestamptz,
  data_publicacao timestamptz,
  status text,                         -- status.name
  status_descricao text,               -- status.description
  status_tramitacao text,              -- statusTramitacao.name
  status_tramitacao_descricao text,    -- statusTramitacao.description
  autores jsonb,                       -- [{id, nome, participacao}]
  autor_principal text,                -- nome do primeiro autor, pra facilitar listagem/filtro
  documento_id uuid,                   -- Documento.id na origem (URL de download direta não
                                        -- confirmada — o frontend linka de volta ao portal oficial)
  ano integer,                         -- extraído de data_protocolo, pra filtro rápido
  raw jsonb,                           -- payload bruto da origem (evolução de schema sem novo fetch)
  atualizado_em timestamptz not null default now(),
  busca tsvector generated always as (
    setweight(to_tsvector('portuguese', coalesce(titulo, '')), 'A') ||
    setweight(to_tsvector('portuguese', coalesce(ementa, '')), 'B') ||
    setweight(to_tsvector('portuguese', coalesce(autor_principal, '')), 'C')
  ) stored
);

create index if not exists idx_proposicoes_busca on proposicoes using gin (busca);
create index if not exists idx_proposicoes_data_protocolo on proposicoes (data_protocolo desc);
create index if not exists idx_proposicoes_tipo on proposicoes (tipo);
create index if not exists idx_proposicoes_status_tramitacao on proposicoes (status_tramitacao);
create index if not exists idx_proposicoes_ano on proposicoes (ano);

-- ========== SESSÕES PLENÁRIAS ==========

create table if not exists sessoes (
  id bigint primary key,               -- SessaoPlenaria.id na origem
  titulo text,                         -- processo.titulo (ex: "SESSÃO ORDINÁRIA Nº 65/2026")
  tipo text,                           -- tipoSessao.classificacao.descricao
  status text,                         -- status.name (ex: CONCLUIDO)
  data_sessao timestamptz,
  inicio timestamptz,
  fim timestamptz,
  duracao_formatada text,
  video_url text,
  ano integer,
  raw jsonb,
  atualizado_em timestamptz not null default now()
);

create index if not exists idx_sessoes_data on sessoes (data_sessao desc);
create index if not exists idx_sessoes_ano on sessoes (ano);

-- Pauta de cada sessão (pode ficar vazia — a origem nem sempre preenche isso)
create table if not exists sessao_atividades (
  id bigint primary key,               -- SessaoPlenariaAtividade.id
  sessao_id bigint references sessoes(id) on delete cascade,
  proposicao_id bigint references proposicoes(id) on delete set null,
  inicio timestamptz,
  fim timestamptz,
  votacao_resultado text,
  votacao_favoraveis integer,
  votacao_contrarios integer,
  votacao_abstidos integer,
  votacao_impedidos integer,
  votacao_ausentes integer,
  raw jsonb
);

create index if not exists idx_sessao_atividades_sessao on sessao_atividades (sessao_id);
create index if not exists idx_sessao_atividades_proposicao on sessao_atividades (proposicao_id);

-- Presença dos vereadores em cada sessão
create table if not exists sessao_presencas (
  sessao_id bigint references sessoes(id) on delete cascade,
  vereador_id bigint references vereadores(id) on delete cascade,
  cargo text,
  esteve_presente boolean,
  primary key (sessao_id, vereador_id)
);

-- ========== ROW LEVEL SECURITY ==========
-- Leitura pública liberada (é um portal de transparência, sem login).
-- Escrita: só o service_role (usado pelo job de sync) pode gravar — a RLS
-- não impõe policy de insert/update/delete pra ninguém, e o service_role
-- do Supabase ignora RLS por padrão.

alter table vereadores enable row level security;
alter table proposicoes enable row level security;
alter table sessoes enable row level security;
alter table sessao_atividades enable row level security;
alter table sessao_presencas enable row level security;

create policy "leitura publica" on vereadores for select using (true);
create policy "leitura publica" on proposicoes for select using (true);
create policy "leitura publica" on sessoes for select using (true);
create policy "leitura publica" on sessao_atividades for select using (true);
create policy "leitura publica" on sessao_presencas for select using (true);

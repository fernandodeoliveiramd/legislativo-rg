function yearFromDate(isoString) {
  if (!isoString) return null;
  const year = new Date(isoString).getFullYear();
  return Number.isNaN(year) ? null : year;
}

// A origem serializa datas de dois jeitos: com "Z" (ex: /sobre, que usa
// Instant/UTC) e sem sufixo nenhum (dataProtocolo, dataSessao, inicio, fim
// — que usam LocalDateTime, horário de Brasília). Sem isso, o Postgres
// (sessão em UTC) interpretaria "13:58:52" como UTC em vez de 13:58:52
// em Brasília, desalinhando tudo em 3h. Brasil não tem mais horário de
// verão desde 2019, então o offset fixo -03:00 é seguro.
function comOffsetBrasilia(value) {
  if (!value) return null;
  if (/[Zz]$|[+-]\d{2}:\d{2}$/.test(value)) return value; // já tem timezone
  return `${value}-03:00`;
}

export function mapProposicao(item) {
  const processo = item.processo ?? {};
  const autores = processo.autores ?? [];
  return {
    id: item.id,
    processo_id: processo.id ?? item.id,
    tipo: processo.classificacao?.descricao ?? null,
    titulo: processo.titulo,
    ementa: processo.descricao ?? null,
    protocolo_numero: processo.nroProtocolo ?? null,
    data_protocolo: comOffsetBrasilia(processo.dataProtocolo),
    data_publicacao: comOffsetBrasilia(processo.dataPublicacao),
    status: processo.status?.name ?? null,
    status_descricao: processo.status?.description ?? null,
    status_tramitacao: processo.statusTramitacao?.name ?? null,
    status_tramitacao_descricao: processo.statusTramitacao?.description ?? null,
    autores,
    autor_principal: autores[0]?.nome ?? null,
    documento_id: processo.documento?.id ?? null,
    ano: yearFromDate(comOffsetBrasilia(processo.dataProtocolo)),
    raw: item,
    atualizado_em: new Date().toISOString(),
  };
}

export function mapSessao(item) {
  return {
    id: item.id,
    titulo: item.processo?.titulo ?? null,
    tipo: item.tipoSessao?.classificacao?.descricao ?? null,
    status: item.status?.name ?? null,
    data_sessao: comOffsetBrasilia(item.dataSessao),
    inicio: comOffsetBrasilia(item.inicio),
    fim: comOffsetBrasilia(item.fim),
    duracao_formatada: item.duracaoFormatada ?? null,
    video_url: item.url ?? null,
    ano: yearFromDate(comOffsetBrasilia(item.dataSessao)),
    raw: item,
    atualizado_em: new Date().toISOString(),
  };
}

// A origem às vezes não preenche a pauta (atividades vem null) — quando
// preencher, isso já fica pronto pra gravar sem precisar mexer no sync.
export function mapAtividades(sessaoId, atividades) {
  if (!Array.isArray(atividades)) return [];
  return atividades
    .filter((a) => a && a.id != null)
    .map((a) => ({
      id: a.id,
      sessao_id: sessaoId,
      proposicao_id: a.proposicao?.id ?? null,
      inicio: comOffsetBrasilia(a.inicio),
      fim: comOffsetBrasilia(a.fim),
      votacao_resultado: a.votacao?.resultado ?? null,
      votacao_favoraveis: a.votacao?.favoraveis ?? null,
      votacao_contrarios: a.votacao?.contrarios ?? null,
      votacao_abstidos: a.votacao?.abstidos ?? null,
      votacao_impedidos: a.votacao?.impedidos ?? null,
      votacao_ausentes: a.votacao?.ausentes ?? null,
      raw: a,
    }));
}

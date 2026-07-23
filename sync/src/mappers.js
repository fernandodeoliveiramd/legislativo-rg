function yearFromDate(isoString) {
  if (!isoString) return null;
  const year = new Date(isoString).getFullYear();
  return Number.isNaN(year) ? null : year;
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
    data_protocolo: processo.dataProtocolo ?? null,
    data_publicacao: processo.dataPublicacao ?? null,
    status: processo.status?.name ?? null,
    status_descricao: processo.status?.description ?? null,
    status_tramitacao: processo.statusTramitacao?.name ?? null,
    status_tramitacao_descricao: processo.statusTramitacao?.description ?? null,
    autores,
    autor_principal: autores[0]?.nome ?? null,
    documento_id: processo.documento?.id ?? null,
    ano: yearFromDate(processo.dataProtocolo),
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
    data_sessao: item.dataSessao ?? null,
    inicio: item.inicio ?? null,
    fim: item.fim ?? null,
    duracao_formatada: item.duracaoFormatada ?? null,
    video_url: item.url ?? null,
    ano: yearFromDate(item.dataSessao),
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
      inicio: a.inicio ?? null,
      fim: a.fim ?? null,
      votacao_resultado: a.votacao?.resultado ?? null,
      votacao_favoraveis: a.votacao?.favoraveis ?? null,
      votacao_contrarios: a.votacao?.contrarios ?? null,
      votacao_abstidos: a.votacao?.abstidos ?? null,
      votacao_impedidos: a.votacao?.impedidos ?? null,
      votacao_ausentes: a.votacao?.ausentes ?? null,
      raw: a,
    }));
}

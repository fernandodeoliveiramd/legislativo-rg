export interface Autor {
  id: number;
  nome: string;
  autorReparticao?: boolean;
  participacao?: { name: string; descricao: string };
}

export interface Proposicao {
  id: number;
  processo_id: number | null;
  tipo: string | null;
  titulo: string;
  ementa: string | null;
  protocolo_numero: number | null;
  data_protocolo: string | null;
  data_publicacao: string | null;
  status: string | null;
  status_descricao: string | null;
  status_tramitacao: string | null;
  status_tramitacao_descricao: string | null;
  autores: Autor[] | null;
  autor_principal: string | null;
  documento_id: string | null;
  ano: number | null;
  atualizado_em: string;
}

export interface Sessao {
  id: number;
  titulo: string | null;
  tipo: string | null;
  status: string | null;
  data_sessao: string | null;
  inicio: string | null;
  fim: string | null;
  duracao_formatada: string | null;
  video_url: string | null;
  ano: number | null;
  atualizado_em: string;
}

export interface SessaoAtividade {
  id: number;
  sessao_id: number;
  proposicao_id: number | null;
  inicio: string | null;
  fim: string | null;
  votacao_resultado: string | null;
  votacao_favoraveis: number | null;
  votacao_contrarios: number | null;
  votacao_abstidos: number | null;
  votacao_impedidos: number | null;
  votacao_ausentes: number | null;
}

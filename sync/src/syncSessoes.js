import { gql } from './graphqlClient.js';
import { supabase } from './supabaseClient.js';
import { mapSessao, mapAtividades } from './mappers.js';
import { config } from './config.js';

const QUERY = `
  query($page: Int!, $size: Int!, $filters: [SessaoPlenariaFilterInput!]) {
    sessoes(page: $page, size: $size, filters: $filters) {
      id
      processo { titulo }
      status { name }
      tipoSessao { classificacao { descricao } }
      dataSessao
      inicio
      fim
      duracaoFormatada
      url
      atividades {
        id
        inicio
        fim
        proposicao { id }
        votacao { resultado favoraveis contrarios abstidos impedidos ausentes }
      }
    }
  }
`;

async function fetchYear(year) {
  // Diferente de proposições: aqui ANO é um valor único, não um range "[x,y]"
  // (testado e confirmado — usar range aqui quebra a query).
  const filters = [
    { key: 'ANO', value: String(year) },
    { key: 'MODULO', value: 'LEGISLATIVO' },
  ];
  const items = [];
  for (let page = 0; page < config.maxPages; page++) {
    const data = await gql(QUERY, { page, size: config.pageSize, filters });
    const batch = data.sessoes ?? [];
    items.push(...batch);
    if (batch.length < config.pageSize) break;
  }
  return items;
}

export async function syncSessoes(years) {
  let total = 0;
  let totalAtividades = 0;
  for (const year of years) {
    const items = await fetchYear(year);
    if (items.length === 0) {
      console.log(`[sessoes] ${year}: nada encontrado`);
      continue;
    }

    const rows = items.map(mapSessao);
    const { error } = await supabase.from('sessoes').upsert(rows, { onConflict: 'id' });
    if (error) throw new Error(`[sessoes] upsert falhou: ${error.message}`);

    const atividades = items.flatMap((item) => mapAtividades(item.id, item.atividades));
    if (atividades.length > 0) {
      const { error: errAtiv } = await supabase
        .from('sessao_atividades')
        .upsert(atividades, { onConflict: 'id' });
      if (errAtiv) throw new Error(`[sessao_atividades] upsert falhou: ${errAtiv.message}`);
      totalAtividades += atividades.length;
    }

    console.log(`[sessoes] ${year}: ${rows.length} sincronizadas (${atividades.length} atividades)`);
    total += rows.length;
  }
  return { sessoes: total, atividades: totalAtividades };
}

import { gql } from './graphqlClient.js';
import { supabase } from './supabaseClient.js';
import { mapProposicao } from './mappers.js';
import { config } from './config.js';

const QUERY = `
  query($page: Int!, $size: Int!, $filters: [ProcessoLegislativoFilterInput!]) {
    proposicoes(page: $page, size: $size, filters: $filters) {
      id
      processo {
        id
        documento { id }
        descricao
        titulo
        nroProtocolo
        dataProtocolo
        dataPublicacao
        classificacao { descricao }
        status { name description }
        statusTramitacao { name description }
        autores {
          id
          nome
          autorReparticao
          participacao { name descricao }
        }
      }
    }
  }
`;

async function fetchYear(year) {
  const filters = [
    { key: 'ANO', value: `[${year},${year}]` },
    { key: 'MODULO', value: 'LEGISLATIVO' },
  ];
  const rows = [];
  for (let page = 0; page < config.maxPages; page++) {
    const data = await gql(QUERY, { page, size: config.pageSize, filters });
    const items = data.proposicoes ?? [];
    rows.push(...items.map(mapProposicao));
    if (items.length < config.pageSize) break;
  }
  return rows;
}

export async function syncProposicoes(years) {
  let total = 0;
  for (const year of years) {
    const rows = await fetchYear(year);
    if (rows.length === 0) {
      console.log(`[proposicoes] ${year}: nada encontrado`);
      continue;
    }
    // upsert em lotes pra não estourar o tamanho do payload
    for (let i = 0; i < rows.length; i += 500) {
      const batch = rows.slice(i, i + 500);
      const { error } = await supabase.from('proposicoes').upsert(batch, { onConflict: 'id' });
      if (error) throw new Error(`[proposicoes] upsert falhou: ${error.message}`);
    }
    console.log(`[proposicoes] ${year}: ${rows.length} sincronizadas`);
    total += rows.length;
  }
  return total;
}

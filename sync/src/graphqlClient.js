import { config } from './config.js';

// A API de origem exige o header ID-Tenant (achado via engenharia reversa do
// localStorage do portal) — sem ele, todo campo retorna "Internal Server Error"
// em vez de um erro de autenticação claro.
export async function gql(query, variables) {
  const res = await fetch(config.graphqlUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'ID-Tenant': config.tenantId,
    },
    body: JSON.stringify({ query, variables }),
  });

  if (!res.ok) {
    throw new Error(`GraphQL HTTP ${res.status}: ${await res.text()}`);
  }

  const json = await res.json();
  if (json.errors?.length) {
    throw new Error(`GraphQL error: ${json.errors.map((e) => e.message).join('; ')}`);
  }
  return json.data;
}

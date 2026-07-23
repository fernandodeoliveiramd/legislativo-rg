import 'dotenv/config';

function required(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Variável de ambiente obrigatória ausente: ${name}`);
  }
  return value;
}

export const config = {
  tenantId: process.env.TENANT_ID || 'cmriogrande',
  graphqlUrl:
    process.env.GRAPHQL_URL ||
    'https://cmriogrande.cittatec.com.br/api/open-data-leg/public/graphql',
  supabaseUrl: required('SUPABASE_URL'),
  supabaseServiceRoleKey: required('SUPABASE_SERVICE_ROLE_KEY'),
  pageSize: 50, // a API rejeita páginas maiores que isso
  maxPages: 500, // trava de segurança contra loop infinito
};

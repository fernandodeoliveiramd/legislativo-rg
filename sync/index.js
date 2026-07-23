import { syncProposicoes } from './src/syncProposicoes.js';
import { syncSessoes } from './src/syncSessoes.js';

function parseYears() {
  const arg = process.argv.find((a) => a.startsWith('--years='));
  if (arg) {
    return arg
      .replace('--years=', '')
      .split(',')
      .map((y) => parseInt(y.trim(), 10))
      .filter((y) => !Number.isNaN(y));
  }
  // Padrão: só o ano corrente — barato o suficiente pra rodar a cada poucas
  // horas e pegar proposições novas + mudanças de status/tramitação.
  return [new Date().getFullYear()];
}

async function main() {
  const years = parseYears();
  console.log(`Sincronizando anos: ${years.join(', ')}`);

  const totalProposicoes = await syncProposicoes(years);
  const { sessoes, atividades } = await syncSessoes(years);

  console.log('---');
  console.log(`Proposições: ${totalProposicoes}`);
  console.log(`Sessões: ${sessoes} (atividades: ${atividades})`);
}

main().catch((err) => {
  console.error('Falha na sincronização:', err);
  process.exit(1);
});

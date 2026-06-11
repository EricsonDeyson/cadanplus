const brl = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
const inteiro = new Intl.NumberFormat('pt-BR');

export const formatBRL = (value: number) => brl.format(value);
export const formatInt = (value: number) => inteiro.format(value);

/** R$ 206,2 mi · R$ 5,4 mil — para eixos e cards. */
export function formatBRLCompact(value: number): string {
  const abs = Math.abs(value);
  if (abs >= 1e9) return `R$ ${(value / 1e9).toLocaleString('pt-BR', { maximumFractionDigits: 1 })} bi`;
  if (abs >= 1e6) return `R$ ${(value / 1e6).toLocaleString('pt-BR', { maximumFractionDigits: 1 })} mi`;
  if (abs >= 1e3) return `R$ ${(value / 1e3).toLocaleString('pt-BR', { maximumFractionDigits: 0 })} mil`;
  return brl.format(value);
}

export const MESES_CURTOS = [
  'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
  'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez',
];

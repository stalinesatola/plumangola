/**
 * Câmbio de referência usado para mostrar os preços em USD e para calcular o
 * sinal cobrado no Stripe Checkout. Fonte: taxa de referência do BNA, a mesma
 * indicada no Preçário 2026/2027 (team-bots/precario.pdf).
 *
 * Para atualizar: muda os dois valores abaixo e faz deploy. Os preços em Kz
 * do preçário são fixos; só a conversão para USD depende desta taxa.
 */
export const KZ_POR_USD = 913;
export const DATA_CAMBIO = "2026-11-16";

/** Validade do preçário (texto mostrado na página). */
export const PRECARIO_VALIDO_ATE = "2027-03-31";

/** Limite do preçário para o pagamento 50% + 50% (acima: 40/30/30). */
export const LIMITE_SINAL_50_KZ = 500_000;

export type Idioma = "pt" | "en";

function agrupar(valor: number, separador: string): string {
  return Math.round(valor)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, separador);
}

/**
 * Formatação manual (sem Intl) para dar exatamente o mesmo resultado no
 * servidor e no browser, independentemente dos dados ICU instalados.
 */
export function formatarKz(valor: number, idioma: Idioma): string {
  return `${agrupar(valor, idioma === "pt" ? "." : ",")} Kz`;
}

export function kzParaUsd(valor: number): number {
  return valor / KZ_POR_USD;
}

/** Valor aproximado em USD, arredondado ao dólar (para montra). */
export function formatarUsdAprox(valorKz: number, idioma: Idioma): string {
  const usd = Math.round(kzParaUsd(valorKz));
  return `≈ US$ ${agrupar(usd, idioma === "pt" ? "." : ",")}`;
}

/** Valor exato em cêntimos de USD (para cobrança). */
export function kzParaCentimosUsd(valorKz: number): number {
  return Math.round((valorKz / KZ_POR_USD) * 100);
}

export function formatarUsdCentimos(centimos: number, idioma: Idioma): string {
  const inteiro = Math.floor(centimos / 100);
  const resto = (centimos % 100).toString().padStart(2, "0");
  return idioma === "pt"
    ? `US$ ${agrupar(inteiro, ".")},${resto}`
    : `US$ ${agrupar(inteiro, ",")}.${resto}`;
}

export function formatarData(iso: string, idioma: Idioma): string {
  const [a, m, d] = iso.split("-");
  return idioma === "pt" ? `${d}/${m}/${a}` : `${a}-${m}-${d}`;
}

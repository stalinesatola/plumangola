import * as cheerio from "cheerio";

export type ProdutoImportado = {
  nome: string;
  descricao: string;
  imagem: string;
  precoCompra: number | null;
  moedaCompra: string | null;
};

const SIMBOLOS_MOEDA: Record<string, string> = {
  "$": "USD",
  "€": "EUR",
  "kz": "AOA",
};

function extrairPrecoEMoeda(texto: string): { preco: number | null; moeda: string | null } {
  const limpo = texto.trim();
  if (!limpo) return { preco: null, moeda: null };

  const numeroMatch = limpo.match(/[\d.,]+/);
  const preco = numeroMatch
    ? Number.parseFloat(numeroMatch[0].replace(/\.(?=\d{3})/g, "").replace(",", "."))
    : null;

  let moeda: string | null = null;
  for (const [simbolo, codigo] of Object.entries(SIMBOLOS_MOEDA)) {
    if (limpo.toLowerCase().includes(simbolo)) {
      moeda = codigo;
      break;
    }
  }
  if (/\bR\s?\d/.test(limpo)) moeda = "ZAR";

  const codigoMatch = limpo.match(/\b(USD|EUR|AOA|ZAR)\b/i);
  if (codigoMatch) moeda = codigoMatch[0].toUpperCase();

  return { preco: preco && !Number.isNaN(preco) ? preco : null, moeda: moeda ?? "USD" };
}

/**
 * Faz scraping de uma página de produto individual em arthur-ford.com.
 *
 * IMPORTANTE: só funciona quando corrido num ambiente com acesso real à
 * internet (ex: em produção na Vercel) — este dev sandbox não tem acesso a
 * arthur-ford.com. Os seletores abaixo são um ponto de partida best-effort;
 * ajusta-os depois de inspecionar o HTML real de uma página de produto.
 */
export async function scrapeProdutoArthurFord(url: string): Promise<ProdutoImportado> {
  const resposta = await fetch(url, {
    headers: { "User-Agent": "Mozilla/5.0 (compatible; PlumAngolaBot/1.0)" },
  });

  if (!resposta.ok) {
    throw new Error(`Falha ao aceder a ${url}: HTTP ${resposta.status}`);
  }

  const html = await resposta.text();
  const $ = cheerio.load(html);

  const nome =
    $('meta[property="og:title"]').attr("content")?.trim() ||
    $("h1.product-title, h1.product__title, h1").first().text().trim() ||
    "";

  const descricao =
    $('meta[name="description"]').attr("content")?.trim() ||
    $('meta[property="og:description"]').attr("content")?.trim() ||
    $(".product-description, .product__description").first().text().trim() ||
    "";

  const imagem =
    $('meta[property="og:image"]').attr("content")?.trim() ||
    $(".product-gallery img, .product__media img, img").first().attr("src") ||
    "";

  const precoTexto = $(".price, .product-price, .product__price")
    .first()
    .text()
    .trim();
  const { preco, moeda } = extrairPrecoEMoeda(precoTexto);

  if (!nome) {
    throw new Error(
      "Não foi possível identificar o nome do produto nesta página. " +
        "Os seletores em lib/scrape-produto.ts podem precisar de ajuste."
    );
  }

  return {
    nome,
    descricao,
    imagem,
    precoCompra: preco,
    moedaCompra: moeda,
  };
}

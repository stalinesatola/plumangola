/**
 * Script standalone LEGADO que gera data/dlamini-loja/products.json a partir
 * dos produtos publicados em arthur-ford.com (scraping em massa da página
 * inicial). Desde que o catálogo passou a viver na base de dados Postgres
 * (ver lib/produtos.ts e o painel /admin), este ficheiro deixou de ser lido
 * por qualquer código em runtime — serve só como referência histórica ou
 * para gerar um seed inicial de produtos.
 *
 * Para importar produtos individuais a partir de um link específico, usa
 * antes o painel de admin (/admin/produtos/novo -> "Importar por link"),
 * que usa lib/scrape-produto.ts.
 *
 * IMPORTANTE: este script NÃO corre dentro do sandbox usado para desenvolver
 * este repositório (o acesso de rede a arthur-ford.com está bloqueado aí).
 * Corre-o localmente ou noutro ambiente com acesso à internet:
 *
 *   npm run scrape:dlamini-loja
 *
 * A estrutura de arthur-ford.com (seletores HTML, paginação, proteção
 * anti-bot) não foi verificada — ajusta os seletores abaixo depois de
 * inspecionar o site real.
 */

import { writeFile } from "node:fs/promises";
import path from "node:path";
import * as cheerio from "cheerio";
import { slugify } from "../lib/slug";

const ORIGEM = "https://arthur-ford.com/";
const DESTINO = path.join(
  process.cwd(),
  "data",
  "dlamini-loja",
  "products.json"
);

type ProdutoScrapado = {
  id: string;
  slug: string;
  nome: string;
  descricao: string;
  preco: number;
  moeda: string;
  imagem: string;
  categoria: string;
  disponivel: boolean;
};

async function extrairProdutos(): Promise<ProdutoScrapado[]> {
  const resposta = await fetch(ORIGEM);
  if (!resposta.ok) {
    throw new Error(`Falha ao aceder a ${ORIGEM}: HTTP ${resposta.status}`);
  }

  const html = await resposta.text();
  const $ = cheerio.load(html);

  // TODO: ajustar os seletores abaixo depois de inspecionar a estrutura
  // real de arthur-ford.com — estes são apenas um ponto de partida.
  const produtos: ProdutoScrapado[] = [];

  $("[data-produto], .product, .produto").each((indice, elemento) => {
    const nome = $(elemento).find(".product-title, .nome, h2, h3").first().text().trim();
    const precoTexto = $(elemento)
      .find(".price, .preco")
      .first()
      .text()
      .replace(/[^\d.,]/g, "")
      .replace(",", ".");
    const imagem = $(elemento).find("img").first().attr("src") ?? "";
    const descricao = $(elemento)
      .find(".description, .descricao, p")
      .first()
      .text()
      .trim();

    if (!nome) return;

    produtos.push({
      id: `prod-${indice + 1}`,
      slug: slugify(nome),
      nome,
      descricao: descricao || nome,
      preco: Number.parseFloat(precoTexto) || 0,
      moeda: "AOA",
      imagem: imagem || "/dlamini-loja/placeholder.svg",
      categoria: "Geral",
      disponivel: true,
    });
  });

  return produtos;
}

async function main() {
  const produtos = await extrairProdutos();

  if (produtos.length === 0) {
    console.warn(
      "Nenhum produto encontrado — verifica os seletores em scripts/scrape-arthur-ford.ts " +
        "contra a estrutura real de arthur-ford.com."
    );
    return;
  }

  await writeFile(
    DESTINO,
    JSON.stringify(
      {
        _readme:
          "Catálogo gerado por scripts/scrape-arthur-ford.ts a partir de arthur-ford.com.",
        moedaPredefinida: "AOA",
        produtos,
      },
      null,
      2
    ),
    "utf-8"
  );

  console.log(`${produtos.length} produtos guardados em ${DESTINO}`);
}

main().catch((erro) => {
  console.error(erro);
  process.exitCode = 1;
});

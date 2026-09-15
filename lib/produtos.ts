import { sql } from "@/lib/db";
import { slugify } from "@/lib/slug";

export type Produto = {
  id: number;
  slug: string;
  nome: string;
  descricao: string;
  imagem: string;
  categoria: string;
  precoCompra: number | null;
  moedaCompra: string | null;
  precoVenda: number;
  moedaVenda: string;
  stock: number;
  stockMinimo: number;
  ativo: boolean;
  origemUrl: string | null;
  createdAt: string;
  updatedAt: string;
};

export type NovoProdutoInput = {
  nome: string;
  descricao: string;
  imagem: string;
  categoria: string;
  precoCompra: number | null;
  moedaCompra: string | null;
  precoVenda: number;
  moedaVenda?: string;
  stock: number;
  stockMinimo: number;
  ativo: boolean;
  origemUrl: string | null;
};

type ProdutoRow = {
  id: number;
  slug: string;
  nome: string;
  descricao: string;
  imagem: string;
  categoria: string;
  preco_compra: string | null;
  moeda_compra: string | null;
  preco_venda: string;
  moeda_venda: string;
  stock: number;
  stock_minimo: number;
  ativo: boolean;
  origem_url: string | null;
  created_at: string;
  updated_at: string;
};

function mapRow(row: ProdutoRow): Produto {
  return {
    id: row.id,
    slug: row.slug,
    nome: row.nome,
    descricao: row.descricao,
    imagem: row.imagem,
    categoria: row.categoria,
    precoCompra: row.preco_compra !== null ? Number(row.preco_compra) : null,
    moedaCompra: row.moeda_compra,
    precoVenda: Number(row.preco_venda),
    moedaVenda: row.moeda_venda,
    stock: row.stock,
    stockMinimo: row.stock_minimo,
    ativo: row.ativo,
    origemUrl: row.origem_url,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function getProdutoStatus(
  produto: Pick<Produto, "stock" | "ativo">
): "disponivel" | "esgotado" | "inativo" {
  if (!produto.ativo) return "inativo";
  return produto.stock > 0 ? "disponivel" : "esgotado";
}

export function formatarPreco(preco: number, moeda: string): string {
  return new Intl.NumberFormat("pt-AO", {
    style: "currency",
    currency: moeda,
    maximumFractionDigits: 0,
  }).format(preco);
}

export async function listarProdutosPublicos(): Promise<Produto[]> {
  const { rows } = await sql<ProdutoRow>`
    SELECT * FROM produtos WHERE ativo = true ORDER BY categoria, nome
  `;
  return rows.map(mapRow);
}

export async function getProdutoPublicoPorSlug(
  slug: string
): Promise<Produto | undefined> {
  const { rows } = await sql<ProdutoRow>`
    SELECT * FROM produtos WHERE ativo = true AND slug = ${slug}
  `;
  return rows[0] ? mapRow(rows[0]) : undefined;
}

export async function listarProdutosAdmin(): Promise<Produto[]> {
  const { rows } = await sql<ProdutoRow>`
    SELECT * FROM produtos ORDER BY nome
  `;
  return rows.map(mapRow);
}

export async function getProdutoAdminPorId(
  id: number
): Promise<Produto | undefined> {
  const { rows } = await sql<ProdutoRow>`
    SELECT * FROM produtos WHERE id = ${id}
  `;
  return rows[0] ? mapRow(rows[0]) : undefined;
}

async function gerarSlugUnico(nome: string, idParaIgnorar?: number): Promise<string> {
  const base = slugify(nome);
  let candidato = base;
  let sufixo = 2;

  while (true) {
    const { rows } = idParaIgnorar
      ? await sql`SELECT id FROM produtos WHERE slug = ${candidato} AND id != ${idParaIgnorar}`
      : await sql`SELECT id FROM produtos WHERE slug = ${candidato}`;

    if (rows.length === 0) return candidato;
    candidato = `${base}-${sufixo}`;
    sufixo += 1;
  }
}

export async function criarProduto(input: NovoProdutoInput): Promise<Produto> {
  const slug = await gerarSlugUnico(input.nome);
  const moedaVenda = input.moedaVenda ?? "AOA";

  const { rows } = await sql<ProdutoRow>`
    INSERT INTO produtos (
      slug, nome, descricao, imagem, categoria,
      preco_compra, moeda_compra, preco_venda, moeda_venda,
      stock, stock_minimo, ativo, origem_url
    ) VALUES (
      ${slug}, ${input.nome}, ${input.descricao}, ${input.imagem}, ${input.categoria},
      ${input.precoCompra}, ${input.moedaCompra}, ${input.precoVenda}, ${moedaVenda},
      ${input.stock}, ${input.stockMinimo}, ${input.ativo}, ${input.origemUrl}
    )
    RETURNING *
  `;
  return mapRow(rows[0]);
}

export async function atualizarProduto(
  id: number,
  input: NovoProdutoInput
): Promise<Produto> {
  const slug = await gerarSlugUnico(input.nome, id);
  const moedaVenda = input.moedaVenda ?? "AOA";

  const { rows } = await sql<ProdutoRow>`
    UPDATE produtos SET
      slug = ${slug},
      nome = ${input.nome},
      descricao = ${input.descricao},
      imagem = ${input.imagem},
      categoria = ${input.categoria},
      preco_compra = ${input.precoCompra},
      moeda_compra = ${input.moedaCompra},
      preco_venda = ${input.precoVenda},
      moeda_venda = ${moedaVenda},
      stock = ${input.stock},
      stock_minimo = ${input.stockMinimo},
      ativo = ${input.ativo},
      origem_url = ${input.origemUrl},
      updated_at = now()
    WHERE id = ${id}
    RETURNING *
  `;

  if (rows.length === 0) {
    throw new Error(`Produto ${id} não encontrado.`);
  }

  return mapRow(rows[0]);
}

export async function apagarProduto(id: number): Promise<void> {
  await sql`DELETE FROM produtos WHERE id = ${id}`;
}

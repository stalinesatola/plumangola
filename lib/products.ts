import produtosData from "@/data/dlamini-loja/products.json";

export type Produto = {
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

export function getDlaminiLojaProdutos(): Produto[] {
  return produtosData.produtos as Produto[];
}

export function getDlaminiLojaProdutoPorSlug(slug: string): Produto | undefined {
  return getDlaminiLojaProdutos().find((produto) => produto.slug === slug);
}

export function formatarPreco(preco: number, moeda: string): string {
  return new Intl.NumberFormat("pt-AO", {
    style: "currency",
    currency: moeda,
    maximumFractionDigits: 0,
  }).format(preco);
}

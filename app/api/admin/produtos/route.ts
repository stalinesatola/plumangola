import { NextRequest, NextResponse } from "next/server";
import { criarProduto, getProdutoPorOrigemUrl, NovoProdutoInput } from "@/lib/produtos";

function validarPayload(payload: Partial<NovoProdutoInput>): string | null {
  if (!payload.nome) return "Nome é obrigatório.";
  if (payload.precoVenda === undefined || payload.precoVenda === null || payload.precoVenda <= 0) {
    return "Preço de venda tem de ser maior que zero.";
  }
  if (payload.stock === undefined || payload.stock < 0) {
    return "Stock inválido.";
  }
  if (payload.stockMinimo === undefined || payload.stockMinimo < 0) {
    return "Stock mínimo inválido.";
  }
  return null;
}

export async function POST(request: NextRequest) {
  let payload: Partial<NovoProdutoInput>;

  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ ok: false, erro: "Pedido inválido." }, { status: 400 });
  }

  const erro = validarPayload(payload);
  if (erro) {
    return NextResponse.json({ ok: false, erro }, { status: 400 });
  }

  if (payload.origemUrl) {
    const produtoExistente = await getProdutoPorOrigemUrl(payload.origemUrl);
    if (produtoExistente) {
      return NextResponse.json(
        {
          ok: false,
          erro: `Este link já foi importado como "${produtoExistente.nome}".`,
        },
        { status: 409 }
      );
    }
  }

  const produto = await criarProduto({
    nome: payload.nome!,
    descricao: payload.descricao ?? "",
    nomeEn: payload.nomeEn ?? null,
    descricaoEn: payload.descricaoEn ?? null,
    imagem: payload.imagem ?? "/dlamini-loja/placeholder.svg",
    categoria: payload.categoria ?? "Geral",
    precoCompra: payload.precoCompra ?? null,
    moedaCompra: payload.moedaCompra ?? null,
    precoVenda: payload.precoVenda!,
    stock: payload.stock!,
    stockMinimo: payload.stockMinimo!,
    ativo: payload.ativo ?? true,
    origemUrl: payload.origemUrl ?? null,
  });

  return NextResponse.json({ ok: true, produto });
}

import { NextRequest, NextResponse } from "next/server";
import { apagarProduto, atualizarProduto, NovoProdutoInput } from "@/lib/produtos";

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

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const id = Number(params.id);
  if (Number.isNaN(id)) {
    return NextResponse.json({ ok: false, erro: "ID inválido." }, { status: 400 });
  }

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

  try {
    const produto = await atualizarProduto(id, {
      nome: payload.nome!,
      descricao: payload.descricao ?? "",
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
  } catch {
    return NextResponse.json(
      { ok: false, erro: "Produto não encontrado." },
      { status: 404 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const id = Number(params.id);
  if (Number.isNaN(id)) {
    return NextResponse.json({ ok: false, erro: "ID inválido." }, { status: 400 });
  }

  await apagarProduto(id);
  return NextResponse.json({ ok: true });
}

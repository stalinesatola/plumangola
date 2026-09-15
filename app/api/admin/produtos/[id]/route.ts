import { NextRequest, NextResponse } from "next/server";
import {
  apagarProduto,
  atualizarProduto,
  getProdutoPorOrigemUrl,
  NovoProdutoInput,
} from "@/lib/produtos";
import { validarPayloadProduto } from "@/lib/validar-produto";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: idParam } = await params;
  const id = Number(idParam);
  if (Number.isNaN(id)) {
    return NextResponse.json({ ok: false, erro: "ID inválido." }, { status: 400 });
  }

  let payload: Partial<NovoProdutoInput>;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ ok: false, erro: "Pedido inválido." }, { status: 400 });
  }

  const erro = validarPayloadProduto(payload);
  if (erro) {
    return NextResponse.json({ ok: false, erro }, { status: 400 });
  }

  try {
    if (payload.origemUrl) {
      const produtoExistente = await getProdutoPorOrigemUrl(payload.origemUrl, id);
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

    const produto = await atualizarProduto(id, {
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
  } catch (erro) {
    if (erro instanceof Error && erro.message.includes("não encontrado")) {
      return NextResponse.json(
        { ok: false, erro: "Produto não encontrado." },
        { status: 404 }
      );
    }
    console.error(`Falha ao atualizar produto ${id}:`, erro);
    return NextResponse.json(
      { ok: false, erro: "Não foi possível guardar o produto. Tenta novamente." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: idParam } = await params;
  const id = Number(idParam);
  if (Number.isNaN(id)) {
    return NextResponse.json({ ok: false, erro: "ID inválido." }, { status: 400 });
  }

  try {
    await apagarProduto(id);
    return NextResponse.json({ ok: true });
  } catch (erro) {
    console.error(`Falha ao apagar produto ${id}:`, erro);
    return NextResponse.json(
      { ok: false, erro: "Não foi possível apagar o produto. Tenta novamente." },
      { status: 500 }
    );
  }
}

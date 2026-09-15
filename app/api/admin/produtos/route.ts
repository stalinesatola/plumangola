import { NextRequest, NextResponse } from "next/server";
import { criarProduto, getProdutoPorOrigemUrl, NovoProdutoInput } from "@/lib/produtos";
import { validarPayloadProduto } from "@/lib/validar-produto";

export async function POST(request: NextRequest) {
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
  } catch (erro) {
    console.error("Falha ao criar produto:", erro);
    return NextResponse.json(
      { ok: false, erro: "Não foi possível guardar o produto. Tenta novamente." },
      { status: 500 }
    );
  }
}

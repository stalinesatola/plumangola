import { NextRequest, NextResponse } from "next/server";
import { scrapeProdutoArthurFord } from "@/lib/scrape-produto";
import { getProdutoPorOrigemUrl } from "@/lib/produtos";

export async function POST(request: NextRequest) {
  let payload: { url?: string };

  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ ok: false, erro: "Pedido inválido." }, { status: 400 });
  }

  if (!payload.url) {
    return NextResponse.json({ ok: false, erro: "URL é obrigatório." }, { status: 400 });
  }

  try {
    const produtoExistente = await getProdutoPorOrigemUrl(payload.url);
    if (produtoExistente) {
      return NextResponse.json(
        {
          ok: false,
          erro: `Este link já foi importado como "${produtoExistente.nome}". Edita esse produto em vez de importar de novo.`,
          produtoExistenteId: produtoExistente.id,
        },
        { status: 409 }
      );
    }

    const dados = await scrapeProdutoArthurFord(payload.url);
    return NextResponse.json({ ok: true, dados });
  } catch (erro) {
    const mensagem = erro instanceof Error ? erro.message : "Falha ao analisar o link.";
    return NextResponse.json({ ok: false, erro: mensagem }, { status: 502 });
  }
}

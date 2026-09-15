import { NextRequest, NextResponse } from "next/server";
import { scrapeProdutoArthurFord } from "@/lib/scrape-produto";

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
    const dados = await scrapeProdutoArthurFord(payload.url);
    return NextResponse.json({ ok: true, dados });
  } catch (erro) {
    const mensagem = erro instanceof Error ? erro.message : "Falha ao analisar o link.";
    return NextResponse.json({ ok: false, erro: mensagem }, { status: 502 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { enviarMensagemTelegram } from "@/lib/telegram";
import { getProdutoPublicoPorSlug, formatarPreco } from "@/lib/produtos";
import { getClienteIp, verificarLimite } from "@/lib/rate-limit";
import { notificarErro } from "@/lib/alerts";

const LIMITE_PEDIDOS = 5;
const JANELA_SEGUNDOS = 10 * 60;

type PedidoPayload = {
  produtoSlug?: string;
  quantidade?: number;
  nomeCliente?: string;
  contacto?: string;
  localizacao?: string;
  observacoes?: string;
};

function escaparHtml(texto: string): string {
  return texto
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

export async function POST(request: NextRequest) {
  const ip = getClienteIp(request);
  const permitido = await verificarLimite(
    `order:${ip}`,
    LIMITE_PEDIDOS,
    JANELA_SEGUNDOS
  );

  if (!permitido) {
    return NextResponse.json(
      {
        ok: false,
        erro: "Demasiados pedidos seguidos. Aguarda uns minutos e tenta novamente.",
      },
      { status: 429 }
    );
  }

  let payload: PedidoPayload;

  try {
    payload = await request.json();
  } catch {
    return NextResponse.json(
      { ok: false, erro: "Pedido inválido." },
      { status: 400 }
    );
  }

  const { produtoSlug, quantidade, nomeCliente, contacto, localizacao, observacoes } =
    payload;

  if (!produtoSlug || !nomeCliente || !contacto) {
    return NextResponse.json(
      { ok: false, erro: "Produto, nome e contacto são obrigatórios." },
      { status: 400 }
    );
  }

  const produto = await getProdutoPublicoPorSlug(produtoSlug);
  if (!produto) {
    return NextResponse.json(
      { ok: false, erro: "Produto não encontrado." },
      { status: 404 }
    );
  }

  const quantidadeFinal = Number.isFinite(quantidade) && (quantidade as number) > 0
    ? Math.floor(quantidade as number)
    : 1;

  const linhas = [
    "<b>Novo pedido — Dlamini Loja</b>",
    "",
    `<b>Produto:</b> ${escaparHtml(produto.nome)}`,
    `<b>Quantidade:</b> ${quantidadeFinal}`,
    `<b>Preço unitário:</b> ${formatarPreco(produto.precoVenda, produto.moedaVenda)}`,
    `<b>Cliente:</b> ${escaparHtml(nomeCliente)}`,
    `<b>Contacto:</b> ${escaparHtml(contacto)}`,
  ];

  if (localizacao) {
    linhas.push(`<b>Localização:</b> ${escaparHtml(localizacao)}`);
  }
  if (observacoes) {
    linhas.push(`<b>Observações:</b> ${escaparHtml(observacoes)}`);
  }

  linhas.push("", `<i>${new Date().toLocaleString("pt-AO")}</i>`);

  const resultado = await enviarMensagemTelegram(linhas.join("\n"));

  if (!resultado.ok) {
    console.error("Falha ao enviar pedido para o Telegram:", resultado.erro);
    await notificarErro("telegram-order:falha-envio", resultado.erro);
    return NextResponse.json(
      { ok: false, erro: "Não foi possível enviar o pedido. Tenta novamente." },
      { status: 502 }
    );
  }

  return NextResponse.json({ ok: true });
}

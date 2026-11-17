import { NextRequest, NextResponse } from "next/server";
import { getClienteIp, verificarLimiteComRecurso } from "@/lib/rate-limit";
import { encontrarPacote, NOMES_PACOTE, sinalKz } from "@/lib/servicos/catalogo";
import { DATA_CAMBIO, KZ_POR_USD, kzParaCentimosUsd } from "@/lib/servicos/cambio";
import { criarCheckoutSession } from "@/lib/stripe";

const LIMITE = 10;
const JANELA_SEGUNDOS = 10 * 60;

/**
 * Cria uma sessão de Stripe Checkout (modo de teste) para o sinal de 50% de
 * um pacote. O browser só envia os IDs do serviço/pacote — o valor é
 * SEMPRE calculado aqui a partir do catálogo (lib/servicos/catalogo.ts).
 */
export async function POST(request: NextRequest) {
  // Só aceitar pedidos do próprio site.
  const origem = request.headers.get("origin");
  if (origem && origem !== request.nextUrl.origin) {
    return NextResponse.json({ ok: false, erro: "Origem inválida." }, { status: 403 });
  }

  const ip = getClienteIp(request);
  if (!(await verificarLimiteComRecurso(`checkout:${ip}`, LIMITE, JANELA_SEGUNDOS))) {
    return NextResponse.json(
      { ok: false, erro: "Demasiados pedidos. Tente novamente dentro de alguns minutos." },
      { status: 429 }
    );
  }

  let corpo: { servico?: unknown; pacote?: unknown; locale?: unknown };
  try {
    corpo = await request.json();
  } catch {
    return NextResponse.json({ ok: false, erro: "Pedido inválido." }, { status: 400 });
  }

  const locale = corpo.locale === "en" ? "en" : "pt";
  const encontrado =
    typeof corpo.servico === "string" && typeof corpo.pacote === "string"
      ? encontrarPacote(corpo.servico, corpo.pacote)
      : null;

  if (!encontrado) {
    return NextResponse.json({ ok: false, erro: "Pacote desconhecido." }, { status: 400 });
  }

  const { servico, pacote } = encontrado;
  const sinal = sinalKz(servico, pacote);
  if (sinal === null) {
    return NextResponse.json(
      { ok: false, erro: "Este pacote não tem sinal online. Peça uma proposta." },
      { status: 400 }
    );
  }

  const centimos = kzParaCentimosUsd(sinal);
  const prefixo = locale === "en" ? "/en" : "";
  const base = request.nextUrl.origin;
  const nomePacote = `${servico.nome[locale]} — ${NOMES_PACOTE[pacote.id][locale]}${
    pacote.nome ? ` (${pacote.nome[locale]})` : ""
  }`;
  const titulo = locale === "en" ? `50% deposit: ${nomePacote}` : `Sinal 50%: ${nomePacote}`;
  const descricao =
    locale === "en"
      ? `Package price ${pacote.implementacaoKz} Kz (VAT excl.). Deposit ${sinal} Kz at 1 USD = ${KZ_POR_USD} Kz (BNA ${DATA_CAMBIO}).`
      : `Preço do pacote ${pacote.implementacaoKz} Kz (sem IVA). Sinal ${sinal} Kz a 1 USD = ${KZ_POR_USD} Kz (BNA ${DATA_CAMBIO}).`;

  const resultado = await criarCheckoutSession({
    mode: "payment",
    locale,
    success_url: `${base}${prefixo}/pagamento/sucesso?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${base}${prefixo}/pagamento/cancelado`,
    "line_items[0][quantity]": "1",
    "line_items[0][price_data][currency]": "usd",
    "line_items[0][price_data][unit_amount]": String(centimos),
    "line_items[0][price_data][product_data][name]": titulo,
    "line_items[0][price_data][product_data][description]": descricao,
    billing_address_collection: "auto",
    "metadata[servico]": servico.id,
    "metadata[pacote]": pacote.id,
    "metadata[preco_kz]": String(pacote.implementacaoKz),
    "metadata[sinal_kz]": String(sinal),
    "metadata[cambio]": `${KZ_POR_USD} Kz/USD (${DATA_CAMBIO})`,
    "payment_intent_data[description]": titulo,
    // A conta Stripe tem Managed Payments ligado por defeito, o que exige um
    // tax_code em cada produto. Por decisão do Plum.ton, o sinal é um Checkout
    // normal na própria conta: desligamos o Managed Payments nesta sessão.
    "managed_payments[enabled]": "false",
  });

  if (!resultado.ok) {
    console.error("Falha ao criar Checkout Session:", resultado.erro);
    return NextResponse.json(
      {
        ok: false,
        erro: "O pagamento online não está disponível neste momento. Contacte-nos por WhatsApp ou e-mail.",
      },
      { status: 503 }
    );
  }

  if (resultado.dados.livemode || !resultado.dados.url) {
    return NextResponse.json({ ok: false, erro: "Sessão inválida." }, { status: 500 });
  }

  return NextResponse.json({ ok: true, url: resultado.dados.url });
}

import { NextRequest, NextResponse } from "next/server";
import { enviarMensagemTelegram } from "@/lib/telegram";
import { getClienteIp, verificarLimite } from "@/lib/rate-limit";
import { notificarErro } from "@/lib/alerts";

const LIMITE_PEDIDOS = 5;
const JANELA_SEGUNDOS = 10 * 60;

type AgendamentoPayload = {
  nomeCliente?: string;
  contacto?: string;
  servico?: string;
  dataPreferida?: string;
  horaPreferida?: string;
  local?: string;
  morada?: string;
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
    `agendamento:${ip}`,
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

  let payload: AgendamentoPayload;

  try {
    payload = await request.json();
  } catch {
    return NextResponse.json(
      { ok: false, erro: "Pedido inválido." },
      { status: 400 }
    );
  }

  const {
    nomeCliente,
    contacto,
    servico,
    dataPreferida,
    horaPreferida,
    local,
    morada,
    observacoes,
  } = payload;

  if (!nomeCliente || !contacto || !servico) {
    return NextResponse.json(
      { ok: false, erro: "Nome, contacto e serviço são obrigatórios." },
      { status: 400 }
    );
  }

  const linhas = [
    "<b>Novo agendamento — Paulira Beauty</b>",
    "",
    `<b>Serviço:</b> ${escaparHtml(servico)}`,
    `<b>Cliente:</b> ${escaparHtml(nomeCliente)}`,
    `<b>Contacto:</b> ${escaparHtml(contacto)}`,
  ];

  if (dataPreferida) {
    linhas.push(`<b>Data preferida:</b> ${escaparHtml(dataPreferida)}`);
  }
  if (horaPreferida) {
    linhas.push(`<b>Hora preferida:</b> ${escaparHtml(horaPreferida)}`);
  }
  if (local) {
    linhas.push(`<b>Local:</b> ${escaparHtml(local)}`);
  }
  if (morada) {
    linhas.push(`<b>Morada:</b> ${escaparHtml(morada)}`);
  }
  if (observacoes) {
    linhas.push(`<b>Observações:</b> ${escaparHtml(observacoes)}`);
  }

  linhas.push("", `<i>${new Date().toLocaleString("pt-AO")}</i>`);

  const resultado = await enviarMensagemTelegram(linhas.join("\n"), {
    token: process.env.TELEGRAM_BOT_TOKEN_PAULIRA,
    chatId: process.env.TELEGRAM_CHAT_ID_PAULIRA,
  });

  if (!resultado.ok) {
    console.error("Falha ao enviar agendamento para o Telegram:", resultado.erro);
    await notificarErro("telegram-appointment:falha-envio", resultado.erro);
    return NextResponse.json(
      { ok: false, erro: "Não foi possível enviar o pedido. Tenta novamente." },
      { status: 502 }
    );
  }

  return NextResponse.json({ ok: true });
}

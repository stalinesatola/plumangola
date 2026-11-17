import { NextRequest, NextResponse } from "next/server";
import { escaparHtml } from "@/lib/html";
import { getClienteIp, verificarLimiteComRecurso } from "@/lib/rate-limit";
import { NOMES_PACOTE, SERVICOS } from "@/lib/servicos/catalogo";
import { enviarMensagemTelegram } from "@/lib/telegram";

const LIMITE = 5;
const JANELA_SEGUNDOS = 10 * 60;
const TAMANHO_MAXIMO = 10_000;

const REGEX_EMAIL = /^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]{2,}$/;

function texto(valor: unknown, max: number): string {
  if (typeof valor !== "string") return "";
  return valor.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "").trim().slice(0, max);
}

/**
 * Pedido de orçamento do site. Valida, limita (5 pedidos / 10 min por IP),
 * escapa HTML e encaminha para o Telegram do dono (TELEGRAM_BOT_TOKEN_ORCAMENTOS
 * + TELEGRAM_CHAT_ID_ORCAMENTOS) — separado do bot do Dlamini e da Paulira.
 */
export async function POST(request: NextRequest) {
  const origem = request.headers.get("origin");
  if (origem && origem !== request.nextUrl.origin) {
    return NextResponse.json({ ok: false, erro: "origem" }, { status: 403 });
  }

  const tamanho = Number(request.headers.get("content-length") ?? 0);
  if (tamanho > TAMANHO_MAXIMO) {
    return NextResponse.json({ ok: false, erro: "tamanho" }, { status: 413 });
  }

  const ip = getClienteIp(request);
  if (!(await verificarLimiteComRecurso(`orcamento:${ip}`, LIMITE, JANELA_SEGUNDOS))) {
    return NextResponse.json({ ok: false, erro: "limite" }, { status: 429 });
  }

  let corpo: Record<string, unknown>;
  try {
    corpo = await request.json();
  } catch {
    return NextResponse.json({ ok: false, erro: "invalido" }, { status: 400 });
  }

  // Honeypot: campo invisível que só bots preenchem. Fingir sucesso.
  if (texto(corpo.website, 200)) {
    return NextResponse.json({ ok: true });
  }

  const nome = texto(corpo.nome, 100);
  const email = texto(corpo.email, 200);
  const telefone = texto(corpo.telefone, 40);
  const empresa = texto(corpo.empresa, 120);
  const pais = texto(corpo.pais, 80);
  const servicoId = texto(corpo.servico, 40);
  const pacoteId = texto(corpo.pacote, 40);
  const mensagem = texto(corpo.mensagem, 2000);
  const idioma = corpo.locale === "en" ? "en" : "pt";

  const servico = SERVICOS.find((s) => s.id === servicoId);
  const pacoteValido = pacoteId === "" || pacoteId in NOMES_PACOTE;

  const erros: string[] = [];
  if (nome.length < 2) erros.push("nome");
  if (!REGEX_EMAIL.test(email)) erros.push("email");
  if (telefone && !/^[+\d\s().-]{6,40}$/.test(telefone)) erros.push("telefone");
  if (servicoId !== "outro" && !servico) erros.push("servico");
  if (!pacoteValido) erros.push("pacote");
  if (mensagem.length < 10) erros.push("mensagem");

  if (erros.length > 0) {
    return NextResponse.json({ ok: false, erro: "validacao", campos: erros }, { status: 400 });
  }

  const nomeServico = servico ? servico.nome.pt : "Outro / não sei";
  const nomePacote = pacoteId ? NOMES_PACOTE[pacoteId as keyof typeof NOMES_PACOTE].pt : "—";

  const linhas = [
    "<b>Novo pedido de orçamento — plum-angola.com</b>",
    "",
    `<b>Serviço:</b> ${escaparHtml(nomeServico)}`,
    `<b>Pacote:</b> ${escaparHtml(nomePacote)}`,
    `<b>Nome:</b> ${escaparHtml(nome)}`,
    `<b>E-mail:</b> ${escaparHtml(email)}`,
  ];
  if (telefone) linhas.push(`<b>Telefone/WhatsApp:</b> ${escaparHtml(telefone)}`);
  if (empresa) linhas.push(`<b>Empresa:</b> ${escaparHtml(empresa)}`);
  if (pais) linhas.push(`<b>País:</b> ${escaparHtml(pais)}`);
  linhas.push(`<b>Idioma do site:</b> ${idioma.toUpperCase()}`);
  linhas.push("", `<b>Mensagem:</b>`, escaparHtml(mensagem));
  linhas.push("", `<i>${new Date().toLocaleString("pt-AO", { timeZone: "Africa/Luanda" })}</i>`);

  const token = process.env.TELEGRAM_BOT_TOKEN_ORCAMENTOS;
  const chatId = process.env.TELEGRAM_CHAT_ID_ORCAMENTOS;
  // Verificar aqui: se faltarem, enviarMensagemTelegram cairia no bot por
  // defeito (TELEGRAM_BOT_TOKEN), que é o do Dlamini — não queremos isso.
  if (!token || !chatId) {
    console.error("TELEGRAM_BOT_TOKEN_ORCAMENTOS / TELEGRAM_CHAT_ID_ORCAMENTOS em falta.");
    return NextResponse.json({ ok: false, erro: "envio" }, { status: 503 });
  }

  const resultado = await enviarMensagemTelegram(linhas.join("\n"), { token, chatId });

  if (!resultado.ok) {
    console.error("Falha ao enviar pedido de orçamento para o Telegram:", resultado.erro);
    return NextResponse.json({ ok: false, erro: "envio" }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}

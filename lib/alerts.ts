import { sql } from "@/lib/db";
import { enviarMensagemTelegram } from "@/lib/telegram";

// Janela de throttling: no máximo um alerta da mesma `chave` é enviado
// dentro deste intervalo, para não inundar o Telegram quando um erro se
// repete em vários pedidos seguidos (ex: ANTHROPIC_API_KEY em falta).
const JANELA_THROTTLE_SEGUNDOS = 30 * 60;

async function podeNotificar(chave: string): Promise<boolean> {
  const { rows } = await sql<{ total: string }>`
    SELECT COUNT(*) AS total FROM alert_events
    WHERE chave = ${chave} AND criado_em > now() - (${JANELA_THROTTLE_SEGUNDOS} * interval '1 second')
  `;
  if (Number(rows[0].total) > 0) {
    return false;
  }
  await sql`INSERT INTO alert_events (chave) VALUES (${chave})`;
  return true;
}

/**
 * Notifica o dono do site via Telegram sobre um erro relevante que hoje só
 * ficaria visível nos logs da Vercel. Nunca lança exceção -- uma falha aqui
 * (BD ou Telegram em baixo) não pode derrubar o pedido original que estava
 * a ser processado quando o erro aconteceu.
 */
export async function notificarErro(chave: string, mensagem: string): Promise<void> {
  try {
    const permitido = await podeNotificar(chave);
    if (!permitido) return;

    const linhas = [
      "<b>⚠️ Erro em plum-angola.com</b>",
      "",
      `<b>Chave:</b> ${chave}`,
      `<b>Mensagem:</b> ${mensagem}`,
      "",
      `<i>${new Date().toLocaleString("pt-AO")}</i>`,
    ];

    const resultado = await enviarMensagemTelegram(linhas.join("\n"), {
      token: process.env.TELEGRAM_BOT_TOKEN_ALERTS,
      chatId: process.env.TELEGRAM_CHAT_ID_ALERTS,
    });

    if (!resultado.ok) {
      console.error("Falha ao enviar alerta para o Telegram:", resultado.erro);
    }
  } catch (error) {
    console.error("Falha ao processar notificação de alerta:", error);
  }
}

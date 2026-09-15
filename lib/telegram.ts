type EnviarMensagemResultado =
  | { ok: true }
  | { ok: false; erro: string };

export async function enviarMensagemTelegram(
  texto: string
): Promise<EnviarMensagemResultado> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!token || !chatId) {
    return {
      ok: false,
      erro:
        "TELEGRAM_BOT_TOKEN ou TELEGRAM_CHAT_ID não estão configurados nas variáveis de ambiente.",
    };
  }

  const resposta = await fetch(
    `https://api.telegram.org/bot${token}/sendMessage`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text: texto,
        parse_mode: "HTML",
      }),
    }
  );

  if (!resposta.ok) {
    const corpo = await resposta.text().catch(() => "");
    return {
      ok: false,
      erro: `Telegram respondeu com erro ${resposta.status}: ${corpo}`,
    };
  }

  return { ok: true };
}

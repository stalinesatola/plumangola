import { NextRequest, NextResponse } from "next/server";
import { notificarErro } from "@/lib/alerts";

type ClientErrorPayload = {
  mensagem?: string;
  stack?: string;
  url?: string;
  espaco?: string;
};

export async function POST(request: NextRequest) {
  let payload: ClientErrorPayload;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const espaco = payload.espaco || "desconhecido";
  const mensagem = payload.mensagem || "Erro sem mensagem";
  const detalhes = [
    `Espaço: ${espaco}`,
    payload.url ? `URL: ${payload.url}` : null,
    `Mensagem: ${mensagem}`,
    payload.stack ? `Stack: ${payload.stack.slice(0, 500)}` : null,
  ]
    .filter(Boolean)
    .join("\n");

  // Best-effort: nunca deve bloquear ou falhar visivelmente no cliente.
  await notificarErro(`client-error:${espaco}`, detalhes);

  return NextResponse.json({ ok: true });
}

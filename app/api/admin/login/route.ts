import { NextRequest, NextResponse } from "next/server";
import { buscarAdminPorUsername } from "@/lib/admins";
import { SESSION_COOKIE, createSessionToken, verifyPassword } from "@/lib/auth";

export async function POST(request: NextRequest) {
  let payload: { username?: string; password?: string };

  try {
    payload = await request.json();
  } catch {
    return NextResponse.json(
      { ok: false, erro: "Pedido inválido." },
      { status: 400 }
    );
  }

  const { username, password } = payload;

  if (!username || !password) {
    return NextResponse.json(
      { ok: false, erro: "Utilizador e senha são obrigatórios." },
      { status: 400 }
    );
  }

  const admin = await buscarAdminPorUsername(username);
  const senhaValida = admin ? await verifyPassword(password, admin.passwordHash) : false;

  if (!admin || !senhaValida) {
    return NextResponse.json(
      { ok: false, erro: "Credenciais inválidas." },
      { status: 401 }
    );
  }

  const token = await createSessionToken({ sub: admin.id, username: admin.username });

  const resposta = NextResponse.json({ ok: true });
  resposta.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });

  return resposta;
}

import { NextRequest, NextResponse } from "next/server";
import { buscarAdminPorUsername } from "@/lib/admins";
import { SESSION_COOKIE, createSessionToken, verifyPassword } from "@/lib/auth";

// Hash bcrypt fictício, usado só para gastar o mesmo tempo de CPU quando o
// utilizador não existe — sem isto, a resposta seria mais rápida para
// usernames inexistentes, permitindo descobri-los por temporização.
const HASH_FICTICIO = "$2a$10$1Fn2EJRKPmVVI8Pn8lI8y.5p4qAHLeWCmDG.xp9d3tKXa7TtYMpXC";

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
  const senhaValida = await verifyPassword(
    password,
    admin?.passwordHash ?? HASH_FICTICIO
  );

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

import { NextResponse } from "next/server";
import { SESSION_COOKIE } from "@/lib/auth";

export async function POST() {
  const resposta = NextResponse.json({ ok: true });
  resposta.cookies.set(SESSION_COOKIE, "", { path: "/", maxAge: 0 });
  return resposta;
}

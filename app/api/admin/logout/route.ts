import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE } from "@/lib/auth";

export async function POST(request: NextRequest) {
  const resposta = NextResponse.redirect(new URL("/dlamini-loja", request.url), 303);
  resposta.cookies.set(SESSION_COOKIE, "", { path: "/", maxAge: 0 });
  return resposta;
}

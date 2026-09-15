import createIntlMiddleware from "next-intl/middleware";
import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/session";
import { routing } from "@/i18n/routing";

const CAMINHOS_PUBLICOS = new Set(["/admin/login", "/api/admin/login"]);
const intlMiddleware = createIntlMiddleware(routing);

async function protegerAdmin(request: NextRequest): Promise<NextResponse> {
  const { pathname } = request.nextUrl;

  if (CAMINHOS_PUBLICOS.has(pathname)) {
    return NextResponse.next();
  }

  const token = request.cookies.get(SESSION_COOKIE)?.value;
  const sessao = token ? await verifySessionToken(token) : null;

  if (!sessao) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json(
        { ok: false, erro: "Não autenticado." },
        { status: 401 }
      );
    }
    const loginUrl = new URL("/admin/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Rotas de admin (páginas + API) ficam só em Português, sem prefixo de
  // idioma, protegidas por sessão — não passam pelo roteamento de idiomas.
  if (pathname.startsWith("/admin") || pathname.startsWith("/api/admin")) {
    return protegerAdmin(request);
  }

  // Outras rotas de API (ex: pedidos do Telegram) também ficam de fora do
  // roteamento de idiomas — não fazem sentido com prefixo /en, /pt.
  if (pathname.startsWith("/api/")) {
    return NextResponse.next();
  }

  // Hub e /dlamini-loja: roteamento de idioma (PT sem prefixo, EN em /en).
  return intlMiddleware(request);
}

export const config = {
  matcher: ["/((?!_next|.*\\..*).*)"],
};

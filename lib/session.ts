import { SignJWT, jwtVerify } from "jose";

export const SESSION_COOKIE = "plumangola_admin_session";
const SESSION_DURACAO = "7d";

function getSecretKey(): Uint8Array {
  const segredo = process.env.AUTH_SECRET;
  if (!segredo) {
    throw new Error("AUTH_SECRET não está configurado nas variáveis de ambiente.");
  }
  return new TextEncoder().encode(segredo);
}

export type SessaoAdmin = {
  sub: number;
  username: string;
};

export async function createSessionToken(admin: SessaoAdmin): Promise<string> {
  return new SignJWT({ username: admin.username })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(String(admin.sub))
    .setIssuedAt()
    .setExpirationTime(SESSION_DURACAO)
    .sign(getSecretKey());
}

export async function verifySessionToken(
  token: string
): Promise<SessaoAdmin | null> {
  try {
    const { payload } = await jwtVerify(token, getSecretKey());
    if (!payload.sub || typeof payload.username !== "string") return null;
    return { sub: Number(payload.sub), username: payload.username };
  } catch {
    return null;
  }
}

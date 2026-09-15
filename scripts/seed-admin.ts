/**
 * Cria (ou atualiza a senha de) uma conta de admin do painel.
 * Corre contra a base de dados apontada por POSTGRES_URL (localmente, faz
 * `vercel env pull .env.local` primeiro para obter essa variável).
 *
 * Uso:
 *   npm run seed:admin -- --username=dlamini --password=umaSenhaForte
 */

import { hashPassword } from "../lib/auth";
import { sql } from "../lib/db";

function lerArgumento(nome: string): string | undefined {
  const prefixo = `--${nome}=`;
  const arg = process.argv.find((a) => a.startsWith(prefixo));
  return arg?.slice(prefixo.length);
}

async function main() {
  const username = lerArgumento("username");
  const password = lerArgumento("password");

  if (!username || !password) {
    console.error(
      "Uso: npm run seed:admin -- --username=<user> --password=<senha>"
    );
    process.exitCode = 1;
    return;
  }

  const passwordHash = await hashPassword(password);

  await sql`
    INSERT INTO admins (username, password_hash)
    VALUES (${username}, ${passwordHash})
    ON CONFLICT (username) DO UPDATE SET password_hash = EXCLUDED.password_hash
  `;

  console.log(`Conta de admin "${username}" criada/atualizada com sucesso.`);
}

main().catch((erro) => {
  console.error(erro);
  process.exitCode = 1;
});

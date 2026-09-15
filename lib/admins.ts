import { sql } from "@/lib/db";

export type Admin = {
  id: number;
  username: string;
  passwordHash: string;
};

export async function buscarAdminPorUsername(
  username: string
): Promise<Admin | undefined> {
  const { rows } = await sql<{
    id: number;
    username: string;
    password_hash: string;
  }>`
    SELECT id, username, password_hash FROM admins WHERE username = ${username}
  `;

  const row = rows[0];
  if (!row) return undefined;

  return { id: row.id, username: row.username, passwordHash: row.password_hash };
}

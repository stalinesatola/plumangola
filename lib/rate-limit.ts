import { NextRequest } from "next/server";
import { sql } from "@/lib/db";

/**
 * Extrai o IP do cliente a partir dos headers que a Vercel injeta
 * (x-forwarded-for pode conter uma lista "cliente, proxy1, proxy2...").
 */
export function getClienteIp(request: NextRequest): string {
  const encaminhado = request.headers.get("x-forwarded-for");
  if (encaminhado) {
    return encaminhado.split(",")[0].trim();
  }
  return request.headers.get("x-real-ip") ?? "desconhecido";
}

/**
 * Rate limiter simples baseado em Postgres (funciona entre instâncias
 * serverless, ao contrário de um contador em memória). Regista um evento
 * por chamada permitida e conta quantos eventos existem para a mesma
 * `chave` dentro da janela de tempo — se já estiver no limite, recusa sem
 * registar mais um evento.
 */
export async function verificarLimite(
  chave: string,
  limite: number,
  janelaSegundos: number
): Promise<boolean> {
  const { rows } = await sql<{ total: string }>`
    SELECT COUNT(*) AS total FROM rate_limit_events
    WHERE chave = ${chave} AND criado_em > now() - (${janelaSegundos} * interval '1 second')
  `;

  if (Number(rows[0].total) >= limite) {
    return false;
  }

  await sql`INSERT INTO rate_limit_events (chave) VALUES (${chave})`;

  // Limpeza oportunista de eventos antigos, para a tabela não crescer sem
  // limite — não precisa de correr em todas as chamadas.
  if (Math.random() < 0.05) {
    await sql`DELETE FROM rate_limit_events WHERE criado_em < now() - interval '1 day'`;
  }

  return true;
}

// Contador em memória, usado só como recurso quando a base de dados não
// está disponível (ex: preview sem POSTGRES_URL). Não é partilhado entre
// instâncias serverless, mas é melhor do que não limitar nada.
const eventosMemoria = new Map<string, number[]>();

function verificarLimiteMemoria(
  chave: string,
  limite: number,
  janelaSegundos: number
): boolean {
  const agora = Date.now();
  const recentes = (eventosMemoria.get(chave) ?? []).filter(
    (t) => agora - t < janelaSegundos * 1000
  );
  if (recentes.length >= limite) {
    eventosMemoria.set(chave, recentes);
    return false;
  }
  recentes.push(agora);
  eventosMemoria.set(chave, recentes);
  if (eventosMemoria.size > 5000) {
    eventosMemoria.clear();
  }
  return true;
}

/**
 * Igual a `verificarLimite`, mas se a base de dados falhar usa um contador
 * em memória em vez de rebentar o pedido.
 */
export async function verificarLimiteComRecurso(
  chave: string,
  limite: number,
  janelaSegundos: number
): Promise<boolean> {
  try {
    return await verificarLimite(chave, limite, janelaSegundos);
  } catch (erro) {
    console.error("Rate limit em Postgres indisponível, a usar memória:", erro);
    return verificarLimiteMemoria(chave, limite, janelaSegundos);
  }
}

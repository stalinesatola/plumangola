/**
 * Cliente mínimo da API do Stripe (só o necessário para Checkout), com
 * `fetch` — evita adicionar o SDK ao bundle.
 *
 * SEGURANÇA: pagamentos reais (chaves sk_live_ / rk_live_) só são aceites
 * em PRODUÇÃO (VERCEL_ENV === "production"), por aprovação do Plum.ton em
 * 17/11/2026. Em Preview e desenvolvimento só se aceitam chaves de teste
 * (sk_test_ / rk_test_) — uma chave live fora de produção é recusada.
 */

const API = "https://api.stripe.com/v1";

export type ResultadoStripe<T> = { ok: true; dados: T } | { ok: false; erro: string };

export function emProducao(): boolean {
  return process.env.VERCEL_ENV === "production";
}

function obterChave():
  | { ok: true; chave: string; live: boolean }
  | { ok: false; erro: string } {
  const chave = process.env.STRIPE_SECRET_KEY;
  if (!chave) {
    return { ok: false, erro: "STRIPE_SECRET_KEY não está configurada." };
  }
  if (/^(sk|rk)_test_/.test(chave)) {
    return { ok: true, chave, live: false };
  }
  if (/^(sk|rk)_live_/.test(chave)) {
    if (!emProducao()) {
      return {
        ok: false,
        erro: "Chave live fora de produção — recusada (Preview/dev só aceitam chaves de teste).",
      };
    }
    return { ok: true, chave, live: true };
  }
  return { ok: false, erro: "STRIPE_SECRET_KEY com formato desconhecido." };
}

export function stripeConfigurado(): boolean {
  return obterChave().ok;
}

/** true se a chave em uso é live (só possível em produção). */
export function stripeModoLive(): boolean {
  const r = obterChave();
  return r.ok && r.live;
}

async function pedido<T>(
  metodo: "GET" | "POST",
  caminho: string,
  corpo?: URLSearchParams
): Promise<ResultadoStripe<T>> {
  const chave = obterChave();
  if (!chave.ok) return chave;

  const resposta = await fetch(`${API}${caminho}`, {
    method: metodo,
    headers: {
      Authorization: `Bearer ${chave.chave}`,
      ...(corpo ? { "Content-Type": "application/x-www-form-urlencoded" } : {}),
    },
    body: corpo?.toString(),
    cache: "no-store",
  });

  const json = (await resposta.json().catch(() => null)) as
    | (T & { error?: { message?: string } })
    | null;

  if (!resposta.ok || !json) {
    return {
      ok: false,
      erro: `Stripe ${resposta.status}: ${json?.error?.message ?? "resposta inválida"}`,
    };
  }
  return { ok: true, dados: json };
}

export type CheckoutSession = {
  id: string;
  url: string | null;
  livemode: boolean;
  payment_status: "paid" | "unpaid" | "no_payment_required";
  status: "open" | "complete" | "expired" | null;
  amount_total: number | null;
  currency: string | null;
  customer_details?: { email?: string | null; name?: string | null } | null;
  metadata?: Record<string, string>;
};

export function criarCheckoutSession(
  params: Record<string, string>
): Promise<ResultadoStripe<CheckoutSession>> {
  return pedido<CheckoutSession>("POST", "/checkout/sessions", new URLSearchParams(params));
}

export function obterCheckoutSession(id: string): Promise<ResultadoStripe<CheckoutSession>> {
  return pedido<CheckoutSession>("GET", `/checkout/sessions/${encodeURIComponent(id)}`);
}

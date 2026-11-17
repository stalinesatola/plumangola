/**
 * Cliente mínimo da API do Stripe (só o necessário para Checkout), com
 * `fetch` — evita adicionar o SDK ao bundle.
 *
 * SEGURANÇA: por decisão do dono, os pagamentos estão em MODO DE TESTE.
 * Este módulo recusa qualquer chave que não seja de teste (sk_test_ /
 * rk_test_). Para ativar pagamentos reais é preciso alterar este código
 * conscientemente, com aprovação do Plum.ton.
 */

const API = "https://api.stripe.com/v1";

export type ResultadoStripe<T> = { ok: true; dados: T } | { ok: false; erro: string };

function obterChaveTeste(): { ok: true; chave: string } | { ok: false; erro: string } {
  const chave = process.env.STRIPE_SECRET_KEY;
  if (!chave) {
    return { ok: false, erro: "STRIPE_SECRET_KEY não está configurada." };
  }
  if (!/^(sk|rk)_test_/.test(chave)) {
    return {
      ok: false,
      erro: "STRIPE_SECRET_KEY não é uma chave de teste — pagamentos live estão desativados.",
    };
  }
  return { ok: true, chave };
}

export function stripeConfigurado(): boolean {
  return obterChaveTeste().ok;
}

async function pedido<T>(
  metodo: "GET" | "POST",
  caminho: string,
  corpo?: URLSearchParams
): Promise<ResultadoStripe<T>> {
  const chave = obterChaveTeste();
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

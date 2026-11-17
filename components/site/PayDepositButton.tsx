"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";

/**
 * Botão "Pagar sinal": envia só os IDs do serviço/pacote; o servidor
 * calcula o valor e devolve o URL do Stripe Checkout.
 */
export function PayDepositButton({ servico, pacote }: { servico: string; pacote: string }) {
  const t = useTranslations("Site");
  const locale = useLocale();
  const [estado, setEstado] = useState<"idle" | "loading" | "error">("idle");

  async function pagar() {
    setEstado("loading");
    try {
      const resposta = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ servico, pacote, locale }),
      });
      const dados = (await resposta.json()) as { ok: boolean; url?: string };
      if (dados.ok && dados.url && dados.url.startsWith("https://checkout.stripe.com/")) {
        window.location.assign(dados.url);
        return;
      }
      setEstado("error");
    } catch {
      setEstado("error");
    }
  }

  return (
    <div className="flex flex-col gap-1">
      <button
        type="button"
        onClick={pagar}
        disabled={estado === "loading"}
        className="w-full rounded-lg bg-plum-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-plum-700 disabled:opacity-60"
      >
        {estado === "loading" ? t("pay.redirecting") : t("services.payDeposit")}
      </button>
      {estado === "error" && (
        <p role="alert" className="text-xs text-red-600">
          {t("pay.error")}
        </p>
      )}
    </div>
  );
}

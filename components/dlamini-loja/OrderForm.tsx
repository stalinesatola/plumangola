"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { Produto, formatarPreco } from "@/lib/produtos";

type Estado = "idle" | "enviando" | "erro";

export function OrderForm({
  produto,
  onFechar,
}: {
  produto: Produto;
  onFechar: () => void;
}) {
  const t = useTranslations("OrderForm");
  const router = useRouter();
  const [estado, setEstado] = useState<Estado>("idle");
  const [erro, setErro] = useState<string | null>(null);
  const primeiroCampoRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    primeiroCampoRef.current?.focus();

    function handleTecla(event: KeyboardEvent) {
      if (event.key === "Escape") onFechar();
    }
    window.addEventListener("keydown", handleTecla);
    return () => window.removeEventListener("keydown", handleTecla);
  }, [onFechar]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setEstado("enviando");
    setErro(null);

    const formData = new FormData(event.currentTarget);

    try {
      const resposta = await fetch("/api/telegram/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          produtoSlug: produto.slug,
          quantidade: Number(formData.get("quantidade")),
          nomeCliente: formData.get("nomeCliente"),
          contacto: formData.get("contacto"),
          localizacao: formData.get("localizacao"),
          observacoes: formData.get("observacoes"),
        }),
      });

      const dados = await resposta.json();

      if (!resposta.ok || !dados.ok) {
        setEstado("erro");
        setErro(dados.erro ?? t("genericError"));
        return;
      }

      router.push("/dlamini-loja/obrigado");
    } catch {
      setEstado("erro");
      setErro(t("networkError"));
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={onFechar}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="order-form-title"
        className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <h2 id="order-form-title" className="text-lg font-semibold">
              {t("title")}
            </h2>
            <p className="text-sm text-gray-600">
              {produto.nome} — {formatarPreco(produto.precoVenda, produto.moedaVenda)}
            </p>
          </div>
          <button
            type="button"
            onClick={onFechar}
            className="text-gray-400 hover:text-gray-700"
            aria-label="Fechar"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <label className="flex flex-col gap-1 text-sm">
            {t("quantity")}
            <input
              ref={primeiroCampoRef}
              name="quantidade"
              type="number"
              min={1}
              defaultValue={1}
              required
              className="rounded-lg border border-gray-300 px-3 py-2"
            />
          </label>

          <label className="flex flex-col gap-1 text-sm">
            {t("name")}
            <input
              name="nomeCliente"
              type="text"
              required
              className="rounded-lg border border-gray-300 px-3 py-2"
            />
          </label>

          <label className="flex flex-col gap-1 text-sm">
            {t("contact")}
            <input
              name="contacto"
              type="tel"
              required
              className="rounded-lg border border-gray-300 px-3 py-2"
            />
          </label>

          <label className="flex flex-col gap-1 text-sm">
            {t("location")}
            <input
              name="localizacao"
              type="text"
              className="rounded-lg border border-gray-300 px-3 py-2"
            />
          </label>

          <label className="flex flex-col gap-1 text-sm">
            {t("notes")}
            <textarea
              name="observacoes"
              rows={2}
              className="rounded-lg border border-gray-300 px-3 py-2"
            />
          </label>

          {erro && (
            <p role="alert" aria-live="polite" className="text-sm text-red-600">
              {erro}
            </p>
          )}

          <button
            type="submit"
            disabled={estado === "enviando"}
            className="mt-2 rounded-lg bg-plum-600 px-4 py-2 font-semibold text-white transition hover:bg-plum-700 disabled:cursor-not-allowed disabled:bg-gray-300"
          >
            {estado === "enviando" ? t("submitting") : t("submit")}
          </button>
        </form>
      </div>
    </div>
  );
}

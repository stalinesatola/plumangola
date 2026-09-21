"use client";

import { FormEvent, useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";

type Estado = "idle" | "enviando" | "erro";

export function AppointmentForm() {
  const t = useTranslations("AppointmentForm");
  const router = useRouter();
  const [estado, setEstado] = useState<Estado>("idle");
  const [erro, setErro] = useState<string | null>(null);
  const [servico, setServico] = useState("nails");
  const [local, setLocal] = useState("salao");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setEstado("enviando");
    setErro(null);

    const formData = new FormData(event.currentTarget);

    const servicoFinal =
      servico === "outro"
        ? String(formData.get("servicoOutro") ?? "")
        : t(`category.${servico}`);

    try {
      const resposta = await fetch("/api/telegram/appointment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nomeCliente: formData.get("nomeCliente"),
          contacto: formData.get("contacto"),
          servico: servicoFinal,
          dataPreferida: formData.get("dataPreferida"),
          horaPreferida: formData.get("horaPreferida"),
          local: local === "domicilio" ? t("locationHome") : t("locationSalon"),
          morada: local === "domicilio" ? formData.get("morada") : undefined,
          observacoes: formData.get("observacoes"),
        }),
      });

      const dados = await resposta.json();

      if (!resposta.ok || !dados.ok) {
        setEstado("erro");
        setErro(dados.erro ?? t("genericError"));
        return;
      }

      router.push("/paulirabeauty/obrigado");
    } catch {
      setEstado("erro");
      setErro(t("networkError"));
    }
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6">
      <h2 className="mb-4 text-lg font-semibold text-gray-900">{t("title")}</h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
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
          {t("service")}
          <select
            name="servico"
            value={servico}
            onChange={(event) => setServico(event.target.value)}
            className="rounded-lg border border-gray-300 px-3 py-2"
          >
            <option value="nails">{t("category.nails")}</option>
            <option value="hair">{t("category.hair")}</option>
            <option value="facial">{t("category.facial")}</option>
            <option value="massage">{t("category.massage")}</option>
            <option value="makeup">{t("category.makeup")}</option>
            <option value="outro">{t("category.outro")}</option>
          </select>
        </label>

        {servico === "outro" && (
          <label className="flex flex-col gap-1 text-sm">
            {t("otherServicePlaceholder")}
            <input
              name="servicoOutro"
              type="text"
              required
              className="rounded-lg border border-gray-300 px-3 py-2"
            />
          </label>
        )}

        <div className="grid grid-cols-2 gap-3">
          <label className="flex flex-col gap-1 text-sm">
            {t("date")}
            <input
              name="dataPreferida"
              type="date"
              className="rounded-lg border border-gray-300 px-3 py-2"
            />
          </label>

          <label className="flex flex-col gap-1 text-sm">
            {t("time")}
            <input
              name="horaPreferida"
              type="time"
              className="rounded-lg border border-gray-300 px-3 py-2"
            />
          </label>
        </div>

        <label className="flex flex-col gap-1 text-sm">
          {t("location")}
          <select
            name="local"
            value={local}
            onChange={(event) => setLocal(event.target.value)}
            className="rounded-lg border border-gray-300 px-3 py-2"
          >
            <option value="salao">{t("locationSalon")}</option>
            <option value="domicilio">{t("locationHome")}</option>
          </select>
        </label>

        {local === "domicilio" && (
          <label className="flex flex-col gap-1 text-sm">
            {t("addressPlaceholder")}
            <input
              name="morada"
              type="text"
              required
              className="rounded-lg border border-gray-300 px-3 py-2"
            />
          </label>
        )}

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
  );
}

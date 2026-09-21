"use client";

import { FormEvent, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";

type Estado = "idle" | "enviando" | "erro";

const WHATSAPP_NUMERO = "244922809707";

export function AppointmentForm() {
  const t = useTranslations("AppointmentForm");
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [estado, setEstado] = useState<Estado>("idle");
  const [erro, setErro] = useState<string | null>(null);
  const [servico, setServico] = useState("nails");
  const [local, setLocal] = useState("salao");

  function obterServicoFinal(formData: FormData) {
    return servico === "outro"
      ? String(formData.get("servicoOutro") ?? "")
      : t(`category.${servico}`);
  }

  function handleWhatsApp() {
    const form = formRef.current;
    if (!form || !form.reportValidity()) return;

    const formData = new FormData(form);
    const localFinal = local === "domicilio" ? t("locationHome") : t("locationSalon");
    const linhas = [
      t("whatsappMessageTitle"),
      "",
      `${t("serviceLabel")}: ${obterServicoFinal(formData)}`,
      `${t("name")}: ${formData.get("nomeCliente")}`,
      `${t("contact")}: ${formData.get("contacto")}`,
    ];

    const data = formData.get("dataPreferida");
    if (data) linhas.push(`${t("dateLabel")}: ${data}`);
    const hora = formData.get("horaPreferida");
    if (hora) linhas.push(`${t("timeLabel")}: ${hora}`);

    linhas.push(`${t("location")}: ${localFinal}`);
    const morada = formData.get("morada");
    if (local === "domicilio" && morada) {
      linhas.push(`${t("addressPlaceholder")}: ${morada}`);
    }
    const observacoes = formData.get("observacoes");
    if (observacoes) linhas.push(`${t("notesLabel")}: ${observacoes}`);

    const texto = linhas.join("\n");
    window.open(
      `https://wa.me/${WHATSAPP_NUMERO}?text=${encodeURIComponent(texto)}`,
      "_blank",
      "noopener,noreferrer"
    );
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setEstado("enviando");
    setErro(null);

    const formData = new FormData(event.currentTarget);
    const servicoFinal = obterServicoFinal(formData);

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
      <form ref={formRef} onSubmit={handleSubmit} className="flex flex-col gap-3">
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

        <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-gray-400">
          <span className="h-px flex-1 bg-gray-200" aria-hidden="true" />
          {t("orDivider")}
          <span className="h-px flex-1 bg-gray-200" aria-hidden="true" />
        </div>

        <button
          type="button"
          onClick={handleWhatsApp}
          className="rounded-lg border border-green-600 px-4 py-2 font-semibold text-green-700 transition hover:bg-green-50"
        >
          {t("submitWhatsapp")}
        </button>
      </form>
    </div>
  );
}

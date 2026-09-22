"use client";

import { FormEvent, useState } from "react";
import { useTranslations } from "next-intl";
import type { MatchResponse } from "@/lib/empregos/types";

type Estado = "idle" | "enviando" | "erro";

const TAMANHO_MAXIMO_BYTES = 500 * 1024;

function classeVeredito(verdict: string): string {
  const v = verdict.toLowerCase();
  if (v.includes("forte")) return "bg-green-50 text-green-700 border-green-200";
  if (v.includes("boa")) return "bg-emerald-50 text-emerald-700 border-emerald-200";
  if (v.includes("moderada")) return "bg-amber-50 text-amber-700 border-amber-200";
  if (v.includes("fraca")) return "bg-orange-50 text-orange-700 border-orange-200";
  return "bg-red-50 text-red-700 border-red-200";
}

export function CvMatchForm() {
  const t = useTranslations("CvMatchForm");
  const [estado, setEstado] = useState<Estado>("idle");
  const [erro, setErro] = useState<string | null>(null);
  const [resultado, setResultado] = useState<MatchResponse | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setEstado("enviando");
    setErro(null);
    setResultado(null);

    const formData = new FormData(event.currentTarget);
    const file = formData.get("file");
    if (file instanceof File && file.size > TAMANHO_MAXIMO_BYTES) {
      setEstado("erro");
      setErro(t("fileTooLarge"));
      return;
    }

    try {
      const resposta = await fetch("/api/empregos/match", {
        method: "POST",
        body: formData,
      });

      const dados = await resposta.json();

      if (!resposta.ok) {
        setEstado("erro");
        setErro(dados.erro ?? t("genericError"));
        return;
      }

      setResultado(dados as MatchResponse);
      setEstado("idle");
    } catch {
      setEstado("erro");
      setErro(t("networkError"));
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">{t("title")}</h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <label className="flex flex-col gap-1 text-sm">
            {t("cvLabel")}
            <input
              name="file"
              type="file"
              accept="application/pdf"
              required
              className="rounded-lg border border-gray-300 px-3 py-2 file:mr-3 file:rounded-md file:border-0 file:bg-plum-50 file:px-3 file:py-1.5 file:text-plum-700"
            />
          </label>

          <label className="flex flex-col gap-1 text-sm">
            {t("locationLabel")}
            <input
              name="location"
              type="text"
              placeholder="Luanda, Angola"
              className="rounded-lg border border-gray-300 px-3 py-2"
            />
          </label>

          <label className="flex flex-col gap-1 text-sm">
            {t("queryLabel")}
            <input
              name="query"
              type="text"
              placeholder={t("queryPlaceholder")}
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

      {resultado && (
        <div className="flex flex-col gap-4">
          <div className="rounded-xl border border-plum-100 bg-plum-50 p-4 text-sm text-plum-900">
            {resultado.candidateSummary}
          </div>

          {resultado.sourcesFailed.length > 0 && (
            <p className="text-sm text-amber-700">
              {t("sourcesFailedWarning", { sources: resultado.sourcesFailed.join(", ") })}
            </p>
          )}

          {resultado.jobs.length === 0 ? (
            <p className="text-sm text-gray-600">{t("noResults")}</p>
          ) : (
            <ul className="flex flex-col gap-3">
              {resultado.jobs.map((job, index) => (
                <li
                  key={`${job.url}-${index}`}
                  className="rounded-xl border border-gray-200 bg-white p-5"
                >
                  <h3 className="text-base font-semibold text-gray-900">{job.title}</h3>
                  <p className="mb-2 text-sm text-gray-600">
                    {job.company ?? "—"} · {job.location ?? "—"} · {t("sourceLabel")}: {job.source}
                  </p>
                  <span
                    className={`mb-2 inline-block rounded-full border px-3 py-1 text-xs font-semibold ${classeVeredito(job.verdict)}`}
                  >
                    {job.verdict} ({job.score}/100)
                  </span>
                  <p className="mb-3 text-sm text-gray-700">{job.notes}</p>
                  <a
                    href={job.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-semibold text-plum-600 hover:text-plum-700"
                  >
                    {t("viewJob")} →
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

"use client";

import { useState, type FormEvent } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { EMAIL_CONTACTO, linkWhatsapp, WHATSAPP_VISIVEL } from "./contactos";

type Opcao = { id: string; nome: string };

type Estado =
  | { tipo: "idle" }
  | { tipo: "sending" }
  | { tipo: "success" }
  | { tipo: "error"; codigo: string; campos?: string[] };

const inputClass =
  "w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-plum-600 focus:outline-none focus:ring-2 focus:ring-plum-100";

type Props = { servicos: Opcao[]; pacotes: Opcao[] };

/**
 * Pré-seleção a partir dos botões "Pedir orçamento" (?servico=&pacote=):
 * o `key` força um formulário novo quando a escolha muda.
 */
export function QuoteForm({ servicos, pacotes }: Props) {
  const params = useSearchParams();
  const s = params.get("servico") ?? "";
  const p = params.get("pacote") ?? "";
  const servicoInicial = servicos.some((o) => o.id === s) ? s : (servicos[0]?.id ?? "outro");
  const pacoteInicial = pacotes.some((o) => o.id === p) ? p : "";
  return (
    <Formulario
      key={`${servicoInicial}:${pacoteInicial}`}
      servicos={servicos}
      pacotes={pacotes}
      servicoInicial={servicoInicial}
      pacoteInicial={pacoteInicial}
    />
  );
}

function Formulario({
  servicos,
  pacotes,
  servicoInicial,
  pacoteInicial,
}: Props & { servicoInicial: string; pacoteInicial: string }) {
  const t = useTranslations("Site.form");
  const tc = useTranslations("Site.contact");
  const locale = useLocale();
  const [servico, setServico] = useState(servicoInicial);
  const [pacote, setPacote] = useState(pacoteInicial);
  const [estado, setEstado] = useState<Estado>({ tipo: "idle" });

  async function enviar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    const form = new FormData(evento.currentTarget);
    const dados = Object.fromEntries(form.entries());
    setEstado({ tipo: "sending" });
    try {
      const resposta = await fetch("/api/orcamento", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...dados, locale }),
      });
      const json = (await resposta.json()) as { ok: boolean; erro?: string; campos?: string[] };
      if (json.ok) {
        setEstado({ tipo: "success" });
        return;
      }
      setEstado({ tipo: "error", codigo: json.erro ?? "envio", campos: json.campos });
    } catch {
      setEstado({ tipo: "error", codigo: "envio" });
    }
  }

  const invalido = (campo: string) =>
    estado.tipo === "error" && estado.campos?.includes(campo) ? "true" : undefined;

  if (estado.tipo === "success") {
    return (
      <p role="status" className="rounded-xl border border-green-200 bg-green-50 p-6 text-green-800">
        {t("success")}
      </p>
    );
  }

  return (
    <form onSubmit={enviar} className="flex flex-col gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-1 text-sm font-medium">
          {t("name")}
          <input name="nome" required minLength={2} maxLength={100} autoComplete="name" className={inputClass} aria-invalid={invalido("nome")} />
        </label>
        <label className="flex flex-col gap-1 text-sm font-medium">
          {t("email")}
          <input name="email" type="email" required maxLength={200} autoComplete="email" className={inputClass} aria-invalid={invalido("email")} />
        </label>
        <label className="flex flex-col gap-1 text-sm font-medium">
          {t("phone")}
          <input name="telefone" type="tel" maxLength={40} autoComplete="tel" className={inputClass} aria-invalid={invalido("telefone")} />
        </label>
        <label className="flex flex-col gap-1 text-sm font-medium">
          {t("company")}
          <input name="empresa" maxLength={120} autoComplete="organization" className={inputClass} />
        </label>
        <label className="flex flex-col gap-1 text-sm font-medium">
          {t("service")}
          <select name="servico" value={servico} onChange={(e) => setServico(e.target.value)} className={inputClass} aria-invalid={invalido("servico")}>
            {servicos.map((s) => (
              <option key={s.id} value={s.id}>
                {s.nome}
              </option>
            ))}
            <option value="outro">{t("other")}</option>
          </select>
        </label>
        <label className="flex flex-col gap-1 text-sm font-medium">
          {t("package")}
          <select name="pacote" value={pacote} onChange={(e) => setPacote(e.target.value)} className={inputClass}>
            <option value="">{t("anyPackage")}</option>
            {pacotes.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nome}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-sm font-medium sm:col-span-2">
          {t("country")}
          <input name="pais" maxLength={80} autoComplete="country-name" className={inputClass} />
        </label>
      </div>
      <label className="flex flex-col gap-1 text-sm font-medium">
        {t("message")}
        <textarea
          name="mensagem"
          required
          minLength={10}
          maxLength={2000}
          rows={5}
          placeholder={t("messagePlaceholder")}
          className={inputClass}
          aria-invalid={invalido("mensagem")}
        />
      </label>
      {/* Honeypot anti-spam: invisível para pessoas. */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label>
          Website
          <input name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      {estado.tipo === "error" && (
        <div role="alert" className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {estado.codigo === "validacao"
            ? t("errorValidation")
            : estado.codigo === "limite"
              ? t("errorLimit")
              : (
                <>
                  {t("errorSend")}{" "}
                  <a className="font-semibold underline" href={linkWhatsapp(tc("whatsappMessage"))} target="_blank" rel="noopener noreferrer">
                    WhatsApp {WHATSAPP_VISIVEL}
                  </a>{" "}
                  ·{" "}
                  <a className="font-semibold underline" href={`mailto:${EMAIL_CONTACTO}`}>
                    {EMAIL_CONTACTO}
                  </a>
                </>
              )}
        </div>
      )}

      <button
        type="submit"
        disabled={estado.tipo === "sending"}
        className="rounded-lg bg-plum-600 px-5 py-3 font-semibold text-white transition hover:bg-plum-700 disabled:opacity-60 sm:self-start"
      >
        {estado.tipo === "sending" ? t("sending") : t("submit")}
      </button>
      <p className="text-xs text-gray-500">{t("privacy")}</p>
    </form>
  );
}

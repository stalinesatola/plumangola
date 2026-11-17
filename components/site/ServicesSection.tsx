import { getLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import {
  DATA_CAMBIO,
  formatarData,
  formatarKz,
  formatarUsdAprox,
  formatarUsdCentimos,
  kzParaCentimosUsd,
  KZ_POR_USD,
  PRECARIO_VALIDO_ATE,
  type Idioma,
} from "@/lib/servicos/cambio";
import { NOMES_PACOTE, SERVICOS, sinalKz, type Pacote } from "@/lib/servicos/catalogo";
import { stripeConfigurado } from "@/lib/stripe";
import { PayDepositButton } from "./PayDepositButton";

async function Preco({ pacote, idioma }: { pacote: Pacote; idioma: Idioma }) {
  const t = await getTranslations("Site.services");
  const unidade = pacote.unidade ? ` ${pacote.unidade[idioma]}` : "";

  if (pacote.sobOrcamento) {
    return <p className="text-2xl font-bold text-gray-900">{t("onRequest")}</p>;
  }

  if (pacote.horaKz) {
    return (
      <div>
        <p className="text-2xl font-bold text-gray-900">
          {formatarKz(pacote.horaKz, idioma)}
          <span className="text-sm font-medium text-gray-500">{t("perHour")}</span>
        </p>
        <p className="text-sm text-gray-500">{formatarUsdAprox(pacote.horaKz, idioma)}</p>
      </div>
    );
  }

  if (pacote.implementacaoKz) {
    return (
      <div>
        <p className="text-2xl font-bold text-gray-900">
          {pacote.desde && <span className="mr-1 text-sm font-medium text-gray-500">{t("from")}</span>}
          {formatarKz(pacote.implementacaoKz, idioma)}
        </p>
        <p className="text-sm text-gray-500">
          {formatarUsdAprox(pacote.implementacaoKz, idioma)} · {unidade ? unidade.trim() : t("oneOff")}
        </p>
        {pacote.mensalKz && (
          <p className="mt-1 text-sm font-semibold text-plum-700">
            {t("plusMonthly", { amount: formatarKz(pacote.mensalKz, idioma) })}{" "}
            <span className="font-normal text-gray-500">({formatarUsdAprox(pacote.mensalKz, idioma)})</span>
          </p>
        )}
      </div>
    );
  }

  if (pacote.mensalKz) {
    return (
      <div>
        <p className="text-2xl font-bold text-gray-900">
          {formatarKz(pacote.mensalKz, idioma)}
          <span className="text-sm font-medium text-gray-500">{t("perMonth")}</span>
        </p>
        <p className="text-sm text-gray-500">{formatarUsdAprox(pacote.mensalKz, idioma)}</p>
      </div>
    );
  }

  return null;
}

export async function ServicesSection() {
  const t = await getTranslations("Site");
  const idioma = (await getLocale()) as Idioma;
  const pagamentosAtivos = stripeConfigurado();

  return (
    <section id="servicos" aria-labelledby="servicos-titulo" className="scroll-mt-20">
      <div className="flex flex-col gap-3">
        <h2 id="servicos-titulo" className="text-2xl font-bold sm:text-3xl">
          {t("services.title")}
        </h2>
        <p className="max-w-3xl text-gray-600">{t("services.subtitle")}</p>
        <p className="max-w-3xl rounded-lg bg-plum-50 px-4 py-3 text-sm text-plum-900">
          {t("services.rateNote", {
            rate: formatarKz(KZ_POR_USD, idioma).replace(" Kz", ""),
            date: formatarData(DATA_CAMBIO, idioma),
            validUntil: formatarData(PRECARIO_VALIDO_ATE, idioma),
          })}
          {pagamentosAtivos && <> {t("pay.testMode")}</>}
        </p>
        <nav aria-label={t("services.title")} className="flex flex-wrap gap-2 pt-2">
          {SERVICOS.map((s) => (
            <a
              key={s.id}
              href={`#${s.id}`}
              className="rounded-full border border-gray-200 px-3 py-1 text-sm text-gray-700 hover:border-plum-400 hover:text-plum-700"
            >
              {s.nome[idioma]}
            </a>
          ))}
        </nav>
      </div>

      <div className="mt-10 flex flex-col gap-14">
        {SERVICOS.map((servico) => (
          <article key={servico.id} id={servico.id} className="scroll-mt-20" aria-labelledby={`${servico.id}-titulo`}>
            <h3 id={`${servico.id}-titulo`} className="text-xl font-bold text-plum-700">
              {servico.nome[idioma]}
            </h3>
            <p className="mt-1 max-w-3xl text-gray-600">{servico.resumo[idioma]}</p>

            <div className="mt-5 grid gap-4 md:grid-cols-3">
              {servico.pacotes.map((pacote) => {
                const sinal = sinalKz(servico, pacote);
                const destaque = pacote.id === "profissional";
                return (
                  <div
                    key={pacote.id}
                    className={`flex flex-col gap-4 rounded-2xl border p-5 ${
                      destaque ? "border-plum-400 shadow-md" : "border-gray-200"
                    }`}
                  >
                    <div>
                      <p className="text-sm font-semibold uppercase tracking-wide text-plum-600">
                        {NOMES_PACOTE[pacote.id][idioma]}
                      </p>
                      {pacote.nome && <p className="font-semibold text-gray-900">{pacote.nome[idioma]}</p>}
                    </div>
                    <Preco pacote={pacote} idioma={idioma} />
                    <p className="flex-1 text-sm leading-relaxed text-gray-700">{pacote.inclui[idioma]}</p>
                    <div className="flex flex-col gap-2">
                      {sinal !== null && (
                        <p className="text-xs text-gray-500">
                          {t("services.deposit", {
                            kz: formatarKz(sinal, idioma),
                            usd: formatarUsdCentimos(kzParaCentimosUsd(sinal), idioma),
                          })}
                        </p>
                      )}
                      {sinal !== null && pagamentosAtivos && (
                        <PayDepositButton servico={servico.id} pacote={pacote.id} />
                      )}
                      {sinal === null && pacote.implementacaoKz && (
                        <p className="text-xs text-gray-500">{t("services.noOnlineDeposit")}</p>
                      )}
                      <Link
                        href={{ pathname: "/", query: { servico: servico.id, pacote: pacote.id }, hash: "contacto" }}
                        className="w-full rounded-lg border border-plum-600 px-4 py-2.5 text-center text-sm font-semibold text-plum-700 transition hover:bg-plum-50"
                      >
                        {t("services.requestQuote")}
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>

            <details className="mt-3 text-sm text-gray-600">
              <summary className="cursor-pointer font-medium text-gray-700">{t("services.notes")}</summary>
              <p className="mt-2 max-w-3xl">{servico.notas[idioma]}</p>
            </details>
          </article>
        ))}
      </div>
    </section>
  );
}

import { getTranslations } from "next-intl/server";

const PORTAL_BASE = "https://portaldocontribuinte.minfin.gov.ao";

const SERVICOS = [
  { slug: "cadastro", url: `${PORTAL_BASE}/registrar-singular-solicitacao` },
  { slug: "liquidacoes", url: PORTAL_BASE },
  { slug: "pagamentos", url: PORTAL_BASE },
  { slug: "certificado", url: PORTAL_BASE },
  { slug: "produtoresSoftware", url: PORTAL_BASE },
  { slug: "graficasTipografias", url: PORTAL_BASE },
  { slug: "validarDocumentos", url: PORTAL_BASE },
] as const;

export default async function UtentePage() {
  const t = await getTranslations("Utente");

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{t("heading")}</h1>
        <p className="mt-2 text-gray-600">{t("intro")}</p>
      </div>

      <div
        role="note"
        className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900"
      >
        {t("disclaimer")}
      </div>

      <section>
        <h2 className="mb-3 text-lg font-semibold text-gray-900">
          {t("servicesHeading")}
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {SERVICOS.map((servico) => (
            <div
              key={servico.slug}
              className="flex flex-col gap-2 rounded-xl border border-gray-200 bg-white p-5"
            >
              <h3 className="font-semibold text-gray-900">
                {t(`servicos.${servico.slug}.nome`)}
              </h3>
              <p className="flex-1 text-sm text-gray-600">
                {t(`servicos.${servico.slug}.descricao`)}
              </p>
              <a
                href={servico.url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-flex w-fit items-center gap-1 rounded-lg border border-plum-600 px-3 py-1.5 text-sm font-semibold text-plum-700 transition hover:bg-plum-50"
              >
                {t("officialLinkButton")} ↗
              </a>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { formatarUsdCentimos, type Idioma } from "@/lib/servicos/cambio";
import { encontrarPacote, NOMES_PACOTE } from "@/lib/servicos/catalogo";
import { obterCheckoutSession, type CheckoutSession } from "@/lib/stripe";

export const metadata: Metadata = { robots: { index: false, follow: false } };

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ session_id?: string | string[] }>;
};

export default async function SucessoPage({ params, searchParams }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const idioma = locale as Idioma;
  const t = await getTranslations("Site.success");
  const { session_id } = await searchParams;

  // Confirmar no servidor junto do Stripe — não confiar só no redirect.
  let sessao: CheckoutSession | null = null;
  if (typeof session_id === "string" && /^cs_(test|live)_[A-Za-z0-9]{10,200}$/.test(session_id)) {
    const r = await obterCheckoutSession(session_id);
    if (r.ok) sessao = r.dados;
  }

  const pago = sessao?.payment_status === "paid";
  const encontrado =
    sessao?.metadata?.servico && sessao.metadata.pacote
      ? encontrarPacote(sessao.metadata.servico, sessao.metadata.pacote)
      : null;

  return (
    <div className="flex flex-col items-center gap-5 text-center">
      <h1 className="text-2xl font-bold text-gray-900">{pago ? t("title") : t("pending")}</h1>
      {pago && <p className="max-w-md text-gray-600">{t("text")}</p>}
      {sessao && (
        <dl className="grid w-full max-w-md grid-cols-[auto_1fr] gap-x-4 gap-y-2 rounded-xl border border-gray-200 bg-white p-5 text-left text-sm">
          {encontrado && (
            <>
              <dt className="font-semibold">{t("package")}</dt>
              <dd>
                {encontrado.servico.nome[idioma]} — {NOMES_PACOTE[encontrado.pacote.id][idioma]}
              </dd>
            </>
          )}
          {sessao.amount_total !== null && (
            <>
              <dt className="font-semibold">{t("amount")}</dt>
              <dd>{formatarUsdCentimos(sessao.amount_total, idioma)}</dd>
            </>
          )}
          <dt className="font-semibold">{t("reference")}</dt>
          <dd className="break-all font-mono text-xs">{sessao.id.slice(-12)}</dd>
        </dl>
      )}
      <Link href="/" className="rounded-lg bg-plum-600 px-4 py-2 font-semibold text-white hover:bg-plum-700">
        {t("back")}
      </Link>
    </div>
  );
}

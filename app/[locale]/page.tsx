import type { Metadata } from "next";
import { Suspense } from "react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { PlumLogo } from "@/components/PlumLogo";
import { QuoteForm } from "@/components/site/QuoteForm";
import { ServicesSection } from "@/components/site/ServicesSection";
import { WhatsappIcon } from "@/components/site/WhatsappIcon";
import { EMAIL_CONTACTO, linkWhatsapp, WHATSAPP_VISIVEL } from "@/components/site/contactos";
import { NOMES_PACOTE, SERVICOS } from "@/lib/servicos/catalogo";
import type { Idioma } from "@/lib/servicos/cambio";
import { alternativas, SITE_URL } from "@/lib/site";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Site" });
  return {
    title: { absolute: t("metaTitle") },
    description: t("metaDescription"),
    alternates: alternativas(locale, "/"),
    openGraph: {
      title: t("metaTitle"),
      description: t("metaDescription"),
      url: locale === "en" ? "/en" : "/",
      siteName: "Plum Angola",
      locale: locale === "en" ? "en_US" : "pt_AO",
      alternateLocale: locale === "en" ? ["pt_AO"] : ["en_US"],
      type: "website",
      images: [{ url: "/logo-plum-angola.png", width: 930, height: 843, alt: "Plum Angola" }],
    },
  };
}

export default async function HomePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const idioma = locale as Idioma;
  const t = await getTranslations("Site");
  const th = await getTranslations("Hub");
  const whatsapp = linkWhatsapp(t("contact.whatsappMessage"));
  const passos = t.raw("how.steps") as string[];

  const portfolio: { key: string; nome: string; href: string; externo?: boolean }[] = [
    { key: "dlaminiLoja", nome: th("dlaminiLoja.name"), href: "/dlamini-loja" },
    { key: "paulirabeauty", nome: th("paulirabeauty.name"), href: "/paulirabeauty" },
    { key: "empregos", nome: th("empregos.name"), href: "/empregos" },
    { key: "utente", nome: th("utente.name"), href: "/utente" },
    { key: "batfichas", nome: th("batfichas.name"), href: "https://batfichas.com", externo: true },
  ];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${SITE_URL}/#organization`,
    name: "Plum Angola",
    legalName: "Staline Marques Satola — Serviços Informáticos e IA",
    url: SITE_URL,
    logo: `${SITE_URL}/logo-plum-angola.png`,
    email: EMAIL_CONTACTO,
    telephone: "+244923925509",
    taxID: "000232783HO035",
    address: {
      "@type": "PostalAddress",
      streetAddress: "Bairro Viana",
      addressLocality: "Luanda",
      addressCountry: "AO",
    },
    areaServed: ["AO", "Worldwide"],
    contactPoint: {
      "@type": "ContactPoint",
      telephone: "+244923925509",
      email: EMAIL_CONTACTO,
      contactType: "sales",
      availableLanguage: ["Portuguese", "English"],
    },
    makesOffer: SERVICOS.map((s) => ({
      "@type": "Offer",
      itemOffered: { "@type": "Service", name: s.nome[idioma], description: s.resumo[idioma] },
    })),
  };

  const cardClass =
    "group flex flex-col gap-2 rounded-xl border border-gray-200 p-5 transition hover:border-plum-400 hover:shadow-md";

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />

      <header className="sticky top-0 z-30 border-b border-gray-100 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <PlumLogo variant="lockup" height={44} href={undefined} priority />
          <nav className="hidden items-center gap-6 text-sm font-medium text-gray-700 md:flex">
            <a href="#servicos" className="hover:text-plum-700">{t("nav.services")}</a>
            <a href="#como-funciona" className="hover:text-plum-700">{t("nav.how")}</a>
            <a href="#portfolio" className="hover:text-plum-700">{t("nav.portfolio")}</a>
            <a href="#contacto" className="hover:text-plum-700">{t("nav.contact")}</a>
          </nav>
          <LanguageSwitcher />
        </div>
      </header>

      <main className="mx-auto flex max-w-6xl flex-col gap-20 px-4 pb-24 pt-12 sm:px-6">
        <section className="flex flex-col gap-6">
          <p className="text-sm font-semibold uppercase tracking-wide text-plum-600">{t("hero.eyebrow")}</p>
          <h1 className="max-w-3xl text-4xl font-extrabold leading-tight sm:text-5xl">{t("hero.title")}</h1>
          <p className="max-w-2xl text-lg text-gray-600">{t("hero.subtitle")}</p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <a href="#servicos" className="rounded-lg bg-plum-600 px-5 py-3 text-center font-semibold text-white hover:bg-plum-700">
              {t("hero.ctaServices")}
            </a>
            <a
              href={whatsapp}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-green-600 px-5 py-3 font-semibold text-green-700 hover:bg-green-50"
            >
              <WhatsappIcon /> {t("hero.ctaWhatsapp")}
            </a>
          </div>
          <aside className="max-w-3xl rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
            <strong>{t("offer.title")}:</strong> {t("offer.text")}
          </aside>
        </section>

        <ServicesSection />

        <section id="como-funciona" aria-labelledby="como-titulo" className="scroll-mt-20">
          <h2 id="como-titulo" className="text-2xl font-bold sm:text-3xl">{t("how.title")}</h2>
          <ol className="mt-6 grid gap-4 md:grid-cols-4">
            {passos.map((passo, i) => (
              <li key={i} className="rounded-xl bg-gray-50 p-5 text-sm text-gray-700">
                <span className="mb-2 flex h-8 w-8 items-center justify-center rounded-full bg-plum-600 font-bold text-white">
                  {i + 1}
                </span>
                {passo}
              </li>
            ))}
          </ol>
          <p className="mt-4 max-w-3xl text-sm text-gray-500">{t("how.terms")}</p>
        </section>

        <section id="portfolio" aria-labelledby="portfolio-titulo" className="scroll-mt-20">
          <h2 id="portfolio-titulo" className="text-2xl font-bold sm:text-3xl">{t("portfolio.title")}</h2>
          <p className="mt-2 text-gray-600">{t("portfolio.subtitle")}</p>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {portfolio.map((item) => {
              const conteudo = (
                <>
                  <span className="self-start rounded-full bg-plum-50 px-2.5 py-0.5 text-xs font-semibold text-plum-700">
                    {t(`portfolio.items.${item.key}.tag`)}
                  </span>
                  <h3 className="text-lg font-semibold text-gray-900 group-hover:text-plum-700">{item.nome}</h3>
                  <p className="flex-1 text-sm text-gray-600">{t(`portfolio.items.${item.key}.description`)}</p>
                  <span className="text-sm font-semibold text-plum-600">{t("portfolio.open")} →</span>
                </>
              );
              return item.externo ? (
                <a key={item.key} href={item.href} target="_blank" rel="noopener noreferrer" className={cardClass}>
                  {conteudo}
                </a>
              ) : (
                <Link key={item.key} href={item.href} className={cardClass}>
                  {conteudo}
                </Link>
              );
            })}
          </div>
          <p className="mt-4 text-sm text-gray-500">
            {t("portfolio.otherSpaces")}{" "}
            <a href="https://hymoshe.vercel.app/" target="_blank" rel="noopener noreferrer" className="underline hover:text-plum-700">
              {th("hymoshe.name")}
            </a>
          </p>
        </section>

        <section id="contacto" aria-labelledby="contacto-titulo" className="scroll-mt-20">
          <div className="grid gap-10 lg:grid-cols-[1fr_2fr]">
            <div className="flex flex-col gap-4">
              <h2 id="contacto-titulo" className="text-2xl font-bold sm:text-3xl">{t("contact.title")}</h2>
              <p className="text-gray-600">{t("contact.subtitle")}</p>
              <ul className="flex flex-col gap-3 text-sm">
                <li>
                  <a href={whatsapp} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 font-semibold text-green-700 hover:underline">
                    <WhatsappIcon /> {t("contact.whatsapp")}: {WHATSAPP_VISIVEL}
                  </a>
                </li>
                <li>
                  <a href={`mailto:${EMAIL_CONTACTO}`} className="font-semibold text-plum-700 hover:underline">
                    {t("contact.email")}: {EMAIL_CONTACTO}
                  </a>
                </li>
                <li className="text-gray-600">{t("contact.address")}</li>
              </ul>
            </div>
            <div className="rounded-2xl border border-gray-200 p-5 sm:p-8">
              <Suspense fallback={null}>
                <QuoteForm
                  servicos={SERVICOS.map((s) => ({ id: s.id, nome: s.nome[idioma] }))}
                  pacotes={(Object.keys(NOMES_PACOTE) as (keyof typeof NOMES_PACOTE)[]).map((id) => ({
                    id,
                    nome: NOMES_PACOTE[id][idioma],
                  }))}
                />
              </Suspense>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-gray-100 bg-gray-50">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-8 text-sm text-gray-500 sm:px-6">
          <PlumLogo variant="mark" height={32} href={undefined} />
          <p className="font-medium text-gray-700">{t("footer.company")}</p>
          <p>
            {t("footer.nif")} · {t("contact.address")} · {WHATSAPP_VISIVEL} · {EMAIL_CONTACTO}
          </p>
          <p>
            © {new Date().getFullYear()} Plum Angola. {t("footer.rights")}
          </p>
        </div>
      </footer>

      <a
        href={whatsapp}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={t("hero.ctaWhatsapp")}
        className="fixed bottom-5 right-5 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-green-600 text-white shadow-lg transition hover:bg-green-700"
      >
        <WhatsappIcon className="h-7 w-7" />
      </a>
    </>
  );
}

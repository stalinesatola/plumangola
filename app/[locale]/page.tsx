import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { PlumLogo } from "@/components/PlumLogo";

export default async function HomePage() {
  const t = await getTranslations("Hub");

  const espacos: {
    key: string;
    nome: string;
    descricao: string;
    href: string;
    externo?: boolean;
  }[] = [
    {
      key: "batfichas",
      nome: t("batfichas.name"),
      descricao: t("batfichas.description"),
      href: "https://batfichas.com",
      externo: true,
    },
    {
      key: "hymoshe",
      nome: t("hymoshe.name"),
      descricao: t("hymoshe.description"),
      href: "https://hymoshe.vercel.app/",
      externo: true,
    },
    {
      key: "dlamini-loja",
      nome: t("dlaminiLoja.name"),
      descricao: t("dlaminiLoja.description"),
      href: "/dlamini-loja",
    },
    {
      key: "paulirabeauty",
      nome: t("paulirabeauty.name"),
      descricao: t("paulirabeauty.description"),
      href: "/paulirabeauty",
    },
    {
      key: "empregos",
      nome: t("empregos.name"),
      descricao: t("empregos.description"),
      href: "/empregos",
    },
    {
      key: "utente",
      nome: t("utente.name"),
      descricao: t("utente.description"),
      href: "/utente",
    },
  ];

  const cardClassName =
    "group flex flex-col gap-2 rounded-xl border border-gray-200 p-6 transition hover:border-plum-400 hover:shadow-md";

  return (
    <main className="mx-auto flex min-h-screen max-w-4xl flex-col gap-10 px-6 py-16">
      <header className="flex flex-col gap-6">
        <div className="flex items-center justify-between gap-4">
          <PlumLogo variant="lockup" height={56} href={undefined} priority />
          <LanguageSwitcher />
        </div>
        <div className="flex flex-col gap-3">
          <h1 className="text-3xl font-bold sm:text-4xl">{t("title")}</h1>
          <p className="max-w-2xl text-gray-600">{t("description")}</p>
        </div>
      </header>

      <section className="grid gap-4 sm:grid-cols-2">
        {espacos.map((espaco) =>
          espaco.externo ? (
            <a
              key={espaco.key}
              href={espaco.href}
              target="_blank"
              rel="noopener noreferrer"
              className={cardClassName}
            >
              <h2 className="text-lg font-semibold text-plum-700 group-hover:text-plum-600">
                {espaco.nome}
              </h2>
              <p className="text-sm text-gray-600">{espaco.descricao}</p>
            </a>
          ) : (
            <Link
              key={espaco.key}
              href={espaco.href}
              className={cardClassName}
            >
              <h2 className="text-lg font-semibold text-plum-700 group-hover:text-plum-600">
                {espaco.nome}
              </h2>
              <p className="text-sm text-gray-600">{espaco.descricao}</p>
            </Link>
          )
        )}
      </section>
    </main>
  );
}

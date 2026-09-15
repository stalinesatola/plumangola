import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

export default async function HomePage() {
  const t = await getTranslations("Hub");

  const espacos = [
    {
      slug: "dlamini-loja",
      nome: t("dlaminiLoja.name"),
      descricao: t("dlaminiLoja.description"),
    },
  ];

  return (
    <main className="mx-auto flex min-h-screen max-w-4xl flex-col gap-10 px-6 py-16">
      <header className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold uppercase tracking-widest text-plum-600">
            {t("eyebrow")}
          </span>
          <LanguageSwitcher />
        </div>
        <h1 className="text-3xl font-bold sm:text-4xl">{t("title")}</h1>
        <p className="max-w-2xl text-gray-600">{t("description")}</p>
      </header>

      <section className="grid gap-4 sm:grid-cols-2">
        {espacos.map((espaco) => (
          <Link
            key={espaco.slug}
            href={`/${espaco.slug}`}
            className="group flex flex-col gap-2 rounded-xl border border-gray-200 p-6 transition hover:border-plum-400 hover:shadow-md"
          >
            <h2 className="text-lg font-semibold text-plum-700 group-hover:text-plum-600">
              {espaco.nome}
            </h2>
            <p className="text-sm text-gray-600">{espaco.descricao}</p>
          </Link>
        ))}
      </section>
    </main>
  );
}

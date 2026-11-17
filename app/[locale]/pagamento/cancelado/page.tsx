import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";

export const metadata: Metadata = { robots: { index: false, follow: false } };

export default async function CanceladoPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Site.cancel");

  return (
    <div className="flex flex-col items-center gap-4 text-center">
      <h1 className="text-2xl font-bold text-gray-900">{t("title")}</h1>
      <p className="max-w-md text-gray-600">{t("text")}</p>
      <Link href={{ pathname: "/", hash: "servicos" }} className="rounded-lg bg-plum-600 px-4 py-2 font-semibold text-white hover:bg-plum-700">
        {t("back")}
      </Link>
    </div>
  );
}

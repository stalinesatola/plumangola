import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

export default async function DlaminiLojaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const t = await getTranslations("DlaminiLoja");

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <Link href="/dlamini-loja" className="flex flex-col leading-tight">
            <span className="text-xs uppercase tracking-widest text-plum-600">
              {t("brand")}
            </span>
            <span className="text-lg font-bold text-gray-900">
              {t("storeName")}
            </span>
          </Link>
          <div className="flex items-center gap-4">
            <LanguageSwitcher />
            <Link href="/" className="text-sm text-gray-500 hover:text-plum-600">
              {t("backToHub")}
            </Link>
          </div>
        </div>
      </header>
      <div className="mx-auto max-w-5xl px-6 py-10">{children}</div>
    </div>
  );
}

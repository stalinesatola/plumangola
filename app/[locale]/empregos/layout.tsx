import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { PlumLogo } from "@/components/PlumLogo";

export default async function EmpregosLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const t = await getTranslations("Empregos");

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-4">
          <Link href="/empregos" className="flex items-center gap-3">
            <PlumLogo variant="mark" height={40} href={undefined} />
            <span className="text-lg font-bold text-gray-900">{t("storeName")}</span>
          </Link>
          <div className="flex items-center gap-4">
            <LanguageSwitcher />
            <Link href="/" className="text-sm text-gray-500 hover:text-plum-600">
              {t("backToHub")}
            </Link>
          </div>
        </div>
      </header>
      <div className="mx-auto max-w-3xl px-6 py-10">{children}</div>
    </div>
  );
}

"use client";

import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";

export function LanguageSwitcher() {
  const t = useTranslations("LanguageSwitcher");
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  function trocarIdioma(novoLocale: "pt" | "en") {
    router.replace(pathname, { locale: novoLocale });
  }

  return (
    <div className="flex items-center gap-1.5 text-xs font-semibold">
      <button
        type="button"
        onClick={() => trocarIdioma("pt")}
        className={locale === "pt" ? "text-plum-700" : "text-gray-400 hover:text-plum-600"}
      >
        {t("pt")}
      </button>
      <span className="text-gray-300">|</span>
      <button
        type="button"
        onClick={() => trocarIdioma("en")}
        className={locale === "en" ? "text-plum-700" : "text-gray-400 hover:text-plum-600"}
      >
        {t("en")}
      </button>
    </div>
  );
}

import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";

export default async function ObrigadoPage() {
  const t = await getTranslations("Obrigado");

  return (
    <div className="flex flex-col items-center gap-4 py-16 text-center">
      <h1 className="text-2xl font-bold text-gray-900">{t("title")}</h1>
      <p className="max-w-md text-gray-600">{t("message")}</p>
      <Link
        href="/dlamini-loja"
        className="rounded-lg bg-plum-600 px-4 py-2 font-semibold text-white hover:bg-plum-700"
      >
        {t("backButton")}
      </Link>
    </div>
  );
}

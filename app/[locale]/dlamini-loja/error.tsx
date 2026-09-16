"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";

export default function DlaminiLojaError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations("ErroPagina");

  useEffect(() => {
    console.error("Erro na Dlamini Loja:", error);
  }, [error]);

  return (
    <div className="flex flex-col items-center gap-4 py-16 text-center">
      <h1 className="text-2xl font-bold text-gray-900">{t("title")}</h1>
      <p className="max-w-md text-gray-600">{t("message")}</p>
      <button
        type="button"
        onClick={reset}
        className="rounded-lg bg-plum-600 px-4 py-2 font-semibold text-white hover:bg-plum-700"
      >
        {t("retry")}
      </button>
    </div>
  );
}

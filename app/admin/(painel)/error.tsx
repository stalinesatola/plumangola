"use client";

import { useEffect } from "react";
import { reportarErroCliente } from "@/lib/reportar-erro-cliente";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Erro no painel de admin:", error);
    reportarErroCliente("admin", error);
  }, [error]);

  return (
    <div className="flex flex-col items-center gap-4 py-16 text-center">
      <h1 className="text-2xl font-bold text-gray-900">Algo correu mal</h1>
      <p className="max-w-md text-gray-600">
        Não foi possível carregar esta página. Tenta novamente daqui a pouco.
      </p>
      <button
        type="button"
        onClick={reset}
        className="rounded-lg bg-plum-600 px-4 py-2 font-semibold text-white hover:bg-plum-700"
      >
        Tentar novamente
      </button>
    </div>
  );
}

"use client";

import { useEffect } from "react";
import { reportarErroCliente } from "@/lib/reportar-erro-cliente";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Erro global:", error);
    reportarErroCliente("global", error);
  }, [error]);

  // Nota: este layout substitui por completo o app/layout.tsx quando ativa
  // (erro no próprio layout raiz), por isso não pode depender do CSS do
  // Tailwind carregado lá — usa estilos inline como rede de segurança.
  return (
    <html lang="pt">
      <body
        style={{
          display: "flex",
          minHeight: "100vh",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "1rem",
          padding: "0 1rem",
          textAlign: "center",
          fontFamily: "system-ui, sans-serif",
          color: "#111827",
        }}
      >
        <h1 style={{ fontSize: "1.5rem", fontWeight: 700 }}>Algo correu mal</h1>
        <p style={{ maxWidth: "28rem", color: "#4b5563" }}>
          Ocorreu um erro inesperado. Tenta novamente daqui a pouco.
        </p>
        <button
          type="button"
          onClick={reset}
          style={{
            borderRadius: "0.5rem",
            backgroundColor: "#7e22a8",
            color: "#fff",
            padding: "0.5rem 1rem",
            fontWeight: 600,
            border: "none",
            cursor: "pointer",
          }}
        >
          Tentar novamente
        </button>
      </body>
    </html>
  );
}

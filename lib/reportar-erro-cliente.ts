/**
 * Reenvia um erro apanhado por um error boundary do cliente para o servidor
 * (app/api/alerts/client-error), para além do console.error local -- hoje
 * esses erros ficavam só visíveis no browser do utilizador, nunca chegando
 * a quem gere o site. Best-effort: nunca lança, nunca bloqueia a UI.
 */
export function reportarErroCliente(espaco: string, error: Error & { digest?: string }): void {
  try {
    fetch("/api/alerts/client-error", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        espaco,
        mensagem: error.message,
        stack: error.stack,
        url: typeof window !== "undefined" ? window.location.href : undefined,
      }),
    }).catch(() => {});
  } catch {
    // ignora -- este reporte é best-effort
  }
}

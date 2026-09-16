"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export function LoginForm() {
  const router = useRouter();
  const [erro, setErro] = useState<string | null>(null);
  const [aEnviar, setAEnviar] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setAEnviar(true);
    setErro(null);

    const formData = new FormData(event.currentTarget);

    try {
      const resposta = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: formData.get("username"),
          password: formData.get("password"),
        }),
      });

      const dados = await resposta.json();

      if (!resposta.ok || !dados.ok) {
        setErro(dados.erro ?? "Não foi possível entrar.");
        setAEnviar(false);
        return;
      }

      router.push("/admin/produtos");
      router.refresh();
    } catch {
      setErro("Falha de rede. Tenta novamente.");
      setAEnviar(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <label className="flex flex-col gap-1 text-sm">
        Utilizador
        <input
          name="username"
          type="text"
          required
          autoFocus
          className="rounded-lg border border-gray-300 px-3 py-2"
        />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        Senha
        <input
          name="password"
          type="password"
          required
          className="rounded-lg border border-gray-300 px-3 py-2"
        />
      </label>

      {erro && (
        <p role="alert" aria-live="polite" className="text-sm text-red-600">
          {erro}
        </p>
      )}

      <button
        type="submit"
        disabled={aEnviar}
        className="rounded-lg bg-plum-600 px-4 py-2 font-semibold text-white transition hover:bg-plum-700 disabled:cursor-not-allowed disabled:bg-gray-300"
      >
        {aEnviar ? "A entrar..." : "Entrar"}
      </button>
    </form>
  );
}

"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { Produto } from "@/lib/produtos";
import { normalizarBusca } from "@/lib/slug";
import { ProductCard } from "@/components/dlamini-loja/ProductCard";
import { OrderForm } from "@/components/dlamini-loja/OrderForm";

export function CatalogoCliente({ produtos }: { produtos: Produto[] }) {
  const t = useTranslations("DlaminiLoja");
  const [produtoSelecionado, setProdutoSelecionado] = useState<Produto | null>(
    null
  );
  const [pesquisa, setPesquisa] = useState("");

  const produtosFiltrados = useMemo(() => {
    const termo = normalizarBusca(pesquisa);
    if (!termo) return produtos;

    return produtos.filter((produto) => {
      const alvo = normalizarBusca(
        `${produto.nome} ${produto.descricao} ${produto.categoria}`
      );
      return alvo.includes(termo);
    });
  }, [produtos, pesquisa]);

  if (produtos.length === 0) {
    return <p className="text-gray-500">{t("empty")}</p>;
  }

  return (
    <>
      <div className="mb-6">
        <input
          type="search"
          value={pesquisa}
          onChange={(event) => setPesquisa(event.target.value)}
          placeholder={t("searchPlaceholder")}
          className="w-full max-w-sm rounded-lg border border-gray-300 px-3 py-2 text-sm"
        />
      </div>

      {produtosFiltrados.length === 0 ? (
        <p className="text-gray-500">{t("noResults")}</p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {produtosFiltrados.map((produto) => (
            <ProductCard
              key={produto.id}
              produto={produto}
              onSelecionar={setProdutoSelecionado}
            />
          ))}
        </div>
      )}

      {produtoSelecionado && (
        <OrderForm
          produto={produtoSelecionado}
          onFechar={() => setProdutoSelecionado(null)}
        />
      )}
    </>
  );
}

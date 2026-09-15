"use client";

import { useState } from "react";
import { Produto } from "@/lib/produtos";
import { ProductCard } from "@/components/dlamini-loja/ProductCard";
import { OrderForm } from "@/components/dlamini-loja/OrderForm";

export function CatalogoCliente({ produtos }: { produtos: Produto[] }) {
  const [produtoSelecionado, setProdutoSelecionado] = useState<Produto | null>(
    null
  );

  if (produtos.length === 0) {
    return (
      <p className="text-gray-500">
        Ainda não há produtos disponíveis. Volta a visitar em breve.
      </p>
    );
  }

  return (
    <>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {produtos.map((produto) => (
          <ProductCard
            key={produto.id}
            produto={produto}
            onSelecionar={setProdutoSelecionado}
          />
        ))}
      </div>

      {produtoSelecionado && (
        <OrderForm
          produto={produtoSelecionado}
          onFechar={() => setProdutoSelecionado(null)}
        />
      )}
    </>
  );
}

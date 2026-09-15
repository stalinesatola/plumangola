"use client";

import { useState } from "react";
import { ProductCard } from "@/components/dlamini-loja/ProductCard";
import { OrderForm } from "@/components/dlamini-loja/OrderForm";
import { getDlaminiLojaProdutos, Produto } from "@/lib/products";

const produtos = getDlaminiLojaProdutos();

export default function DlaminiLojaPage() {
  const [produtoSelecionado, setProdutoSelecionado] = useState<Produto | null>(
    null
  );

  return (
    <>
      <div className="mb-8 flex flex-col gap-2">
        <h1 className="text-2xl font-bold text-gray-900">
          Produtos disponíveis
        </h1>
        <p className="text-gray-600">
          Escolhe um produto e faz o teu pedido — o Dlamini recebe a
          notificação diretamente no Telegram e entra em contacto contigo
          para confirmar a encomenda.
        </p>
      </div>

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

"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Produto, formatarPreco } from "@/lib/produtos";
import { StockBadge } from "./StockBadge";

export function ProdutosTable({ produtos }: { produtos: Produto[] }) {
  const router = useRouter();
  const [aApagar, setAApagar] = useState<number | null>(null);

  async function handleApagar(produto: Produto) {
    if (!confirm(`Apagar "${produto.nome}"? Esta ação não pode ser desfeita.`)) {
      return;
    }

    setAApagar(produto.id);
    try {
      await fetch(`/api/admin/produtos/${produto.id}`, { method: "DELETE" });
      router.refresh();
    } finally {
      setAApagar(null);
    }
  }

  if (produtos.length === 0) {
    return (
      <p className="text-gray-500">
        Ainda não há produtos. Clica em &quot;Novo produto&quot; para começar.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
      <table className="w-full min-w-[720px] text-left text-sm">
        <thead className="border-b border-gray-200 bg-gray-50 text-xs uppercase text-gray-500">
          <tr>
            <th className="px-4 py-3">Produto</th>
            <th className="px-4 py-3">Categoria</th>
            <th className="px-4 py-3">Preço compra</th>
            <th className="px-4 py-3">Preço venda</th>
            <th className="px-4 py-3">Stock</th>
            <th className="px-4 py-3">Estado</th>
            <th className="px-4 py-3" />
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {produtos.map((produto) => (
            <tr key={produto.id} className={!produto.ativo ? "opacity-50" : ""}>
              <td className="flex items-center gap-3 px-4 py-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={produto.imagem}
                  alt={produto.nome}
                  className="h-10 w-10 rounded object-cover"
                />
                <span className="font-medium text-gray-900">{produto.nome}</span>
              </td>
              <td className="px-4 py-3 text-gray-600">{produto.categoria}</td>
              <td className="px-4 py-3 text-gray-600">
                {produto.precoCompra !== null && produto.moedaCompra
                  ? formatarPreco(produto.precoCompra, produto.moedaCompra)
                  : "—"}
              </td>
              <td className="px-4 py-3 font-semibold text-plum-700">
                {formatarPreco(produto.precoVenda, produto.moedaVenda)}
              </td>
              <td className="px-4 py-3">
                <StockBadge produto={produto} />
              </td>
              <td className="px-4 py-3 text-gray-600">
                {produto.ativo ? "Ativo" : "Inativo"}
              </td>
              <td className="px-4 py-3 text-right">
                <div className="flex justify-end gap-3">
                  <Link
                    href={`/admin/produtos/${produto.id}`}
                    className="text-plum-600 hover:underline"
                  >
                    Editar
                  </Link>
                  <button
                    type="button"
                    onClick={() => handleApagar(produto)}
                    disabled={aApagar === produto.id}
                    className="text-red-600 hover:underline disabled:opacity-50"
                  >
                    Apagar
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

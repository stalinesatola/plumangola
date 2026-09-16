"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { Produto, formatarPreco } from "@/lib/produtos";
import { normalizarBusca } from "@/lib/slug";
import { StockBadge } from "./StockBadge";

export function ProdutosTable({ produtos }: { produtos: Produto[] }) {
  const router = useRouter();
  const [aApagar, setAApagar] = useState<number | null>(null);
  const [erro, setErro] = useState<string | null>(null);
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

  async function handleApagar(produto: Produto) {
    if (!confirm(`Apagar "${produto.nome}"? Esta ação não pode ser desfeita.`)) {
      return;
    }

    setAApagar(produto.id);
    setErro(null);

    try {
      const resposta = await fetch(`/api/admin/produtos/${produto.id}`, {
        method: "DELETE",
      });

      if (!resposta.ok) {
        const dados = await resposta.json().catch(() => null);
        setErro(dados?.erro ?? "Não foi possível apagar o produto.");
        return;
      }

      router.refresh();
    } catch {
      setErro("Falha de rede ao apagar o produto. Tenta novamente.");
    } finally {
      setAApagar(null);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <input
        type="search"
        value={pesquisa}
        onChange={(event) => setPesquisa(event.target.value)}
        placeholder="Pesquisar produtos..."
        className="w-full max-w-sm rounded-lg border border-gray-300 px-3 py-2 text-sm"
      />

      {erro && (
        <p
          role="alert"
          aria-live="polite"
          className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700"
        >
          {erro}
        </p>
      )}

      {produtos.length === 0 ? (
        <p className="text-gray-500">
          Ainda não há produtos. Clica em &quot;Novo produto&quot; para começar.
        </p>
      ) : produtosFiltrados.length === 0 ? (
        <p className="text-gray-500">
          Nenhum produto encontrado para essa pesquisa.
        </p>
      ) : (
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
              {produtosFiltrados.map((produto) => (
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
                        {aApagar === produto.id ? "A apagar..." : "Apagar"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

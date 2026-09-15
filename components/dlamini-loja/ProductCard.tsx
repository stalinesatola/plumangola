"use client";

import { useTranslations } from "next-intl";
import { Produto, formatarPreco, getProdutoStatus } from "@/lib/produtos";

export function ProductCard({
  produto,
  onSelecionar,
}: {
  produto: Produto;
  onSelecionar: (produto: Produto) => void;
}) {
  const t = useTranslations("ProductCard");
  const status = getProdutoStatus(produto);
  const disponivel = status === "disponivel";

  return (
    <div className="flex flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
      <div className="aspect-[4/3] w-full bg-plum-50">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={produto.imagem}
          alt={produto.nome}
          className="h-full w-full object-cover"
        />
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <h3 className="font-semibold text-gray-900">{produto.nome}</h3>
        <p className="flex-1 text-sm text-gray-600">{produto.descricao}</p>
        <p className="text-lg font-bold text-plum-700">
          {formatarPreco(produto.precoVenda, produto.moedaVenda)}
        </p>
        <span
          className={`text-xs font-semibold ${
            disponivel ? "text-green-700" : "text-red-600"
          }`}
        >
          {disponivel ? t("available") : t("outOfStock")}
        </span>
        <button
          type="button"
          disabled={!disponivel}
          onClick={() => onSelecionar(produto)}
          className="mt-2 rounded-lg bg-plum-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-plum-700 disabled:cursor-not-allowed disabled:bg-gray-300"
        >
          {disponivel ? t("orderButton") : t("outOfStock")}
        </button>
      </div>
    </div>
  );
}

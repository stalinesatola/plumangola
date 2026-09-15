import { Produto } from "@/lib/produtos";

export function StockBadge({ produto }: { produto: Produto }) {
  if (produto.stock <= 0) {
    return (
      <span className="rounded-full bg-red-100 px-2 py-1 text-xs font-semibold text-red-700">
        Esgotado
      </span>
    );
  }

  if (produto.stock <= produto.stockMinimo) {
    return (
      <span className="rounded-full bg-amber-100 px-2 py-1 text-xs font-semibold text-amber-700">
        Stock baixo ({produto.stock})
      </span>
    );
  }

  return (
    <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-semibold text-green-700">
      Em stock ({produto.stock})
    </span>
  );
}

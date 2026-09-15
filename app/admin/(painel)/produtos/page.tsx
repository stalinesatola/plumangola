import Link from "next/link";
import { listarProdutosAdmin } from "@/lib/produtos";
import { ProdutosTable } from "@/components/admin/ProdutosTable";

export const revalidate = 0;

export default async function AdminProdutosPage() {
  const produtos = await listarProdutosAdmin();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Produtos</h1>
        <Link
          href="/admin/produtos/novo"
          className="rounded-lg bg-plum-600 px-4 py-2 text-sm font-semibold text-white hover:bg-plum-700"
        >
          Novo produto
        </Link>
      </div>

      <ProdutosTable produtos={produtos} />
    </div>
  );
}

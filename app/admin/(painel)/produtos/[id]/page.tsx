import { notFound } from "next/navigation";
import { getProdutoAdminPorId } from "@/lib/produtos";
import { ProdutoForm } from "@/components/admin/ProdutoForm";

export default async function EditarProdutoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: idParam } = await params;
  const id = Number(idParam);
  if (Number.isNaN(id)) notFound();

  const produto = await getProdutoAdminPorId(id);
  if (!produto) notFound();

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold text-gray-900">Editar produto</h1>
      <ProdutoForm produto={produto} />
    </div>
  );
}

import { ProdutoForm } from "@/components/admin/ProdutoForm";

export default function NovoProdutoPage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold text-gray-900">Novo produto</h1>
      <ProdutoForm />
    </div>
  );
}

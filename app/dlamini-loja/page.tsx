import { listarProdutosPublicos } from "@/lib/produtos";
import { CatalogoCliente } from "@/components/dlamini-loja/CatalogoCliente";

export const revalidate = 0;

export default async function DlaminiLojaPage() {
  const produtos = await listarProdutosPublicos();

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

      <CatalogoCliente produtos={produtos} />
    </>
  );
}

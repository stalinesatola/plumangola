import { getTranslations } from "next-intl/server";
import { listarProdutosPublicos, localizarProduto } from "@/lib/produtos";
import { CatalogoCliente } from "@/components/dlamini-loja/CatalogoCliente";

export const revalidate = 0;

export default async function DlaminiLojaPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations("DlaminiLoja");
  const produtos = await listarProdutosPublicos();
  const produtosLocalizados = produtos.map((produto) =>
    localizarProduto(produto, locale)
  );

  return (
    <>
      <div className="mb-8 flex flex-col gap-2">
        <h1 className="text-2xl font-bold text-gray-900">{t("heading")}</h1>
        <p className="text-gray-600">{t("intro")}</p>
      </div>

      <CatalogoCliente produtos={produtosLocalizados} />
    </>
  );
}

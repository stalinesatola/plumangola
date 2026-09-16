"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Produto } from "@/lib/produtos";

type Valores = {
  nome: string;
  descricao: string;
  nomeEn: string;
  descricaoEn: string;
  imagem: string;
  categoria: string;
  precoCompra: string;
  moedaCompra: string;
  precoVenda: string;
  stock: string;
  stockMinimo: string;
  ativo: boolean;
  origemUrl: string;
};

const VALORES_VAZIOS: Valores = {
  nome: "",
  descricao: "",
  nomeEn: "",
  descricaoEn: "",
  imagem: "",
  categoria: "Geral",
  precoCompra: "",
  moedaCompra: "USD",
  precoVenda: "",
  stock: "0",
  stockMinimo: "0",
  ativo: true,
  origemUrl: "",
};

function produtoParaValores(produto: Produto): Valores {
  return {
    nome: produto.nome,
    descricao: produto.descricao,
    nomeEn: produto.nomeEn ?? "",
    descricaoEn: produto.descricaoEn ?? "",
    imagem: produto.imagem,
    categoria: produto.categoria,
    precoCompra: produto.precoCompra !== null ? String(produto.precoCompra) : "",
    moedaCompra: produto.moedaCompra ?? "USD",
    precoVenda: String(produto.precoVenda),
    stock: String(produto.stock),
    stockMinimo: String(produto.stockMinimo),
    ativo: produto.ativo,
    origemUrl: produto.origemUrl ?? "",
  };
}

export function ProdutoForm({ produto }: { produto?: Produto }) {
  const router = useRouter();
  const modoEdicao = Boolean(produto);
  const [valores, setValores] = useState<Valores>(
    produto ? produtoParaValores(produto) : VALORES_VAZIOS
  );
  const [linkImportar, setLinkImportar] = useState("");
  const [aImportar, setAImportar] = useState(false);
  const [erroImportar, setErroImportar] = useState<string | null>(null);
  const [aGuardar, setAGuardar] = useState(false);
  const [erroGuardar, setErroGuardar] = useState<string | null>(null);

  function atualizarCampo<K extends keyof Valores>(campo: K, valor: Valores[K]) {
    setValores((atual) => ({ ...atual, [campo]: valor }));
  }

  async function handleImportar() {
    if (!linkImportar) return;
    setAImportar(true);
    setErroImportar(null);

    try {
      const resposta = await fetch("/api/admin/parse-produto", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: linkImportar }),
      });
      const dados = await resposta.json();

      if (!resposta.ok || !dados.ok) {
        setErroImportar(dados.erro ?? "Não foi possível analisar o link.");
        return;
      }

      setValores((atual) => ({
        ...atual,
        nome: dados.dados.nome || atual.nome,
        descricao: dados.dados.descricao || atual.descricao,
        imagem: dados.dados.imagem || atual.imagem,
        precoCompra:
          dados.dados.precoCompra !== null && dados.dados.precoCompra !== undefined
            ? String(dados.dados.precoCompra)
            : atual.precoCompra,
        moedaCompra: dados.dados.moedaCompra || atual.moedaCompra,
        origemUrl: linkImportar,
      }));
    } catch {
      setErroImportar("Falha de rede ao analisar o link.");
    } finally {
      setAImportar(false);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setAGuardar(true);
    setErroGuardar(null);

    const payload = {
      nome: valores.nome,
      descricao: valores.descricao,
      nomeEn: valores.nomeEn || null,
      descricaoEn: valores.descricaoEn || null,
      imagem: valores.imagem || "/dlamini-loja/placeholder.svg",
      categoria: valores.categoria || "Geral",
      precoCompra: valores.precoCompra ? Number(valores.precoCompra) : null,
      moedaCompra: valores.precoCompra ? valores.moedaCompra : null,
      precoVenda: Number(valores.precoVenda),
      stock: Number(valores.stock),
      stockMinimo: Number(valores.stockMinimo),
      ativo: valores.ativo,
      origemUrl: valores.origemUrl || null,
    };

    try {
      const resposta = await fetch(
        modoEdicao ? `/api/admin/produtos/${produto!.id}` : "/api/admin/produtos",
        {
          method: modoEdicao ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );
      const dados = await resposta.json();

      if (!resposta.ok || !dados.ok) {
        setErroGuardar(dados.erro ?? "Não foi possível guardar o produto.");
        return;
      }

      router.push("/admin/produtos");
      router.refresh();
    } catch {
      setErroGuardar("Falha de rede ao guardar.");
    } finally {
      setAGuardar(false);
    }
  }

  return (
    <div className="flex flex-col gap-8">
      {!modoEdicao && (
        <div className="rounded-xl border border-plum-100 bg-plum-50 p-4">
          <label className="mb-2 block text-sm font-semibold text-plum-700">
            Importar por link (arthur-ford.com)
          </label>
          <div className="flex flex-col gap-2 sm:flex-row">
            <input
              type="url"
              placeholder="https://arthur-ford.com/products/..."
              value={linkImportar}
              onChange={(event) => setLinkImportar(event.target.value)}
              className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm"
            />
            <button
              type="button"
              onClick={handleImportar}
              disabled={aImportar || !linkImportar}
              className="rounded-lg bg-plum-600 px-4 py-2 text-sm font-semibold text-white hover:bg-plum-700 disabled:cursor-not-allowed disabled:bg-gray-300"
            >
              {aImportar ? "A analisar..." : "Analisar link"}
            </button>
          </div>
          {erroImportar && (
            <p role="alert" aria-live="polite" className="mt-2 text-sm text-red-600">
              {erroImportar}
            </p>
          )}
          <p className="mt-2 text-xs text-plum-600">
            Isto só pré-preenche o formulário abaixo — revê os dados antes de
            guardar.
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <label className="flex flex-col gap-1 text-sm">
          Nome
          <input
            required
            value={valores.nome}
            onChange={(event) => atualizarCampo("nome", event.target.value)}
            className="rounded-lg border border-gray-300 px-3 py-2"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm">
          Descrição
          <textarea
            rows={3}
            value={valores.descricao}
            onChange={(event) => atualizarCampo("descricao", event.target.value)}
            className="rounded-lg border border-gray-300 px-3 py-2"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm">
          Nome (EN) <span className="text-gray-400">— opcional</span>
          <input
            value={valores.nomeEn}
            onChange={(event) => atualizarCampo("nomeEn", event.target.value)}
            className="rounded-lg border border-gray-300 px-3 py-2"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm">
          Descrição (EN) <span className="text-gray-400">— opcional</span>
          <textarea
            rows={3}
            value={valores.descricaoEn}
            onChange={(event) => atualizarCampo("descricaoEn", event.target.value)}
            className="rounded-lg border border-gray-300 px-3 py-2"
          />
        </label>

        <p className="-mt-2 text-xs text-gray-500">
          Se deixares o nome/descrição em inglês em branco, a loja mostra a
          versão em português também na versão EN do site.
        </p>

        <label className="flex flex-col gap-1 text-sm">
          Imagem (URL)
          <input
            value={valores.imagem}
            onChange={(event) => atualizarCampo("imagem", event.target.value)}
            className="rounded-lg border border-gray-300 px-3 py-2"
          />
        </label>

        {valores.imagem && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={valores.imagem}
            alt="Pré-visualização"
            className="h-32 w-32 rounded-lg border border-gray-200 object-cover"
          />
        )}

        <label className="flex flex-col gap-1 text-sm">
          Categoria
          <input
            value={valores.categoria}
            onChange={(event) => atualizarCampo("categoria", event.target.value)}
            className="rounded-lg border border-gray-300 px-3 py-2"
          />
        </label>

        <div className="grid grid-cols-2 gap-4">
          <label className="flex flex-col gap-1 text-sm">
            Preço de compra (fornecedor)
            <input
              type="number"
              step="0.01"
              min="0"
              value={valores.precoCompra}
              onChange={(event) => atualizarCampo("precoCompra", event.target.value)}
              className="rounded-lg border border-gray-300 px-3 py-2"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            Moeda de compra
            <select
              value={valores.moedaCompra}
              onChange={(event) => atualizarCampo("moedaCompra", event.target.value)}
              className="rounded-lg border border-gray-300 px-3 py-2"
            >
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
              <option value="ZAR">ZAR (Rand Sul-Africano)</option>
              <option value="AOA">AOA</option>
            </select>
          </label>
        </div>

        <label className="flex flex-col gap-1 text-sm">
          Preço de venda (AOA, mostrado aos clientes)
          <input
            type="number"
            step="0.01"
            min="0"
            required
            value={valores.precoVenda}
            onChange={(event) => atualizarCampo("precoVenda", event.target.value)}
            className="rounded-lg border border-gray-300 px-3 py-2"
          />
        </label>

        <div className="grid grid-cols-2 gap-4">
          <label className="flex flex-col gap-1 text-sm">
            Stock atual
            <input
              type="number"
              min="0"
              required
              value={valores.stock}
              onChange={(event) => atualizarCampo("stock", event.target.value)}
              className="rounded-lg border border-gray-300 px-3 py-2"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            Stock mínimo (alerta interno)
            <input
              type="number"
              min="0"
              required
              value={valores.stockMinimo}
              onChange={(event) => atualizarCampo("stockMinimo", event.target.value)}
              className="rounded-lg border border-gray-300 px-3 py-2"
            />
          </label>
        </div>

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={valores.ativo}
            onChange={(event) => atualizarCampo("ativo", event.target.checked)}
          />
          Ativo (visível na loja)
        </label>

        {erroGuardar && (
          <p role="alert" aria-live="polite" className="text-sm text-red-600">
            {erroGuardar}
          </p>
        )}

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={aGuardar}
            className="rounded-lg bg-plum-600 px-4 py-2 font-semibold text-white hover:bg-plum-700 disabled:cursor-not-allowed disabled:bg-gray-300"
          >
            {aGuardar ? "A guardar..." : "Guardar produto"}
          </button>
        </div>
      </form>
    </div>
  );
}

import { NovoProdutoInput } from "@/lib/produtos";

export function validarPayloadProduto(
  payload: Partial<NovoProdutoInput>
): string | null {
  if (!payload.nome || typeof payload.nome !== "string") {
    return "Nome é obrigatório.";
  }
  if (
    typeof payload.precoVenda !== "number" ||
    !Number.isFinite(payload.precoVenda) ||
    payload.precoVenda <= 0
  ) {
    return "Preço de venda tem de ser maior que zero.";
  }
  if (
    typeof payload.stock !== "number" ||
    !Number.isFinite(payload.stock) ||
    payload.stock < 0
  ) {
    return "Stock inválido.";
  }
  if (
    typeof payload.stockMinimo !== "number" ||
    !Number.isFinite(payload.stockMinimo) ||
    payload.stockMinimo < 0
  ) {
    return "Stock mínimo inválido.";
  }
  return null;
}

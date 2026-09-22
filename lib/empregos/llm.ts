// Camada fina sobre o provedor de LLM: usa a Anthropic como principal e,
// se essa chamada falhar (erro de rede, rate limit, sem crédito, etc.),
// tenta automaticamente um modelo gratuito via NVIDIA NIM
// (https://build.nvidia.com — API compatível com o formato OpenAI, chave
// gratuita) antes de desistir. A NVIDIA nunca é usada como primeira opção:
// só entra em jogo quando ANTHROPIC_API_KEY está configurada mas a chamada
// em concreto falha.

import Anthropic from "@anthropic-ai/sdk";
import OpenAI from "openai";

const ANTHROPIC_MODEL = process.env.ANTHROPIC_MODEL || "claude-sonnet-4-5";
// Ver o catálogo de modelos gratuitos em https://build.nvidia.com — os IDs
// dos modelos podem mudar ao longo do tempo, por isso é configurável. Nota:
// uma chave gratuita fica tipicamente limitada ao modelo da página onde foi
// gerada (testado: outros modelos devolvem 404 com a mesma chave). O
// default abaixo é um modelo de raciocínio (lento, chain-of-thought longo)
// — ver README.md "Fallback gratuito (NVIDIA NIM)" para detalhes.
const NVIDIA_MODEL = process.env.NVIDIA_MODEL || "nvidia/nemotron-3-super-120b-a12b";

export interface LlmClients {
  anthropic: Anthropic;
  nvidia: OpenAI | null;
}

export function buildLlmClients(anthropicApiKey: string): LlmClients {
  const nvidiaApiKey = process.env.NVIDIA_API_KEY;
  return {
    anthropic: new Anthropic({ apiKey: anthropicApiKey }),
    nvidia: nvidiaApiKey
      ? new OpenAI({ apiKey: nvidiaApiKey, baseURL: "https://integrate.api.nvidia.com/v1" })
      : null,
  };
}

export type LlmProvider = "anthropic" | "nvidia";

export interface LlmResult {
  text: string;
  provider: LlmProvider;
}

/**
 * Pede uma conclusão de texto à Anthropic; se falhar e houver um cliente
 * NVIDIA configurado, tenta de novo com esse fallback antes de propagar o
 * erro original.
 */
export async function completeText(
  clients: LlmClients,
  system: string,
  userMessage: string,
  maxTokens: number
): Promise<LlmResult> {
  try {
    const response = await clients.anthropic.messages.create({
      model: ANTHROPIC_MODEL,
      max_tokens: maxTokens,
      system,
      messages: [{ role: "user", content: userMessage }],
    });
    const text = response.content
      .filter((block): block is Anthropic.TextBlock => block.type === "text")
      .map((block) => block.text)
      .join("");
    if (!text.trim()) throw new Error("Resposta vazia da Anthropic");
    return { text, provider: "anthropic" };
  } catch (anthropicError) {
    if (!clients.nvidia) throw anthropicError;

    console.warn(
      "Chamada à Anthropic falhou, a tentar fallback NVIDIA:",
      anthropicError instanceof Error ? anthropicError.message : anthropicError
    );

    const response = await clients.nvidia.chat.completions.create({
      model: NVIDIA_MODEL,
      max_tokens: maxTokens,
      messages: [
        { role: "system", content: system },
        { role: "user", content: userMessage },
      ],
    });
    const text = response.choices[0]?.message?.content ?? "";
    if (!text.trim()) throw new Error("Resposta vazia do fallback NVIDIA");
    return { text, provider: "nvidia" };
  }
}

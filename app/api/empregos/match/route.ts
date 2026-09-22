import { NextRequest, NextResponse } from "next/server";
import { extractTextFromPdf } from "@/lib/empregos/cv-extract";
import { searchLinkedInJobs } from "@/lib/empregos/linkedin";
import { buildLlmClients } from "@/lib/empregos/llm";
import { getClienteIp, verificarLimite } from "@/lib/rate-limit";
import { extractProfile, rankJobs } from "@/lib/empregos/scoring";
import type { JobCard, MatchResponse } from "@/lib/empregos/types";
import { notificarErro } from "@/lib/alerts";

export const runtime = "nodejs";
// Vários pedidos à API da Anthropic em série/paralelo (perfil + pontuação
// por vaga) podem demorar mais do que o limite por omissão do plano.
export const maxDuration = 60;

const LIMITE_PEDIDOS = 3;
const JANELA_SEGUNDOS = 15 * 60;
const TAMANHO_MAXIMO_KB = 500;
const LOCALIZACAO_DEFEITO = "Luanda, Angola";
// TEMPORÁRIO: reduzido de 12 para 2 enquanto ANTHROPIC_API_KEY estiver
// inválida — nesse estado, TODAS as chamadas (perfil + cada vaga) passam
// pelo fallback NVIDIA (modelo de raciocínio, lento), e pontuar muitas
// vagas em paralelo estoura o limite de 60s da função (maxDuration acima),
// devolvendo 504 sem nenhum resultado. Repor para 12 assim que a chave da
// Anthropic voltar a funcionar.
const MAX_VAGAS = 2;

export async function POST(request: NextRequest) {
  try {
    return await handlePost(request);
  } catch (error) {
    // Última rede de segurança: qualquer erro não tratado abaixo (falha de
    // ligação à base de dados, falha inesperada da API da Anthropic, etc.)
    // devolve sempre JSON — sem isto, o Next.js devolve uma página de erro
    // HTML que o formulário não consegue interpretar e mostra "falha de
    // rede" ao utilizador, escondendo a causa real (que fica no log).
    console.error("Erro não tratado em /api/empregos/match:", error);
    await notificarErro(
      "empregos-match:erro-nao-tratado",
      error instanceof Error ? error.message : String(error)
    );
    return NextResponse.json(
      { erro: "Não foi possível processar o pedido. Tenta novamente mais tarde." },
      { status: 500 }
    );
  }
}

async function handlePost(request: NextRequest): Promise<NextResponse> {
  const ip = getClienteIp(request);
  let permitido: boolean;
  try {
    permitido = await verificarLimite(`empregos-match:${ip}`, LIMITE_PEDIDOS, JANELA_SEGUNDOS);
  } catch (error) {
    // Falha ao aceder à tabela de rate-limiting (ex: `rate_limit_events` não
    // existe ainda na base de dados ligada — ver README "Configurar a base
    // de dados"). Falha fechado: este endpoint tem custo real em chamadas à
    // API da Anthropic, por isso não avança sem conseguir aplicar o limite.
    console.error("Falha ao verificar rate limit:", error);
    await notificarErro(
      "empregos-match:rate-limit-db",
      error instanceof Error ? error.message : String(error)
    );
    return NextResponse.json(
      { erro: "Este serviço não está disponível de momento. Tenta novamente mais tarde." },
      { status: 503 }
    );
  }
  if (!permitido) {
    return NextResponse.json(
      { erro: "Demasiados pedidos seguidos. Aguarda uns minutos e tenta novamente." },
      { status: 429 }
    );
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    console.error("ANTHROPIC_API_KEY não configurada.");
    await notificarErro("empregos-match:anthropic-key-missing", "ANTHROPIC_API_KEY não configurada.");
    return NextResponse.json(
      { erro: "Este serviço não está configurado no momento. Tenta novamente mais tarde." },
      { status: 503 }
    );
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ erro: "Pedido inválido." }, { status: 400 });
  }

  const file = formData.get("file");
  const location = String(formData.get("location") ?? "").trim();
  const query = String(formData.get("query") ?? "").trim();

  if (!(file instanceof File)) {
    return NextResponse.json({ erro: "É necessário enviar um ficheiro." }, { status: 422 });
  }
  if (file.type !== "application/pdf") {
    return NextResponse.json({ erro: "Apenas ficheiros PDF são suportados." }, { status: 422 });
  }
  if (file.size > TAMANHO_MAXIMO_KB * 1024) {
    console.error(`Ficheiro acima do limite de ${TAMANHO_MAXIMO_KB}KB recusado (${file.size} bytes, ip: ${ip}).`);
    await notificarErro(
      "empregos-match:file-too-large",
      `Ficheiro de ${file.size} bytes recusado (limite: ${TAMANHO_MAXIMO_KB}KB, ip: ${ip}).`
    );
    return NextResponse.json(
      { erro: `O ficheiro excede o limite de ${TAMANHO_MAXIMO_KB}KB.` },
      { status: 422 }
    );
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  let cvText: string;
  try {
    cvText = await extractTextFromPdf(buffer);
  } catch (error) {
    console.error("Falha ao extrair texto do PDF:", error);
    await notificarErro(
      "empregos-match:pdf-extract",
      error instanceof Error ? error.message : String(error)
    );
    return NextResponse.json(
      { erro: "Não foi possível ler o ficheiro PDF enviado." },
      { status: 422 }
    );
  }
  if (!cvText) {
    return NextResponse.json(
      { erro: "Não foi possível extrair texto do PDF enviado." },
      { status: 422 }
    );
  }

  const clients = buildLlmClients(apiKey);

  const profile = await extractProfile(clients, cvText);

  const searchLocation = location || profile.location || LOCALIZACAO_DEFEITO;
  const searchQuery = query || profile.headline || profile.primarySkills.slice(0, 3).join(" ");

  let jobs: JobCard[] = [];
  const sourcesUsed: string[] = [];
  const sourcesFailed: string[] = [];
  try {
    jobs = await searchLinkedInJobs({ query: searchQuery, location: searchLocation, limit: MAX_VAGAS });
    sourcesUsed.push("linkedin");
  } catch (error) {
    console.error("Falha ao pesquisar vagas no LinkedIn:", error);
    sourcesFailed.push("linkedin");
    await notificarErro(
      "empregos-match:linkedin-search",
      error instanceof Error ? error.message : String(error)
    );
  }

  const matches = await rankJobs(clients, profile, jobs);

  const summary =
    profile.summary ||
    `${profile.headline || "Candidato"} — ${profile.primarySkills.length} competências identificadas.`;

  const body: MatchResponse = {
    candidateSummary: summary,
    jobs: matches,
    sourcesUsed,
    sourcesFailed,
  };

  return NextResponse.json(body);
}

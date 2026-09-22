import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";
import { extractTextFromPdf } from "@/lib/empregos/cv-extract";
import { searchLinkedInJobs } from "@/lib/empregos/linkedin";
import { getClienteIp, verificarLimite } from "@/lib/rate-limit";
import { extractProfile, rankJobs } from "@/lib/empregos/scoring";
import type { JobCard, MatchResponse } from "@/lib/empregos/types";

export const runtime = "nodejs";
// Vários pedidos à API da Anthropic em série/paralelo (perfil + pontuação
// por vaga) podem demorar mais do que o limite por omissão do plano.
export const maxDuration = 60;

const LIMITE_PEDIDOS = 3;
const JANELA_SEGUNDOS = 15 * 60;
const TAMANHO_MAXIMO_MB = 8;
const LOCALIZACAO_DEFEITO = "Luanda, Angola";
const MAX_VAGAS = 12;

export async function POST(request: NextRequest) {
  const ip = getClienteIp(request);
  const permitido = await verificarLimite(`empregos-match:${ip}`, LIMITE_PEDIDOS, JANELA_SEGUNDOS);
  if (!permitido) {
    return NextResponse.json(
      { erro: "Demasiados pedidos seguidos. Aguarda uns minutos e tenta novamente." },
      { status: 429 }
    );
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    console.error("ANTHROPIC_API_KEY não configurada.");
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
  if (file.size > TAMANHO_MAXIMO_MB * 1024 * 1024) {
    return NextResponse.json(
      { erro: `O ficheiro excede o limite de ${TAMANHO_MAXIMO_MB}MB.` },
      { status: 422 }
    );
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  let cvText: string;
  try {
    cvText = await extractTextFromPdf(buffer);
  } catch (error) {
    console.error("Falha ao extrair texto do PDF:", error);
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

  const client = new Anthropic({ apiKey });

  const profile = await extractProfile(client, cvText);

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
  }

  const matches = await rankJobs(client, profile, jobs);

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

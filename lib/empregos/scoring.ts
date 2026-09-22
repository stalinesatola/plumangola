import { completeText, type LlmClients } from "./llm";
import { JOB_EVALUATION_SYSTEM_PROMPT, PROFILE_EXTRACTION_SYSTEM_PROMPT } from "./prompts";
import type { CandidateProfile, JobCard, JobMatch } from "./types";

function parseJsonObject(raw: string): Record<string, unknown> {
  let text = raw.trim();
  if (text.startsWith("```")) {
    text = text.replace(/^```(json)?/, "").replace(/```$/, "").trim();
  }
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start === -1 || end === -1 || end < start) {
    throw new Error(`Não foi possível encontrar um objeto JSON na resposta do modelo: ${raw}`);
  }
  return JSON.parse(text.slice(start, end + 1));
}

function toStringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((v): v is string => typeof v === "string") : [];
}

export async function extractProfile(clients: LlmClients, cvText: string): Promise<CandidateProfile> {
  const { text: raw } = await completeText(clients, PROFILE_EXTRACTION_SYSTEM_PROMPT, cvText, 1024);
  const data = parseJsonObject(raw);

  return {
    fullName: typeof data.fullName === "string" ? data.fullName : null,
    headline: typeof data.headline === "string" ? data.headline : null,
    seniority: typeof data.seniority === "string" ? data.seniority : null,
    yearsExperience: typeof data.yearsExperience === "number" ? data.yearsExperience : null,
    location: typeof data.location === "string" ? data.location : null,
    languages: toStringArray(data.languages),
    primarySkills: toStringArray(data.primarySkills),
    secondarySkills: toStringArray(data.secondarySkills),
    domains: toStringArray(data.domains),
    summary: typeof data.summary === "string" ? data.summary : null,
  };
}

function buildUserMessage(profile: CandidateProfile, job: JobCard): string {
  return [
    "## Perfil do candidato",
    JSON.stringify(profile, null, 2),
    "",
    "## Vaga",
    `Título: ${job.title}`,
    `Empresa: ${job.company ?? "—"}`,
    `Localização: ${job.location ?? "—"}`,
    `URL: ${job.url}`,
  ].join("\n");
}

async function scoreOne(clients: LlmClients, profile: CandidateProfile, job: JobCard): Promise<JobMatch> {
  let score = 0;
  let verdict = "Erro na avaliação";
  let notes = "Não foi possível avaliar esta vaga.";

  try {
    const { text: raw } = await completeText(
      clients,
      JOB_EVALUATION_SYSTEM_PROMPT,
      buildUserMessage(profile, job),
      512
    );
    const data = parseJsonObject(raw);
    score = typeof data.score === "number" ? data.score : 0;
    verdict = typeof data.verdict === "string" ? data.verdict : "Sem compatibilidade";
    notes = typeof data.notes === "string" ? data.notes : "";
  } catch (error) {
    console.error(`Falha ao avaliar a vaga ${job.id}:`, error);
  }

  return {
    title: job.title,
    company: job.company,
    location: job.location,
    url: job.url,
    source: job.source,
    score,
    verdict,
    notes,
  };
}

export async function rankJobs(
  clients: LlmClients,
  profile: CandidateProfile,
  jobs: JobCard[]
): Promise<JobMatch[]> {
  if (jobs.length === 0) return [];
  const matches = await Promise.all(jobs.map((job) => scoreOne(clients, profile, job)));
  return matches.sort((a, b) => b.score - a.score);
}

import Anthropic from "@anthropic-ai/sdk";
import { JOB_EVALUATION_SYSTEM_PROMPT, PROFILE_EXTRACTION_SYSTEM_PROMPT } from "./prompts";
import type { CandidateProfile, JobCard, JobMatch } from "./types";

const MODEL = process.env.ANTHROPIC_MODEL || "claude-sonnet-4-5";

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

function textFromResponse(response: Anthropic.Message): string {
  return response.content
    .filter((block): block is Anthropic.TextBlock => block.type === "text")
    .map((block) => block.text)
    .join("");
}

function toStringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((v): v is string => typeof v === "string") : [];
}

export async function extractProfile(client: Anthropic, cvText: string): Promise<CandidateProfile> {
  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 1024,
    system: PROFILE_EXTRACTION_SYSTEM_PROMPT,
    messages: [{ role: "user", content: cvText }],
  });

  const data = parseJsonObject(textFromResponse(response));

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

async function scoreOne(client: Anthropic, profile: CandidateProfile, job: JobCard): Promise<JobMatch> {
  let score = 0;
  let verdict = "Erro na avaliação";
  let notes = "Não foi possível avaliar esta vaga.";

  try {
    const response = await client.messages.create({
      model: MODEL,
      max_tokens: 512,
      system: JOB_EVALUATION_SYSTEM_PROMPT,
      messages: [{ role: "user", content: buildUserMessage(profile, job) }],
    });
    const data = parseJsonObject(textFromResponse(response));
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
  client: Anthropic,
  profile: CandidateProfile,
  jobs: JobCard[]
): Promise<JobMatch[]> {
  if (jobs.length === 0) return [];
  const matches = await Promise.all(jobs.map((job) => scoreOne(client, profile, job)));
  return matches.sort((a, b) => b.score - a.score);
}

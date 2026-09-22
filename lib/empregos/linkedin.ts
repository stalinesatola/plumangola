// Busca vagas nos endpoints públicos "jobs-guest" do LinkedIn (sem
// autenticação). Adaptado do CLI equivalente em
// stalinesatola/ai-job-search (.agents/skills/linkedin-search/cli/src/).
//
// Uso pessoal/de baixo volume apenas: aceder a estes endpoints de forma
// automatizada vai contra os Termos de Serviço do LinkedIn. Mantém o volume
// baixo — isto corre uma vez por pedido de um utilizador, não em massa.

import type { JobCard } from "./types";

const SEARCH_URL =
  "https://www.linkedin.com/jobs-guest/jobs/api/seeMoreJobPostings/search";

const USER_AGENT =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 " +
  "(KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

async function htmlFetch(url: string): Promise<string> {
  const maxRetries = 4;
  let delay = 500;
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    const response = await fetch(url, {
      headers: {
        "User-Agent": USER_AGENT,
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "pt-PT,pt;q=0.9,en;q=0.8",
        "X-Requested-With": "XMLHttpRequest",
      },
      redirect: "follow",
      signal: AbortSignal.timeout(15000),
    });
    if (response.status === 429 || response.status >= 500) {
      if (attempt === maxRetries) {
        throw new Error(`Pedido falhou: ${response.status} ${response.statusText}`);
      }
      const jitter = Math.floor(Math.random() * 500);
      await new Promise((r) => setTimeout(r, delay + jitter));
      delay = Math.min(delay * 2, 6000);
      continue;
    }
    if (response.status === 404) return "";
    if (!response.ok) {
      throw new Error(`Pedido falhou: ${response.status} ${response.statusText}`);
    }
    return response.text();
  }
  throw new Error("Pedido falhou depois do número máximo de tentativas");
}

function numericEntity(codePoint: number): string {
  return codePoint >= 0 && codePoint <= 0x10ffff ? String.fromCodePoint(codePoint) : "";
}

function decodeHtmlEntities(text: string): string {
  return text
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, dec) => numericEntity(parseInt(dec, 10)))
    .replace(/&#[xX]([0-9a-fA-F]+);/g, (_, hex) => numericEntity(parseInt(hex, 16)))
    .replace(/&nbsp;/g, " ");
}

function stripTags(html: string): string {
  return html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

function clean(html: string): string {
  return decodeHtmlEntities(stripTags(html));
}

/**
 * A resposta de pesquisa é uma lista plana de cartões <li>. Divide-se pelo
 * URN de cada vaga e cada bloco é analisado de forma independente, para que
 * um cartão malformado não afete os restantes.
 */
function parseJobCards(html: string): JobCard[] {
  const results: JobCard[] = [];
  const chunks = html.split(/data-entity-urn="urn:li:jobPosting:/).slice(1);

  for (const chunk of chunks) {
    const idMatch = chunk.match(/^(\d+)/);
    if (!idMatch) continue;
    const id = idMatch[1];

    const linkMatch = chunk.match(/class="base-card__full-link[^"]*"[^>]*href="([^"]+)"/i);
    const url = linkMatch ? decodeHtmlEntities(linkMatch[1]).split("?")[0] : "";

    let title: string | null = null;
    const h3 = chunk.match(/class="base-search-card__title"[^>]*>([\s\S]*?)<\/h3>/i);
    if (h3) title = clean(h3[1]);
    if (!title) {
      const sr = chunk.match(/class="sr-only"[^>]*>([\s\S]*?)<\/span>/i);
      if (sr) title = clean(sr[1]);
    }
    if (!title) continue;

    let company: string | null = null;
    let companyUrl: string | null = null;
    const sub = chunk.match(/class="base-search-card__subtitle"[^>]*>([\s\S]*?)<\/h4>/i);
    if (sub) {
      const a = sub[1].match(/href="([^"]+)"/i);
      if (a) companyUrl = decodeHtmlEntities(a[1]).split("?")[0];
      company = clean(sub[1]) || null;
    }

    const loc = chunk.match(/class="job-search-card__location"[^>]*>([\s\S]*?)<\/span>/i);
    const location = loc ? clean(loc[1]) || null : null;
    const dt = chunk.match(/class="job-search-card__listdate[^"]*"[^>]*datetime="([^"]+)"/i);
    const date = dt ? dt[1] : null;

    results.push({
      id,
      title,
      company,
      companyUrl,
      location,
      date,
      url: url || `https://www.linkedin.com/jobs/view/${id}`,
      source: "linkedin",
    });
  }

  return results;
}

export type LinkedInSearchOptions = {
  query?: string;
  location: string;
  limit?: number;
};

export async function searchLinkedInJobs(opts: LinkedInSearchOptions): Promise<JobCard[]> {
  const params = new URLSearchParams();
  if (opts.query) params.set("keywords", opts.query);
  params.set("location", opts.location);
  params.set("start", "0");

  const html = await htmlFetch(`${SEARCH_URL}?${params.toString()}`);
  const cards = parseJobCards(html);
  return opts.limit !== undefined ? cards.slice(0, opts.limit) : cards;
}

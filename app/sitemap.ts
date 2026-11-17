import type { MetadataRoute } from "next";
import { caminhoLocalizado, SITE_URL } from "@/lib/site";

const CAMINHOS = ["/", "/dlamini-loja", "/paulirabeauty", "/empregos", "/utente"];

export default function sitemap(): MetadataRoute.Sitemap {
  return CAMINHOS.flatMap((caminho) =>
    (["pt", "en"] as const).map((locale) => ({
      url: `${SITE_URL}${caminhoLocalizado(locale, caminho)}`,
      changeFrequency: "weekly" as const,
      priority: caminho === "/" ? 1 : 0.6,
      alternates: {
        languages: {
          pt: `${SITE_URL}${caminhoLocalizado("pt", caminho)}`,
          en: `${SITE_URL}${caminhoLocalizado("en", caminho)}`,
        },
      },
    }))
  );
}

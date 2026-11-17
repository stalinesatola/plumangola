/** URL canónico do site (produção). Pode ser alterado com NEXT_PUBLIC_SITE_URL. */
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://plum-angola.com").replace(/\/$/, "");

/** Caminho com prefixo de idioma (PT sem prefixo, EN em /en). */
export function caminhoLocalizado(locale: string, caminho: string): string {
  const limpo = caminho === "/" ? "" : caminho;
  return locale === "en" ? `/en${limpo}` : limpo || "/";
}

/** `alternates` (canonical + hreflang) para usar em generateMetadata. */
export function alternativas(locale: string, caminho: string) {
  return {
    canonical: caminhoLocalizado(locale, caminho),
    languages: {
      pt: caminhoLocalizado("pt", caminho),
      en: caminhoLocalizado("en", caminho),
      "x-default": caminhoLocalizado("pt", caminho),
    },
  };
}

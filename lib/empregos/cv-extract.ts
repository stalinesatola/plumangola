// unpdf embrulha o pdfjs-dist e é mantido ativamente com o Node/serverless
// (Vercel) em mente. A alternativa mais popular, pdf-parse, tem uma versão
// de pdfjs-dist antiga que falhou (erro "bad XRef entry") mesmo com PDFs
// simples e válidos gerados por bibliotecas recentes (pdfkit, pdf-lib) neste
// ambiente — por isso a escolha de unpdf em vez do padrão mais comum.
import { extractText, getDocumentProxy } from "unpdf";

export async function extractTextFromPdf(buffer: Buffer): Promise<string> {
  const doc = await getDocumentProxy(new Uint8Array(buffer));
  const { text } = await extractText(doc, { mergePages: true });
  return text.trim();
}

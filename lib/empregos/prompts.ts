// Prompts adaptados do repositório stalinesatola/ai-job-search
// (.claude/skills/job-application-assistant/04-job-evaluation.md), reescritos
// para devolver JSON estruturado (consumido por código, não lido por uma
// pessoa) e para o enquadramento legal angolano em vez do original,
// pensado para mercados como a Dinamarca/UE (cidadania/residência
// permanente). Ver README.md, secção "Espaço: Empregos", para a nota sobre
// revisão humana recomendada deste gate de elegibilidade.

export const PROFILE_EXTRACTION_SYSTEM_PROMPT = `Extrai um perfil profissional estruturado a partir do texto de um curriculum vitae (CV).
Responde APENAS com um objeto JSON válido (sem markdown, sem comentários) com exatamente
estes campos:

{
  "fullName": string | null,
  "headline": string | null,          // titulo profissional atual, ex: "Engenheiro de Software"
  "seniority": string | null,         // ex: "junior", "pleno", "senior", "gestor"
  "yearsExperience": number | null,   // anos de experiencia profissional estimados
  "location": string | null,          // cidade/pais onde o candidato reside, se indicado
  "languages": string[],
  "primarySkills": string[],          // competencias tecnicas/profissionais fortes e frequentes no CV
  "secondarySkills": string[],        // competencias mencionadas com menor destaque
  "domains": string[],                // setores/dominios de atuacao, ex: "banca", "telecomunicacoes"
  "summary": string | null            // resumo de 2-3 frases do perfil do candidato
}

Usa apenas informacao que esteja realmente presente no texto do CV. Não inventes
competencias, anos de experiencia ou dados de contacto. Se um campo nao puder ser
determinado com confianca, usa null ou uma lista vazia.`;

export const JOB_EVALUATION_SYSTEM_PROMPT = `Avalias a compatibilidade entre o perfil de um candidato e uma vaga de emprego em
Angola, seguindo esta rubrica.

## Passo 1 — Verificação de elegibilidade (eliminatória)

Le a secao de requisitos/elegibilidade da vaga. Angola aceita, na maioria dos
setores privados, candidatos estrangeiros ao abrigo de um visto de trabalho
(Lei Geral do Trabalho), sujeito a quotas de contratacao de mao-de-obra
estrangeira. Classifica assim:

- Se a vaga exige explicitamente **nacionalidade angolana** ou é claramente
  reservada a cidadãos angolanos (comum em funcao publica ou setores
  regulados) -> FALHA ELIMINATORIA.
- Se a vaga menciona explicitamente que patrocina visto de trabalho ou aceita
  candidatos internacionais -> elegibilidade confirmada.
- Se a vaga é omissa quanto a nacionalidade/visto -> prossegue, mas assinala
  a elegibilidade como "não verificada" nas notas.

Se falhar a verificacao eliminatoria, atribui score 0 e verdict "Eliminado -
elegibilidade" sem avaliar as restantes dimensoes.

## Passo 2 — Pontuação (0-100 cada dimensão, exceto Localização)

1. **Competências Técnicas (peso 30%)** — alinhamento entre as competências
   exigidas/preferidas na vaga e as competências do candidato.
2. **Experiência (peso 25%)** — alinhamento entre o histórico profissional do
   candidato e o que a vaga procura.
3. **Fit Comportamental/Cultural (peso 15%)** — com base no que a descrição da
   vaga revela sobre cultura/estilo de trabalho, e no perfil do candidato (se
   disponível).
4. **Localização & Logística (PASS/FAIL, não pesado)** — considera a
   localização da vaga face à localização do candidato; remoto ou dentro da
   mesma cidade/província = PASS; exige mudança sem indicação de apoio =
   FAIL, salvo indicação em contrário.
5. **Alinhamento de Carreira (peso 30%)** — em que medida a vaga faz avançar
   os objetivos de carreira e competências indicados no perfil.

Overall score = média ponderada das 4 dimensões pesadas (Localização não
conta para a média, mas um FAIL nessa dimensão deve reduzir fortemente o
verdict final).

## Verdicts

- 75-100: "Forte compatibilidade"
- 60-74: "Boa compatibilidade"
- 45-59: "Compatibilidade moderada"
- 30-44: "Compatibilidade fraca"
- 0-29: "Sem compatibilidade"

## Formato de resposta

Responde APENAS com um objeto JSON válido (sem markdown, sem comentários),
com exatamente estes campos:

{
  "score": number,       // 0-100, overall score (0 se eliminado na elegibilidade)
  "verdict": string,     // um dos verdicts acima, ou "Eliminado - elegibilidade"
  "notes": string        // 1-2 frases em portugues explicando a pontuacao, mencionando
                          // pontos fortes e lacunas principais
}`;

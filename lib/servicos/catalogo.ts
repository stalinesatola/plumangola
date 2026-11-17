import { LIMITE_SINAL_50_KZ, type Idioma } from "./cambio";

/**
 * Catálogo de serviços e pacotes, transcrito do Preçário 2026/2027
 * (team-bots/precario.pdf, versão de Novembro de 2026, válido até
 * 31/03/2027). Valores em Kwanzas, sem IVA.
 *
 * NÃO inventar preços aqui: qualquer alteração tem de vir do preçário.
 * Este ficheiro é a única fonte de preços do site — a rota de checkout
 * (/api/checkout) calcula o sinal a partir daqui, nunca a partir do browser.
 */

type Texto = Record<Idioma, string>;

export type PacoteId = "basico" | "profissional" | "premium";

export type Pacote = {
  id: PacoteId;
  /** Nome comercial do pacote (ex: "Landing page"), opcional. */
  nome?: Texto;
  /** Pagamento único de implementação/desenvolvimento, em Kz. */
  implementacaoKz?: number;
  /** Mensalidade em Kz. */
  mensalKz?: number;
  /** Preço por hora em Kz. */
  horaKz?: number;
  /** Unidade extra mostrada depois do preço (ex: "por grupo"). */
  unidade?: Texto;
  /** Preço "desde" (valor final após levantamento de requisitos). */
  desde?: boolean;
  /** Sem preço fixo no preçário ("Sob orçamento"). */
  sobOrcamento?: boolean;
  inclui: Texto;
};

export type ServicoId =
  | "sites"
  | "lojas"
  | "chatbots"
  | "automacao"
  | "sistemas"
  | "suporte"
  | "manutencao"
  | "consultoria"
  | "formacao";

export type Servico = {
  id: ServicoId;
  nome: Texto;
  resumo: Texto;
  pacotes: [Pacote, Pacote, Pacote];
  /** Notas do preçário (incluído / não incluído), resumidas. */
  notas: Texto;
  /**
   * Se false, o sinal online fica desligado para todo o serviço (ex:
   * sistemas à medida, que o preçário manda pagar em 3 prestações).
   */
  sinalOnline?: boolean;
};

export const SERVICOS: Servico[] = [
  {
    id: "sites",
    nome: { pt: "Websites e landing pages", en: "Websites & landing pages" },
    resumo: {
      pt: "Presença online profissional, rápida e adaptada a telemóveis — a forma mais simples de transmitir confiança e receber contactos.",
      en: "A professional, fast, mobile-friendly online presence — the simplest way to build trust and get enquiries.",
    },
    pacotes: [
      {
        id: "basico",
        nome: { pt: "Landing page", en: "Landing page" },
        implementacaoKz: 85_000,
        inclui: {
          pt: "1 página com até 6 secções; botão de WhatsApp; formulário de contacto; mapa; redes sociais; SEO básico. Prazo: 5–7 dias úteis. 1 ronda de alterações.",
          en: "1 page with up to 6 sections; WhatsApp button; contact form; map; social links; basic SEO. Delivery: 5–7 business days. 1 round of changes.",
        },
      },
      {
        id: "profissional",
        nome: { pt: "Institucional", en: "Corporate" },
        implementacaoKz: 160_000,
        inclui: {
          pt: "Até 5 páginas (Início, Sobre, Serviços, Galeria, Contactos); painel para editar textos e imagens; Google Analytics e Search Console; optimização de velocidade. Prazo: 10–15 dias úteis. 2 rondas de alterações.",
          en: "Up to 5 pages (Home, About, Services, Gallery, Contact); panel to edit text and images; Google Analytics and Search Console; speed optimisation. Delivery: 10–15 business days. 2 rounds of changes.",
        },
      },
      {
        id: "premium",
        nome: { pt: "Empresarial", en: "Business" },
        implementacaoKz: 290_000,
        inclui: {
          pt: "Até 10 páginas; blog/notícias; até 3 formulários; assistente simples com IA (perguntas frequentes); SEO on-page avançado; formação de 1h. Prazo: 15–25 dias úteis. 3 rondas de alterações.",
          en: "Up to 10 pages; blog/news; up to 3 forms; simple AI assistant (FAQ); advanced on-page SEO; 1h training. Delivery: 15–25 business days. 3 rounds of changes.",
        },
      },
    ],
    notas: {
      pt: "Todos incluem design responsivo, SSL, configuração de domínio, alojamento e até 3 e-mails, e 3 meses de manutenção correctiva. Domínio e alojamento são custos de terceiros. Página extra: 15.000 Kz.",
      en: "All include responsive design, SSL, domain/hosting setup and up to 3 email accounts, plus 3 months of corrective maintenance. Domain and hosting are third-party costs. Extra page: 15,000 Kz.",
    },
  },
  {
    id: "lojas",
    nome: { pt: "Lojas online", en: "Online stores" },
    resumo: {
      pt: "Venda os seus produtos 24 horas por dia, com encomendas organizadas e pagamentos simplificados.",
      en: "Sell your products 24/7, with organised orders and simple payments.",
    },
    pacotes: [
      {
        id: "basico",
        implementacaoKz: 150_000,
        inclui: {
          pt: "Catálogo com até 20 produtos inseridos; carrinho e encomenda via WhatsApp ou transferência/Multicaixa Express com confirmação manual; páginas Sobre/Entregas/Contactos. Prazo: 10 dias úteis.",
          en: "Catalogue with up to 20 products added; cart and ordering via WhatsApp or bank transfer/Multicaixa Express with manual confirmation; About/Delivery/Contact pages. Delivery: 10 business days.",
        },
      },
      {
        id: "profissional",
        implementacaoKz: 280_000,
        inclui: {
          pt: "Até 100 produtos inseridos; categorias; gestão de stock e encomendas; códigos promocionais; notificações por e-mail; integração com um meio de pagamento electrónico. Prazo: 15–20 dias úteis.",
          en: "Up to 100 products added; categories; stock and order management; promo codes; email notifications; integration with one electronic payment method. Delivery: 15–20 business days.",
        },
      },
      {
        id: "premium",
        implementacaoKz: 480_000,
        inclui: {
          pt: "Produtos ilimitados (até 200 inseridos por nós); contas de clientes; vários métodos de entrega; relatórios de vendas; Meta Pixel/Google Tag; assistente de IA para dúvidas sobre produtos; formação de 2h. Prazo: 20–30 dias úteis.",
          en: "Unlimited products (up to 200 added by us); customer accounts; multiple delivery methods; sales reports; Meta Pixel/Google Tag; AI assistant for product questions; 2h training. Delivery: 20–30 business days.",
        },
      },
    ],
    notas: {
      pt: "Todos incluem design responsivo, SSL, SEO básico, formação e 3 meses de manutenção correctiva. Não inclui domínio, alojamento nem taxas de gateways/bancos. Produto extra: 500 Kz.",
      en: "All include responsive design, SSL, basic SEO, training and 3 months of corrective maintenance. Domain, hosting and payment gateway/bank fees not included. Extra product: 500 Kz.",
    },
  },
  {
    id: "chatbots",
    nome: { pt: "Chatbots com IA (WhatsApp / site)", en: "AI chatbots (WhatsApp / website)" },
    resumo: {
      pt: "Um assistente virtual que responde aos seus clientes em segundos, 24 horas por dia — perguntas frequentes, preços, horários, reservas e encomendas.",
      en: "A virtual assistant that answers your customers in seconds, 24/7 — FAQs, prices, opening hours, bookings and orders.",
    },
    pacotes: [
      {
        id: "basico",
        implementacaoKz: 35_000,
        mensalKz: 12_000,
        inclui: {
          pt: "1 canal (WhatsApp ou site); respostas com IA a partir de uma base de conhecimento (até 30 perguntas/respostas); encaminhamento para um humano. Referência: até 1.000 conversas/mês.",
          en: "1 channel (WhatsApp or website); AI answers from a knowledge base (up to 30 Q&As); hand-off to a human. Reference: up to 1,000 conversations/month.",
        },
      },
      {
        id: "profissional",
        implementacaoKz: 75_000,
        mensalKz: 25_000,
        inclui: {
          pt: "WhatsApp + site; recolha de contactos e pedidos para Google Sheets ou e-mail; entende mensagens de áudio; relatório mensal; 1 actualização mensal da base de conhecimento. Referência: até 3.000 conversas/mês.",
          en: "WhatsApp + website; leads and orders sent to Google Sheets or email; understands voice notes; monthly report; 1 knowledge-base update per month. Reference: up to 3,000 conversations/month.",
        },
      },
      {
        id: "premium",
        implementacaoKz: 150_000,
        mensalKz: 45_000,
        inclui: {
          pt: "WhatsApp + site + Instagram; integração com o sistema do cliente (agenda, stock, CRM); envio de catálogo/fotos; campanhas e lembretes; painel de métricas; actualizações ilimitadas. Referência: até 6.000 conversas/mês.",
          en: "WhatsApp + website + Instagram; integration with your systems (calendar, stock, CRM); catalogue/photo sending; campaigns and reminders; metrics dashboard; unlimited updates. Reference: up to 6,000 conversations/month.",
        },
      },
    ],
    notas: {
      pt: "Inclui configuração, treino inicial e 7 dias de testes acompanhados. A mensalidade cobre alojamento, monitorização e custos de IA até ao volume de referência. Taxas da Meta e número dedicado não incluídos.",
      en: "Includes setup, initial training and 7 days of supervised testing. The monthly fee covers hosting, monitoring and AI costs up to the reference volume. Meta fees and a dedicated phone number are not included.",
    },
  },
  {
    id: "automacao",
    nome: { pt: "Automação de processos com IA", en: "AI process automation" },
    resumo: {
      pt: "Eliminamos tarefas repetitivas: copiar dados, gerar relatórios, responder e-mails padrão, organizar facturas e pedidos.",
      en: "We remove repetitive work: copying data, generating reports, answering standard emails, organising invoices and orders.",
    },
    pacotes: [
      {
        id: "basico",
        implementacaoKz: 60_000,
        inclui: {
          pt: "1 fluxo automático simples (ex.: formulário → folha de cálculo → notificação por e-mail/WhatsApp). Prazo: 3–5 dias úteis.",
          en: "1 simple automated workflow (e.g. form → spreadsheet → email/WhatsApp notification). Delivery: 3–5 business days.",
        },
      },
      {
        id: "profissional",
        implementacaoKz: 150_000,
        inclui: {
          pt: "Até 3 fluxos integrados (Google Workspace, e-mail, WhatsApp, folhas de cálculo); 1 passo com IA (classificar pedidos, resumir documentos, extrair dados de facturas). Prazo: 2 semanas.",
          en: "Up to 3 integrated workflows (Google Workspace, email, WhatsApp, spreadsheets); 1 AI step (classify requests, summarise documents, extract invoice data). Delivery: 2 weeks.",
        },
      },
      {
        id: "premium",
        implementacaoKz: 300_000,
        inclui: {
          pt: "Até 6 fluxos + assistente de IA interno com os documentos da empresa; relatórios automáticos; documentação e formação da equipa (2h). Prazo: 3–4 semanas.",
          en: "Up to 6 workflows + internal AI assistant over your company documents; automatic reports; documentation and team training (2h). Delivery: 3–4 weeks.",
        },
      },
    ],
    notas: {
      pt: "Inclui levantamento do processo, testes e 30 dias de garantia. Manutenção após a garantia: opcional, 15.000 Kz/mês por até 3 fluxos.",
      en: "Includes process mapping, testing and a 30-day warranty. Maintenance after the warranty: optional, 15,000 Kz/month for up to 3 workflows.",
    },
  },
  {
    id: "sistemas",
    nome: { pt: "Sistemas de gestão à medida", en: "Custom management systems" },
    resumo: {
      pt: "Aplicações web simples e práticas para controlar stock, clientes, vendas, agendamentos ou pedidos, no computador e no telemóvel.",
      en: "Simple, practical web apps to manage stock, customers, sales, bookings or orders, on desktop and mobile.",
    },
    sinalOnline: false,
    pacotes: [
      {
        id: "basico",
        implementacaoKz: 350_000,
        inclui: {
          pt: "1 módulo (ex.: stock OU clientes OU agendamentos); até 3 utilizadores; exportação para Excel. Prazo: 3–5 semanas.",
          en: "1 module (e.g. stock OR customers OR bookings); up to 3 users; Excel export. Delivery: 3–5 weeks.",
        },
      },
      {
        id: "profissional",
        implementacaoKz: 750_000,
        inclui: {
          pt: "2 a 3 módulos integrados; perfis de acesso; painel com indicadores; relatórios em PDF/Excel. Prazo: 6–10 semanas.",
          en: "2 to 3 integrated modules; access roles; KPI dashboard; PDF/Excel reports. Delivery: 6–10 weeks.",
        },
      },
      {
        id: "premium",
        implementacaoKz: 1_300_000,
        desde: true,
        inclui: {
          pt: "Solução de gestão mais completa (vários módulos, filiais, integrações com outros sistemas, funcionalidades de IA). Valor final após levantamento de requisitos.",
          en: "A more complete management solution (multiple modules, branches, integrations with other systems, AI features). Final price after requirements gathering.",
        },
      },
    ],
    notas: {
      pt: "Inclui levantamento de requisitos, protótipo para aprovação, formação e 60 dias de garantia. Pagamento em 3 prestações — por isso este serviço é contratado mediante proposta.",
      en: "Includes requirements gathering, a prototype for approval, training and a 60-day warranty. Paid in 3 instalments — so this service is contracted through a proposal.",
    },
  },
  {
    id: "suporte",
    nome: { pt: "Suporte informático (avença mensal)", en: "IT support (monthly plan)" },
    resumo: {
      pt: "Os seus computadores, impressoras e Wi-Fi a funcionar, com um técnico de confiança sempre disponível (Luanda).",
      en: "Your computers, printers and Wi-Fi working, with a trusted technician always available (Luanda).",
    },
    pacotes: [
      {
        id: "basico",
        mensalKz: 35_000,
        inclui: {
          pt: "Até 5 computadores; suporte remoto ilimitado em horário laboral; 1 visita preventiva por mês; antivírus e actualizações; resposta em 24h úteis.",
          en: "Up to 5 computers; unlimited remote support during business hours; 1 preventive visit per month; antivirus and updates; response within 24 business hours.",
        },
      },
      {
        id: "profissional",
        mensalKz: 65_000,
        inclui: {
          pt: "Até 10 computadores + rede/Wi-Fi e impressoras; 2 visitas por mês; cópias de segurança verificadas; resposta em 8h úteis; relatório mensal.",
          en: "Up to 10 computers + network/Wi-Fi and printers; 2 visits per month; verified backups; response within 8 business hours; monthly report.",
        },
      },
      {
        id: "premium",
        mensalKz: 120_000,
        inclui: {
          pt: "Até 20 computadores + servidor/NAS; visitas semanais; gestão de contas de e-mail e utilizadores; resposta em 4h úteis; inventário de equipamentos.",
          en: "Up to 20 computers + server/NAS; weekly visits; email account and user management; response within 4 business hours; equipment inventory.",
        },
      },
    ],
    notas: {
      pt: "Deslocações na zona de cobertura em Luanda (Viana e arredores) incluídas. Avulso: 20.000 Kz/visita (até 2h); suporte remoto 6.000 Kz/hora. Peças e licenças à parte.",
      en: "Travel within the Luanda coverage area (Viana and surroundings) included. One-off: 20,000 Kz/visit (up to 2h); remote support 6,000 Kz/hour. Parts and licences extra.",
    },
  },
  {
    id: "manutencao",
    nome: { pt: "Manutenção de websites", en: "Website maintenance" },
    resumo: {
      pt: "Site sempre actualizado, seguro e com cópias de segurança — sem preocupações técnicas.",
      en: "Your site always updated, secure and backed up — no technical worries.",
    },
    pacotes: [
      {
        id: "basico",
        mensalKz: 15_000,
        inclui: {
          pt: "Actualizações de segurança; cópia de segurança semanal; monitorização de disponibilidade; até 1h de alterações por mês.",
          en: "Security updates; weekly backup; uptime monitoring; up to 1h of content changes per month.",
        },
      },
      {
        id: "profissional",
        mensalKz: 30_000,
        inclui: {
          pt: "Tudo do Básico + cópia de segurança diária; até 3h de alterações; optimização de velocidade trimestral; relatório mensal de visitas.",
          en: "Everything in Basic + daily backup; up to 3h of changes; quarterly speed optimisation; monthly traffic report.",
        },
      },
      {
        id: "premium",
        nome: { pt: "Lojas online", en: "Online stores" },
        mensalKz: 50_000,
        inclui: {
          pt: "Tudo do Profissional + até 6h de alterações (produtos, promoções, banners); apoio na gestão de encomendas; resposta prioritária em 24h úteis.",
          en: "Everything in Professional + up to 6h of changes (products, promotions, banners); help managing orders; priority response within 24 business hours.",
        },
      },
    ],
    notas: {
      pt: "Para sites WordPress e sites feitos por nós; outros sites após avaliação gratuita. Horas adicionais: 8.000 Kz/hora.",
      en: "For WordPress sites and sites we built; other sites after a free assessment. Extra hours: 8,000 Kz/hour.",
    },
  },
  {
    id: "consultoria",
    nome: { pt: "Consultoria em IA", en: "AI consulting" },
    resumo: {
      pt: "Ajudamos a perceber onde a IA traz retorno real ao seu negócio — sem modas e sem desperdício.",
      en: "We help you find where AI brings real return to your business — no hype, no waste.",
    },
    pacotes: [
      {
        id: "basico",
        nome: { pt: "Diagnóstico IA", en: "AI assessment" },
        implementacaoKz: 40_000,
        inclui: {
          pt: "Sessão de 2h (presencial ou online) + relatório com 3 a 5 oportunidades concretas, estimativa de custo e prioridade.",
          en: "2h session (in person or online) + report with 3 to 5 concrete opportunities, cost estimate and priority.",
        },
      },
      {
        id: "profissional",
        nome: { pt: "Plano de implementação", en: "Implementation plan" },
        implementacaoKz: 120_000,
        inclui: {
          pt: "Diagnóstico + mapeamento de processos + roteiro de 3 meses + 1 protótipo funcional (ex.: assistente interno ou automação simples).",
          en: "Assessment + process mapping + 3-month roadmap + 1 working prototype (e.g. internal assistant or simple automation).",
        },
      },
      {
        id: "premium",
        nome: { pt: "Acompanhamento", en: "Ongoing advisory" },
        horaKz: 10_000,
        inclui: {
          pt: "Reuniões de acompanhamento, revisão de fornecedores, políticas de utilização segura de IA.",
          en: "Follow-up meetings, vendor reviews, safe-AI-use policies.",
        },
      },
    ],
    notas: {
      pt: "Se avançar com a implementação connosco em até 60 dias, o valor do Diagnóstico é descontado no projecto. Licenças e custos de modelos de IA não incluídos.",
      en: "If you go ahead with implementation with us within 60 days, the Assessment fee is deducted from the project. AI tool licences and model usage costs not included.",
    },
  },
  {
    id: "formacao",
    nome: { pt: "Formação em IA e informática", en: "AI & IT training" },
    resumo: {
      pt: "Formação prática, em português e com exemplos da realidade angolana, para equipas que querem usar IA e ferramentas digitais no dia-a-dia.",
      en: "Hands-on training, in Portuguese and with real Angolan examples, for teams who want to use AI and digital tools every day.",
    },
    pacotes: [
      {
        id: "basico",
        nome: { pt: "Workshop “IA no dia-a-dia” (3h)", en: "“AI at work” workshop (3h)" },
        implementacaoKz: 60_000,
        unidade: { pt: "por grupo (até 10)", en: "per group (up to 10)" },
        inclui: {
          pt: "3 horas, até 10 participantes, na empresa ou online; assistentes de IA, prompts para tarefas reais, cuidados com dados.",
          en: "3 hours, up to 10 participants, on-site or online; AI assistants, prompts for real tasks, data care.",
        },
      },
      {
        id: "profissional",
        nome: { pt: "Curso prático (12h)", en: "Hands-on course (12h)" },
        implementacaoKz: 180_000,
        unidade: { pt: "por grupo (até 10)", en: "per group (up to 10)" },
        inclui: {
          pt: "4 sessões de 3h: IA para escrita, atendimento, marketing, folhas de cálculo e automação simples; materiais e certificado.",
          en: "4 × 3h sessions: AI for writing, customer service, marketing, spreadsheets and simple automation; materials and certificate.",
        },
      },
      {
        id: "premium",
        nome: { pt: "Programa à medida", en: "Tailored programme" },
        sobOrcamento: true,
        inclui: {
          pt: "Conteúdo desenhado para a função e as ferramentas da empresa.",
          en: "Content designed around your team's roles and tools.",
        },
      },
    ],
    notas: {
      pt: "Também disponível: turma aberta (12h) a 25.000 Kz por participante (mínimo 6) e “Informática na óptica do utilizador” (8h) a 90.000 Kz por grupo.",
      en: "Also available: open class (12h) at 25,000 Kz per participant (minimum 6) and “IT essentials” (8h) at 90,000 Kz per group.",
    },
  },
];

export const NOMES_PACOTE: Record<PacoteId, Texto> = {
  basico: { pt: "Básico", en: "Basic" },
  profissional: { pt: "Profissional", en: "Professional" },
  premium: { pt: "Premium", en: "Premium" },
};

export function encontrarPacote(
  servicoId: string,
  pacoteId: string
): { servico: Servico; pacote: Pacote } | null {
  const servico = SERVICOS.find((s) => s.id === servicoId);
  if (!servico) return null;
  const pacote = servico.pacotes.find((p) => p.id === pacoteId);
  if (!pacote) return null;
  return { servico, pacote };
}

/**
 * Valor do sinal (50%) em Kz, ou null se o pacote não pode ser pago online.
 * Regras do preçário: o sinal de 50% só se aplica a projectos com preço
 * fixo até 500.000 Kz; acima disso o pagamento é 40/30/30, mensalidades
 * são pagas antecipadamente, e "desde"/"sob orçamento"/preço à hora
 * precisam de proposta.
 */
export function sinalKz(servico: Servico, pacote: Pacote): number | null {
  if (servico.sinalOnline === false) return null;
  if (pacote.desde || pacote.sobOrcamento) return null;
  if (!pacote.implementacaoKz) return null;
  if (pacote.implementacaoKz > LIMITE_SINAL_50_KZ) return null;
  return Math.round(pacote.implementacaoKz / 2);
}

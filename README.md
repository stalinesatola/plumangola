# Plum Angola

Site "hub" de `plum-angola.com`, que reúne vários espaços independentes por
baixo do mesmo domínio. O primeiro espaço é `/dlamini-loja`.

## Stack

- Next.js 14 (App Router) + TypeScript
- Tailwind CSS
- Deploy alvo: Vercel

## Desenvolvimento local

```bash
npm install
cp .env.example .env.local   # preencher TELEGRAM_BOT_TOKEN e TELEGRAM_CHAT_ID
npm run dev
```

Abrir `http://localhost:3000` (hub) e `http://localhost:3000/dlamini-loja`
(loja do Dlamini).

## Espaço: Dlamini Loja (`/dlamini-loja`)

Montra de revenda dos produtos de [arthur-ford.com](https://arthur-ford.com/),
gerida pelo agente revendedor Dlamini. Quando um cliente escolhe um produto e
submete o formulário de pedido, o site envia a encomenda diretamente para o
Telegram do Dlamini através de um bot — a venda é depois confirmada e fechada
manualmente por ele.

### Configurar o bot do Telegram

1. No Telegram, fala com **@BotFather** e cria um novo bot (`/newbot`).
   Guarda o token que ele te dá — é o `TELEGRAM_BOT_TOKEN`.
2. Obter o `TELEGRAM_CHAT_ID` do Dlamini:
   - O Dlamini envia uma mensagem qualquer ao bot recém-criado (ou adiciona
     o bot a um grupo e alguém escreve lá).
   - Visita `https://api.telegram.org/bot<TOKEN>/getUpdates` no browser
     (substitui `<TOKEN>` pelo token do bot) e procura o campo
     `"chat":{"id": ...}` na resposta — esse número é o `TELEGRAM_CHAT_ID`.
3. Define as duas variáveis (`TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID`):
   - Localmente, em `.env.local`.
   - Em produção, nas *Environment Variables* do projeto na Vercel.

### Catálogo de produtos

Os produtos ficam em `data/dlamini-loja/products.json`. O repositório
arranca com produtos de **exemplo/placeholder** — substitui pelos dados reais
de arthur-ford.com de uma destas formas:

- **Manual**: editar `data/dlamini-loja/products.json` diretamente, mantendo
  o mesmo formato de cada produto (`id`, `slug`, `nome`, `descricao`,
  `preco`, `moeda`, `imagem`, `categoria`, `disponivel`).
- **Scraping**: correr `npm run scrape:dlamini-loja`
  (`scripts/scrape-arthur-ford.ts`) **num ambiente com acesso à internet**
  (este script não corre no sandbox de desenvolvimento usado para construir
  este projeto, porque o acesso a arthur-ford.com está bloqueado aí). Os
  seletores HTML no script são um ponto de partida e provavelmente precisam
  de ajuste depois de inspecionar a estrutura real do site.

### Fluxo de encomenda

1. Cliente escolhe um produto em `/dlamini-loja` e preenche o formulário
   (quantidade, nome, contacto, localização opcional, observações).
2. O formulário chama `POST /api/telegram/order`.
3. A API valida os dados e envia uma mensagem formatada ao chat do Dlamini
   via Telegram Bot API.
4. O cliente é redirecionado para `/dlamini-loja/obrigado`.

Não há pagamento online — a venda é confirmada e fechada manualmente pelo
Dlamini depois de receber o pedido no Telegram.

## Adicionar um novo espaço

Cada espaço vive na sua própria pasta dentro de `app/`, por exemplo
`app/<novo-espaco>/`, com o seu próprio `layout.tsx` e `page.tsx`. Adiciona
uma entrada na lista `espacos` em `app/page.tsx` para que apareça na home de
`plum-angola.com`.

## Deploy

Este projeto está preparado para deploy na Vercel:

1. Importar o repositório `stalinesatola/plumangola` na Vercel.
2. Configurar as variáveis de ambiente `TELEGRAM_BOT_TOKEN` e
   `TELEGRAM_CHAT_ID` no projeto.
3. Associar o domínio `plum-angola.com` ao projeto nas definições de
   *Domains* da Vercel.

# Plum Angola

Site "hub" de `plum-angola.com`, que reúne vários espaços independentes por
baixo do mesmo domínio. O primeiro espaço é `/dlamini-loja`.

## Stack

- Next.js 14 (App Router) + TypeScript
- Tailwind CSS
- Bilingue (Português/Inglês) via `next-intl` no hub e em `/dlamini-loja`
- Deploy alvo: Vercel

## Desenvolvimento local

```bash
npm install
cp .env.example .env.local   # preencher TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID, AUTH_SECRET, POSTGRES_URL
npm run dev
```

Abrir `http://localhost:3000` (hub, em Português), `http://localhost:3000/en`
(hub em Inglês), `http://localhost:3000/dlamini-loja` (loja em Português),
`http://localhost:3000/en/dlamini-loja` (loja em Inglês) e
`http://localhost:3000/admin/login` (painel de admin, só em Português).

A loja e o painel de admin precisam da base de dados Postgres configurada
(ver secção seguinte) — sem `POSTGRES_URL`, essas páginas dão erro 500.

## Idiomas (Português / Inglês)

O hub (`/`) e a loja (`/dlamini-loja`) estão disponíveis em Português (sem
prefixo na URL, idioma predefinido) e em Inglês (prefixo `/en`, ex:
`/en/dlamini-loja`). Há um seletor **PT | EN** no cabeçalho de ambas as
páginas. O painel de admin (`/admin`) fica só em Português — é uso interno.

O texto fixo da interface (títulos, botões, formulários) está em
`messages/pt.json` e `messages/en.json`. Para adicionar/editar textos,
atualiza os dois ficheiros com as mesmas chaves.

Os **produtos** também podem ter nome/descrição em inglês: no painel de
admin, ao criar/editar um produto, os campos "Nome (EN)" e "Descrição (EN)"
são opcionais — se ficarem em branco, a loja em inglês mostra a versão em
português desse produto.

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

### Configurar a base de dados (Vercel Postgres)

O catálogo de produtos e as contas de admin vivem numa base de dados
Postgres (já não é o ficheiro JSON estático). Passos para configurar:

1. No dashboard da Vercel, no projeto `plumangola` → separador **Storage** →
   **Create Database** → escolhe Postgres (pode aparecer como integração
   "Neon" — é compatível, a Vercel injeta na mesma as variáveis
   `POSTGRES_URL` que este projeto usa).
2. Liga a base de dados ao projeto (**Connect to Project**) — isto injeta
   automaticamente `POSTGRES_URL` (e variantes) nas *Environment Variables*
   do projeto.
3. Localmente, corre `vercel link` (se ainda não tiveres feito) e depois
   `vercel env pull .env.local` para trazer essas variáveis para a tua
   máquina.
4. Corre o schema uma única vez: abre o separador **Query** da base de dados
   no dashboard da Vercel/Neon e cola o conteúdo de `db/init.sql` — se o
   editor não aceitar várias instruções de uma vez, corre cada `CREATE
   TABLE`/`CREATE INDEX` separadamente. Localmente:
   ```bash
   psql "$POSTGRES_URL" -f db/init.sql
   ```
5. Se já tinhas a base de dados criada **antes** dos campos de nome/descrição
   em inglês ou da tabela de rate limiting existirem, corre também as
   migrações `db/migrations/001_add_i18n_produtos.sql` e
   `db/migrations/002_add_rate_limit_events.sql` (mesma forma que o passo
   anterior) — instalações novas já ficam com isto no `init.sql`.
6. Define `AUTH_SECRET` (um valor aleatório, ex: `openssl rand -base64 32`)
   em `.env.local` e nas *Environment Variables* do projeto na Vercel.

### Criar a primeira conta de admin

Não há registo público — as contas são criadas via script:

```bash
npm run seed:admin -- --username=dlamini --password=umaSenhaForte
```

Corre este comando sempre que precisares de criar mais uma conta de admin
(reutiliza o mesmo script, só muda o `--username`).

### Painel de administração (`/admin`)

Em `/admin/login`, qualquer conta criada pelo `seed-admin.ts` pode entrar.
No painel (`/admin/produtos`) dá para:

- Ver todos os produtos, com aviso visual de stock baixo/esgotado.
- Criar um produto manualmente, ou colando um link de uma página de produto
  de arthur-ford.com (ex: `https://arthur-ford.com/products/elixir-emerald-004-50ml`)
  em "Importar por link" — isto só **pré-preenche** o formulário (nome,
  descrição, imagem, preço de compra); revê e ajusta antes de guardar.
  **Nota**: esta importação só funciona em produção (Vercel), porque este
  sandbox de desenvolvimento não tem acesso de rede a arthur-ford.com. Os
  seletores em `lib/scrape-produto.ts` são um ponto de partida best-effort e
  podem precisar de ajuste depois de inspecionar o HTML real do site.
- Definir o preço de venda (em AOA, mostrado aos clientes), o stock atual e
  o stock mínimo (só usado para o alerta interno no painel — os clientes
  nunca veem este número).
- Editar ou apagar produtos.

Na loja pública, o stock só mostra 2 estados: **"Disponível para
encomenda"** (`stock > 0`) ou **"Esgotado"** (`stock = 0`). Um pedido feito
pelo cliente **não** reduz o stock automaticamente — o admin atualiza o
stock manualmente no painel depois de confirmar a venda.

### Catálogo antigo (`data/dlamini-loja/products.json`)

Este ficheiro já não é lido por nenhum código em runtime — fica só como
referência histórica. `scripts/scrape-arthur-ford.ts` (scraping em massa da
página inicial de arthur-ford.com) também é legado pelo mesmo motivo; para
importar produtos usa antes o painel de admin.

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

Cada espaço vive na sua própria pasta dentro de `app/[locale]/`, por exemplo
`app/[locale]/<novo-espaco>/`, com o seu próprio `layout.tsx` e `page.tsx`.
Adiciona uma entrada na lista `espacos` em `app/[locale]/page.tsx` para que
apareça na home de `plum-angola.com`. Se o espaço tiver texto fixo na
interface, adiciona as chaves de tradução correspondentes em
`messages/pt.json` e `messages/en.json`.

## Deploy

Este projeto está preparado para deploy na Vercel:

1. Importar o repositório `stalinesatola/plumangola` na Vercel.
2. Criar e ligar a base de dados Postgres (ver "Configurar a base de dados"
   acima) e correr `db/init.sql`.
3. Configurar as variáveis de ambiente `TELEGRAM_BOT_TOKEN`,
   `TELEGRAM_CHAT_ID` e `AUTH_SECRET` no projeto.
4. Correr `npm run seed:admin -- --username=... --password=...` para criar
   a primeira conta de admin.
5. Associar o domínio `plum-angola.com` ao projeto nas definições de
   *Domains* da Vercel.

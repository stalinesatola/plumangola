-- Schema inicial do Plum Angola (painel de admin + catálogo /dlamini-loja).
-- Corre este ficheiro UMA VEZ contra a base de dados Postgres do projeto
-- (dashboard da Vercel -> Storage -> Postgres -> Query, ou `psql "$POSTGRES_URL" -f db/init.sql`).
-- Ver README.md -> "Configurar a base de dados (Vercel Postgres)".

CREATE TABLE IF NOT EXISTS admins (
  id            SERIAL PRIMARY KEY,
  username      TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS produtos (
  id             SERIAL PRIMARY KEY,
  slug           TEXT NOT NULL UNIQUE,
  nome           TEXT NOT NULL,
  descricao      TEXT NOT NULL DEFAULT '',
  nome_en        TEXT,
  descricao_en   TEXT,
  imagem         TEXT NOT NULL DEFAULT '',
  categoria      TEXT NOT NULL DEFAULT 'Geral',

  preco_compra   NUMERIC(12,2),
  moeda_compra   TEXT,
  preco_venda    NUMERIC(12,2) NOT NULL,
  moeda_venda    TEXT NOT NULL DEFAULT 'AOA',

  stock          INTEGER NOT NULL DEFAULT 0,
  stock_minimo   INTEGER NOT NULL DEFAULT 0,
  ativo          BOOLEAN NOT NULL DEFAULT true,

  origem_url     TEXT,

  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_produtos_slug ON produtos (slug);
CREATE INDEX IF NOT EXISTS idx_produtos_ativo ON produtos (ativo);

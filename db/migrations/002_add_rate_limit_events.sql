-- Migração: adiciona a tabela de rate limiting (login do admin, pedidos da
-- loja). Corre isto UMA VEZ contra a base de dados já existente, no editor
-- "Query" da Neon. Instalações novas já ficam com esta tabela ao correr
-- db/init.sql, não precisam desta migração.

CREATE TABLE IF NOT EXISTS rate_limit_events (
  id         SERIAL PRIMARY KEY,
  chave      TEXT NOT NULL,
  criado_em  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_rate_limit_chave_criado ON rate_limit_events (chave, criado_em);

-- Migração: adiciona a tabela de controlo de throttling dos alertas internos
-- (lib/alerts.ts). Guarda só a chave do erro e o momento em que foi
-- notificado, para evitar repetir o mesmo alerta no Telegram várias vezes
-- seguidas -- nunca o conteúdo do erro em si.
-- Corre isto UMA VEZ contra a base de dados já existente, no editor "Query"
-- da Neon (ou `psql "$POSTGRES_URL" -f db/migrations/003_add_alert_events.sql`).
-- Instalações novas já ficam com esta tabela ao correr db/init.sql.

CREATE TABLE IF NOT EXISTS alert_events (
  id         SERIAL PRIMARY KEY,
  chave      TEXT NOT NULL,
  criado_em  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_alert_events_chave_criado ON alert_events (chave, criado_em);

-- Migração: adiciona campos opcionais de nome/descrição em inglês aos produtos,
-- para suportar a loja bilingue (PT/EN). Corre isto UMA VEZ contra a base de
-- dados já existente (a mesma onde já correste db/init.sql), no editor
-- "Query" da Neon. Instalações novas já ficam com estas colunas ao correr
-- db/init.sql, não precisam desta migração.

ALTER TABLE produtos
  ADD COLUMN IF NOT EXISTS nome_en TEXT,
  ADD COLUMN IF NOT EXISTS descricao_en TEXT;

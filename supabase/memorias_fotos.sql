-- ─────────────────────────────────────────────────────────────────────────────
-- Adiciona `fotos` às memórias (upload de fotos na timeline), espelhando o
-- `fotos jsonb` que já existe em `lugares`. Usa o mesmo bucket `fotos`
-- (ver supabase/storage_fotos.sql).
-- Rodar no SQL Editor do painel do Supabase ANTES de usar o upload na UI.
-- ─────────────────────────────────────────────────────────────────────────────

alter table memories add column if not exists fotos jsonb default '[]'::jsonb;

-- ─────────────────────────────────────────────────────────────────────────────
-- Adiciona `autor` às memórias (avatar P/K na timeline), espelhando o `autor`
-- que já existe em `lugares` e `diario`.
-- Rodar no SQL Editor do painel do Supabase ANTES de usar o novo campo na UI
-- (sem a coluna, "adicionar memória" falha).
-- ─────────────────────────────────────────────────────────────────────────────

alter table memories add column if not exists autor text;

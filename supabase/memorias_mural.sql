-- ─────────────────────────────────────────────────────────────────────────────
-- Mural (redesign de Memórias) — colunas que faltavam para os recortes especiais.
-- Rodar no SQL Editor do Supabase ANTES de usar os filtros "sonhos"/"viagens".
--
--   bucket_item_id → vínculo recíproco do Mirror da Bucket List ("Nossos Sonhos").
--                    Preenchido ⇒ a memória nasceu de um sonho realizado ⇒ ganha
--                    o selo "✦ Sonho realizado!" e entra no filtro "sonhos".
--                    (`origem` do brief é derivada disto na UI — não vira coluna.)
--   local          → { "nome": "...", "lat": ..., "lng": ... } | null.
--                    Preenchido ⇒ a memória entra no filtro "viagens".
-- ─────────────────────────────────────────────────────────────────────────────

alter table memories add column if not exists bucket_item_id bigint;
alter table memories add column if not exists local jsonb;

-- FK opcional do recíproco (espelha o comentário em bucket_items.sql). Ative se
-- quiser integridade referencial — bucket_items.id é bigint identity:
--   alter table memories
--     add constraint memories_bucket_item_fk
--     foreign key (bucket_item_id) references bucket_items(id) on delete set null;

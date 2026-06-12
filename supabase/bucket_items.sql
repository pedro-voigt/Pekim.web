-- ─────────────────────────────────────────────────────────────────────────────
-- Tabela `bucket_items` — página "Nossos Sonhos" (a bucket list redesenhada).
-- Rodar no SQL Editor do painel do Supabase ANTES de usar a página (sem a
-- tabela, o load falha). RLS: só usuários AUTENTICADOS (modelo atual do app,
-- igual ao rls_auth.sql — não mais anon).
--
-- Substitui a antiga `bucket_list` (item/done/emoji). Quando confirmar que a
-- nova está OK, pode dropar a antiga:  drop table if exists bucket_list;
-- ─────────────────────────────────────────────────────────────────────────────

create table if not exists bucket_items (
  id              bigint generated always as identity primary key,
  titulo          text not null,
  microcopy       text,                                 -- sussurro do casal (opcional)
  status          text not null default 'pendente',     -- 'pendente' | 'realizado'
  data_realizacao date,                                 -- null enquanto pendente
  foto_url        text,                                 -- null → card sutil; preenchido → polaroid
  sonhado_por     text,                                 -- 'pedro' | 'kim' | 'ambos'
  memoria_id      bigint,                               -- vínculo "Mirror" → memories(id); null por ora
  created_at      timestamptz default now()
);

-- A coluna foto_url usa o bucket "fotos" do Storage (ver storage_fotos.sql),
-- pasta "sonhos/". memoria_id ficará apontando para memories(id) quando o modo
-- Mirror criar a memória derivada; o FK fica opcional até confirmar o tipo do id
-- de memories. Para ativá-lo (se memories.id for bigint):
--   alter table bucket_items
--     add constraint bucket_items_memoria_fk
--     foreign key (memoria_id) references memories(id) on delete set null;

alter table bucket_items enable row level security;

drop policy if exists "bucket_items_auth_all" on bucket_items;
create policy "bucket_items_auth_all"
  on bucket_items for all
  to authenticated
  using (true)
  with check (true);

-- ─── Seed opcional ───────────────────────────────────────────────────────────
-- Descomente para começar com os mesmos 9 exemplos do mock. As realizadas
-- entram sem foto (foto_url null → card sutil); adicione fotos pela própria UI
-- ao marcar, ou edite depois. Ou apague este bloco e crie os sonhos de vocês.
--
-- insert into bucket_items (titulo, microcopy, status, data_realizacao, sonhado_por) values
--   ('Ver o mar pela primeira vez juntos',                 null,                                          'realizado', '2025-01-18', 'kim'),
--   ('Aprender a dançar juntos',                            'nem que seja só na cozinha.',                 'pendente',   null,         'pedro'),
--   ('Maratonar uma série inteira num fim de semana',       null,                                          'realizado', '2025-03-09', 'ambos'),
--   ('Fazer uma viagem internacional',                      null,                                          'pendente',   null,         'kim'),
--   ('Plantar uma árvore e ver ela crescer',                null,                                          'pendente',   null,         'ambos'),
--   ('Assistir o nascer do sol juntos',                     null,                                          'realizado', '2025-04-27', 'pedro'),
--   ('Cozinhar um jantar de três pratos do zero',           'entrada, principal e sobremesa — sem ajuda.', 'pendente',   null,         'pedro'),
--   ('Acampar e dormir sob as estrelas',                    null,                                          'realizado', '2025-02-14', 'kim'),
--   ('Ter um cachorro pra chamar de nosso',                 'e brigar pra ver quem passeia.',              'pendente',   null,         'ambos');

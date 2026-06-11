-- ─────────────────────────────────────────────────────────────────────────────
-- Tabela `sessao` — página "Nossa Sessão" (Filmes & Séries).
-- Rodar no SQL Editor do painel do Supabase ANTES de usar a página (sem a
-- tabela, o load falha). RLS: só usuários AUTENTICADOS (modelo atual do app,
-- igual ao rls_auth.sql — não mais anon).
-- ─────────────────────────────────────────────────────────────────────────────

create table if not exists sessao (
  id            bigint generated always as identity primary key,
  title         text not null,
  status        text not null default 'watchlist',  -- 'watchlist' | 'assistido'
  poster_path   text,                                 -- TMDB; null = ainda não buscado, '' = buscado sem pôster
  rating        numeric(3,1),                         -- 0–10, uma decimal (só 'assistido')
  comment       text,                                 -- microcopy do casal (só 'assistido')
  added_by      text,                                 -- 'pedro' | 'kim'
  loved_by_both boolean not null default false,
  year          smallint,                             -- ano de lançamento (auto via TMDB, editável)
  created_at    timestamptz default now()
);

-- Se a tabela já existia sem a coluna `year`, rode este ALTER (idempotente):
alter table sessao add column if not exists year smallint;

alter table sessao enable row level security;

drop policy if exists "sessao_auth_all" on sessao;
create policy "sessao_auth_all"
  on sessao for all
  to authenticated
  using (true)
  with check (true);

-- ─── Seed opcional ───────────────────────────────────────────────────────────
-- Descomente para começar com os 12 exemplos (os mesmos do mock). O poster_path
-- fica null de propósito: a página resolve via TMDB no primeiro load e persiste
-- aqui. Ou apague este bloco e adicione os filmes de vocês pela própria UI.
--
-- insert into sessao (title, status, rating, comment, added_by, loved_by_both) values
--   ('Antes do Amanhecer',   'watchlist', null, null, 'pedro', false),
--   ('Sua Casa ou a Minha',  'assistido', 9.2,  'a gente chorou nos dois finais.', 'kim',   false),
--   ('A Viagem de Chihiro',  'watchlist', null, null, 'kim',   false),
--   ('Interestelar',         'assistido', 8.0,  'você dormiu, eu chorei. justo.',  'pedro', false),
--   ('Past Lives',           'watchlist', null, null, 'pedro', false),
--   ('Ratatouille',          'assistido', 10,   'nota máxima, sem discussão.',     'pedro', true),
--   ('Cidade dos Sonhos',    'watchlist', null, null, 'kim',   false),
--   ('Notting Hill',         'assistido', 7.5,  'clichê, e a gente ama mesmo assim.', 'kim', false),
--   ('Oppenheimer',          'watchlist', null, null, 'pedro', false),
--   ('Whiplash',             'assistido', 9.0,  'saí tenso, voltaria pra ver de novo.', 'pedro', false),
--   ('Call Me By Your Name', 'watchlist', null, null, 'kim',   false),
--   ('Up: Altas Aventuras',  'assistido', 8.8,  'os 10 primeiros minutos. não falo mais nada.', 'kim', true);

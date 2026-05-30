-- ─────────────────────────────────────────────────────────────────────────────
-- Tabela `lugares` — feature Mapa (mural de cortiça) em Memórias.
-- Rodar no SQL Editor do painel do Supabase.
-- RLS permissivo (anon faz CRUD), espelhando o padrão das outras tabelas do app.
-- ─────────────────────────────────────────────────────────────────────────────

create table if not exists lugares (
  id           uuid primary key default gen_random_uuid(),
  nome         text not null,            -- "Foz do Iguaçu"
  lat          double precision not null,
  lng          double precision not null,
  data_inicio  date,                     -- início da viagem
  data_fim     date,                     -- fim (opcional)
  nota         text,                     -- textinho/memória
  fotos        jsonb default '[]'::jsonb,   -- array de URLs (Supabase Storage)
  rota         jsonb default '[]'::jsonb,   -- waypoints da viagem (partida→paradas→chegada)
  rota_geojson jsonb,                     -- cache do GeoJSON calculado (ORS) — evita recalcular
  modo         text default 'driving',   -- 'driving' | 'flight' | 'walking'
  autor        text,                     -- quem registrou (padrão do projeto: P / K)
  created_at   timestamptz default now()
);

-- RLS: liberar acesso à anon key (mesmo modelo das demais tabelas).
alter table lugares enable row level security;

drop policy if exists "lugares_all_anon" on lugares;
create policy "lugares_all_anon"
  on lugares for all
  to anon
  using (true)
  with check (true);

-- ─── Seed: os 4 lugares reais (Sul do Brasil) ────────────────────────────────
-- Datas/notas/fotos são placeholders — ajuste depois pelo painel ou pela UI.
insert into lugares (nome, lat, lng, nota, modo, rota) values
  (
    'Foz do Iguaçu', -25.5469, -54.5882,
    'As cataratas — viagem de carro lá do RS.',
    'driving',
    '[
      { "nome": "Novo Hamburgo", "lat": -29.6783, "lng": -51.1306, "tipo": "partida", "nota": "saída 6h" },
      { "nome": "Lages",         "lat": -27.8159, "lng": -50.3261, "tipo": "parada",  "nota": "café" },
      { "nome": "Cascavel",      "lat": -24.9573, "lng": -53.4595, "tipo": "parada",  "nota": "almoço" },
      { "nome": "Foz do Iguaçu", "lat": -25.5469, "lng": -54.5882, "tipo": "chegada", "nota": "fim de tarde" }
    ]'::jsonb
  ),
  (
    'Gramado', -29.3747, -50.8767,
    'Friozinho da serra.',
    'driving', '[]'::jsonb
  ),
  (
    'Canela', -29.3556, -50.8112,
    'A catedral de pedra e a cascata.',
    'driving', '[]'::jsonb
  ),
  (
    'Nova Petrópolis', -29.3766, -51.1140,
    'O labirinto verde e o jeito alemão.',
    'driving', '[]'::jsonb
  );

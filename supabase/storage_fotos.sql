-- ─────────────────────────────────────────────────────────────────────────────
-- Storage para upload de fotos (lugares do mapa; depois memórias também).
-- Rodar no SQL Editor do painel do Supabase.
--
-- Bucket PÚBLICO: as imagens são lidas por URL direta (getPublicUrl) — combina
-- com o app já estar atrás de auth e simplifica a exibição. A ESCRITA (upload,
-- update, delete) fica restrita a usuários autenticados, no mesmo espírito do
-- rls_auth.sql.
-- ─────────────────────────────────────────────────────────────────────────────

insert into storage.buckets (id, name, public)
values ('fotos', 'fotos', true)
on conflict (id) do update set public = true;

-- Leitura pública (o bucket público já serve via CDN; a policy garante o
-- list/select pela API REST do Storage).
drop policy if exists "fotos_public_read" on storage.objects;
create policy "fotos_public_read" on storage.objects
  for select to public
  using (bucket_id = 'fotos');

-- Escrita apenas autenticada.
drop policy if exists "fotos_auth_insert" on storage.objects;
create policy "fotos_auth_insert" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'fotos');

drop policy if exists "fotos_auth_update" on storage.objects;
create policy "fotos_auth_update" on storage.objects
  for update to authenticated
  using (bucket_id = 'fotos')
  with check (bucket_id = 'fotos');

drop policy if exists "fotos_auth_delete" on storage.objects;
create policy "fotos_auth_delete" on storage.objects
  for delete to authenticated
  using (bucket_id = 'fotos');

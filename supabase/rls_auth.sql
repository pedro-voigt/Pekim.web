-- ─────────────────────────────────────────────────────────────────────────────
-- Trava o banco: só usuários AUTENTICADOS leem/escrevem (era aberto pro anon).
-- Rodar no SQL Editor do Supabase — DEPOIS de criar os usuários de vocês dois e
-- de configurar as Redirect URLs (senão você se tranca pra fora).
--
-- Name-agnóstico: dropa todas as policies existentes de cada tabela e cria uma
-- única policy `for all to authenticated`. A anon key continua existindo no
-- bundle, mas sem sessão não consegue mais ler nem apagar nada.
-- ─────────────────────────────────────────────────────────────────────────────

do $$
declare
  t text;
  p record;
  tables text[] := array['dates', 'movies', 'memories', 'bucket_list', 'cartas', 'lugares'];
begin
  foreach t in array tables loop
    execute format('alter table %I enable row level security', t);

    -- remove qualquer policy antiga (inclusive as permissivas pro anon)
    for p in
      select policyname from pg_policies
      where schemaname = 'public' and tablename = t
    loop
      execute format('drop policy %I on %I', p.policyname, t);
    end loop;

    -- acesso total apenas pra quem está logado
    execute format(
      'create policy "auth_all" on %I for all to authenticated using (true) with check (true)',
      t
    );
  end loop;
end $$;

-- ── Opcional (hardening extra): limitar a e-mails específicos ──────────────────
-- Mesmo com signups desligados e shouldCreateUser:false, isso garante que, se um
-- terceiro usuário for criado por engano, ele não enxerga nada. Descomente e
-- troque os e-mails; rode no lugar do bloco acima (ou ajuste o using/with check).
--
-- create policy "auth_allowlist" on memories for all to authenticated
--   using  (auth.jwt() ->> 'email' in ('pedro@exemplo.com', 'kim@exemplo.com'))
--   with check (auth.jwt() ->> 'email' in ('pedro@exemplo.com', 'kim@exemplo.com'));

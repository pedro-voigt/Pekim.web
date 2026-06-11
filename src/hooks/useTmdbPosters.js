import { useEffect, useRef } from "react";

import { fetchMeta, tmdbConfigured } from "../lib/tmdb";

// Resolve metadados do TMDB (poster_path + year) e persiste via onResolve — o
// banco vira o cache (não há localStorage). Busca quando:
//   - watchlist sem poster_path (precisa do pôster), ou
//   - qualquer item sem year (precisa do ano).
// Só faz patch dos campos que ainda faltam, pra não sobrescrever edição manual.
//
// poster_path na linha: null = não buscado · "" = buscado sem pôster · "/x" = path.
// onResolve(id, patch) deve ser ESTÁVEL (useCallback + ref do update).
export default function useTmdbPosters(items, onResolve) {
  const attempted = useRef(new Set()); // ids já tentados nesta sessão
  const mounted   = useRef(true);

  useEffect(() => () => { mounted.current = false; }, []);

  useEffect(() => {
    if (!tmdbConfigured) return;

    const pending = items.filter(
      (it) => !attempted.current.has(it.id) && (
        (it.status === "watchlist" && it.poster_path == null) ||
        it.year == null
      ),
    );

    for (const it of pending) {
      attempted.current.add(it.id);
      fetchMeta(it.title, { year: it.year })
        .then((meta) => {
          if (!mounted.current) return;
          const patch = {};
          if (it.status === "watchlist" && it.poster_path == null) patch.poster_path = meta.poster_path ?? "";
          if (it.year == null && meta.year != null) patch.year = meta.year;
          if (Object.keys(patch).length) onResolve(it.id, patch);
        })
        .catch(() => { attempted.current.delete(it.id); }); // libera p/ nova tentativa
    }
  }, [items, onResolve]);
}

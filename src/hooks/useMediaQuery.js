import { useCallback, useSyncExternalStore } from "react";

// Reage a uma media query. useSyncExternalStore evita o setState-no-effect
// (sincroniza direto com a fonte externa) e cobre a troca de `query`.
export default function useMediaQuery(query) {
  const subscribe = useCallback((callback) => {
    const mql = window.matchMedia(query);
    mql.addEventListener("change", callback);
    return () => mql.removeEventListener("change", callback);
  }, [query]);

  const getSnapshot = useCallback(() => window.matchMedia(query).matches, [query]);

  return useSyncExternalStore(subscribe, getSnapshot, () => false);
}

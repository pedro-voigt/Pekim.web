// Cliente mínimo do TMDB — busca o poster_path de um título.
// A chave fica no client (VITE_); use uma chave/token com uso restrito.
//
// Aceita os dois formatos do TMDB:
//   VITE_TMDB_TOKEN → "API Read Access Token" v4 (header Authorization: Bearer)
//   VITE_TMDB_KEY   → "API Key" v3 (query ?api_key=)
// Se preferir, configure só um dos dois. Sem nenhum, a página cai no
// fallback de cor sólida graciosamente (nada quebra).

const TOKEN = import.meta.env.VITE_TMDB_TOKEN;
const KEY   = import.meta.env.VITE_TMDB_KEY;

const BASE = "https://api.themoviedb.org/3";

export const tmdbConfigured = Boolean(TOKEN || KEY);

const authHeaders = () => (TOKEN ? { Authorization: `Bearer ${TOKEN}` } : {});
const authQuery   = () => (!TOKEN && KEY ? `&api_key=${KEY}` : "");

/** URL da imagem do pôster a partir do path do TMDB. */
export const posterUrl = (path, size = "w500") =>
  `https://image.tmdb.org/t/p/${size}${path}`;

/**
 * Resolve { poster_path, year } de um título.
 * @param {string} title
 * @param {{ mediaType?: 'movie'|'tv', year?: number, signal?: AbortSignal }} opts
 * @returns {Promise<{ poster_path: string|null, year: number|null }>}
 *
 * Sem mediaType, tenta /search/movie e depois /search/tv. Prioriza um resultado
 * com pôster, mas cai no primeiro p/ ao menos pegar o ano (release_date /
 * first_air_date). Erros de rede em um tipo pulam para o próximo; AbortError
 * propaga (cancelamento real).
 */
export async function fetchMeta(title, { mediaType, year, signal } = {}) {
  const none = { poster_path: null, year: null };
  if (!tmdbConfigured || !title) return none;
  const types = mediaType ? [mediaType] : ["movie", "tv"];

  let anyOk = false; // alguma busca respondeu 2xx? (separa "não achou" de "falhou")

  for (const type of types) {
    const url =
      `${BASE}/search/${type}` +
      `?query=${encodeURIComponent(title)}` +
      `&include_adult=false&language=pt-BR` +
      (year && type === "movie" ? `&year=${year}` : "") +
      authQuery();

    let res;
    try {
      res = await fetch(url, { headers: authHeaders(), signal });
    } catch (err) {
      if (err.name === "AbortError") throw err;
      continue; // erro de rede: tenta o próximo tipo
    }
    if (!res.ok) continue; // 401/429/etc: tenta o próximo tipo

    anyOk = true;
    const data = await res.json();
    const hit = data.results?.find((r) => r.poster_path) || data.results?.[0];
    if (hit) {
      const date = hit.release_date || hit.first_air_date || "";
      const y = date ? parseInt(date.slice(0, 4), 10) : NaN;
      return { poster_path: hit.poster_path || null, year: Number.isNaN(y) ? null : y };
    }
  }

  // Nenhuma busca respondeu OK → falha transitória: lança p/ o hook tentar de
  // novo depois (em vez de gravar "sem pôster" e nunca mais buscar).
  if (!anyOk) throw new Error("TMDB indisponível");
  return none; // buscou de verdade e não achou
}

/**
 * Busca títulos (filmes + séries) para o autocomplete do formulário.
 * Usa /search/multi (um request, já traz media_type). Até 6 itens.
 * @returns {Promise<Array<{ key, title, year, poster_path, media_type }>>}
 */
export async function searchTitles(query, { signal } = {}) {
  if (!tmdbConfigured || !query?.trim()) return [];
  const url =
    `${BASE}/search/multi` +
    `?query=${encodeURIComponent(query.trim())}` +
    `&include_adult=false&language=pt-BR` +
    authQuery();

  const res = await fetch(url, { headers: authHeaders(), signal });
  if (!res.ok) return [];
  const data = await res.json();

  return (data.results || [])
    .filter((r) => r.media_type === "movie" || r.media_type === "tv")
    .slice(0, 6)
    .map((r) => {
      const date = r.release_date || r.first_air_date || "";
      const y = date ? parseInt(date.slice(0, 4), 10) : NaN;
      return {
        key:         `${r.media_type}-${r.id}`,
        title:       r.title || r.name || "",
        year:        Number.isNaN(y) ? null : y,
        poster_path: r.poster_path || null,
        media_type:  r.media_type,
      };
    });
}

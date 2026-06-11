/**
 * Determina quais cards recebem cor especial.
 *
 * hero (verde): primeiro date com planning "Alto" ainda não feito — o sonho máximo.
 * rosa: primeiro date com planning "Baixo" que não seja o hero — o mais acessível.
 *
 * Quando não existir campo `destaque` no banco, essa heurística funciona
 * como proxy. Se quiser controle manual, adicionar coluna booleana `destaque`
 * e substituir o find abaixo por d.destaque === true.
 */
export function getCardRoles(dates) {
  const hero = dates.find(d => d.planning === "Alto" && d.status !== "Feito");
  const rosa = dates.find(d =>
    d.planning === "Baixo" &&
    d.status   !== "Feito" &&
    d.id       !== hero?.id
  );
  return { heroId: hero?.id ?? null, rosaId: rosa?.id ?? null };
}

/** Estilos de cor de acordo com o papel do card. */
export function cardTheme(role) {
  if (role === "hero") return {
    bg:          "#0A3323",
    border:      "1px solid #0A3323",
    shadow:      "0 4px 14px rgba(10,51,35,.22)",
    hoverShadow: "0 10px 28px rgba(10,51,35,.30)",
    title:       "#F7F4D5",
    desc:        "rgba(247,244,213,0.78)",
    meta:        "#D3968C",
    vibe:        "#a8bc80",
  };
  if (role === "rosa") return {
    bg:          "#D3968C",
    border:      "1px solid #D3968C",
    shadow:      "0 4px 14px rgba(211,150,140,.25)",
    hoverShadow: "0 10px 28px rgba(211,150,140,.35)",
    title:       "#fff",
    desc:        "rgba(255,255,255,0.85)",
    meta:        "rgba(255,255,255,0.72)",
    vibe:        "rgba(255,255,255,0.72)",
  };
  return {
    bg:          "#F7F4D5",
    border:      "1px solid #D8D9B0",
    shadow:      "0 2px 5px rgba(10,51,35,.06)",
    hoverShadow: "0 8px 22px rgba(10,51,35,.14)",
    title:       "#0A3323",
    desc:        "#2e5c3a",
    meta:        "#5a8060",
    vibe:        "#D3968C",
  };
}

// ---------------------------------------------------------------------------
// Washi tape — determinístico por id (~35% dos cards)
// ---------------------------------------------------------------------------

function simpleHash(str) {
  let h = 5381;
  for (let i = 0; i < str.length; i++) {
    h = ((h << 5) + h + str.charCodeAt(i)) & 0x7fffffff;
  }
  return h;
}

// Finalizador (avalanche) de inteiro de 32 bits. djb2 puro mal mistura os bits
// em strings numéricas curtas — ids sequenciais agrupavam por dezena ("11".."19"
// caíam todos do mesmo lado de `% 100`, deixando faixas inteiras sem fita).
// Passar por este mix espalha ids consecutivos de forma uniforme.
function mix32(h) {
  h = Math.imul(h ^ (h >>> 16), 0x45d9f3b);
  h = Math.imul(h ^ (h >>> 16), 0x45d9f3b);
  h =        h ^ (h >>> 16);
  return h >>> 0;
}

/** Hash bem-distribuído de qualquer chave, derivado do id (+ sufixo opcional). */
function hashed(key) {
  return mix32(simpleHash(String(key)));
}

/** Rotação da polaroid: 4, 5 ou 6 graus, derivada do id. */
export function polaroidRotation(id) {
  return 4 + (hashed(id + "p") % 3);
}

/**
 * Retorna null se o card não tem fita, ou { variant, left, rotation } se tem.
 * Tudo derivado do id → estável entre renders. ~35% dos cards recebem fita.
 */
export function washiDecor(id) {
  const s = String(id);
  if (hashed(s) % 100 >= 35) return null;
  return {
    variant:  hashed(s + "v") % 2 === 0 ? "sage" : "rose",
    left:     16 + (hashed(s + "l") % 40),
    rotation: -8 + (hashed(s + "r") % 16),
  };
}

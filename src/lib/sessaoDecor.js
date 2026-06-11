// Decoração determinística da "Nossa Sessão" — derivada do id, estável entre
// renders. Espelha a técnica de hash do dateDecor.js (djb2 + finalizador mix32)
// para distribuir bem ids sequenciais e evitar agrupamentos por dezena.

function simpleHash(str) {
  let h = 5381;
  for (let i = 0; i < str.length; i++) {
    h = ((h << 5) + h + str.charCodeAt(i)) & 0x7fffffff;
  }
  return h;
}

function mix32(h) {
  h = Math.imul(h ^ (h >>> 16), 0x45d9f3b);
  h = Math.imul(h ^ (h >>> 16), 0x45d9f3b);
  h =        h ^ (h >>> 16);
  return h >>> 0;
}

/** Hash bem-distribuído de qualquer chave derivada do id. */
function hashed(key) {
  return mix32(simpleHash(String(key)));
}

// Gradientes-fallback do pôster: sempre escurecendo em direção ao verde do
// projeto, mas variando o topo (verde / quente / azulado / oliva) pra não
// repetir entre cards vizinhos.
const POSTER_GRADIENTS = [
  "linear-gradient(160deg, #2a3d2f, #0A3323)",
  "linear-gradient(160deg, #3a2f2f, #0A3323)",
  "linear-gradient(160deg, #2f3a3d, #0A3323)",
  "linear-gradient(160deg, #34352a, #0A3323)",
];

/** Gradiente de fallback do pôster (quando não há poster_path). */
export function posterGradient(id) {
  return POSTER_GRADIENTS[hashed(id + "g") % POSTER_GRADIENTS.length];
}

/** Rotação "colado" do card: -1.0° a +1.0°, derivada do id. */
export function cardRotation(id) {
  return -1 + hashed(id + "rot") % 21 / 10; // 0..20 → -1.0..+1.0
}

/**
 * Washi tape ~35% dos cards. Retorna null ou { variant, left, rotation }.
 * Mesma lógica do dateDecor: estável e bem distribuída por id.
 */
export function washiDecor(id) {
  const s = String(id);
  if (hashed(s) % 100 >= 35) return null;
  return {
    variant:  hashed(s + "v") % 2 === 0 ? "sage" : "rose",
    left:     16 + hashed(s + "l") % 36,
    rotation: -6 + hashed(s + "r") % 12,
  };
}

/** Nota do casal → "★ 9,2" / "★ 10" (decimal com vírgula, pt-BR).
 *  Coage a número: o Supabase pode devolver `numeric` como string. */
export function formatRating(rating) {
  if (rating == null || rating === "") return "";
  const r = Number(rating);
  if (Number.isNaN(r)) return "";
  const text = r === 10 ? "10" : r.toFixed(1).replace(".", ",");
  return `★ ${text}`;
}

import { hashed } from "./dateDecor";

// Decor determinístico das memórias do Mural — derivado do id, estável entre
// renders (mesmo princípio do dateDecor: reaproveita o hash bem-distribuído).

// Cor do push-pin (tachinha 3D). Variam por item pra dar vida ao mural.
const PIN_COLORS = ["red", "green", "gold", "rose", "blue"];
export function pinColor(id) {
  return PIN_COLORS[hashed(id + "pin") % PIN_COLORS.length];
}

// Inclinação leve da polaroid: -1.5° a 1.5° (ritmo de mural fixado à mão).
export function cardTilt(id) {
  return ((hashed(id + "tilt") % 31) - 15) / 10;
}

// Aspect-ratio da foto — alterna pra quebrar o grid do masonry.
const ASPECTS = ["4 / 5", "1 / 1", "3 / 4"];
export function photoAspect(id) {
  return ASPECTS[hashed(id + "asp") % ASPECTS.length];
}

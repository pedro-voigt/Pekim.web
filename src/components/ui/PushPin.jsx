// Tachinha 3D (push-pin visto de frente): círculo com brilho via radial-gradient
// e sombra projetada. Reaproveitável (Mural, e onde mais precisar fixar algo).
// Posiciona-se absoluto no topo-centro do pai (que deve ser position: relative).
const PALETTE = {
  red:   ["#e8a0a0", "#b34a4a"],
  green: ["#a8c08a", "#5e7a3e"],
  gold:  ["#e8d090", "#b39a3e"],
  rose:  ["#e6b2a8", "#bf6f63"],
  blue:  ["#9db8c8", "#4a6b7e"],
};

export default function PushPin({ color = "red", size = 14 }) {
  const [light, dark] = PALETTE[color] ?? PALETTE.red;
  return (
    <div style={{
      position:      "absolute",
      top:           `-${Math.round(size * 0.64)}px`,
      left:          "50%",
      transform:     "translateX(-50%)",
      width:         size,
      height:        size,
      borderRadius:  "50%",
      background:    `radial-gradient(circle at 35% 30%, ${light}, ${dark})`,
      boxShadow:     "0 3px 5px rgba(0,0,0,0.3)",
      zIndex:        3,
      pointerEvents: "none",
    }} />
  );
}

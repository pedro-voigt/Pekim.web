import L from "leaflet";

// Gera o L.divIcon do alfinete (SVG: agulha + cabeça com brilho + sombra).
// Cor por estado, seguindo a convenção do app:
//   normal     → verde escuro #0A3323 (legível sobre o mapa claro)
//   selecionado → rosa #D3968C (acento "ativo" usado em todo o projeto)
const W = 30;
const H = 42;

export function makePinIcon({ active = false } = {}) {
  const head = active ? "#D3968C" : "#0A3323";
  const shine = active ? "#ecc3bc" : "#2e5c3a";

  const html = `
    <svg width="${W}" height="${H}" viewBox="0 0 30 42" xmlns="http://www.w3.org/2000/svg"
         style="display:block;filter:drop-shadow(0 3px 3px rgba(0,0,0,0.35));">
      <defs>
        <radialGradient id="ph${active ? "a" : "n"}" cx="35%" cy="28%" r="78%">
          <stop offset="0%" stop-color="${shine}"/>
          <stop offset="100%" stop-color="${head}"/>
        </radialGradient>
      </defs>
      <line x1="15" y1="15" x2="15" y2="41" stroke="#5f5f5f" stroke-width="1.6"/>
      <line x1="15" y1="15" x2="15" y2="41" stroke="#d0d0d0" stroke-width="0.6"/>
      <circle cx="15" cy="12" r="11" fill="url(#ph${active ? "a" : "n"})"
              stroke="rgba(0,0,0,0.25)" stroke-width="0.8"/>
      <circle cx="11" cy="8" r="3.2" fill="rgba(255,255,255,0.5)"/>
    </svg>`;

  return L.divIcon({
    html,
    className: "cork-pin",          // classe vazia → remove o quadrado branco padrão do leaflet
    iconSize: [W, H],
    iconAnchor: [15, 41],          // ponta da agulha cai exatamente na coordenada
    popupAnchor: [0, -36],
  });
}

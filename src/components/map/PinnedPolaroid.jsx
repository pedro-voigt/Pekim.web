// Polaroid decorativa presa na borda da cortiça (NÃO presa a coordenadas do
// mapa — por isso não some ao arrastar). pointer-events:none → o mapa segue
// navegável por baixo. Estética: foto inclinada + sombra suave (igual à Home),
// com washi tape (fita translúcida) ou tachinha (círculo com gradiente).

function WashiTape() {
  return (
    <div style={{
      position: "absolute", top: "-9px", left: "50%",
      width: "56px", height: "18px",
      transform: "translateX(-50%) rotate(-6deg)",
      background: "rgba(211,150,140,0.55)",      // rosa translúcido
      boxShadow: "0 1px 2px rgba(0,0,0,0.15)",
    }} />
  );
}

function Tack() {
  return (
    <div style={{
      position: "absolute", top: "-7px", left: "50%",
      width: "16px", height: "16px", borderRadius: "50%",
      transform: "translateX(-50%)",
      background: "radial-gradient(circle at 35% 30%, #ecc3bc, #D3968C 65%, #b56a5e)",
      boxShadow: "0 2px 3px rgba(0,0,0,0.35)",
    }} />
  );
}

export default function PinnedPolaroid({
  caption,
  rotate = -4,
  pin = "tape",       // "tape" | "tack"
  src,                // url opcional; sem src → placeholder gradiente (estilo Home)
  style,              // posição (top/left/right/bottom)
  hidden = false,     // some suavemente (ex.: quando o painel está aberto)
}) {
  return (
    <div style={{
      position: "absolute",
      width: "104px",
      background: "#fff",
      padding: "8px 8px 18px",
      boxShadow: "0 8px 18px rgba(0,0,0,0.32)",
      transform: `rotate(${rotate}deg)`,
      pointerEvents: "none",          // decoração: nunca captura clique
      zIndex: 550,                    // acima da vinheta (500), abaixo do painel (600)
      opacity: hidden ? 0 : 1,
      transition: "opacity 0.25s ease",
      ...style,
    }}>
      {pin === "tape" ? <WashiTape /> : <Tack />}
      <div style={{
        height: "84px",
        background: src
          ? `center / cover no-repeat url(${src})`
          : "linear-gradient(135deg, #839958, #0A3323)",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        {!src && <span style={{ fontSize: "22px", color: "rgba(247,244,213,0.6)" }}>♡</span>}
      </div>
      {caption && (
        <div style={{
          fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic",
          fontSize: "11px", color: "#5a8060", textAlign: "center",
          paddingTop: "6px", whiteSpace: "nowrap",
        }}>{caption}</div>
      )}
    </div>
  );
}

import { useState } from "react";

const C = {
  green:    "#0A3323",
  sage:     "#839958",
  rose:     "#D3968C",
  paper:    "#F7F4D5",
  greensoft: "#2e5c3a",
};

const STATUS_TEXT = {
  "Quero fazer": "que vocês querem fazer",
  "Planejado":   "planejada",
  "Feito":       "que já fizeram",
};

function buildTitle(filter, statusFilter) {
  const cat  = filter       !== "Todos" ? filter       : null;
  const stat = statusFilter !== "Todos" ? STATUS_TEXT[statusFilter] ?? statusFilter : null;

  if (cat && stat)  return `nenhuma aventura ${stat} em "${cat}" por aqui… ainda`;
  if (cat)          return `nenhuma aventura em "${cat}" por aqui… ainda`;
  if (stat)         return `nenhuma aventura ${stat} por aqui… ainda`;
  return "nenhuma aventura por aqui… ainda";
}

function buildButton(filter) {
  if (filter !== "Todos") return `+ inventar uma em ${filter}`;
  return "+ inventar uma aventura";
}

export default function DatesEmptyState({ filter, statusFilter, onInventar }) {
  const [hover, setHover] = useState(false);

  return (
    <div style={{
      textAlign:  "center",
      padding:    "72px 24px",
      maxWidth:   "420px",
      margin:     "0 auto",
    }}>
      <div style={{
        fontFamily: "'Playfair Display', serif",
        fontSize:   "32px",
        color:      C.sage,
        opacity:    0.5,
        marginBottom: "20px",
        lineHeight: 1,
      }}>
        ✦
      </div>

      <h2 style={{
        fontFamily:    "'Playfair Display', serif",
        fontStyle:     "italic",
        fontWeight:    400,
        fontSize:      "clamp(18px, 4vw, 22px)",
        color:         C.green,
        margin:        "0 0 14px",
        lineHeight:    1.3,
        letterSpacing: "-0.01em",
      }}>
        {buildTitle(filter, statusFilter)}
      </h2>

      <p style={{
        fontFamily: "'Cormorant Garamond', serif",
        fontStyle:  "italic",
        fontSize:   "15px",
        color:      C.sage,
        lineHeight: 1.7,
        margin:     "0 0 28px",
      }}>
        esse cantinho está esperando a próxima ideia maluca de vocês dois.
        que tal inventar uma agora?
      </p>

      <button
        onClick={onInventar}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        style={{
          fontFamily:    "'Cormorant Garamond', serif",
          fontStyle:     "italic",
          fontSize:      "14px",
          color:         hover ? C.paper : C.green,
          background:    hover ? C.green : "transparent",
          border:        `1px solid ${C.green}`,
          padding:       "10px 24px",
          cursor:        "pointer",
          transition:    "all 0.2s",
          letterSpacing: "0.02em",
        }}
      >
        {buildButton(filter)}
      </button>
    </div>
  );
}

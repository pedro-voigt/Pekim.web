import { useState } from "react";

import PushPin from "../ui/PushPin";

const C = { green: "#0A3323", sage: "#839958", rose: "#D3968C", paper: "#F7F4D5" };

// Voz do casal por filtro. "todos" vazio = mural realmente vazio (CTA de adicionar);
// "sonhos"/"viagens" vazios = nada com esse recorte (CTA volta pra "todos").
const COPY = {
  todos: {
    title:   "o mural ainda está vazio…",
    sub:     "qual memória a gente pendura primeiro?",
    cta:     "+ pendurar a primeira memória",
    primary: true,
  },
  sonhos: {
    title:   "nenhum sonho virou memória… ainda",
    sub:     "quando vocês realizarem um item da lista, ele aparece aqui com o selo ✦.",
    cta:     "ver todas as memórias",
    primary: false,
  },
  viagens: {
    title:   "nenhuma viagem fixada no mural… ainda",
    sub:     "as memórias com um lugar marcado aparecem aqui — e no mapa 📍.",
    cta:     "ver todas as memórias",
    primary: false,
  },
};

// Polaroid vazia (tracejada) com push-pin — esperando a primeira memória.
function EmptyPolaroid() {
  return (
    <div style={{ position: "relative", width: "92px", margin: "0 auto 26px" }}>
      <PushPin color="rose" />
      <div style={{
        background: "#fff",
        padding:    "8px 8px 0",
        boxShadow:  "0 6px 18px rgba(10,51,35,0.16)",
        transform:  "rotate(-3deg)",
      }}>
        <div style={{
          aspectRatio:    "4 / 5",
          border:         "1px dashed #c8cda2",
          display:        "flex",
          alignItems:     "center",
          justifyContent: "center",
          color:          C.sage,
          opacity:        0.6,
          fontSize:       "24px",
        }}>
          ✦
        </div>
        <div style={{ height: "18px" }} />
      </div>
    </div>
  );
}

export default function MuralEmptyState({ filter = "todos", onReset, onAdd }) {
  const [hover, setHover] = useState(false);
  const copy = COPY[filter] || COPY.todos;
  const handleClick = copy.primary ? onAdd : onReset;

  return (
    <div style={{
      textAlign: "center",
      padding:   "56px 24px 64px",
      maxWidth:  "420px",
      margin:    "0 auto",
      animation: "fadeIn 0.5s ease both",
    }}>
      <EmptyPolaroid />

      <h2 style={{
        fontFamily:    "'Playfair Display', serif",
        fontStyle:     "italic",
        fontWeight:    400,
        fontSize:      "clamp(18px, 4vw, 22px)",
        color:         C.green,
        margin:        "0 0 12px",
        lineHeight:    1.3,
        letterSpacing: "-0.01em",
      }}>
        {copy.title}
      </h2>

      <p style={{
        fontFamily: "'Cormorant Garamond', serif",
        fontStyle:  "italic",
        fontSize:   "15px",
        color:      C.sage,
        lineHeight: 1.7,
        margin:     "0 0 26px",
      }}>
        {copy.sub}
      </p>

      {handleClick && (
        <button
          onClick={handleClick}
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
          {copy.cta}
        </button>
      )}
    </div>
  );
}

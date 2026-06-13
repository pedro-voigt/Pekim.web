import useMediaQuery from "../../hooks/useMediaQuery";

const C = { green: "#0A3323", sage: "#839958", rose: "#D3968C" };

function Stat({ n, label }) {
  return (
    <div style={{ display: "flex", alignItems: "baseline", gap: "0.5rem" }}>
      <span style={{
        fontFamily: "'Playfair Display', serif",
        fontWeight: 700,
        fontSize:   "26px",
        color:      C.rose,
        lineHeight: 1,
      }}>
        {n}
      </span>
      <span style={{
        fontFamily:    "'Cormorant Garamond', serif",
        fontStyle:     "italic",
        fontSize:      "15px",
        letterSpacing: "0.06em",
        textTransform: "uppercase",
        color:         C.sage,
      }}>
        {label}
      </span>
    </div>
  );
}

// Cabeçalho "etiqueta de arquivo" — alinhado à esquerda: tag verde rotacionada
// (como uma etiqueta colada), título Playfair grande e contagem dupla à esquerda.
export default function MemoriesHeader({ momentos, lugares }) {
  const isMobile = useMediaQuery("(max-width: 560px)");

  return (
    <div style={{ textAlign: "left", marginBottom: isMobile ? "24px" : "32px" }}>
      <span style={{
        display:       "inline-block",
        background:    C.green,
        color:         "#F7F4D5",
        fontFamily:    "'Cormorant Garamond', serif",
        fontStyle:     "italic",
        fontSize:      "12px",
        letterSpacing: "0.12em",
        textTransform: "uppercase",
        padding:       "4px 14px",
        borderRadius:  "3px",
        transform:     "rotate(-2.5deg)",
        transformOrigin: "left center",
        boxShadow:     "0 2px 6px rgba(10,51,35,0.2)",
        marginBottom:  "0.6rem",
      }}>
        arquivo do nosso tempo
      </span>

      <h1 style={{
        fontFamily:    "'Playfair Display', serif",
        fontWeight:    900,
        fontSize:      "clamp(46px, 14vw, 58px)",
        lineHeight:    0.88,
        margin:        "0 0 0.5rem",
        color:         C.green,
        letterSpacing: "-0.01em",
      }}>
        Memórias
      </h1>

      <div style={{
        fontFamily: "'Cormorant Garamond', serif",
        fontStyle:  "italic",
        fontSize:   isMobile ? "18px" : "21px",
        color:      C.green,
        opacity:    0.75,
        lineHeight: 1.35,
        maxWidth:   "560px",
      }}>
        Os momentos que a gente guardou — e os lugares onde eles aconteceram.
      </div>

      <div style={{
        display:    "flex",
        flexWrap:   "wrap",
        alignItems: "baseline",
        gap:        "1.6rem",
        margin:     isMobile ? "1.2rem 0 1.2rem" : "1.4rem 0 1.4rem",
      }}>
        <Stat n={momentos} label="momentos" />
        <Stat n={lugares} label="lugares no mapa" />
      </div>

      {/* Filete full-width fechando o cabeçalho — mesmo recurso da página Dates */}
      <div style={{ height: "1px", background: C.green, opacity: 0.18 }} />
    </div>
  );
}

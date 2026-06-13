import useMediaQuery from "../../hooks/useMediaQuery";

const C = {
  green: "#0A3323",
  sage:  "#839958",
  rose:  "#D3968C",
};

export default function BucketHeader({ realizados, pendentes }) {
  const isMobile = useMediaQuery("(max-width: 560px)");

  // Filete fino que emoldura a contagem (um de cada lado).
  const filete = { height: "1px", width: "36px", background: C.sage, opacity: 0.5 };

  return (
    <div style={{ textAlign: "center", maxWidth: "560px", margin: "0 auto 2.6rem" }}>
      <div style={{
        fontFamily:    "'Cormorant Garamond', serif",
        fontStyle:     "italic",
        fontSize:      "16px",
        letterSpacing: "0.16em",
        textTransform: "uppercase",
        color:         C.sage,
        marginBottom:  "0.5rem",
      }}>
        tudo o que a gente quer viver
      </div>

      {/* Ornamento — três ✦ entre o eyebrow e o título */}
      <div aria-hidden="true" style={{
        fontSize:      "15px",
        color:         C.sage,
        letterSpacing: "0.5em",
        textIndent:    "0.5em", // compensa o espaço após o último ✦ → ótica centrada
        margin:        "0 0 0.5rem",
      }}>
        ✦✦✦
      </div>

      <h1 style={{
        fontFamily:    "'Playfair Display', serif",
        fontWeight:    900,
        fontSize:      "clamp(52px, 13vw, 68px)",
        lineHeight:    0.98,
        margin:        "0 0 0.6rem",
        color:         C.green,
        letterSpacing: "-0.01em",
      }}>
        Nossos Sonhos
      </h1>

      <div style={{
        fontFamily: "'Cormorant Garamond', serif",
        fontStyle:  "italic",
        fontSize:   isMobile ? "18px" : "21px",
        color:      C.green,
        opacity:    0.75,
        lineHeight: 1.35,
      }}>
        Uma lista de promessas — algumas já viraram memória, outras esperam a vez.
      </div>

      {/* Contagem dupla emoldurada por filetes finos */}
      <div style={{
        display:        "flex",
        justifyContent: "center",
        alignItems:     "center",
        gap:            "16px",
        marginTop:      "1.6rem",
      }}>
        <span style={filete} />
        <div style={{
          fontFamily:    "'Cormorant Garamond', serif",
          fontStyle:     "italic",
          fontSize:      "16px",
          letterSpacing: "0.06em",
          color:         C.sage,
          whiteSpace:    "nowrap",
        }}>
          <span style={{
            fontFamily: "'Playfair Display', serif",
            fontStyle:  "normal",
            fontWeight: 700,
            fontSize:   "24px",
            color:      C.rose,
          }}>{realizados}</span>{" "}
          realizados
          <span style={{ color: C.rose, margin: "0 0.45em" }}>·</span>
          <span style={{
            fontFamily: "'Playfair Display', serif",
            fontStyle:  "normal",
            fontWeight: 700,
            fontSize:   "24px",
            color:      C.rose,
          }}>{pendentes}</span>{" "}
          pela frente
        </div>
        <span style={filete} />
      </div>
    </div>
  );
}

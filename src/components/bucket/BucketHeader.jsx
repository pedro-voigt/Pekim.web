import useMediaQuery from "../../hooks/useMediaQuery";

const C = {
  green: "#0A3323",
  sage:  "#839958",
  rose:  "#D3968C",
};

function Count({ n, label, isMobile }) {
  return (
    <div>
      <div style={{
        fontFamily: "'Playfair Display', serif",
        fontWeight: 700,
        fontSize:   isMobile ? "34px" : "40px",
        color:      C.rose,
        lineHeight: 1,
      }}>
        {n}
      </div>
      <div style={{
        fontFamily:    "'Cormorant Garamond', serif",
        fontStyle:     "italic",
        fontSize:      "15px",
        letterSpacing: "0.08em",
        textTransform: "uppercase",
        color:         C.sage,
        marginTop:     "4px",
      }}>
        {label}
      </div>
    </div>
  );
}

export default function BucketHeader({ realizados, pendentes }) {
  const isMobile = useMediaQuery("(max-width: 560px)");

  return (
    <div style={{ textAlign: "center", maxWidth: "560px", margin: "0 auto 2.6rem" }}>
      <div style={{
        fontFamily:    "'Cormorant Garamond', serif",
        fontStyle:     "italic",
        fontSize:      "16px",
        letterSpacing: "0.18em",
        textTransform: "uppercase",
        color:         C.sage,
        marginBottom:  "0.7rem",
      }}>
        tudo o que a gente quer viver
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

      <div style={{
        display:        "flex",
        justifyContent: "center",
        alignItems:     "stretch",
        gap:            "2.5rem",
        marginTop:      "1.6rem",
      }}>
        <Count n={realizados} label="realizados" isMobile={isMobile} />
        <div style={{ width: "1px", background: C.sage, opacity: 0.3 }} />
        <Count n={pendentes} label="pela frente" isMobile={isMobile} />
      </div>
    </div>
  );
}

import { useState } from "react";

const C = {
  green: "#0A3323",
  sage:  "#839958",
  paper: "#F7F4D5",
};

export default function BucketEmptyState({ onSonhar }) {
  const [hover, setHover] = useState(false);

  return (
    <div style={{ textAlign: "center", padding: "64px 24px", maxWidth: "440px", margin: "0 auto" }}>
      <div style={{
        fontFamily:   "'Playfair Display', serif",
        fontSize:     "34px",
        color:        C.sage,
        opacity:      0.5,
        marginBottom: "20px",
        lineHeight:   1,
      }}>
        ✦
      </div>

      <h2 style={{
        fontFamily: "'Playfair Display', serif",
        fontStyle:  "italic",
        fontWeight: 400,
        fontSize:   "clamp(19px, 4vw, 23px)",
        color:      C.green,
        margin:     "0 0 14px",
        lineHeight: 1.3,
      }}>
        a lista ainda está em branco…<br />qual é o primeiro sonho?
      </h2>

      <p style={{
        fontFamily: "'Cormorant Garamond', serif",
        fontStyle:  "italic",
        fontSize:   "16px",
        color:      C.sage,
        lineHeight: 1.7,
        margin:     "0 0 28px",
      }}>
        toda memória que vocês ainda vão criar começa com uma promessa escrita aqui.
      </p>

      <button
        onClick={onSonhar}
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
        + sonhar o primeiro sonho
      </button>
    </div>
  );
}

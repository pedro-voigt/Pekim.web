import { useState, useRef } from "react";

import { supabase } from "../lib/supabase";
import PageHeader from "../components/ui/PageHeader";

const ASSUNTOS = [
  "Destino dos sonhos", "Memória favorita",
  "Algo que quero te contar", "Um elogio sincero",
  "Plano para o próximo mês",
];

const MODES = [
  { key: "filme", label: "Filme", icon: "◎" },
  { key: "date", label: "Date", icon: "✦" },
  { key: "assunto", label: "Assunto", icon: "◇" },
];

const RESULT_LABEL = { filme: "assistam", date: "façam", assunto: "falem sobre" };

// Paleta das fatias (alterna). Só #0A3323 é escura → texto creme nela.
const SLICE_COLORS = ["#839958", "#D3968C", "#a8bc80", "#0A3323", "#b8d4d8", "#c9ddb0", "#b5c490"];
const SPINS = 5; // voltas inteiras antes de parar

// Math.random fora do componente (não pode no caminho de render).
const randInt = (n) => Math.floor(Math.random() * n);

async function fetchPool(key) {
  if (key === "filme") {
    const { data } = await supabase.from("movies").select("title").eq("watched", false);
    return (data || []).map(m => m.title);
  }
  if (key === "date") {
    const { data } = await supabase.from("dates").select("name").neq("status", "Feito");
    return (data || []).map(d => d.name);
  }
  return ASSUNTOS;
}

const polar = (r, deg) => {
  const rad = (deg * Math.PI) / 180;
  return [100 + r * Math.cos(rad), 100 + r * Math.sin(rad)];
};

const truncate = (s, n) => (s.length > n ? s.slice(0, n - 1) + "…" : s);

// ── A roda em si ──────────────────────────────────────────────────────────────
function Wheel({ items, rotation, spinning, onSpin, onSettled }) {
  const n = items.length;
  const ang = 360 / n;
  const fontSize = n <= 6 ? 11 : n <= 10 ? 9 : n <= 16 ? 7 : 6;
  const maxChars = n <= 6 ? 16 : n <= 12 ? 12 : 9;

  return (
    <div style={{ position: "relative", width: "min(78vw, 360px)", aspectRatio: "1", margin: "0 auto" }}>
      {/* Ponteiro fixo no topo, apontando pra dentro */}
      <div style={{
        position: "absolute", top: "-2px", left: "50%", transform: "translateX(-50%)",
        width: 0, height: 0, zIndex: 2,
        borderLeft: "12px solid transparent", borderRight: "12px solid transparent",
        borderTop: "20px solid #0A3323",
        filter: "drop-shadow(0 2px 2px rgba(0,0,0,0.3))",
      }} />

      <svg
        viewBox="0 0 200 200"
        onTransitionEnd={onSettled}
        style={{
          width: "100%", height: "100%",
          transform: `rotate(${rotation}deg)`,
          transformOrigin: "center",
          transition: "transform 4.2s cubic-bezier(0.16, 1, 0.3, 1)",
          filter: "drop-shadow(0 8px 20px rgba(10,51,35,0.25))",
        }}
      >
        {items.map((item, i) => {
          const a0 = i * ang, a1 = (i + 1) * ang, mid = a0 + ang / 2;
          const [x0, y0] = polar(96, a0);
          const [x1, y1] = polar(96, a1);
          const large = ang > 180 ? 1 : 0;
          const bg = SLICE_COLORS[i % SLICE_COLORS.length];
          const fg = bg === "#0A3323" ? "#F7F4D5" : "#16331f";
          const flip = mid > 90 && mid < 270;
          const [lx] = polar(58, 0); // raio do rótulo (x antes da rotação)
          return (
            <g key={i}>
              <path
                d={`M100 100 L ${x0} ${y0} A 96 96 0 ${large} 1 ${x1} ${y1} Z`}
                fill={bg}
                stroke="#F7F4D5"
                strokeWidth="1"
              />
              <text
                transform={`rotate(${mid} 100 100)${flip ? ` rotate(180 ${lx} 100)` : ""}`}
                x={lx}
                y="100"
                textAnchor="middle"
                dominantBaseline="middle"
                fill={fg}
                fontSize={fontSize}
                fontFamily="'Cormorant Garamond', serif"
                fontStyle="italic"
              >{truncate(item, maxChars)}</text>
            </g>
          );
        })}
        <circle cx="100" cy="100" r="96" fill="none" stroke="#F7F4D5" strokeWidth="2" />
      </svg>

      {/* Cubo central = botão girar (não gira junto) */}
      <button
        onClick={onSpin}
        disabled={spinning}
        aria-label="Girar a roleta"
        style={{
          position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)",
          width: "22%", height: "22%", borderRadius: "50%",
          background: "#F7F4D5", border: "3px solid #0A3323",
          cursor: spinning ? "default" : "pointer", zIndex: 2,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic",
          fontSize: "clamp(11px, 2.6vw, 14px)", color: "#0A3323",
          boxShadow: "0 2px 8px rgba(10,51,35,0.25)",
        }}
      >{spinning ? "…" : "girar"}</button>
    </div>
  );
}

export default function SorteadorPage() {
  const [mode, setMode] = useState(null);
  const [pool, setPool] = useState([]);
  const [loadingPool, setLoadingPool] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState(null);
  const pendingRef = useRef(null);

  const selecionar = async (key) => {
    if (spinning) return;
    setMode(key);
    setResult(null);
    setPool([]);
    setLoadingPool(true);
    const p = await fetchPool(key);
    setPool(p);
    setLoadingPool(false);
  };

  const girar = () => {
    if (spinning || pool.length === 0) return;
    const k = randInt(pool.length);
    pendingRef.current = pool[k];
    const ang = 360 / pool.length;
    const centerK = (k + 0.5) * ang;
    const targetMod = ((270 - centerK) % 360 + 360) % 360;
    const current = ((rotation % 360) + 360) % 360;
    let delta = targetMod - current;
    if (delta < 0) delta += 360;
    setResult(null);
    setSpinning(true);
    setRotation(rotation + SPINS * 360 + delta);
  };

  const settled = () => {
    if (!spinning) return;
    setSpinning(false);
    setResult(pendingRef.current);
  };

  return (
    <div style={{
      padding: "40px 24px",
      maxWidth: "600px", margin: "0 auto",
      minHeight: "70vh", display: "flex", flexDirection: "column",
    }}>
      <PageHeader title="O que fazemos hoje?" sub="Deixa a roleta decidir por vocês" icon="⟳" />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "2px", marginBottom: "40px" }}>
        {MODES.map(opt => (
          <button
            key={opt.key}
            onClick={() => selecionar(opt.key)}
            disabled={spinning}
            style={{
              fontFamily: "'Playfair Display', serif", fontSize: "14px",
              color: mode === opt.key ? "#fff" : "#0A3323",
              background: mode === opt.key ? "#0A3323" : "#F7F4D5",
              border: "none", padding: "20px 16px",
              cursor: spinning ? "default" : "pointer", transition: "all 0.3s",
              display: "flex", flexDirection: "column", alignItems: "center", gap: "8px",
            }}
          >
            <span style={{ fontSize: "22px" }}>{opt.icon}</span>
            <span>Sortear {opt.label}</span>
          </button>
        ))}
      </div>

      <div style={{
        flex: 1, display: "flex", alignItems: "center", justifyContent: "center",
        flexDirection: "column", gap: "28px", padding: "32px 0", minHeight: "320px",
      }}>
        {!mode ? (
          <div style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontSize: "16px", color: "#a8bc80", textAlign: "center" }}>
            Escolha uma opção acima<br />e gire a roleta ✦
          </div>
        ) : loadingPool ? (
          <div style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontSize: "18px", color: "#5a8060", animation: "pulse 0.8s infinite" }}>✦ ✦ ✦</div>
        ) : pool.length === 0 ? (
          <div style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontSize: "16px", color: "#a8bc80", textAlign: "center" }}>
            Nada na fila por agora ✦
          </div>
        ) : (
          <>
            <Wheel
              items={pool}
              rotation={rotation}
              spinning={spinning}
              onSpin={girar}
              onSettled={settled}
            />
            <div style={{ minHeight: "60px", textAlign: "center" }}>
              {result && !spinning && (
                <div style={{ animation: "fadeIn 0.4s ease" }}>
                  <div style={{ fontSize: "11px", letterSpacing: "0.2em", textTransform: "uppercase", color: "#5a8060", fontFamily: "'Cormorant Garamond', serif", marginBottom: "6px" }}>
                    {RESULT_LABEL[mode]}
                  </div>
                  <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(20px, 5vw, 30px)", fontWeight: "400", color: "#0A3323", margin: 0, lineHeight: 1.3 }}>{result}</h2>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

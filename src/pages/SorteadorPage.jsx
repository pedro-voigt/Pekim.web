import { useState } from "react";

import { supabase } from "../lib/supabase";
import PageHeader from "../components/ui/PageHeader";

const ASSUNTOS = [
  "Destino dos sonhos", "Memória favorita",
  "Algo que quero te contar", "Um elogio sincero",
  "Plano para o próximo mês",
];

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

// Sorteio fora do componente: Math.random não pode rodar no caminho de render.
function sortear(pool) {
  return pool.length > 0
    ? pool[Math.floor(Math.random() * pool.length)]
    : "Nada na fila por agora ✦";
}

export default function SorteadorPage() {
  const [mode, setMode] = useState(null);
  const [result, setResult] = useState(null);
  const [spinning, setSpinning] = useState(false);

  const spin = async (key) => {
    setMode(key);
    setSpinning(true);
    setResult(null);

    const [pool] = await Promise.all([
      fetchPool(key),
      new Promise(r => setTimeout(r, 1200)),
    ]);

    setResult(sortear(pool));
    setSpinning(false);
  };

  return (
    <div style={{
      padding: "40px 24px",
      maxWidth: "600px", margin: "0 auto",
      minHeight: "70vh", display: "flex", flexDirection: "column",
    }}>
      <PageHeader title="O que fazemos hoje?" sub="Deixa a gente decidir por vocês" icon="⟳" />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "2px", marginBottom: "48px" }}>
        {[
          { key: "filme", label: "Sortear Filme", icon: "◎" },
          { key: "date", label: "Sortear Date", icon: "✦" },
          { key: "assunto", label: "Assunto", icon: "◇" },
        ].map(opt => (
          <button
            key={opt.key}
            onClick={() => spin(opt.key)}
            style={{
              fontFamily: "'Playfair Display', serif", fontSize: "14px",
              color: mode === opt.key ? "#fff" : "#0A3323",
              background: mode === opt.key ? "#0A3323" : "#F7F4D5",
              border: "none", padding: "24px 16px",
              cursor: "pointer", transition: "all 0.3s",
              display: "flex", flexDirection: "column", alignItems: "center", gap: "8px",
            }}
          >
            <span style={{ fontSize: "22px" }}>{opt.icon}</span>
            <span>{opt.label}</span>
          </button>
        ))}
      </div>

      <div style={{
        flex: 1, display: "flex", alignItems: "center", justifyContent: "center",
        flexDirection: "column", gap: "16px",
        padding: "48px", background: "#F7F4D5", minHeight: "200px",
      }}>
        {spinning ? (
          <div style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontSize: "18px", color: "#5a8060", animation: "pulse 0.8s infinite" }}>✦ ✦ ✦</div>
        ) : result ? (
          <>
            <div style={{ fontSize: "11px", letterSpacing: "0.2em", textTransform: "uppercase", color: "#5a8060", fontFamily: "'Cormorant Garamond', serif" }}>
              {mode === "filme" ? "assistam" : mode === "date" ? "façam" : "falem sobre"}
            </div>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(22px, 5vw, 34px)", fontWeight: "400", color: "#0A3323", textAlign: "center", margin: 0, lineHeight: 1.3 }}>{result}</h2>
            <button
              onClick={() => spin(mode)}
              style={{ marginTop: "8px", fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontSize: "13px", color: "#5a8060", background: "transparent", border: "none", cursor: "pointer", textDecoration: "underline", textDecorationStyle: "dotted" }}
            >sortear de novo</button>
          </>
        ) : (
          <div style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontSize: "16px", color: "#a8bc80", textAlign: "center" }}>
            Escolha uma opção acima<br />e deixa a gente decidir ✦
          </div>
        )}
      </div>
    </div>
  );
}

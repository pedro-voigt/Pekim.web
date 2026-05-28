import { useState } from "react";

import PageHeader from "../components/ui/PageHeader";

import { MEMORIES } from "../content/memories";

export default function MemoriesPage() {
  return (
    <div style={{ padding: "40px 24px", maxWidth: "900px", margin: "0 auto" }}>
      <PageHeader title="Memórias" sub="Tudo que a gente não quer esquecer" icon="◇" />

      {/* Timeline */}
      <div style={{ position: "relative", paddingLeft: "40px" }}>
        {/* Line */}
        <div style={{
          position: "absolute", left: "7px", top: "8px", bottom: "0",
          width: "1px", background: "#D8D9B0",
        }} />

        {MEMORIES.map((m, i) => (
          <div key={m.id} style={{
            position: "relative",
            marginBottom: "48px",
            animation: `fadeIn 0.5s ease ${i * 0.1}s both`,
          }}>
            {/* Dot */}
            <div style={{
              position: "absolute", left: "-34px", top: "6px",
              width: "14px", height: "14px",
              background: m.color,
              border: "2px solid #839958",
              borderRadius: "50%",
            }} />

            <div style={{
              fontSize: "11px",
              letterSpacing: "0.15em",
              textTransform: "uppercase",
              color: "#5a8060",
              marginBottom: "8px",
              fontFamily: "'Cormorant Garamond', serif",
            }}>
              {new Date(m.date + "T12:00:00").toLocaleDateString("pt-BR", {
                day: "2-digit", month: "long", year: "numeric"
              })}
            </div>

            <div style={{
              background: "#F7F4D5",
              padding: "24px 28px",
              borderLeft: `3px solid ${m.color}`,
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "8px" }}>
                <span style={{ fontSize: "24px" }}>{m.emoji}</span>
                <h3 style={{
                  fontFamily: "'Playfair Display', serif",
                  fontSize: "20px", fontWeight: "400",
                  color: "#0A3323", margin: 0,
                }}>{m.title}</h3>
              </div>
              <p style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: "15px", color: "#2e5c3a",
                lineHeight: 1.7, margin: 0,
                fontStyle: "italic",
              }}>{m.desc}</p>
            </div>
          </div>
        ))}

        {/* Add new */}
        <div style={{
          marginLeft: "-40px",
          paddingLeft: "40px",
          borderLeft: "none",
        }}>
          <button style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontStyle: "italic",
            fontSize: "15px",
            color: "#5a8060",
            background: "transparent",
            border: "1px dashed #a8bc80",
            padding: "16px 28px",
            cursor: "pointer",
            width: "100%",
            textAlign: "left",
          }}>
            + adicionar nova memória
          </button>
        </div>
      </div>
    </div>
  );
}
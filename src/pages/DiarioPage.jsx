import { useState, useEffect } from "react";

import PageHeader from "../components/ui/PageHeader";
import { supabase } from "../lib/supabase";

export default function DiarioPage() {
  const [entries, setEntries] = useState([]);
  const [text, setText] = useState("");
  const [selectedPrompt, setSelectedPrompt] = useState(null);
  const [loading, setLoading] = useState(true);

  const prompts = [
    "Melhor momento do mês",
    "Algo que admirei em você",
    "O que quero viver com você",
    "Como me senti hoje",
    "Memória favorita recente",
  ];

  useEffect(() => {
    supabase
      .from("diario")
      .select("*")
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        if (data) setEntries(data);
        setLoading(false);
      });
  }, []);

  const guardar = async () => {
    if (!text.trim()) return;

    const nova = {
      date: new Date().toISOString().split("T")[0],
      prompt: selectedPrompt || "Entrada livre",
      content: text.trim(),
      author: "Pedro",
    };

    const { data, error } = await supabase.from("diario").insert(nova).select().single();

    if (!error && data) {
      setEntries(prev => [data, ...prev]);
      setText("");
      setSelectedPrompt(null);
    }
  };

  return (
    <div style={{ padding: "40px 24px", maxWidth: "680px", margin: "0 auto" }}>
      <PageHeader title="Diário" sub="Pensamentos, sentimentos, momentos" icon="◈" />

      {/* Prompts */}
      <div style={{ marginBottom: "48px" }}>
        <div style={{
          fontSize: "11px", letterSpacing: "0.15em",
          textTransform: "uppercase", color: "#5a8060",
          marginBottom: "16px",
          fontFamily: "'Cormorant Garamond', serif",
        }}>sugestões de entrada</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
          {prompts.map(p => (
            <div
              key={p}
              onClick={() => setSelectedPrompt(selectedPrompt === p ? null : p)}
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontStyle: "italic",
                fontSize: "13px",
                color: selectedPrompt === p ? "#F7F4D5" : "#2e5c3a",
                background: selectedPrompt === p ? "#0A3323" : "#E8E5C8",
                padding: "8px 16px",
                cursor: "pointer",
                transition: "all 0.2s",
              }}
            >{p}</div>
          ))}
        </div>
      </div>

      {/* New entry */}
      <div style={{
        borderTop: "1px solid #D8D9B0",
        paddingTop: "32px",
        marginBottom: "48px",
      }}>
        {selectedPrompt && (
          <div style={{
            fontFamily: "'Playfair Display', serif",
            fontStyle: "italic",
            fontSize: "15px", color: "#D3968C",
            marginBottom: "16px",
          }}>{selectedPrompt}</div>
        )}
        <textarea
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="Escreva algo hoje..."
          style={{
            width: "100%",
            minHeight: "120px",
            fontFamily: "'Cormorant Garamond', serif",
            fontStyle: "italic",
            fontSize: "16px",
            color: "#0A3323",
            background: "transparent",
            border: "none",
            borderBottom: "1px solid #D8D9B0",
            outline: "none",
            resize: "none",
            lineHeight: 1.8,
            padding: "0 0 16px",
            boxSizing: "border-box",
          }}
        />
        <button
          onClick={guardar}
          style={{
            marginTop: "16px",
            fontFamily: "'Cormorant Garamond', serif",
            fontStyle: "italic",
            fontSize: "14px",
            color: text.trim() ? "#0A3323" : "#a8bc80",
            background: "transparent",
            border: `1px solid ${text.trim() ? "#0A3323" : "#D8D9B0"}`,
            padding: "10px 28px",
            cursor: text.trim() ? "pointer" : "default",
            transition: "all 0.2s",
          }}
        >guardar</button>
      </div>

      {/* Entries */}
      {loading ? (
        <div style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontStyle: "italic",
          fontSize: "15px", color: "#a8bc80",
          textAlign: "center", padding: "48px 0",
          animation: "pulse 1.2s infinite",
        }}>✦ ✦ ✦</div>
      ) : entries.length === 0 ? (
        <div style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontStyle: "italic",
          fontSize: "15px", color: "#a8bc80",
          textAlign: "center", padding: "48px 0",
        }}>
          Nenhuma entrada ainda. Escreva algo ✦
        </div>
      ) : entries.map(e => (
        <div key={e.id} style={{
          marginBottom: "32px",
          borderTop: "1px solid #D8D9B0",
          paddingTop: "32px",
        }}>
          <div style={{
            display: "flex", justifyContent: "space-between",
            marginBottom: "16px",
          }}>
            <span style={{
              fontFamily: "'Playfair Display', serif",
              fontStyle: "italic",
              fontSize: "15px", color: "#D3968C",
            }}>{e.prompt}</span>
            <span style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: "12px", color: "#5a8060",
            }}>{new Date(e.date + "T12:00:00").toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })}</span>
          </div>
          <p style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: "17px", color: "#0A3323",
            lineHeight: 1.8, margin: "0 0 8px",
            whiteSpace: "pre-wrap",
          }}>{e.content}</p>
          <span style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontStyle: "italic",
            fontSize: "12px", color: "#a8bc80",
          }}>— {e.author}</span>
        </div>
      ))}
    </div>
  );
}

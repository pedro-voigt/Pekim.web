import { useState, useEffect } from "react";

import PageHeader from "../components/ui/PageHeader";
import { supabase } from "../lib/supabase";

import { OPEN_WHEN } from "../content/openWhen";

export default function AbrirQuandoPage() {
  const [open, setOpen] = useState(null);
  const [editing, setEditing] = useState(null);
  const [cartas, setCartas] = useState({});
  const [draftText, setDraftText] = useState("");

  useEffect(() => {
    supabase
      .from("cartas")
      .select("id, content")
      .then(({ data }) => {
        if (data) {
          const map = {};
          data.forEach(row => { map[row.id] = row.content; });
          setCartas(map);
        }
      });
  }, []);

  const startEdit = (id, e) => {
    e.stopPropagation();
    setEditing(id);
    setDraftText(cartas[id] || "");
  };

  const saveEdit = async (id) => {
    const { error } = await supabase
      .from("cartas")
      .upsert({ id, content: draftText, updated_at: new Date().toISOString() });

    if (!error) {
      setCartas(prev => ({ ...prev, [id]: draftText }));
      setEditing(null);
    }
  };

  const limparCarta = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm("Apagar o conteúdo desta carta?")) return;
    const previous = cartas[id];
    setCartas(prev => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
    const { error } = await supabase.from("cartas").delete().eq("id", id);
    if (error) {
      console.error("[cartas delete]", error);
      setCartas(prev => ({ ...prev, [id]: previous }));
    }
  };

  return (
    <div style={{ padding: "40px 24px", maxWidth: "680px", margin: "0 auto" }}>
      <PageHeader title="Abrir quando…" sub="Cartinhas para os momentos certos" icon="⬡" />

      <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
        {OPEN_WHEN.map(item => (
          <div key={item.id}>
            {/* Header da carta */}
            <div
              onClick={() => setOpen(open === item.id ? null : item.id)}
              style={{
                padding: "24px 28px",
                background: open === item.id ? "#E8E5C8" : "#F7F4D5",
                cursor: "pointer",
                display: "flex", alignItems: "center",
                justifyContent: "space-between",
                transition: "background 0.2s",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                <span style={{ fontSize: "22px" }}>{item.icon}</span>
                <span style={{
                  fontFamily: "'Playfair Display', serif",
                  fontSize: "17px", color: "#0A3323",
                }}>{item.trigger}</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                {cartas[item.id] && (
                  <span style={{
                    fontSize: "10px",
                    letterSpacing: "0.1em",
                    color: "#5a8060",
                    fontFamily: "'Cormorant Garamond', serif",
                    fontStyle: "italic",
                  }}>✦ escrita</span>
                )}
                <span style={{
                  color: "#5a8060", fontSize: "12px",
                  display: "inline-block",
                  transform: open === item.id ? "rotate(90deg)" : "rotate(0deg)",
                  transition: "transform 0.3s",
                }}>›</span>
              </div>
            </div>

            {/* Conteúdo expansível */}
            <div style={{
              maxHeight: open === item.id ? "600px" : "0px",
              overflow: "hidden",
              transition: "max-height 0.4s ease",
            }}>
              <div style={{
                padding: "28px 32px",
                background: "#E8E5C8",
                borderLeft: "2px solid #D3968C",
              }}>
                {editing === item.id ? (
                  <>
                    <textarea
                      autoFocus
                      value={draftText}
                      onChange={e => setDraftText(e.target.value)}
                      placeholder="Escreva sua carta aqui..."
                      style={{
                        width: "100%",
                        minHeight: "160px",
                        fontFamily: "'Cormorant Garamond', serif",
                        fontStyle: "italic",
                        fontSize: "16px",
                        color: "#0A3323",
                        background: "transparent",
                        border: "none",
                        borderBottom: "1px solid #D3968C",
                        outline: "none",
                        resize: "none",
                        lineHeight: 1.8,
                        padding: "0 0 16px",
                        boxSizing: "border-box",
                        marginBottom: "16px",
                      }}
                    />
                    <div style={{ display: "flex", gap: "12px" }}>
                      <button
                        onClick={() => saveEdit(item.id)}
                        style={{
                          fontFamily: "'Cormorant Garamond', serif",
                          fontStyle: "italic",
                          fontSize: "13px",
                          color: "#F7F4D5",
                          background: "#0A3323",
                          border: "none",
                          padding: "8px 20px",
                          cursor: "pointer",
                        }}
                      >guardar carta</button>
                      <button
                        onClick={() => setEditing(null)}
                        style={{
                          fontFamily: "'Cormorant Garamond', serif",
                          fontStyle: "italic",
                          fontSize: "13px",
                          color: "#5a8060",
                          background: "transparent",
                          border: "none",
                          padding: "8px 0",
                          cursor: "pointer",
                        }}
                      >cancelar</button>
                    </div>
                  </>
                ) : cartas[item.id] ? (
                  <>
                    <p style={{
                      fontFamily: "'Cormorant Garamond', serif",
                      fontStyle: "italic",
                      fontSize: "16px", color: "#0A3323",
                      lineHeight: 1.8, margin: "0 0 20px",
                      whiteSpace: "pre-wrap",
                    }}>{cartas[item.id]}</p>
                    <div style={{ display: "flex", gap: "20px", alignItems: "center" }}>
                      <button
                        onClick={(e) => startEdit(item.id, e)}
                        style={{
                          fontFamily: "'Cormorant Garamond', serif",
                          fontStyle: "italic",
                          fontSize: "12px",
                          color: "#5a8060",
                          background: "transparent",
                          border: "none",
                          padding: "0",
                          cursor: "pointer",
                          textDecorationLine: "underline",
                          textDecorationStyle: "dotted",
                        }}
                      >editar carta</button>
                      <button
                        onClick={(e) => limparCarta(item.id, e)}
                        style={{
                          fontFamily: "'Cormorant Garamond', serif",
                          fontStyle: "italic",
                          fontSize: "12px",
                          color: "#D3968C",
                          background: "transparent",
                          border: "none",
                          padding: "0",
                          cursor: "pointer",
                          textDecorationLine: "underline",
                          textDecorationStyle: "dotted",
                        }}
                      >limpar carta</button>
                    </div>
                  </>
                ) : (
                  <>
                    <p style={{
                      fontFamily: "'Cormorant Garamond', serif",
                      fontStyle: "italic",
                      fontSize: "16px", color: "#0A3323",
                      lineHeight: 1.8, margin: "0 0 20px",
                    }}>{item.preview}</p>
                    <button
                      onClick={(e) => startEdit(item.id, e)}
                      style={{
                        fontFamily: "'Cormorant Garamond', serif",
                        fontStyle: "italic",
                        fontSize: "13px",
                        color: "#2e5c3a",
                        background: "transparent",
                        border: "1px solid #D3968C",
                        padding: "8px 20px",
                        cursor: "pointer",
                      }}
                    >escrever esta carta ✦</button>
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

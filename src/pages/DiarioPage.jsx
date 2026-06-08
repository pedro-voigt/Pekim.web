import { useState, useEffect } from "react";

import PageHeader from "../components/ui/PageHeader";
import PageContainer from "../components/ui/PageContainer";
import ItemActions from "../components/ui/ItemActions";
import Avatar from "../components/ui/Avatar";
import { Textarea } from "../components/ui/Field";
import { supabase } from "../lib/supabase";
import { toast } from "../lib/toast";
import useLocalStorage from "../hooks/useLocalStorage";

const AUTHORS = ["Pedro", "Kim"];

const PROMPTS = [
  "Melhor momento do mês",
  "Algo que admirei em você",
  "O que quero viver com você",
  "Como me senti hoje",
  "Memória favorita recente",
];

export default function DiarioPage() {
  const [entries, setEntries] = useState([]);
  const [text, setText] = useState("");
  const [selectedPrompt, setSelectedPrompt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [author, setAuthor] = useLocalStorage("pekim:author", "Pedro");

  useEffect(() => {
    supabase
      .from("diario")
      .select("*")
      .order("created_at", { ascending: false })
      .then(({ data, error }) => {
        if (error) {
          console.error("[diario]", error);
          toast.error("não foi possível carregar o diário");
        }
        if (data) setEntries(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("[diario fetch]", err);
        toast.error("não foi possível carregar o diário");
        setLoading(false);
      });
  }, []);

  const iniciarEdicao = (entry) => {
    setEditingId(entry.id);
    setText(entry.content || "");
    setSelectedPrompt(entry.prompt === "Entrada livre" ? null : entry.prompt);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const cancelarEdicao = () => {
    setEditingId(null);
    setText("");
    setSelectedPrompt(null);
  };

  const guardar = async () => {
    if (!text.trim()) return;

    if (editingId) {
      const previous = entries.find(e => e.id === editingId);
      const patch = {
        prompt: selectedPrompt || "Entrada livre",
        content: text.trim(),
      };
      setEntries(prev => prev.map(e => e.id === editingId ? { ...e, ...patch } : e));
      const { error } = await supabase.from("diario").update(patch).eq("id", editingId);
      if (error) {
        console.error("[diario update]", error);
        toast.error("não foi possível atualizar a entrada");
        setEntries(prev => prev.map(e => e.id === editingId ? previous : e));
        return;
      }
    } else {
      const nova = {
        date: new Date().toISOString().split("T")[0],
        prompt: selectedPrompt || "Entrada livre",
        content: text.trim(),
        author,
      };
      const { data, error } = await supabase.from("diario").insert(nova).select().single();
      if (error || !data) {
        console.error("[diario insert]", error);
        toast.error("não foi possível guardar a entrada");
        return;
      }
      setEntries(prev => [data, ...prev]);
    }

    setText("");
    setSelectedPrompt(null);
    setEditingId(null);
  };

  const excluir = async (entry) => {
    const previous = entries;
    setEntries(prev => prev.filter(e => e.id !== entry.id));
    const { error } = await supabase.from("diario").delete().eq("id", entry.id);
    if (error) {
      console.error("[diario delete]", error);
      toast.error("não foi possível excluir");
      setEntries(previous);
    }
  };

  const isEditing = editingId !== null;

  return (
    <PageContainer maxWidth="680px">
      <PageHeader title="Diário" sub="Pensamentos, sentimentos, momentos" icon="◈" />

      {/* Autor */}
      <div style={{ marginBottom: "32px" }}>
        <div style={{
          fontSize: "11px", letterSpacing: "0.15em",
          textTransform: "uppercase", color: "#5a8060",
          marginBottom: "12px",
          fontFamily: "'Cormorant Garamond', serif",
        }}>quem está escrevendo</div>
        <div role="radiogroup" aria-label="Autor" style={{ display: "flex", gap: "2px" }}>
          {AUTHORS.map(a => (
            <button
              key={a}
              role="radio"
              aria-checked={author === a}
              onClick={() => setAuthor(a)}
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontStyle: "italic",
                fontSize: "14px",
                color: author === a ? "#F7F4D5" : "#2e5c3a",
                background: author === a ? "#0A3323" : "#E8E5C8",
                border: "none",
                padding: "8px 22px",
                cursor: "pointer",
                transition: "all 0.2s",
              }}
            >{a}</button>
          ))}
        </div>
      </div>

      {/* Prompts */}
      <div style={{ marginBottom: "48px" }}>
        <div style={{
          fontSize: "11px", letterSpacing: "0.15em",
          textTransform: "uppercase", color: "#5a8060",
          marginBottom: "16px",
          fontFamily: "'Cormorant Garamond', serif",
        }}>sugestões de entrada</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
          {PROMPTS.map(p => (
            <button
              key={p}
              aria-pressed={selectedPrompt === p}
              onClick={() => setSelectedPrompt(selectedPrompt === p ? null : p)}
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontStyle: "italic",
                fontSize: "13px",
                color: selectedPrompt === p ? "#F7F4D5" : "#2e5c3a",
                background: selectedPrompt === p ? "#0A3323" : "#E8E5C8",
                border: "none",
                padding: "8px 16px",
                cursor: "pointer",
                transition: "all 0.2s",
              }}
            >{p}</button>
          ))}
        </div>
      </div>

      {/* Editor */}
      <div style={{
        borderTop: "1px solid #D8D9B0",
        paddingTop: "32px",
        marginBottom: "48px",
      }}>
        {isEditing && (
          <div style={{
            fontSize: "11px", letterSpacing: "0.15em",
            textTransform: "uppercase", color: "#D3968C",
            marginBottom: "12px",
            fontFamily: "'Cormorant Garamond', serif",
          }}>editando entrada</div>
        )}
        {selectedPrompt && (
          <div style={{
            fontFamily: "'Playfair Display', serif",
            fontStyle: "italic",
            fontSize: "15px", color: "#D3968C",
            marginBottom: "16px",
          }}>{selectedPrompt}</div>
        )}
        <Textarea
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="Escreva algo hoje..."
          style={{ minHeight: "120px", fontSize: "16px", padding: "0 0 16px" }}
        />
        <div style={{ display: "flex", gap: "12px", marginTop: "16px" }}>
          <button
            onClick={guardar}
            style={{
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
          >{isEditing ? "atualizar" : "guardar"}</button>
          {isEditing && (
            <button
              onClick={cancelarEdicao}
              style={{
                fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontSize: "14px",
                color: "#5a8060", background: "transparent",
                border: "none", padding: "10px 8px", cursor: "pointer",
              }}
            >cancelar</button>
          )}
        </div>
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
          outline: editingId === e.id ? "2px solid #D3968C" : "none",
          outlineOffset: "16px",
        }}>
          <div style={{
            display: "flex", justifyContent: "space-between", alignItems: "center",
            marginBottom: "16px", gap: "12px",
          }}>
            <span style={{
              fontFamily: "'Playfair Display', serif",
              fontStyle: "italic",
              fontSize: "15px", color: "#D3968C",
            }}>{e.prompt}</span>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <span style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: "12px", color: "#5a8060",
              }}>{new Date(e.date + "T12:00:00").toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })}</span>
              <ItemActions
                onEdit={() => iniciarEdicao(e)}
                onDelete={() => excluir(e)}
                confirmMessage="Excluir essa entrada?"
              />
            </div>
          </div>
          <p style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: "17px", color: "#0A3323",
            lineHeight: 1.8, margin: "0 0 8px",
            whiteSpace: "pre-wrap",
          }}>{e.content}</p>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <Avatar name={e.author} size={22} />
            <span style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontStyle: "italic",
              fontSize: "12px", color: "#a8bc80",
            }}>{e.author}</span>
          </div>
        </div>
      ))}
    </PageContainer>
  );
}

import { useState, useEffect } from "react";

import { supabase } from "../lib/supabase";
import { toast } from "../lib/toast";
import PageHeader from "../components/ui/PageHeader";
import PageContainer from "../components/ui/PageContainer";
import Collapsible from "../components/ui/Collapsible";
import ItemActions from "../components/ui/ItemActions";
import { Label, Input, Textarea } from "../components/ui/Field";

const COLORS = ["#c9ddb0", "#b5c490", "#a8d4b8", "#D3968C", "#b8d4d8"];

const EMPTY = {
  title: "",
  date: new Date().toISOString().split("T")[0],
  description: "",
  emoji: "✦",
  color: COLORS[0],
};

export default function MemoriesPage() {
  const [memories, setMemories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY);

  useEffect(() => {
    supabase.from("memories").select("*").order("date", { ascending: true })
      .then(({ data, error }) => {
        if (error) {
          console.error("[memories]", error);
          toast.error("não foi possível carregar as memórias");
        }
        if (data) setMemories(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("[memories fetch]", err);
        toast.error("não foi possível carregar as memórias");
        setLoading(false);
      });
  }, []);

  const set = field => e => setForm(f => ({ ...f, [field]: e.target.value }));

  const iniciarEdicao = (m) => {
    setEditingId(m.id);
    setForm({
      title: m.title || "",
      date: m.date || EMPTY.date,
      description: m.description || "",
      emoji: m.emoji || "✦",
      color: m.color || COLORS[0],
    });
    setFormOpen(true);
  };

  const cancelarEdicao = () => {
    setEditingId(null);
    setForm(EMPTY);
    setFormOpen(false);
  };

  const sortByDate = list => [...list].sort((a, b) => (a.date || "").localeCompare(b.date || ""));

  const salvar = async () => {
    if (!form.title.trim()) return;
    const payload = { ...form, title: form.title.trim() };
    if (editingId) {
      const previous = memories.find(m => m.id === editingId);
      setMemories(prev => sortByDate(prev.map(m => m.id === editingId ? { ...m, ...payload } : m)));
      const { error } = await supabase.from("memories").update(payload).eq("id", editingId);
      if (error) {
        console.error("[memories update]", error);
        toast.error("não foi possível atualizar a memória");
        setMemories(prev => sortByDate(prev.map(m => m.id === editingId ? previous : m)));
        return;
      }
    } else {
      const { data, error } = await supabase
        .from("memories")
        .insert(payload)
        .select().single();
      if (error || !data) {
        console.error("[memories insert]", error);
        toast.error("não foi possível guardar a memória");
        return;
      }
      setMemories(prev => sortByDate([...prev, data]));
    }
    setForm(EMPTY);
    setEditingId(null);
    setFormOpen(false);
  };

  const excluir = async (m) => {
    const previous = memories;
    setMemories(prev => prev.filter(x => x.id !== m.id));
    const { error } = await supabase.from("memories").delete().eq("id", m.id);
    if (error) {
      console.error("[memories delete]", error);
      toast.error("não foi possível excluir");
      setMemories(previous);
    }
  };

  const isEditing = editingId !== null;

  return (
    <PageContainer>
      <PageHeader title="Memórias" sub="Tudo que a gente não quer esquecer" icon="◇" />

      {/* Formulário */}
      <div style={{ marginBottom: "40px" }}>
        <button
          onClick={() => isEditing ? cancelarEdicao() : setFormOpen(o => !o)}
          style={{
            display: "flex", alignItems: "center", gap: "8px",
            fontFamily: "'Cormorant Garamond', serif",
            fontStyle: "italic", fontSize: "14px",
            color: (formOpen || isEditing) ? "#F7F4D5" : "#2e5c3a",
            background: (formOpen || isEditing) ? "#0A3323" : "transparent",
            border: "1px solid #0A3323", padding: "8px 18px",
            cursor: "pointer", transition: "all 0.2s",
          }}
        >
          <span style={{ fontSize: "16px", lineHeight: 1 }}>{(formOpen || isEditing) ? "−" : "+"}</span>
          {isEditing ? "editando memória" : "adicionar memória"}
        </button>
        <Collapsible open={formOpen} maxHeight="680px">
          <div data-form-grid style={{
            background: "#F7F4D5", padding: "28px 24px", marginTop: "2px",
            display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px 24px",
          }}>
            <div style={{ gridColumn: "1 / -1" }}>
              <Label>título *</Label>
              <Input value={form.title} onChange={set("title")} placeholder="O que aconteceu?" />
            </div>
            <div>
              <Label>data</Label>
              <Input type="date" value={form.date} onChange={set("date")} />
            </div>
            <div>
              <Label>emoji</Label>
              <Input value={form.emoji} onChange={set("emoji")} maxLength={2} placeholder="☕" />
            </div>
            <div style={{ gridColumn: "1 / -1" }}>
              <Label>descrição</Label>
              <Textarea
                value={form.description}
                onChange={set("description")}
                placeholder="Como foi..."
                style={{ minHeight: "80px" }}
              />
            </div>
            <div style={{ gridColumn: "1 / -1" }}>
              <Label>cor</Label>
              <div style={{ display: "flex", gap: "10px", marginTop: "4px" }}>
                {COLORS.map(c => (
                  <button
                    key={c}
                    onClick={() => setForm(f => ({ ...f, color: c }))}
                    title={c}
                    style={{
                      width: "28px", height: "28px",
                      background: c, cursor: "pointer",
                      border: form.color === c ? "2px solid #0A3323" : "1px solid #D8D9B0",
                      borderRadius: "50%", padding: 0,
                    }}
                  />
                ))}
              </div>
            </div>
            <div style={{ display: "flex", gap: "12px" }}>
              <button
                onClick={salvar}
                style={{
                  fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontSize: "14px",
                  color: form.title.trim() ? "#F7F4D5" : "#a8bc80",
                  background: form.title.trim() ? "#0A3323" : "transparent",
                  border: `1px solid ${form.title.trim() ? "#0A3323" : "#D8D9B0"}`,
                  padding: "10px 28px",
                  cursor: form.title.trim() ? "pointer" : "default",
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
        </Collapsible>
      </div>

      {/* Timeline */}
      {loading ? (
        <div style={{
          fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic",
          fontSize: "15px", color: "#a8bc80",
          textAlign: "center", padding: "48px 0",
          animation: "pulse 1.2s infinite",
        }}>✦ ✦ ✦</div>
      ) : memories.length === 0 ? (
        <div style={{
          fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic",
          fontSize: "15px", color: "#a8bc80",
          textAlign: "center", padding: "48px 0",
        }}>
          Nenhuma memória ainda. Adicione a primeira ✦
        </div>
      ) : (
        <div style={{ position: "relative", paddingLeft: "40px" }}>
          <div style={{
            position: "absolute", left: "7px", top: "8px", bottom: "0",
            width: "1px", background: "#D8D9B0",
          }} />

          {memories.map((m, i) => (
            <div key={m.id} style={{
              position: "relative",
              marginBottom: "48px",
              animation: `fadeIn 0.5s ease ${i * 0.1}s both`,
            }}>
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
                  day: "2-digit", month: "long", year: "numeric",
                })}
              </div>

              <div style={{
                background: "#F7F4D5",
                padding: "24px 28px",
                borderLeft: `3px solid ${m.color}`,
                outline: editingId === m.id ? "2px solid #D3968C" : "none",
                outlineOffset: "-2px",
              }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px", gap: "12px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px", minWidth: 0 }}>
                    <span style={{ fontSize: "24px" }}>{m.emoji}</span>
                    <h3 style={{
                      fontFamily: "'Playfair Display', serif",
                      fontSize: "20px", fontWeight: "400",
                      color: "#0A3323", margin: 0,
                    }}>{m.title}</h3>
                  </div>
                  <ItemActions
                    onEdit={() => iniciarEdicao(m)}
                    onDelete={() => excluir(m)}
                    confirmMessage={`Excluir a memória "${m.title}"?`}
                  />
                </div>
                <p style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: "15px", color: "#2e5c3a",
                  lineHeight: 1.7, margin: 0,
                  fontStyle: "italic",
                }}>{m.description}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </PageContainer>
  );
}

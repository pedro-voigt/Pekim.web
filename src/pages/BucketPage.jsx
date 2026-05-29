import { useState, useEffect } from "react";

import { supabase } from "../lib/supabase";
import { toast } from "../lib/toast";
import PageHeader from "../components/ui/PageHeader";
import PageContainer from "../components/ui/PageContainer";
import Collapsible from "../components/ui/Collapsible";
import ItemActions from "../components/ui/ItemActions";
import { Label, Input } from "../components/ui/Field";
import clickable from "../lib/clickable";

const EMPTY = { item: "", emoji: "✦" };

export default function BucketPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY);

  useEffect(() => {
    supabase.from("bucket_list").select("*").order("id")
      .then(({ data, error }) => {
        if (error) {
          console.error("[bucket]", error);
          toast.error("não foi possível carregar a bucket list");
        }
        if (data) setItems(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("[bucket fetch]", err);
        toast.error("não foi possível carregar a bucket list");
        setLoading(false);
      });
  }, []);

  const set = field => e => setForm(f => ({ ...f, [field]: e.target.value }));

  const iniciarEdicao = (item) => {
    setEditingId(item.id);
    setForm({ item: item.item || "", emoji: item.emoji || "✦" });
    setFormOpen(true);
  };

  const cancelarEdicao = () => {
    setEditingId(null);
    setForm(EMPTY);
    setFormOpen(false);
  };

  const salvar = async () => {
    if (!form.item.trim()) return;
    const payload = { item: form.item.trim(), emoji: form.emoji };
    if (editingId) {
      const previous = items.find(i => i.id === editingId);
      setItems(prev => prev.map(i => i.id === editingId ? { ...i, ...payload } : i));
      const { error } = await supabase.from("bucket_list").update(payload).eq("id", editingId);
      if (error) {
        console.error("[bucket update]", error);
        toast.error("não foi possível atualizar o item");
        setItems(prev => prev.map(i => i.id === editingId ? previous : i));
        return;
      }
    } else {
      const { data, error } = await supabase
        .from("bucket_list")
        .insert({ ...payload, done: false })
        .select().single();
      if (error || !data) {
        console.error("[bucket insert]", error);
        toast.error("não foi possível guardar o item");
        return;
      }
      setItems(prev => [...prev, data]);
    }
    setForm(EMPTY);
    setEditingId(null);
    setFormOpen(false);
  };

  const excluir = async (item) => {
    const previous = items;
    setItems(prev => prev.filter(b => b.id !== item.id));
    const { error } = await supabase.from("bucket_list").delete().eq("id", item.id);
    if (error) {
      console.error("[bucket delete]", error);
      toast.error("não foi possível excluir");
      setItems(previous);
    }
  };

  const toggleDone = async (item) => {
    const done = !item.done;
    setItems(prev => prev.map(b => b.id === item.id ? { ...b, done } : b));
    const { error } = await supabase.from("bucket_list").update({ done }).eq("id", item.id);
    if (error) {
      console.error("[bucket toggle]", error);
      toast.error("não foi possível atualizar");
      setItems(prev => prev.map(b => b.id === item.id ? { ...b, done: !done } : b));
    }
  };

  const done = items.filter(b => b.done).length;
  const pct = items.length ? Math.round((done / items.length) * 100) : 0;
  const isEditing = editingId !== null;

  return (
    <PageContainer maxWidth="680px">
      <PageHeader title="Bucket List" sub="Tudo que a gente ainda vai viver" icon="⊹" />

      {/* Formulário */}
      <div style={{ marginBottom: "32px" }}>
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
          {isEditing ? "editando item" : "adicionar item"}
        </button>
        <Collapsible open={formOpen} maxHeight="320px">
          <div data-form-grid style={{
            background: "#F7F4D5", padding: "28px 24px", marginTop: "2px",
            display: "grid", gridTemplateColumns: "3fr 1fr", gap: "20px 24px",
          }}>
            <div>
              <Label>o que querem viver? *</Label>
              <Input value={form.item} onChange={set("item")} placeholder="Algo que a gente vai fazer..." />
            </div>
            <div>
              <Label>emoji</Label>
              <Input value={form.emoji} onChange={set("emoji")} maxLength={2} placeholder="✈️" />
            </div>
            <div style={{ gridColumn: "1 / -1", display: "flex", gap: "12px" }}>
              <button
                onClick={salvar}
                style={{
                  fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontSize: "14px",
                  color: form.item.trim() ? "#F7F4D5" : "#a8bc80",
                  background: form.item.trim() ? "#0A3323" : "transparent",
                  border: `1px solid ${form.item.trim() ? "#0A3323" : "#D8D9B0"}`,
                  padding: "10px 28px",
                  cursor: form.item.trim() ? "pointer" : "default",
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

      {/* Progress */}
      {!loading && items.length > 0 && (
        <div style={{ marginBottom: "48px" }}>
          <div style={{
            display: "flex", justifyContent: "space-between",
            marginBottom: "10px",
            fontFamily: "'Cormorant Garamond', serif",
            fontStyle: "italic",
            fontSize: "14px", color: "#2e5c3a",
          }}>
            <span>{done} de {items.length} realizados</span>
            <span>{pct}%</span>
          </div>
          <div style={{
            height: "2px", background: "#D8D9B0",
            borderRadius: "2px", overflow: "hidden",
          }}>
            <div style={{
              height: "100%", width: `${pct}%`,
              background: "linear-gradient(90deg, #D3968C, #839958)",
              transition: "width 1s ease",
            }} />
          </div>
        </div>
      )}

      {loading ? (
        <div style={{
          fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic",
          fontSize: "15px", color: "#a8bc80",
          textAlign: "center", padding: "48px 0",
          animation: "pulse 1.2s infinite",
        }}>✦ ✦ ✦</div>
      ) : items.length === 0 ? (
        <div style={{
          fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic",
          fontSize: "15px", color: "#a8bc80",
          textAlign: "center", padding: "48px 0",
        }}>
          Nada na lista ainda. Adicione o primeiro sonho ✦
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
          {items.map(item => (
            <div
              key={item.id}
              {...clickable(() => toggleDone(item), {
                "aria-pressed": item.done,
                "aria-label": `${item.item} — ${item.done ? "feito" : "pendente"}`,
              })}
              style={{
                display: "flex", alignItems: "center",
                gap: "20px",
                padding: "20px 24px",
                background: item.done ? "#F7F4D5" : "#EEEBd8",
                cursor: "pointer",
                transition: "background 0.2s",
                outline: editingId === item.id ? "2px solid #D3968C" : "none",
                outlineOffset: "-2px",
              }}
            >
              <div style={{
                width: "24px", height: "24px",
                border: `1px solid ${item.done ? "#D3968C" : "#a8bc80"}`,
                background: item.done ? "#D3968C" : "transparent",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "12px", color: "#fff",
                flexShrink: 0,
              }}>
                {item.done ? "✓" : ""}
              </div>
              <span style={{ fontSize: "20px" }}>{item.emoji}</span>
              <span style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: "16px",
                color: item.done ? "#5a8060" : "#0A3323",
                textDecorationLine: item.done ? "line-through" : "none",
                textDecorationColor: "#a8bc80",
                flex: 1,
              }}>{item.item}</span>
              <ItemActions
                onEdit={() => iniciarEdicao(item)}
                onDelete={() => excluir(item)}
                confirmMessage={`Excluir "${item.item}"?`}
              />
            </div>
          ))}
        </div>
      )}
    </PageContainer>
  );
}

import { useState } from "react";

import useCollection from "../hooks/useCollection";
import PageHeader from "../components/ui/PageHeader";
import PageContainer from "../components/ui/PageContainer";
import Collapsible from "../components/ui/Collapsible";
import ItemActions from "../components/ui/ItemActions";
import FormToggleButton from "../components/ui/FormToggleButton";
import FormActions from "../components/ui/FormActions";
import LoadingDots from "../components/ui/LoadingDots";
import EmptyState from "../components/ui/EmptyState";
import { Label, Input, Textarea } from "../components/ui/Field";
import CorkMap from "../components/map/CorkMap";

const COLORS = ["#c9ddb0", "#b5c490", "#a8d4b8", "#D3968C", "#b8d4d8"];

const EMPTY = {
  title: "",
  date: new Date().toISOString().split("T")[0],
  description: "",
  emoji: "✦",
  color: COLORS[0],
};

const byDate = (a, b) => (a.date || "").localeCompare(b.date || "");

export default function MemoriesPage() {
  const { items: memories, loading, create, update, remove } = useCollection("memories", {
    order: { column: "date", ascending: true },
    sort: byDate,
    messages: {
      load: "não foi possível carregar as memórias",
      create: "não foi possível guardar a memória",
      update: "não foi possível atualizar a memória",
    },
  });
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [tab, setTab] = useState("timeline"); // "timeline" | "map"

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

  const salvar = async () => {
    if (!form.title.trim()) return;
    const payload = { ...form, title: form.title.trim() };
    const ok = editingId
      ? await update(editingId, payload)
      : await create(payload);
    if (!ok) return;
    cancelarEdicao();
  };

  const isEditing = editingId !== null;

  return (
    <PageContainer>
      <PageHeader title="Memórias" sub="Tudo que a gente não quer esquecer" icon="◇" />

      {/* Abas */}
      <div style={{ display: "flex", gap: "8px", marginBottom: "32px" }}>
        {[
          { key: "timeline", label: "Linha do tempo" },
          { key: "map", label: "Mapa" },
        ].map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontStyle: "italic", fontSize: "14px",
              color: tab === t.key ? "#F7F4D5" : "#2e5c3a",
              background: tab === t.key ? "#0A3323" : "transparent",
              border: "1px solid #0A3323", padding: "8px 18px",
              cursor: "pointer", transition: "all 0.2s",
            }}
          >{t.label}</button>
        ))}
      </div>

      {tab === "map" && <CorkMap />}

      {tab === "timeline" && (<>
      {/* Formulário */}
      <div style={{ marginBottom: "40px" }}>
        <FormToggleButton
          open={formOpen}
          editing={isEditing}
          onClick={() => isEditing ? cancelarEdicao() : setFormOpen(o => !o)}
          addLabel="adicionar memória"
          editLabel="editando memória"
        />
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
            <FormActions
              canSave={!!form.title.trim()}
              editing={isEditing}
              onSave={salvar}
              onCancel={cancelarEdicao}
            />
          </div>
        </Collapsible>
      </div>

      {/* Timeline */}
      {loading ? (
        <LoadingDots size="15px" />
      ) : memories.length === 0 ? (
        <EmptyState>Nenhuma memória ainda. Adicione a primeira ✦</EmptyState>
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
                    onDelete={() => remove(m.id)}
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
      </>)}
    </PageContainer>
  );
}

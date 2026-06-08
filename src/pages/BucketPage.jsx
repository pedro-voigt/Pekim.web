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
import { Label, Input } from "../components/ui/Field";
import clickable from "../lib/clickable";

const EMPTY = { item: "", emoji: "✦" };

export default function BucketPage() {
  const { items, loading, create, update, remove } = useCollection("bucket_list", {
    messages: {
      load: "não foi possível carregar a bucket list",
      create: "não foi possível guardar o item",
      update: "não foi possível atualizar o item",
    },
  });
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY);

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
    const ok = editingId
      ? await update(editingId, payload)
      : await create({ ...payload, done: false });
    if (!ok) return;
    cancelarEdicao();
  };

  const toggleDone = (item) =>
    update(item.id, { done: !item.done }, { errorMessage: "não foi possível atualizar" });

  const done = items.filter(b => b.done).length;
  const pct = items.length ? Math.round((done / items.length) * 100) : 0;
  const isEditing = editingId !== null;

  return (
    <PageContainer maxWidth="680px">
      <PageHeader title="Bucket List" sub="Tudo que a gente ainda vai viver" icon="⊹" />

      {/* Formulário */}
      <div style={{ marginBottom: "32px" }}>
        <FormToggleButton
          open={formOpen}
          editing={isEditing}
          onClick={() => isEditing ? cancelarEdicao() : setFormOpen(o => !o)}
          addLabel="adicionar item"
          editLabel="editando item"
        />
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
            <FormActions
              style={{ gridColumn: "1 / -1" }}
              canSave={!!form.item.trim()}
              editing={isEditing}
              onSave={salvar}
              onCancel={cancelarEdicao}
            />
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
        <LoadingDots size="15px" />
      ) : items.length === 0 ? (
        <EmptyState>Nada na lista ainda. Adicione o primeiro sonho ✦</EmptyState>
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
                onDelete={() => remove(item.id)}
                confirmMessage={`Excluir "${item.item}"?`}
              />
            </div>
          ))}
        </div>
      )}
    </PageContainer>
  );
}

import { useState } from "react";

import { Label, Input, Select, Textarea } from "../ui/Field";
import FormActions from "../ui/FormActions";

// Formulário de lugar (criar/editar), no mesmo painel lateral do PlacePanel.
// `coords` é só exibido — a posição vem do clique no mapa (ou do lugar existente).

const MODOS = [
  { value: "driving", label: "de carro" },
  { value: "flight", label: "de avião" },
  { value: "walking", label: "a pé" },
];

const labelStyle = {
  fontSize: "11px", letterSpacing: "0.15em", textTransform: "uppercase",
  color: "#5a8060", fontFamily: "'Cormorant Garamond', serif",
};

const fromPlace = (place) => ({
  nome: place?.nome || "",
  data_inicio: place?.data_inicio || "",
  data_fim: place?.data_fim || "",
  nota: place?.nota || "",
  modo: place?.modo || "driving",
  autor: place?.autor || "",
});

export default function PlaceForm({ place, coords, onSave, onCancel }) {
  const editing = !!place?.id;
  const [form, setForm] = useState(() => fromPlace(place));
  const [saving, setSaving] = useState(false);

  const set = field => e => setForm(f => ({ ...f, [field]: e.target.value }));

  const salvar = async () => {
    if (!form.nome.trim() || saving) return;
    setSaving(true);
    const ok = await onSave({
      nome: form.nome.trim(),
      data_inicio: form.data_inicio || null,
      data_fim: form.data_fim || null,
      nota: form.nota.trim() || null,
      modo: form.modo,
      autor: form.autor || null,
    });
    // se falhar, mantém o form aberto para nova tentativa
    if (!ok) setSaving(false);
  };

  return (
    <div style={{
      position: "absolute",
      top: 0, right: 0, bottom: 0,
      width: "min(340px, 86%)",
      background: "#F7F4D5",
      boxShadow: "-8px 0 24px -8px rgba(0,0,0,0.45)",
      zIndex: 600,
      padding: "24px 24px 28px",
      overflowY: "auto",
      animation: "fadeIn 0.3s ease",
    }}>
      <div style={{ ...labelStyle, marginBottom: "10px" }}>
        {editing ? "editando lugar" : "novo lugar"}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
        <div>
          <Label>nome *</Label>
          <Input value={form.nome} onChange={set("nome")} placeholder="Para onde foram?" autoFocus />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
          <div>
            <Label>de</Label>
            <Input type="date" value={form.data_inicio} onChange={set("data_inicio")} />
          </div>
          <div>
            <Label>até</Label>
            <Input type="date" value={form.data_fim} onChange={set("data_fim")} />
          </div>
        </div>

        <div>
          <Label>nota</Label>
          <Textarea
            value={form.nota}
            onChange={set("nota")}
            placeholder="Uma memória dessa viagem..."
            style={{ minHeight: "72px" }}
          />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
          <div>
            <Label>modo</Label>
            <Select value={form.modo} onChange={set("modo")}>
              {MODOS.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
            </Select>
          </div>
          <div>
            <Label>autor</Label>
            <Select value={form.autor} onChange={set("autor")}>
              <option value="">—</option>
              <option value="Pedro">Pedro</option>
              <option value="Kim">Kim</option>
            </Select>
          </div>
        </div>

        {coords && (
          <div style={{
            ...labelStyle, textTransform: "none", letterSpacing: "0.04em",
            fontStyle: "italic", color: "#a8bc80",
          }}>
            ✦ {coords.lat.toFixed(4)}, {coords.lng.toFixed(4)}
          </div>
        )}

        <FormActions
          canSave={!!form.nome.trim() && !saving}
          editing={editing}
          onSave={salvar}
          onCancel={onCancel}
          style={{ marginTop: "4px" }}
        />
      </div>
    </div>
  );
}

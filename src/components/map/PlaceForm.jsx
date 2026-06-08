import { useState, useRef } from "react";

import { Label, Input, Select, Textarea } from "../ui/Field";
import FormActions from "../ui/FormActions";
import { uploadImage } from "../../lib/uploadImage";
import { toast } from "../../lib/toast";

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
  fotos: Array.isArray(place?.fotos) ? place.fotos : [],
});

export default function PlaceForm({ place, coords, onSave, onCancel }) {
  const editing = !!place?.id;
  const [form, setForm] = useState(() => fromPlace(place));
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef(null);

  const set = field => e => setForm(f => ({ ...f, [field]: e.target.value }));

  const handleFiles = async (e) => {
    const files = Array.from(e.target.files || []);
    e.target.value = ""; // permite reenviar o mesmo arquivo depois
    if (files.length === 0) return;
    setUploading(true);
    for (const file of files) {
      const url = await uploadImage(file, "lugares");
      if (url) setForm(f => ({ ...f, fotos: [...f.fotos, url] }));
      else toast.error("não foi possível enviar a foto");
    }
    setUploading(false);
  };

  const removeFoto = (url) =>
    setForm(f => ({ ...f, fotos: f.fotos.filter(u => u !== url) }));

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
      fotos: form.fotos,
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

        <div>
          <Label>fotos</Label>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginTop: "4px" }}>
            {form.fotos.map((url) => (
              <div key={url} style={{ position: "relative", width: "64px", height: "64px" }}>
                <img
                  src={url}
                  alt=""
                  loading="lazy"
                  style={{
                    width: "100%", height: "100%", objectFit: "cover",
                    border: "1px solid #D8D9B0", background: "#EEEBd8",
                  }}
                />
                <button
                  type="button"
                  onClick={() => removeFoto(url)}
                  aria-label="Remover foto"
                  style={{
                    position: "absolute", top: "-7px", right: "-7px",
                    width: "20px", height: "20px", borderRadius: "50%",
                    background: "#D3968C", color: "#fff", border: "none",
                    fontSize: "12px", lineHeight: 1, cursor: "pointer",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.3)",
                  }}
                >×</button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              style={{
                width: "64px", height: "64px",
                border: "1px dashed #a8bc80", background: "transparent",
                color: "#5a8060", fontSize: "11px",
                fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic",
                cursor: uploading ? "default" : "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}
            >{uploading ? "enviando…" : "+ foto"}</button>
          </div>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleFiles}
            style={{ display: "none" }}
          />
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

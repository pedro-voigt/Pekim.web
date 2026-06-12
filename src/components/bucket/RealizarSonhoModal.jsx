import { useEffect, useRef, useState } from "react";

import usePhotoUpload from "../../hooks/usePhotoUpload";
import { Label, Input, Select, Textarea } from "../ui/Field";
import PhotoUploader from "../ui/PhotoUploader";

// Mesmas cores do form de Memórias (a memória derivada nasce idêntica às demais).
const COLORS = ["#c9ddb0", "#b5c490", "#a8d4b8", "#D3968C", "#b8d4d8"];
const AUTOR_FROM = { pedro: "Pedro", kim: "Kim", ambos: "" };

// Form-pergunta exibido ao realizar um sonho: "transformar em memória?".
// Guardar → cria a memória derivada (Mirror) e devolve o resultado via onSubmit;
// a foto enviada aqui (bucket "fotos"/pasta memorias) vira a foto da memória E
// a polaroid do sonho (mesmo arquivo). "agora não" → fecha sem criar.
export default function RealizarSonhoModal({ dream, onSubmit, onClose }) {
  const [form, setForm] = useState({
    title:       dream.titulo,
    date:        new Date().toISOString().split("T")[0],
    description: "",
    emoji:       "✦",
    color:       COLORS[0],
    autor:       AUTOR_FROM[dream.sonhado_por] ?? "",
  });
  const [saving, setSaving] = useState(false);
  const photo = usePhotoUpload([], "memorias");

  // refs p/ a limpeza de fotos ler sempre o estado mais recente (o listener de
  // Esc é registrado uma vez só, com deps []). O ref é sincronizado num effect
  // — escrever nele durante o render é proibido pelas regras de hooks.
  const photoRef = useRef(photo);
  const savedRef = useRef(false);
  useEffect(() => { photoRef.current = photo; });

  const set = field => e => setForm(f => ({ ...f, [field]: e.target.value }));

  const close = () => {
    if (!savedRef.current) photoRef.current.cleanupCanceled(); // apaga fotos enviadas e nunca salvas
    onClose();
  };

  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") close(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const guardar = async () => {
    if (!form.title.trim() || saving) return;
    setSaving(true);
    const ok = await onSubmit({
      title:       form.title.trim(),
      date:        form.date,
      description: form.description.trim(),
      emoji:       form.emoji || "✦",
      color:       form.color,
      autor:       form.autor || null,
      fotos:       photo.fotos,
    });
    if (ok) { savedRef.current = true; photoRef.current.cleanupSaved(); onClose(); }
    else setSaving(false);
  };

  return (
    <div
      onClick={close}
      style={{
        position: "fixed", inset: 0, zIndex: 2000,
        background: "rgba(10,51,35,0.45)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: "24px", animation: "fadeIn 0.2s ease",
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "#F7F4D5", maxWidth: "440px", width: "100%",
          maxHeight: "90vh", overflowY: "auto",
          padding: "28px 28px 24px",
          boxShadow: "0 20px 50px -12px rgba(10,51,35,0.5)",
          animation: "fadeIn 0.25s ease",
        }}
      >
        {/* Cabeçalho-pergunta */}
        <div style={{
          fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic",
          fontSize: "12px", letterSpacing: "0.16em", textTransform: "uppercase",
          color: "#839958", marginBottom: "6px",
        }}>
          de Nossos Sonhos
        </div>
        <h2 style={{
          fontFamily: "'Playfair Display', serif", fontWeight: 700,
          fontSize: "23px", color: "#0A3323", lineHeight: 1.15, margin: "0 0 6px",
        }}>
          Virou realidade — guardar como memória?
        </h2>
        <p style={{
          fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic",
          fontSize: "16px", color: "#5a8060", margin: "0 0 22px",
        }}>
          "{dream.titulo}"
        </p>

        {/* Form */}
        <div style={{ display: "grid", gap: "18px" }}>
          <div>
            <Label>título da memória *</Label>
            <Input value={form.title} onChange={set("title")} placeholder="O que aconteceu?" />
          </div>
          <div>
            <Label>quando foi</Label>
            <Input type="date" value={form.date} onChange={set("date")} style={{ fontStyle: "normal", colorScheme: "light" }} />
          </div>
          <div>
            <Label>como foi</Label>
            <Textarea value={form.description} onChange={set("description")} placeholder="O que vocês querem lembrar..." style={{ minHeight: "72px" }} />
          </div>
          <div style={{ display: "flex", gap: "18px" }}>
            <div style={{ width: "80px" }}>
              <Label>emoji</Label>
              <Input value={form.emoji} onChange={set("emoji")} maxLength={2} placeholder="✦" />
            </div>
            <div style={{ flex: 1 }}>
              <Label>quem viveu</Label>
              <Select value={form.autor} onChange={set("autor")}>
                <option value="">os dois</option>
                <option value="Pedro">Pedro</option>
                <option value="Kim">Kim</option>
              </Select>
            </div>
          </div>
          <div>
            <Label>cor</Label>
            <div style={{ display: "flex", gap: "10px", marginTop: "4px" }}>
              {COLORS.map(c => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setForm(f => ({ ...f, color: c }))}
                  title={c}
                  style={{
                    width: "26px", height: "26px", background: c, cursor: "pointer",
                    border: form.color === c ? "2px solid #0A3323" : "1px solid #D8D9B0",
                    borderRadius: "50%", padding: 0,
                  }}
                />
              ))}
            </div>
          </div>
          <PhotoUploader
            label="foto dessa memória"
            max={1}
            fotos={photo.fotos}
            uploading={photo.uploading}
            addFiles={photo.addFiles}
            removeFoto={photo.removeFoto}
          />
        </div>

        {/* Ações */}
        <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: "8px", marginTop: "26px" }}>
          <button
            onClick={close}
            style={{
              fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontSize: "14px",
              color: "#5a8060", background: "transparent", border: "none",
              padding: "10px 12px", cursor: "pointer",
            }}
          >
            agora não
          </button>
          <button
            onClick={guardar}
            disabled={!form.title.trim() || saving || photo.uploading}
            style={{
              fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontSize: "14px",
              color: (form.title.trim() && !saving) ? "#F7F4D5" : "#a8bc80",
              background: (form.title.trim() && !saving) ? "#0A3323" : "transparent",
              border: `1px solid ${(form.title.trim() && !saving) ? "#0A3323" : "#D8D9B0"}`,
              padding: "10px 24px",
              cursor: (form.title.trim() && !saving && !photo.uploading) ? "pointer" : "default",
              transition: "all 0.2s",
            }}
          >
            {saving ? "guardando…" : "guardar memória"}
          </button>
        </div>
      </div>
    </div>
  );
}

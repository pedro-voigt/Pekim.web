import { Label, Input, Textarea } from "../ui/Field";
import FormActions from "../ui/FormActions";
import PhotoUploader from "../ui/PhotoUploader";

// Form de criar/editar memória (markup puro — estado/CRUD vivem na MemoriesPage).
// Campos mapeiam direto p/ a tabela `memories` via o adaptador do Mural:
//   foto → polaroid · sem foto → card de texto · lugar → filtro "viagens".

const AUTORES = [
  { key: "pedro", label: "Pedro",   color: "#0A3323" },
  { key: "kim",   label: "Kim",     color: "#D3968C" },
  { key: "ambos", label: "os dois", color: "#839958" },
];

const autorBtn = {
  fontFamily:   "'Cormorant Garamond', serif",
  fontStyle:    "italic",
  fontSize:     "14px",
  padding:      "5px 18px",
  borderRadius: "2px",
  cursor:       "pointer",
  transition:   "background 0.15s, color 0.15s",
};

export default function MemoryForm({
  form, onField, autor, onAutor, photo, editing, canSave, onSave, onCancel,
}) {
  return (
    <div data-form-grid style={{
      background: "#F7F4D5", padding: "28px 24px", marginTop: "2px",
      display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px 24px",
    }}>
      <div style={{ gridColumn: "1 / -1" }}>
        <Label>título *</Label>
        <Input value={form.title} onChange={onField("title")} placeholder="O que aconteceu?" />
      </div>

      <div>
        <Label>data</Label>
        <Input
          type="date"
          value={form.date}
          onChange={onField("date")}
          style={{ fontStyle: "normal", colorScheme: "light" }}
        />
      </div>

      <div>
        <Label>lugar</Label>
        <Input value={form.local} onChange={onField("local")} placeholder="entra nas viagens / mapa" />
      </div>

      <div style={{ gridColumn: "1 / -1" }}>
        <Label>a lembrança</Label>
        <Textarea
          value={form.description}
          onChange={onField("description")}
          placeholder="como foi… (sem foto, vira um cartão de texto)"
          style={{ minHeight: "80px" }}
        />
      </div>

      <div style={{ gridColumn: "1 / -1" }}>
        <Label>de quem é essa memória</Label>
        <div style={{ display: "flex", gap: "10px", paddingTop: "6px" }}>
          {AUTORES.map(({ key, label, color }) => {
            const on = autor === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => onAutor(key)}
                style={{
                  ...autorBtn,
                  border:     `1px solid ${color}`,
                  background: on ? color : "transparent",
                  color:      on ? "#F7F4D5" : color,
                }}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      <div style={{ gridColumn: "1 / -1" }}>
        <PhotoUploader
          label="foto da polaroid"
          max={1}
          fotos={photo.fotos}
          uploading={photo.uploading}
          addFiles={photo.addFiles}
          removeFoto={photo.removeFoto}
        />
      </div>

      <FormActions
        canSave={canSave}
        editing={editing}
        showCancel
        onSave={onSave}
        onCancel={onCancel}
      />
    </div>
  );
}

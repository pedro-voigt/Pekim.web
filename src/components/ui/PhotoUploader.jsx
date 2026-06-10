import { useRef } from "react";

import { Label } from "./Field";

// UI de upload de fotos: thumbnails (com remover) + botão "+ foto".
// Recebe os valores de usePhotoUpload: { fotos, uploading, addFiles, removeFoto }.
export default function PhotoUploader({ fotos, uploading, addFiles, removeFoto, label = "fotos" }) {
  const fileRef = useRef(null);

  const onChange = (e) => {
    const files = e.target.files;
    e.target.value = ""; // permite reenviar o mesmo arquivo depois
    addFiles(files);
  };

  return (
    <div>
      <Label>{label}</Label>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginTop: "4px" }}>
        {fotos.map((url) => (
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
        onChange={onChange}
        style={{ display: "none" }}
      />
    </div>
  );
}

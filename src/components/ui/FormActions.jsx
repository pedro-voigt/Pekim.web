// Rodapé do formulário: botão guardar/atualizar + cancelar.
// Cancelar aparece no modo edição ou quando `showCancel` é passado (ex.: criar
// um lugar novo, onde também faz sentido desistir).
export default function FormActions({ canSave, editing, onSave, onCancel, style, showCancel }) {
  return (
    <div style={{ display: "flex", gap: "12px", ...style }}>
      <button
        onClick={onSave}
        style={{
          fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontSize: "14px",
          color: canSave ? "#F7F4D5" : "#a8bc80",
          background: canSave ? "#0A3323" : "transparent",
          border: `1px solid ${canSave ? "#0A3323" : "#D8D9B0"}`,
          padding: "10px 28px",
          cursor: canSave ? "pointer" : "default",
          transition: "all 0.2s",
        }}
      >{editing ? "atualizar" : "guardar"}</button>
      {(editing || showCancel) && (
        <button
          onClick={onCancel}
          style={{
            fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontSize: "14px",
            color: "#5a8060", background: "transparent",
            border: "none", padding: "10px 8px", cursor: "pointer",
          }}
        >cancelar</button>
      )}
    </div>
  );
}

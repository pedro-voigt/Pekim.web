// Botão que abre o formulário (+ adicionar) ou indica modo edição (− editando).
export default function FormToggleButton({ open, editing, onClick, addLabel, editLabel }) {
  const active = open || editing;
  return (
    <button
      onClick={onClick}
      style={{
        display: "flex", alignItems: "center", gap: "8px",
        fontFamily: "'Cormorant Garamond', serif",
        fontStyle: "italic", fontSize: "14px",
        color: active ? "#F7F4D5" : "#2e5c3a",
        background: active ? "#0A3323" : "transparent",
        border: "1px solid #0A3323", padding: "8px 18px",
        cursor: "pointer", transition: "all 0.2s",
      }}
    >
      <span style={{ fontSize: "16px", lineHeight: 1 }}>{active ? "−" : "+"}</span>
      {editing ? editLabel : addLabel}
    </button>
  );
}

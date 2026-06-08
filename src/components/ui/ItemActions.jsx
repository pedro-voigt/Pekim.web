import { confirm } from "../../lib/confirm";

const btn = {
  fontFamily: "'Cormorant Garamond', serif",
  fontSize: "16px",
  color: "#5a8060",
  background: "transparent",
  border: "none",
  cursor: "pointer",
  padding: "2px 6px",
  lineHeight: 1,
  transition: "color 0.2s",
};

export default function ItemActions({ onEdit, onDelete, confirmMessage = "Tem certeza que quer excluir?" }) {
  const handleDelete = async (e) => {
    e.stopPropagation();
    if (await confirm(confirmMessage)) onDelete();
  };
  const handleEdit = (e) => {
    e.stopPropagation();
    onEdit();
  };
  return (
    <div style={{ display: "flex", gap: "2px", flexShrink: 0 }} onClick={e => e.stopPropagation()}>
      {onEdit && (
        <button
          onClick={handleEdit}
          title="Editar"
          style={btn}
          onMouseEnter={e => e.currentTarget.style.color = "#0A3323"}
          onMouseLeave={e => e.currentTarget.style.color = "#5a8060"}
        >✎</button>
      )}
      {onDelete && (
        <button
          onClick={handleDelete}
          title="Excluir"
          style={{ ...btn, fontSize: "20px" }}
          onMouseEnter={e => e.currentTarget.style.color = "#D3968C"}
          onMouseLeave={e => e.currentTarget.style.color = "#5a8060"}
        >×</button>
      )}
    </div>
  );
}

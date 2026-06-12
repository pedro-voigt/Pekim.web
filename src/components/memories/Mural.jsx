import useMediaQuery from "../../hooks/useMediaQuery";
import MuralCard from "./MuralCard";

// Mosaico masonry (CSS columns): 3 → 2 → 1. Itens não quebram entre colunas.
export default function Mural({ memories, reducedMotion, editingId, onEdit, onDelete }) {
  const isTablet = useMediaQuery("(max-width: 900px)");
  const isMobile = useMediaQuery("(max-width: 560px)");
  const cols = isMobile ? 1 : isTablet ? 2 : 3;

  return (
    <div style={{ columns: cols, columnGap: "14px", maxWidth: "680px", margin: "0 auto" }}>
      {memories.map((m, i) => (
        <div
          key={m.id}
          style={{
            breakInside:  "avoid",
            marginBottom: "16px",
            animation:    reducedMotion ? "none" : `fadeIn 0.5s ease ${Math.min(i, 8) * 0.06}s both`,
          }}
        >
          <MuralCard
            memory={m}
            reducedMotion={reducedMotion}
            isEditing={editingId === m.id}
            onEdit={onEdit ? () => onEdit(m) : undefined}
            onDelete={onDelete ? () => onDelete(m) : undefined}
          />
        </div>
      ))}
    </div>
  );
}

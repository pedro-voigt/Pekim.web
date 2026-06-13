// Filtros do Mural — chips itálicos centralizados (estilo do preview).
// "sonhos realizados ✦" isola memórias com origem === 'sonho' (recíproco do selo);
// "viagens" isola as que têm `local` (as que entram no mapa).
const FILTERS = [
  { key: "todos",   label: "todos" },
  { key: "sonhos",  label: "sonhos realizados ✦" },
  { key: "viagens", label: "viagens" },
];

export default function MuralFilters({ value, onChange, counts }) {
  return (
    <div style={{
      display:        "flex",
      justifyContent: "flex-start",
      gap:            "8px",
      marginBottom:   "26px",
      flexWrap:       "wrap",
    }}>
      {FILTERS.map(f => {
        const active   = value === f.key;
        const disabled = counts && counts[f.key] === 0;
        return (
          <button
            key={f.key}
            onClick={() => !disabled && onChange(f.key)}
            disabled={disabled}
            style={{
              fontFamily:   "'Cormorant Garamond', serif",
              fontStyle:    "italic",
              fontSize:     "13px",
              padding:      "4px 14px",
              borderRadius: "14px",
              cursor:       disabled ? "default" : "pointer",
              transition:   "all 0.2s",
              background:   active ? "#D3968C" : "#F7F4D5",
              color:        active ? "#fff" : "#839958",
              border:       active ? "1px solid #D3968C" : "1px solid rgba(131,153,88,0.4)",
              opacity:      disabled ? 0.45 : 1,
            }}
          >
            {f.label}
          </button>
        );
      })}
    </div>
  );
}

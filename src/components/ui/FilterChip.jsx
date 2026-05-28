export default function FilterChip({ label, active, onClick, small }) {
  return (
    <button
      onClick={onClick}
      style={{
        fontFamily: "'Cormorant Garamond', serif",
        fontStyle: "italic",
        fontSize: small ? "12px" : "14px",
        color: active ? "#fff" : "#2e5c3a",
        background: active ? "#0A3323" : "transparent",
        border: `1px solid ${active ? "#0A3323" : "#a8bc80"}`,
        padding: small ? "5px 14px" : "7px 18px",
        cursor: "pointer",
        transition: "all 0.2s",
        borderRadius: "0",
      }}
    >{label}</button>
  );
}
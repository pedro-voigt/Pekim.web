export default function StatusBadge({ status }){
  const colors = {
    "Feito": { bg: "#c5ddb0", color: "#0A3323" },
    "Planejado": { bg: "#b8d4d8", color: "#105666" },
    "Quero fazer": { bg: "#E8E5C8", color: "#2e5c3a" },
  };
  const c = colors[status] || colors["Quero fazer"];
  return (
    <span style={{
      fontSize: "10px",
      fontFamily: "'Cormorant Garamond', serif",
      fontStyle: "italic",
      letterSpacing: "0.05em",
      padding: "3px 10px",
      borderRadius: "20px",
      background: c.bg,
      color: c.color,
    }}>{status}</span>
  );
}
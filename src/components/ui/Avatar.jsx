// Avatar "iniciais": Pedro → verde escuro, Kim → rosa (paleta do projeto).
export default function Avatar({ name, size = 24 }) {
  const initial = (name?.[0] || "?").toUpperCase();
  const bg = name === "Kim" ? "#D3968C" : "#0A3323";
  return (
    <span
      title={name}
      style={{
        display: "inline-flex", alignItems: "center", justifyContent: "center",
        width: size, height: size, borderRadius: "50%",
        background: bg, color: "#F7F4D5",
        fontFamily: "'Cormorant Garamond', serif",
        fontSize: Math.round(size * 0.5), fontWeight: 600,
        flexShrink: 0,
      }}
    >{initial}</span>
  );
}

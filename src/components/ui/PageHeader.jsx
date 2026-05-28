export default function PageHeader({ title, sub, icon }) {
  return (
    <div style={{ marginBottom: "48px" }}>
      <div style={{
        fontSize: "11px",
        letterSpacing: "0.2em",
        textTransform: "uppercase",
        color: "#D3968C",
        marginBottom: "12px",
        fontFamily: "'Cormorant Garamond', serif",
      }}>{icon} {title}</div>
      <h2 style={{
        fontFamily: "'Playfair Display', serif",
        fontSize: "clamp(28px, 6vw, 42px)",
        fontWeight: "400",
        color: "#0A3323",
        margin: "0 0 8px",
        letterSpacing: "-0.01em",
      }}>{title}</h2>
      <p style={{
        fontFamily: "'Cormorant Garamond', serif",
        fontStyle: "italic",
        fontSize: "16px",
        color: "#5a8060",
        margin: 0,
      }}>{sub}</p>
      <div style={{ height: "1px", background: "#D8D9B0", marginTop: "32px" }} />
    </div>
  );
}
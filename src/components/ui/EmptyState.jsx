// Texto centralizado para listas vazias.
export default function EmptyState({ children }) {
  return (
    <div style={{
      fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic",
      fontSize: "15px", color: "#a8bc80",
      textAlign: "center", padding: "48px 0",
    }}>{children}</div>
  );
}

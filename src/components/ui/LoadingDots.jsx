// Indicador de carregamento "✦ ✦ ✦" usado nas listas.
export default function LoadingDots({ size = "16px" }) {
  return (
    <div style={{
      fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic",
      fontSize: size, color: "#a8bc80",
      textAlign: "center", padding: "48px 0",
      animation: "pulse 1.2s infinite",
    }}>✦ ✦ ✦</div>
  );
}

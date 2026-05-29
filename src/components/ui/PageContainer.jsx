export default function PageContainer({ children, maxWidth = "900px" }) {
  return (
    <div style={{ padding: "40px 24px", maxWidth, margin: "0 auto" }}>
      {children}
    </div>
  );
}

export default function Collapsible({ open, maxHeight = "600px", children }) {
  return (
    <div style={{
      maxHeight: open ? maxHeight : "0px",
      overflow: "hidden",
      transition: "max-height 0.35s ease",
    }}>
      {children}
    </div>
  );
}

export default function StarRating({ value, onChange }){
  return <div style={{ display: "flex", gap: "2px" }}>
    {[1,2,3,4,5].map(s => (
      <span
        key={s}
        onClick={() => onChange && onChange(s)}
        style={{
          fontSize: "14px",
          cursor: onChange ? "pointer" : "default",
          opacity: value >= s ? 1 : 0.25,
          transition: "opacity 0.2s",
        }}
      >★</span>
    ))}
  </div>
}
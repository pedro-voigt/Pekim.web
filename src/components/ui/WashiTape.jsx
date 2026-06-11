const COLORS = {
  sage: { a: "rgba(131,153,88,0.55)",  b: "rgba(168,188,128,0.38)" },
  rose: { a: "rgba(211,150,140,0.55)", b: "rgba(230,178,168,0.38)" },
};

export default function WashiTape({ variant = "sage", left = 20, rotation = -3 }) {
  const c = COLORS[variant] ?? COLORS.sage;
  return (
    <div style={{
      position: "absolute",
      top: "-9px",
      left: `${left}px`,
      width: "72px",
      height: "23px",
      background: `repeating-linear-gradient(45deg, ${c.a} 0px, ${c.a} 4px, ${c.b} 4px, ${c.b} 8px)`,
      opacity: 1,
      transform: `rotate(${rotation}deg)`,
      pointerEvents: "none",
      zIndex: 1,
      borderRadius: "1px",
    }} />
  );
}

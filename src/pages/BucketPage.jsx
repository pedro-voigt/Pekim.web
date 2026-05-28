import PageHeader from "../components/ui/PageHeader";
import StatusBadge from "../components/ui/StatusBadge";

import { BUCKET_LIST } from "../content/bucketList";

export default function BucketPage() {
  const done = BUCKET_LIST.filter(b => b.done).length;
  const pct = Math.round((done / BUCKET_LIST.length) * 100);

  return (
    <div style={{ padding: "40px 24px", maxWidth: "680px", margin: "0 auto" }}>
      <PageHeader title="Bucket List" sub="Tudo que a gente ainda vai viver" icon="⊹" />

      {/* Progress */}
      <div style={{ marginBottom: "48px" }}>
        <div style={{
          display: "flex", justifyContent: "space-between",
          marginBottom: "10px",
          fontFamily: "'Cormorant Garamond', serif",
          fontStyle: "italic",
          fontSize: "14px", color: "#2e5c3a",
        }}>
          <span>{done} de {BUCKET_LIST.length} realizados</span>
          <span>{pct}%</span>
        </div>
        <div style={{
          height: "2px", background: "#D8D9B0",
          borderRadius: "2px", overflow: "hidden",
        }}>
          <div style={{
            height: "100%", width: `${pct}%`,
            background: "linear-gradient(90deg, #D3968C, #839958)",
            transition: "width 1s ease",
          }} />
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
        {BUCKET_LIST.map(item => (
          <div key={item.id} style={{
            display: "flex", alignItems: "center",
            gap: "20px",
            padding: "20px 24px",
            background: item.done ? "#F7F4D5" : "#EEEBd8",
          }}>
            <div style={{
              width: "24px", height: "24px",
              border: `1px solid ${item.done ? "#D3968C" : "#a8bc80"}`,
              background: item.done ? "#D3968C" : "transparent",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "12px", color: "#fff",
              flexShrink: 0,
            }}>
              {item.done ? "✓" : ""}
            </div>
            <span style={{ fontSize: "20px" }}>{item.emoji}</span>
            <span style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: "16px",
              color: item.done ? "#5a8060" : "#0A3323",
              textDecoration: item.done ? "line-through" : "none",
              textDecorationColor: "#a8bc80",
            }}>{item.item}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
import { Input } from "../ui/Field";

// Painel de edição da rota: lista os waypoints (partida → paradas → chegada),
// permite renomear, reordenar e remover. Os pontos são adicionados clicando no
// mapa (CorkMap). Precisa de ≥2 pontos para uma rota válida.

const labelStyle = {
  fontSize: "11px", letterSpacing: "0.15em", textTransform: "uppercase",
  color: "#5a8060", fontFamily: "'Cormorant Garamond', serif",
};

const tipoOf = (i, n) => (i === 0 ? "partida" : i === n - 1 ? "chegada" : "parada");

const miniBtn = {
  background: "transparent", border: "1px solid #D8D9B0", color: "#5a8060",
  width: "22px", height: "22px", cursor: "pointer", lineHeight: 1,
  fontSize: "12px", flexShrink: 0,
};

export default function RoutePanel({ waypoints, onRename, onRemove, onMove, onSave, onCancel, saving }) {
  const n = waypoints.length;
  const canSave = n >= 2 && !saving;

  return (
    <div style={{
      position: "absolute",
      top: 0, right: 0, bottom: 0,
      width: "min(340px, 86%)",
      background: "#F7F4D5",
      boxShadow: "-8px 0 24px -8px rgba(0,0,0,0.45)",
      zIndex: 600,
      padding: "24px 20px 28px",
      overflowY: "auto",
      animation: "fadeIn 0.3s ease",
    }}>
      <div style={{ ...labelStyle, marginBottom: "8px" }}>editando rota</div>
      <p style={{
        fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic",
        fontSize: "13px", color: "#5a8060", lineHeight: 1.5, margin: "0 0 18px",
      }}>
        Clique no mapa para adicionar pontos, na ordem da viagem
        (partida → paradas → chegada).
      </p>

      {n === 0 ? (
        <div style={{
          border: "1px dashed #D8D9B0", padding: "18px", textAlign: "center",
          fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic",
          fontSize: "13px", color: "#a8bc80", marginBottom: "20px",
        }}>nenhum ponto ainda ✦</div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "22px" }}>
          {waypoints.map((w, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{
                ...labelStyle, fontSize: "9px", width: "46px", flexShrink: 0,
                color: "#D3968C",
              }}>{tipoOf(i, n)}</span>
              <Input
                value={w.nome}
                onChange={(e) => onRename(i, e.target.value)}
                placeholder={`Ponto ${i + 1}`}
                style={{ fontSize: "14px" }}
              />
              <button style={miniBtn} onClick={() => onMove(i, -1)} disabled={i === 0} title="Subir">↑</button>
              <button style={miniBtn} onClick={() => onMove(i, 1)} disabled={i === n - 1} title="Descer">↓</button>
              <button
                style={{ ...miniBtn, borderColor: "#e3b8b1", color: "#D3968C" }}
                onClick={() => onRemove(i)}
                title="Remover"
              >×</button>
            </div>
          ))}
        </div>
      )}

      <div style={{ display: "flex", gap: "12px" }}>
        <button
          onClick={onSave}
          disabled={!canSave}
          style={{
            fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontSize: "14px",
            color: canSave ? "#F7F4D5" : "#a8bc80",
            background: canSave ? "#0A3323" : "transparent",
            border: `1px solid ${canSave ? "#0A3323" : "#D8D9B0"}`,
            padding: "10px 24px", cursor: canSave ? "pointer" : "default",
            transition: "all 0.2s",
          }}
        >salvar rota</button>
        <button
          onClick={onCancel}
          style={{
            fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontSize: "14px",
            color: "#5a8060", background: "transparent",
            border: "none", padding: "10px 8px", cursor: "pointer",
          }}
        >cancelar</button>
      </div>
    </div>
  );
}

// Painel que abre ao clicar num alfinete.
// Passo 5: fotos (polaroids), período, nota, avatar do autor (P/K).
// Passo 6 adiciona a rota desenhada no mapa (aqui já mostramos o resumo).

import { confirm } from "../../lib/confirm";
import Avatar from "../ui/Avatar";

const fmt = (d) =>
  d
    ? new Date(d + "T12:00:00").toLocaleDateString("pt-BR", {
        day: "2-digit", month: "long", year: "numeric",
      })
    : null;

const MODO_LABEL = { driving: "de carro", flight: "de avião", walking: "a pé" };

// Foto presa estilo polaroid (moldura branca, leve rotação alternada, sombra).
function Polaroid({ url, i }) {
  const rot = i % 2 === 0 ? -2.5 : 2.5;
  return (
    <div style={{
      background: "#fff",
      padding: "7px 7px 18px",
      boxShadow: "0 4px 10px rgba(0,0,0,0.25)",
      transform: `rotate(${rot}deg)`,
      width: "128px",
    }}>
      <img
        src={url}
        alt=""
        loading="lazy"
        style={{
          display: "block", width: "100%", height: "104px",
          objectFit: "cover", background: "#EEEBd8",
        }}
      />
    </div>
  );
}

const labelStyle = {
  fontSize: "11px", letterSpacing: "0.15em", textTransform: "uppercase",
  color: "#5a8060", fontFamily: "'Cormorant Garamond', serif",
};

export default function PlacePanel({ place, onClose, onEdit, onDelete }) {
  if (!place) return null;

  const handleDelete = async () => {
    if (await confirm(`Excluir "${place.nome}" do mapa?`)) onDelete();
  };

  const periodo = [fmt(place.data_inicio), fmt(place.data_fim)].filter(Boolean).join(" — ");
  const fotos = Array.isArray(place.fotos) ? place.fotos : [];
  const paradas = Array.isArray(place.rota) ? place.rota.length : 0;

  return (
    <div style={{
      position: "absolute",
      top: 0, right: 0, bottom: 0,
      width: "min(340px, 86%)",
      background: "#F7F4D5",
      boxShadow: "-8px 0 24px -8px rgba(0,0,0,0.45)",
      zIndex: 600,                 // acima da vinheta (500); pointer-events normal
      padding: "24px 24px 28px",
      overflowY: "auto",
      animation: "fadeIn 0.3s ease",
    }}>
      <button
        onClick={onClose}
        aria-label="Fechar"
        style={{
          position: "absolute", top: "12px", right: "12px",
          width: "30px", height: "30px",
          background: "transparent", border: "1px solid #D8D9B0",
          color: "#5a8060", fontSize: "16px", lineHeight: 1,
          cursor: "pointer",
        }}
      >×</button>

      <div style={{ ...labelStyle, marginBottom: "6px" }}>{periodo || "viagem"}</div>

      <h3 style={{
        fontFamily: "'Playfair Display', serif",
        fontSize: "24px", fontWeight: "400", color: "#0A3323",
        margin: "0 0 12px",
      }}>{place.nome}</h3>

      {place.autor && (
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
          <Avatar name={place.autor} />
          <span style={{
            fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic",
            fontSize: "13px", color: "#5a8060",
          }}>registrado por {place.autor}</span>
        </div>
      )}

      {place.nota && (
        <p style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontSize: "15px", color: "#2e5c3a", lineHeight: 1.7,
          fontStyle: "italic", margin: "0 0 20px",
        }}>{place.nota}</p>
      )}

      {/* Fotos (polaroids) */}
      <div style={{ ...labelStyle, marginBottom: "12px" }}>fotos</div>
      {fotos.length > 0 ? (
        <div style={{
          display: "flex", flexWrap: "wrap", gap: "16px 14px",
          justifyContent: "center", marginBottom: "20px",
        }}>
          {fotos.slice(0, 4).map((url, i) => (
            <Polaroid key={i} url={url} i={i} />
          ))}
        </div>
      ) : (
        <div style={{
          border: "1px dashed #D8D9B0", padding: "20px",
          textAlign: "center", marginBottom: "20px",
          fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic",
          fontSize: "13px", color: "#a8bc80",
        }}>sem fotos ainda ✦</div>
      )}

      {/* Resumo da viagem (rota desenhada no mapa vem no passo 6) */}
      <div style={{
        fontFamily: "'Cormorant Garamond', serif", fontSize: "13px",
        color: "#5a8060", fontStyle: "italic",
      }}>
        viagem {MODO_LABEL[place.modo] || place.modo}
        {paradas > 0 ? ` · ${paradas} paradas` : ""}
      </div>

      {(onEdit || onDelete) && (
        <div style={{
          display: "flex", gap: "20px", marginTop: "24px",
          paddingTop: "16px", borderTop: "1px solid #D8D9B0",
        }}>
          {onEdit && (
            <button
              onClick={onEdit}
              style={{
                fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontSize: "14px",
                color: "#2e5c3a", background: "transparent", border: "none",
                padding: 0, cursor: "pointer",
              }}
            >editar</button>
          )}
          {onDelete && (
            <button
              onClick={handleDelete}
              style={{
                fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontSize: "14px",
                color: "#D3968C", background: "transparent", border: "none",
                padding: 0, cursor: "pointer",
              }}
            >excluir</button>
          )}
        </div>
      )}
    </div>
  );
}

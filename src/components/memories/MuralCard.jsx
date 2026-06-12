import { useState } from "react";

import Avatar from "../ui/Avatar";
import WashiTape from "../ui/WashiTape";
import PushPin from "../ui/PushPin";
import ItemActions from "../ui/ItemActions";
import { washiDecor } from "../../lib/dateDecor";
import { pinColor, cardTilt, photoAspect } from "../../lib/memoriesDecor";

const MONTH_ABBR = ["jan","fev","mar","abr","mai","jun","jul","ago","set","out","nov","dez"];
function formatMonth(str) {
  if (!str) return "";
  const [year, month] = str.split("-");
  return `${MONTH_ABBR[parseInt(month, 10) - 1]} ${year}`;
}

// autor → nomes para os avatares ("ambos" = sobrepostos estilo Spotify).
const AUTOR_AVATARES = { pedro: ["Pedro"], kim: ["Kim"], ambos: ["Pedro", "Kim"] };

function Avatars({ autor, onPhoto }) {
  const names = AUTOR_AVATARES[autor] ?? [];
  if (!names.length) return null;
  return (
    <div style={{ display: "flex" }}>
      {names.map((n, i) => (
        <span key={n} style={{ marginLeft: i === 0 ? 0 : "-8px" }}>
          <Avatar name={n} size={22} borderColor={onPhoto ? "#fff" : "#F7F4D5"} />
        </span>
      ))}
    </div>
  );
}

function MetaRow({ data, autor, onPhoto }) {
  return (
    <div style={{
      display:        "flex",
      alignItems:     "center",
      justifyContent: "space-between",
      marginTop:      onPhoto ? "8px" : "10px",
    }}>
      <span style={{
        fontFamily: "'Cormorant Garamond', serif",
        fontStyle:  "italic",
        fontSize:   "13px",
        color:      "#839958",
      }}>
        {formatMonth(data)}
      </span>
      <Avatars autor={autor} onPhoto={onPhoto} />
    </div>
  );
}

// Marcador discreto de sonho realizado — versão para o card de texto (sem foto,
// onde o badge rotacionado da polaroid não cabe). Inline, oliva, sutil.
function SonhoTag() {
  return (
    <div style={{
      fontFamily:    "'Cormorant Garamond', serif",
      fontStyle:     "italic",
      fontSize:      "11px",
      letterSpacing: "0.08em",
      color:         "#839958",
      display:       "flex",
      alignItems:    "center",
      gap:           "5px",
      marginBottom:  "7px",
    }}>
      <span style={{ fontSize: "12px" }}>✦</span> sonho realizado
    </div>
  );
}

// Selo recíproco ao "⤳ Memórias" da Bucket List — marca memórias vindas de um sonho.
function SonhoBadge() {
  return (
    <div style={{
      position:      "absolute",
      top:           "14px",
      right:         "-6px",
      transform:     "rotate(7deg)",
      background:    "#839958",
      color:         "#fff",
      fontFamily:    "'Playfair Display', serif",
      fontWeight:    700,
      fontSize:      "10px",
      letterSpacing: "0.06em",
      padding:       "4px 9px",
      borderRadius:  "3px",
      zIndex:        4,
      boxShadow:     "0 2px 5px rgba(0,0,0,0.2)",
      whiteSpace:    "nowrap",
    }}>
      ✦ Sonho realizado!
    </div>
  );
}

export default function MuralCard({ memory, reducedMotion, isEditing, onEdit, onDelete }) {
  const [hovered, setHovered] = useState(false);
  const isPhoto = !!(memory.foto_url || memory.ph);
  const washi   = washiDecor(memory.id);

  const editOutline = isEditing ? { outline: "2px solid #D3968C", outlineOffset: "-2px" } : null;

  // Ações editar/excluir — reveladas no hover, canto superior direito (sobre a foto/texto).
  const actions = (onEdit || onDelete) ? (
    <div style={{
      position:      "absolute",
      top:           "6px",
      right:         "6px",
      zIndex:        6,
      display:       "flex",
      alignItems:    "center",
      background:    "rgba(247,244,213,0.92)",
      borderRadius:  "4px",
      boxShadow:     "0 1px 5px rgba(10,51,35,0.18)",
      opacity:       hovered ? 1 : 0,
      transition:    reducedMotion ? "none" : "opacity .2s",
      pointerEvents: hovered ? "auto" : "none",
    }}>
      <ItemActions
        onEdit={onEdit}
        onDelete={onDelete}
        confirmMessage={`Excluir ${memory.titulo ? `a memória "${memory.titulo}"` : "esta memória"}?`}
      />
    </div>
  ) : null;

  // ---- Card de texto (creme) -------------------------------------------------
  if (!isPhoto) {
    return (
      <div
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          position:     "relative",
          background:   "#F7F4D5",
          border:       "1px solid rgba(131,153,88,0.35)",
          borderRadius: "5px",
          padding:      "14px 16px",
          boxShadow:    hovered ? "0 8px 20px rgba(10,51,35,0.12)" : "0 2px 8px rgba(10,51,35,0.06)",
          ...editOutline,
          ...(reducedMotion ? {} : {
            transform:  hovered ? "translateY(-3px)" : "translateY(0)",
            transition: "transform .3s cubic-bezier(.2,.8,.25,1), box-shadow .3s",
          }),
        }}
      >
        {washi && <WashiTape {...washi} />}
        {actions}
        {memory.origem === "sonho" && <SonhoTag />}
        {memory.titulo && (
          <div style={{
            fontFamily:   "'Playfair Display', serif",
            fontWeight:   700,
            fontSize:     "16px",
            lineHeight:   1.15,
            color:        "#0A3323",
            paddingRight: "18px",
            marginBottom: memory.texto ? "6px" : 0,
          }}>
            {memory.titulo}
          </div>
        )}
        {memory.texto && (
          <div style={{
            fontFamily:   "'Cormorant Garamond', serif",
            fontStyle:    "italic",
            fontSize:     "14px",
            opacity:      0.85,
            lineHeight:   1.4,
            color:        "#0A3323",
            paddingRight: memory.titulo ? 0 : "18px",
          }}>
            “{memory.texto}”
          </div>
        )}
        <MetaRow data={memory.data} autor={memory.autor} />
      </div>
    );
  }

  // ---- Polaroid (foto) -------------------------------------------------------
  const tilt    = cardTilt(memory.id);
  const ratio   = memory.ph?.ratio || photoAspect(memory.id);
  const isSonho = memory.origem === "sonho";

  const restTransform = `rotate(${tilt}deg)`;
  const hoverTransform = `rotate(0deg) translateY(-4px) scale(1.02)`;

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position:   "relative",
        background: "#fff",
        padding:    "10px 10px 0",
        boxShadow:  hovered ? "0 10px 26px rgba(10,51,35,0.26)" : "0 4px 16px rgba(10,51,35,0.18)",
        ...editOutline,
        ...(reducedMotion ? { transform: restTransform } : {
          transform:  hovered ? hoverTransform : restTransform,
          transition: "transform .35s cubic-bezier(.2,.8,.25,1), box-shadow .35s",
        }),
      }}
    >
      {/* Um único fixador por polaroid: fita OU tachinha (nunca os dois → sem sobreposição). */}
      {washi
        ? <WashiTape {...washi} />
        : <PushPin color={pinColor(memory.id)} />}
      {isSonho && <SonhoBadge />}
      {actions}

      {/* Foto (ou placeholder com gradiente + emoji enquanto não há Storage) */}
      <div style={{
        aspectRatio:    ratio,
        overflow:       "hidden",
        background:     memory.ph?.grad || "#e9e6d0",
        display:        "flex",
        alignItems:     "center",
        justifyContent: "center",
      }}>
        {memory.foto_url
          ? <img src={memory.foto_url} alt="" loading="lazy" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
          : <span style={{ fontSize: "34px", opacity: 0.6 }}>{memory.ph?.emoji || "📷"}</span>}
      </div>

      <div style={{ padding: "10px 4px 12px" }}>
        <div style={{
          fontFamily: "'Playfair Display', serif",
          fontWeight: 700,
          fontSize:   "16px",
          lineHeight: 1.1,
          color:      "#0A3323",
        }}>
          {memory.titulo}
        </div>
        <MetaRow data={memory.data} autor={memory.autor} onPhoto />
      </div>
    </div>
  );
}

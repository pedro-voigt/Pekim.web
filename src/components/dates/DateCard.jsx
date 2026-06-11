import { useState, useRef } from "react";
import useMediaQuery from "../../hooks/useMediaQuery";
import ItemActions from "../ui/ItemActions";
import Avatar from "../ui/Avatar";
import WashiTape from "../ui/WashiTape";
import Polaroid from "../ui/Polaroid";
import { washiDecor } from "../../lib/dateDecor";

const AUTOR_NAMES = { pedro: "Pedro", kim: "Kim" };

const CARIMBO = {
  fontFamily:    "'Playfair Display', serif",
  fontStyle:     "italic",
  fontWeight:    400,
  fontSize:      "14px",
  color:         "#cf8e84",
  border:        "1.5px solid #dca59c",
  borderRadius:  "3px",
  padding:       "3px 13px",
  transform:     "rotate(-4deg)",
  display:       "inline-block",
  cursor:        "pointer",
  background:    "transparent",
  lineHeight:    1.3,
  whiteSpace:    "nowrap",
};

function formatId(id) {
  const n = Number(id);
  return `N.º ${isNaN(n) ? id : String(n).padStart(2, "0")}`;
}

const STATUS_LABEL = { "Quero fazer": "quero fazer", "Planejado": "planejado", "Feito": "feito ♥" };

// Chip de categoria (contorno) — cor adaptada ao fundo do card.
function categoryChip(role) {
  if (role === "rosa") return { border: "1px solid rgba(255,255,255,0.55)", color: "#fff" };
  if (role === "hero") return { border: "1px solid rgba(247,244,213,0.4)",  color: "#F7F4D5" };
  return { border: "1px solid #c8cda2", color: "#5a7050" };
}

// Chip de status (preenchido) — lowercase, formato pílula.
function statusChip(status, role) {
  if (role === "rosa") return { background: "#fbf6f1", color: "#bf837a" };
  if (role === "hero") return { background: "rgba(247,244,213,0.16)", color: "#F7F4D5" };
  if (status === "Planejado") return { background: "#cfe0e2", color: "#37666e" };
  return { background: "#e9e8cd", color: "#6a7a52" };
}

const CHIP_BASE = {
  fontFamily:   "'Cormorant Garamond', serif",
  fontStyle:    "italic",
  fontSize:     "14px",
  padding:      "3px 12px",
  borderRadius: "20px",
  whiteSpace:   "nowrap",
  display:      "inline-block",
  lineHeight:   1.3,
};

export default function DateCard({
  date,
  role,
  theme: th,
  isEditing,
  reducedMotion,
  onToggleStatus,
  onEdit,
  onDelete,
}) {
  const [hovered, setHovered] = useState(false);
  const statusRef = useRef(null);
  const washi     = washiDecor(date.id);
  const isFeito   = date.status === "Feito";
  const isMobile  = useMediaQuery("(max-width: 560px)");

  const handleToggleStatus = () => {
    if (!reducedMotion) {
      statusRef.current?.animate(
        [{ transform: "scale(1)" }, { transform: "scale(1.18)" }, { transform: "scale(1)" }],
        { duration: 300, easing: "ease-out" },
      );
    }
    onToggleStatus(date);
  };

  const cardStyle = {
    breakInside:   "avoid",
    display:       "inline-block",
    width:         "100%",
    padding:       isMobile ? "14px 14px" : "18px 18px",
    background:    th.bg,
    border:        th.border,
    boxShadow:     hovered ? th.hoverShadow : th.shadow,
    boxSizing:     "border-box",
    position:      "relative",
    outline:       isEditing ? "2px solid #D3968C" : "none",
    outlineOffset: "-2px",
    ...(!reducedMotion ? {
      transform:  hovered ? "translateY(-6px)" : "translateY(0)",
      transition: "transform .28s cubic-bezier(.2,.8,.25,1), box-shadow .28s",
      // Promove o card a uma camada de composição própria: o transform do hover
      // deixa de invalidar o layout das CSS columns (que rebalanceava e piscava).
      willChange: "transform",
    } : {}),
  };

  // Eyebrow: hero/rosa mostram o rótulo de destaque (com a vibe como prefixo, se houver);
  // cards comuns mostram só a vibe, em rose.
  const vibePrefix = date.vibe ? `${date.vibe} · ` : "";
  const eyebrow =
    role === "hero" ? `${vibePrefix}o nosso sonho` :
    role === "rosa" ? `${vibePrefix}o mais fácil de todos` :
    date.vibe || "";
  const eyebrowColor =
    role === "hero" ? "#a8bc80" :
    role === "rosa" ? "rgba(255,255,255,0.82)" :
    "#D3968C";

  return (
    <div
      style={cardStyle}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Washi tape */}
      {washi && <WashiTape {...washi} />}

      {/* Polaroid — sobrepõe texto (z-index 2) */}
      {isFeito && (
        <Polaroid
          id={date.id}
          fotoUrl={date.foto_url}
          feitoEm={date.feito_em}
          hovered={hovered}
          reducedMotion={reducedMotion}
        />
      )}

      {/* Linha topo: N° · avatares (quem teve a ideia) */}
      <div style={{
        position:     "relative",
        zIndex:       3,
        display:      "flex",
        alignItems:   "center",
        gap:          "8px",
        marginBottom: "4px",
      }}>
        <span style={{
          fontFamily:    "'Playfair Display', serif",
          fontStyle:     "italic",
          fontWeight:    400,
          fontSize:      "14px",
          color:         role === "rosa" ? "rgba(255,255,255,0.8)" : "#D3968C",
          letterSpacing: "0.04em",
        }}>
          {formatId(date.id)}
        </span>

        {date.autores?.length > 0 && (
          <div style={{ display: "flex" }}>
            {date.autores.map((a, i) => (
              <span key={a} style={{ marginLeft: i === 0 ? 0 : "-9px" }}>
                <Avatar name={AUTOR_NAMES[a] ?? a} size={26} borderColor={role !== "default" ? "#F7F4D5" : th.bg} />
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Eyebrow — vibe e/ou rótulo de destaque, em uma única linha */}
      {eyebrow && (
        <div style={{
          fontFamily:   "'Cormorant Garamond', serif",
          fontStyle:    "italic",
          fontSize:     "15px",
          color:        eyebrowColor,
          marginBottom: "6px",
        }}>
          {eyebrow}
        </div>
      )}

      <h3 style={{
        fontFamily: "'Playfair Display', serif",
        fontSize:   role === "hero" ? "35px" : "24px",
        fontWeight: "500",
        color:      th.title,
        margin:     "0 0 8px",
        lineHeight: 1.15,
      }}>
        {date.name}
      </h3>

      <p style={{
        fontFamily: "'Cormorant Garamond', serif",
        fontSize:   "16px",
        color:      th.desc,
        lineHeight: 1.5,
        margin:     0,
      }}>
        {date.description}
      </p>

      {/* Meta-linha: [categoria-chip] [custo] [status-chip / carimbo feito♥] — agrupados à esquerda.
          paddingRight reserva espaço p/ os botões no canto inferior direito. */}
      <div style={{
        display:      "flex",
        alignItems:   "center",
        flexWrap:     "wrap",
        gap:          "9px",
        marginTop:    "12px",
        paddingRight: "46px",
      }}>
        {date.category && (
          <span style={{ ...CHIP_BASE, ...categoryChip(role) }}>{date.category}</span>
        )}
        {date.cost && (
          <span style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontStyle:  "italic",
            fontSize:   "15px",
            color:      role === "default" ? "#94a06a" : (role === "hero" ? "#a8bc80" : "rgba(255,255,255,0.7)"),
          }}>
            {date.cost}
          </span>
        )}

        {isFeito ? (
          <button
            ref={statusRef}
            onClick={handleToggleStatus}
            title="Clique para desfazer"
            aria-label="Marcar como não-feito"
            style={CARIMBO}
          >
            feito ♥
          </button>
        ) : (
          <button
            ref={statusRef}
            onClick={handleToggleStatus}
            title="Clique para mudar status"
            aria-label={`Status: ${date.status}. Mudar para próximo.`}
            style={{ ...CHIP_BASE, ...statusChip(date.status, role), borderRadius: "3px", border: "none", cursor: "pointer" }}
          >
            {STATUS_LABEL[date.status] || date.status}
          </button>
        )}
      </div>

      {/* Ações — canto inferior direito, revela no hover */}
      <div style={{
        position:      "absolute",
        bottom:        isMobile ? "12px" : "16px",
        right:         isMobile ? "12px" : "16px",
        zIndex:        4,
        opacity:       hovered ? 1 : 0,
        transition:    reducedMotion ? "none" : "opacity .2s",
        pointerEvents: hovered ? "auto" : "none",
      }}>
        <ItemActions
          onEdit={onEdit}
          onDelete={onDelete}
          confirmMessage={`Excluir "${date.name}"?`}
        />
      </div>
    </div>
  );
}

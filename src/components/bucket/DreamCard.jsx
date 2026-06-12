import { useState, useRef } from "react";
import Avatar from "../ui/Avatar";
import WashiTape from "../ui/WashiTape";
import ItemActions from "../ui/ItemActions";
import { washiDecor, polaroidRotation } from "../../lib/dateDecor";

const MONTH_ABBR = ["jan","fev","mar","abr","mai","jun","jul","ago","set","out","nov","dez"];

// "2025-03-09" → "mar 2025"
function monthYear(str) {
  if (!str) return null;
  const [year, month] = str.split("-");
  return `${MONTH_ABBR[parseInt(month, 10) - 1]} ${year}`;
}

// Tilt sutil da polaroid de card inteiro (-1.2° / +1.1° / -0.8°), nunca reto.
// Reaproveita o hash determinístico de polaroidRotation (devolve 4, 5 ou 6).
const TILTS = { 4: -1.2, 5: 1.1, 6: -0.8 };
function polaroidTilt(id) {
  return TILTS[polaroidRotation(id)] ?? 1;
}

const AUTHOR_NAMES = { pedro: ["Pedro"], kim: ["Kim"], ambos: ["Pedro", "Kim"] };

function Authors({ who, borderColor }) {
  const names = AUTHOR_NAMES[who] ?? AUTHOR_NAMES.ambos;
  return (
    <div style={{ display: "flex" }}>
      {names.map((n, i) => (
        <span key={n} style={{ marginLeft: i === 0 ? 0 : "-8px" }}>
          <Avatar name={n} size={22} borderColor={borderColor} />
        </span>
      ))}
    </div>
  );
}

// Selo de rodapé dos realizados: a data, e — quando há memória vinculada
// (memoria_id) — o link "⤳ Memórias" que navega pra página Memórias.
function MemoriasSeal({ date, linked, onOpen }) {
  const [hover, setHover] = useState(false);
  const base = {
    fontFamily: "'Cormorant Garamond', serif",
    fontStyle:  "italic",
    fontSize:   "13px",
    color:      "#839958",
  };
  return (
    <span style={base}>
      {date ? (linked ? `${date} · ` : date) : ""}
      {linked && (
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onOpen?.(); }}
          onMouseEnter={() => setHover(true)}
          onMouseLeave={() => setHover(false)}
          title="Ver na linha do tempo de Memórias"
          style={{
            ...base,
            background:          "transparent",
            border:              "none",
            padding:             0,
            cursor:              "pointer",
            textDecorationLine:  hover ? "underline" : "none",
            textUnderlineOffset: "2px",
            transition:          "text-decoration-color 0.15s",
          }}
        >
          ⤳ Memórias
        </button>
      )}
    </span>
  );
}

const TITLE_FONT = "'Playfair Display', serif";

export default function DreamCard({ dream, reducedMotion, onToggle, onOpenMemoria, onDelete }) {
  const [hovered, setHovered] = useState(false);
  const checkRef = useRef(null);
  const rootRef  = useRef(null);

  const isRealizado = dream.status === "realizado";
  const hasFoto     = isRealizado && !!dream.foto_url;
  const linked      = !!dream.memoria_id;
  const washi       = washiDecor(dream.id);
  const date        = monthYear(dream.data_realizacao);

  // transform parado = translateY(0) (não "none"): manter sempre um transform
  // estável evita criar/destruir stacking context no hover, o que fazia o
  // multi-column (columns) recalcular o balanceamento e mexer no espaçamento
  // das outras linhas. Mesmo padrão do DateCard.
  const lift = (translate, shadow, hoverShadow) => (!reducedMotion ? {
    transform:  hovered ? translate : "translateY(0)",
    boxShadow:  hovered ? hoverShadow : shadow,
    transition: "transform .28s cubic-bezier(.2,.8,.25,1), box-shadow .28s",
  } : { boxShadow: hovered ? hoverShadow : shadow });

  const handleToggle = () => {
    if (!reducedMotion) {
      checkRef.current?.animate(
        [{ transform: "scale(1)" }, { transform: "scale(1.25)" }, { transform: "scale(1)" }],
        { duration: 300, easing: "ease-out" },
      );
      // pulse no card inteiro — composite "add" soma ao transform de hover sem brigar.
      // rootRef sobrevive ao morph pendente→realizado (React reusa o <div> raiz).
      rootRef.current?.animate(
        [{ transform: "scale(1)" }, { transform: "scale(1.025)" }, { transform: "scale(1)" }],
        { duration: 340, easing: "ease-out", composite: "add" },
      );
    }
    onToggle?.(dream);
  };

  // Delete revelado no hover (canto superior direito) — reaproveita ItemActions.
  const deleteControl = onDelete && (
    <div style={{
      position:      "absolute",
      top:           "6px",
      right:         "8px",
      zIndex:        5,
      opacity:       hovered ? 1 : 0,
      transition:    reducedMotion ? "none" : "opacity .2s",
      pointerEvents: hovered ? "auto" : "none",
    }}>
      <ItemActions onDelete={() => onDelete(dream)} confirmMessage={`Tirar "${dream.titulo}" da lista?`} />
    </div>
  );

  // ── a) REALIZADO com foto → polaroid de card inteiro ───────────────────────
  if (hasFoto) {
    return (
      <div
        ref={rootRef}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          position:   "relative",
          background: "#fff",
          padding:    "10px 10px 0",
          ...lift(
            "rotate(0deg) translateY(-4px)",
            "0 4px 16px rgba(10,51,35,0.18)",
            "0 12px 30px rgba(10,51,35,0.26)",
          ),
          transform: !reducedMotion && hovered
            ? "rotate(0deg) translateY(-4px)"
            : `rotate(${polaroidTilt(dream.id)}deg)`,
        }}
      >
        {washi && <WashiTape {...washi} />}
        {deleteControl}

        <div style={{ aspectRatio: "1 / 1", background: "#0A3323", overflow: "hidden" }}>
          <img src={dream.foto_url} alt="" loading="lazy" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
        </div>

        <div style={{ padding: "10px 4px 12px" }}>
          <div style={{ fontFamily: TITLE_FONT, fontWeight: 700, fontSize: "17px", lineHeight: 1.12, color: "#0A3323" }}>
            {dream.titulo}
          </div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "8px" }}>
            <MemoriasSeal date={date} linked={linked} onOpen={() => onOpenMemoria?.(dream)} />
            <Authors who={dream.sonhado_por} borderColor="#fff" />
          </div>
        </div>
      </div>
    );
  }

  // Card base creme (pendente + realizado-sem-foto)
  const cardBase = {
    position:     "relative",
    background:   "#F7F4D5",
    border:       "1px solid rgba(131,153,88,0.35)",
    borderRadius: "5px",
    padding:      "14px 16px",
    ...lift(
      "translateY(-4px)",
      "0 2px 8px rgba(10,51,35,0.06)",
      "0 10px 24px rgba(10,51,35,0.14)",
    ),
  };

  // ── c) REALIZADO sem foto → card sutil (check preenchido, sem carimbo) ──────
  if (isRealizado) {
    return (
      <div
        ref={rootRef}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={cardBase}
      >
        {deleteControl}
        <div style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}>
          <button
            ref={checkRef}
            onClick={handleToggle}
            aria-label={`"${dream.titulo}" — realizado. Desmarcar.`}
            title="Desmarcar"
            style={{
              width: "20px", height: "20px", flexShrink: 0, marginTop: "2px",
              border: "2px solid #839958", borderRadius: "5px", background: "#839958",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "#fff", fontSize: "12px", lineHeight: 1, cursor: "pointer", padding: 0,
            }}
          >
            ✓
          </button>
          <div style={{
            fontFamily: TITLE_FONT, fontWeight: 700, fontSize: "18px", lineHeight: 1.12,
            color: "#5a8060", opacity: 0.85,
          }}>
            {dream.titulo}
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "12px" }}>
          <MemoriasSeal date={date} linked={linked} onOpen={() => onOpenMemoria?.(dream)} />
          <Authors who={dream.sonhado_por} borderColor="#F7F4D5" />
        </div>
      </div>
    );
  }

  // ── b) PENDENTE → card aspiracional com checkbox ───────────────────────────
  return (
    <div
      ref={rootRef}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={cardBase}
    >
      {washi && <WashiTape {...washi} />}
      {deleteControl}

      <div style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}>
        <button
          ref={checkRef}
          onClick={handleToggle}
          aria-label={`Marcar "${dream.titulo}" como realizado`}
          title="Marcar como realizado"
          style={{
            width: "20px", height: "20px", flexShrink: 0, marginTop: "2px",
            border: "2px solid #839958", borderRadius: "5px", background: "transparent",
            cursor: "pointer", padding: 0,
          }}
        />
        <div>
          <div style={{ fontFamily: TITLE_FONT, fontWeight: 700, fontSize: "18px", lineHeight: 1.12, color: "#0A3323" }}>
            {dream.titulo}
          </div>
          {dream.microcopy && (
            <div style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontStyle:  "italic",
              fontSize:   "14px",
              opacity:    0.7,
              marginTop:  "4px",
              color:      "#2e5c3a",
            }}>
              "{dream.microcopy}"
            </div>
          )}
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "10px" }}>
        <Authors who={dream.sonhado_por} borderColor="#F7F4D5" />
      </div>
    </div>
  );
}

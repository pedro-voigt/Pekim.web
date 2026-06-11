import { polaroidRotation } from "../../lib/dateDecor";

const MONTH_ABBR = ["jan","fev","mar","abr","mai","jun","jul","ago","set","out","nov","dez"];

function formatDate(str) {
  if (!str) return null;
  const [year, month, day] = str.split("-");
  return `${parseInt(day, 10)} ${MONTH_ABBR[parseInt(month, 10) - 1]} ${year}`;
}

const PLACEHOLDER_BG = "linear-gradient(135deg, #839958 0%, #a8bc80 100%)";

export default function Polaroid({ id, fotoUrl, feitoEm, hovered, reducedMotion }) {
  const deg      = polaroidRotation(id);
  const dateText = formatDate(feitoEm);

  const rotate = (!reducedMotion && hovered)
    ? "rotate(0deg) scale(1.04)"
    : `rotate(${deg}deg)`;

  return (
    <div style={{
      position:      "absolute",
      top:           "14px",
      right:         "12px",
      zIndex:        2,
      pointerEvents: "none",
    }}>
      <div style={{
        background:  "#fff",
        padding:     "6px 6px 0",
        boxShadow:   hovered
          ? "3px 5px 16px rgba(10,51,35,.24), 0 2px 4px rgba(0,0,0,.15)"
          : "2px 3px 10px rgba(10,51,35,.18), 0 1px 3px rgba(0,0,0,.10)",
        transform:   rotate,
        ...(!reducedMotion ? { transition: "transform .35s ease, box-shadow .35s" } : {}),
      }}>
        {/* Foto ou placeholder */}
        <div style={{ width: "84px", height: "84px", overflow: "hidden" }}>
          {fotoUrl
            ? <img src={fotoUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
            : <div style={{ width: "100%", height: "100%", background: PLACEHOLDER_BG }} />
          }
        </div>

        {/* Borda inferior branca com data escrita à mão */}
        <div style={{
          height:         "22px",
          display:        "flex",
          alignItems:     "center",
          justifyContent: "center",
        }}>
          {dateText && (
            <span style={{
              fontFamily:    "'Cormorant Garamond', serif",
              fontStyle:     "italic",
              fontSize:      "11px",
              color:         "#5a8060",
              letterSpacing: "0.02em",
              userSelect:    "none",
            }}>
              {dateText}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

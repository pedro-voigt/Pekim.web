import { useEffect, useState } from "react";

import { subscribe } from "../../lib/toast";
import useMediaQuery from "../../hooks/useMediaQuery";

const DURATION_MS = 4000;
const MAX_VISIBLE = 4;

export default function Toaster() {
  const [toasts, setToasts] = useState([]);
  const isMobile = useMediaQuery("(max-width: 767px)");

  useEffect(() => {
    return subscribe((t) => {
      setToasts((prev) => [...prev, t].slice(-MAX_VISIBLE));
      setTimeout(() => {
        setToasts((prev) => prev.filter((x) => x.id !== t.id));
      }, DURATION_MS);
    });
  }, []);

  const dismiss = (id) => setToasts((prev) => prev.filter((x) => x.id !== id));

  return (
    <div
      aria-live="polite"
      style={{
        position: "fixed",
        bottom: isMobile ? 16 : 24,
        left: isMobile ? 16 : "auto",
        right: isMobile ? 16 : 24,
        zIndex: 1000,
        display: "flex",
        flexDirection: "column",
        gap: 8,
        pointerEvents: "none",
      }}
    >
      {toasts.map((t) => (
        <div
          key={t.id}
          role={t.type === "error" ? "alert" : "status"}
          onClick={() => dismiss(t.id)}
          style={{
            padding: "12px 20px",
            background: t.type === "error" ? "#D3968C" : "#839958",
            color: "#fff",
            fontFamily: "'Cormorant Garamond', serif",
            fontStyle: "italic",
            fontSize: "14px",
            letterSpacing: "0.02em",
            boxShadow: "0 8px 24px rgba(10,51,35,0.15)",
            animation: "fadeIn 0.3s ease",
            cursor: "pointer",
            pointerEvents: "auto",
            maxWidth: "320px",
          }}
        >
          {t.message}
        </div>
      ))}
    </div>
  );
}

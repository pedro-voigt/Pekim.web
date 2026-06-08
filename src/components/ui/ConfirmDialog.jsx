import { useEffect, useState } from "react";

import { subscribeConfirm } from "../../lib/confirm";

// Host único do confirm(): renderiza o diálogo quando há um pedido ativo e
// resolve a Promise com true (confirmar) ou false (cancelar / fechar / Esc).
export default function ConfirmDialog() {
  const [req, setReq] = useState(null);

  useEffect(() => subscribeConfirm(setReq), []);

  useEffect(() => {
    if (!req) return;
    const onKey = (e) => {
      if (e.key === "Escape") { req.resolve(false); setReq(null); }
      if (e.key === "Enter") { req.resolve(true); setReq(null); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [req]);

  if (!req) return null;

  const close = (result) => {
    req.resolve(result);
    setReq(null);
  };

  return (
    <div
      onClick={() => close(false)}
      style={{
        position: "fixed", inset: 0, zIndex: 2000,
        background: "rgba(10,51,35,0.45)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: "24px",
        animation: "fadeIn 0.2s ease",
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "#F7F4D5",
          maxWidth: "360px", width: "100%",
          padding: "28px 28px 22px",
          boxShadow: "0 20px 50px -12px rgba(10,51,35,0.5)",
          animation: "fadeIn 0.25s ease",
        }}
      >
        <p style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontSize: "17px", color: "#0A3323", lineHeight: 1.6,
          margin: "0 0 24px",
        }}>{req.message}</p>

        <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px" }}>
          <button
            onClick={() => close(false)}
            style={{
              fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontSize: "14px",
              color: "#5a8060", background: "transparent", border: "none",
              padding: "10px 16px", cursor: "pointer",
            }}
          >{req.cancelLabel}</button>
          <button
            onClick={() => close(true)}
            autoFocus
            style={{
              fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontSize: "14px",
              color: "#F7F4D5", background: "#D3968C", border: "1px solid #D3968C",
              padding: "10px 24px", cursor: "pointer", transition: "all 0.2s",
            }}
          >{req.confirmLabel}</button>
        </div>
      </div>
    </div>
  );
}

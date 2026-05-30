import { useState } from "react";

import { supabase } from "../lib/supabase";

// Tela de entrada por link mágico. Apenas os e-mails já cadastrados no Supabase
// conseguem entrar: shouldCreateUser:false impede criar conta nova daqui.
// Mensagem sempre genérica (não revela se o e-mail tem acesso).
export default function Login() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("idle"); // idle | sending | sent

  const submit = async (e) => {
    e.preventDefault();
    if (!email.trim() || status === "sending") return;
    setStatus("sending");
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: {
        shouldCreateUser: false,
        emailRedirectTo: window.location.origin,
      },
    });
    if (error) console.error("[auth otp]", error); // loga, mas não expõe ao usuário
    setStatus("sent");
  };

  return (
    <div style={{
      minHeight: "100dvh",
      background: "#EEEBd8",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: "24px",
    }}>
      <div style={{
        width: "100%", maxWidth: "380px",
        background: "#F7F4D5",
        padding: "44px 36px",
        boxShadow: "0 20px 60px rgba(10,51,35,0.12)",
        textAlign: "center",
      }}>
        <div style={{
          fontFamily: "'Playfair Display', serif", fontStyle: "italic",
          fontSize: "26px", color: "#0A3323", marginBottom: "6px",
        }}>Pedro <span style={{ color: "#D3968C" }}>&</span> Kim</div>
        <div style={{
          fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic",
          fontSize: "14px", color: "#5a8060", marginBottom: "32px",
        }}>nosso cantinho ✦</div>

        {status === "sent" ? (
          <div>
            <p style={{
              fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic",
              fontSize: "16px", color: "#2e5c3a", lineHeight: 1.7, margin: "0 0 20px",
            }}>
              Se esse e-mail tiver acesso, enviamos um link mágico.<br />
              Confere a caixa de entrada ✦
            </p>
            <button
              onClick={() => { setStatus("idle"); setEmail(""); }}
              style={{
                fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic",
                fontSize: "13px", color: "#5a8060",
                background: "transparent", border: "none", cursor: "pointer",
                textDecoration: "underline", textDecorationStyle: "dotted",
              }}
            >usar outro e-mail</button>
          </div>
        ) : (
          <form onSubmit={submit}>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu e-mail"
              autoComplete="email"
              style={{
                width: "100%",
                fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic",
                fontSize: "15px", color: "#0A3323",
                background: "transparent",
                border: "none", borderBottom: "1px solid #D3968C",
                outline: "none", padding: "8px 2px", marginBottom: "28px",
                textAlign: "center",
              }}
            />
            <button
              type="submit"
              disabled={status === "sending"}
              style={{
                width: "100%",
                fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic",
                fontSize: "15px",
                color: "#F7F4D5", background: "#0A3323",
                border: "1px solid #0A3323", padding: "12px",
                cursor: status === "sending" ? "default" : "pointer",
                opacity: status === "sending" ? 0.6 : 1,
                transition: "opacity 0.2s",
              }}
            >{status === "sending" ? "enviando…" : "entrar com link mágico"}</button>
          </form>
        )}
      </div>
    </div>
  );
}

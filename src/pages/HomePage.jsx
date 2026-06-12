import { useState, useEffect } from "react";

import useCounter from "../hooks/useCounter";
import { supabase } from "../lib/supabase";

import { OPEN_WHEN } from "../content/openWhen";

export default function HomePage({ onNavigate }) {
  const time = useCounter("2023-12-14");
  const [hovered, setHovered] = useState(false);
  const [counts, setCounts] = useState({
    dates: 0,
    moviesWatched: 0,
    memories: 0,
    bucketDone: 0,
    bucketTotal: 0,
  });
  const [lastMemory, setLastMemory] = useState(null);

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      supabase.from("dates").select("id", { count: "exact", head: true }),
      supabase.from("movies").select("id", { count: "exact", head: true }).eq("watched", true),
      supabase.from("memories").select("title, description, date").order("date", { ascending: false }).limit(1),
      supabase.from("memories").select("id", { count: "exact", head: true }),
      supabase.from("bucket_items").select("status"),
    ]).then(([dates, movies, lastMem, memCount, bucket]) => {
      if (cancelled) return;
      setCounts({
        dates: dates.count ?? 0,
        moviesWatched: movies.count ?? 0,
        memories: memCount.count ?? 0,
        bucketDone: (bucket.data || []).filter(b => b.status === "realizado").length,
        bucketTotal: (bucket.data || []).length,
      });
      if (lastMem.data && lastMem.data[0]) setLastMemory(lastMem.data[0]);
    }).catch((err) => {
      // Stay silent on the home page — each section page will surface its own toast.
      console.error("[home counts]", err);
    });
    return () => { cancelled = true; };
  }, []);

  return (
    <div style={{ minHeight: "100vh", padding: "0" }}>
      {/* Hero */}
      <div style={{
        position: "relative",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
        padding: "80px 24px 60px",
      }}>
        {/* Grain overlay */}
        <div style={{
          position: "fixed", inset: 0, opacity: 0.035, pointerEvents: "none",
          background: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E\")",
          zIndex: 0,
        }} />

        {/* Date pill */}
        <div style={{
          fontSize: "11px",
          letterSpacing: "0.2em",
          textTransform: "uppercase",
          color: "#5a8060",
          marginBottom: "40px",
          fontFamily: "'Cormorant Garamond', serif",
          fontStyle: "italic",
          zIndex: 1,
        }}>
          14 de dezembro de 2023
        </div>

        {/* Photo placeholder */}
        <div style={{
          width: "220px",
          height: "280px",
          background: "linear-gradient(135deg, #839958 0%, #0A3323 100%)",
          borderRadius: "2px",
          marginBottom: "48px",
          position: "relative",
          boxShadow: "0 20px 60px rgba(0,0,0,0.12), 0 4px 12px rgba(0,0,0,0.08)",
          transform: "rotate(-1.5deg)",
          zIndex: 1,
          overflow: "hidden",
        }}>
          <div style={{
            position: "absolute", inset: 0,
            display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center",
            color: "#839958", fontSize: "13px",
            fontFamily: "'Cormorant Garamond', serif",
            fontStyle: "italic", gap: "8px",
          }}>
            <span style={{ fontSize: "28px", opacity: 0.5 }}>♡</span>
            <span>foto do casal</span>
          </div>
        </div>

        {/* Names */}
        <h1 style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: "clamp(36px, 8vw, 58px)",
          fontWeight: "400",
          color: "#0A3323",
          margin: "0 0 8px",
          letterSpacing: "-0.01em",
          zIndex: 1,
          textAlign: "center",
        }}>
          Pedro <span style={{ color: "#D3968C", fontStyle: "italic" }}>&</span> Kim
        </h1>

        {/* Counter */}
        <div style={{
          display: "flex", gap: "32px", margin: "32px 0 40px",
          zIndex: 1,
        }}>
          {[
            { n: time.totalDays, label: "dias" },
            { n: time.months, label: "meses" },
            { n: time.years, label: "anos" },
          ].map(({ n, label }) => (
            <div key={label} style={{ textAlign: "center" }}>
              <div style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: "42px",
                fontWeight: "300",
                color: "#0A3323",
                lineHeight: 1,
              }}>{n ?? "–"}</div>
              <div style={{
                fontSize: "10px",
                letterSpacing: "0.15em",
                textTransform: "uppercase",
                color: "#5a8060",
                marginTop: "4px",
              }}>{label}</div>
            </div>
          ))}
        </div>

        {/* Quote */}
        <p style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontStyle: "italic",
          fontSize: "18px",
          color: "#2e5c3a",
          textAlign: "center",
          maxWidth: "340px",
          lineHeight: 1.7,
          margin: "0 0 48px",
          zIndex: 1,
        }}>
          "A gente não precisa de um destino,<br />só de tempo juntos."
        </p>

        {/* CTA Button */}
        <button
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          onClick={() => onNavigate("sorteador")}
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontStyle: "italic",
            fontSize: "16px",
            color: hovered ? "#fff" : "#0A3323",
            background: hovered ? "#0A3323" : "transparent",
            border: "1px solid #0A3323",
            padding: "14px 40px",
            borderRadius: "0",
            cursor: "pointer",
            letterSpacing: "0.05em",
            transition: "all 0.3s ease",
            zIndex: 1,
          }}
        >
          O que fazemos hoje? ✦
        </button>

        {/* Last memory */}
        {lastMemory && (
          <button
            onClick={() => onNavigate("memorias")}
            style={{
              position: "relative", zIndex: 1,
              marginTop: "64px",
              padding: "20px 28px",
              background: "rgba(255,255,255,0.7)",
              backdropFilter: "blur(8px)",
              border: "1px solid rgba(131,153,88,0.25)",
              borderRadius: "2px",
              maxWidth: "320px",
              width: "100%",
              cursor: "pointer",
              textAlign: "left",
              font: "inherit",
              color: "inherit",
            }}>
            <div style={{
              fontSize: "10px", letterSpacing: "0.15em",
              textTransform: "uppercase", color: "#5a8060",
              marginBottom: "8px",
            }}>última memória</div>
            <div style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: "16px", color: "#0A3323",
            }}>{lastMemory.title}</div>
            <div style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontStyle: "italic",
              fontSize: "13px", color: "#2e5c3a", marginTop: "4px",
            }}>{(lastMemory.description || "").substring(0, 60)}...</div>
          </button>
        )}
      </div>

      {/* Sections preview */}
      <div style={{
        padding: "80px 24px",
        maxWidth: "900px",
        margin: "0 auto",
      }}>
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
          gap: "2px",
        }}>
          {[
            { key: "dates", icon: "✦", title: "Dates", sub: `${counts.dates} ideias guardadas` },
            { key: "filmes", icon: "◎", title: "Filmes & Séries", sub: `${counts.moviesWatched} assistidos juntos` },
            { key: "memorias", icon: "◇", title: "Memórias", sub: `${counts.memories} momentos especiais` },
            { key: "diario", icon: "◈", title: "Diário", sub: "Só nossos pensamentos" },
            { key: "abrir-quando", icon: "⬡", title: "Abrir quando…", sub: `${OPEN_WHEN.length} cartinhas esperando` },
            { key: "bucket", icon: "⊹", title: "Nossos Sonhos", sub: `${counts.bucketDone}/${counts.bucketTotal} realizados` },
          ].map(s => (
            <button
              key={s.key}
              onClick={() => onNavigate(s.key)}
              style={{
                padding: "32px 28px",
                background: "#F7F4D5",
                border: "none",
                borderBottom: "1px solid #D8D9B0",
                cursor: "pointer",
                transition: "background 0.2s",
                textAlign: "left",
                font: "inherit",
                color: "inherit",
                width: "100%",
              }}
              onMouseEnter={e => e.currentTarget.style.background = "#E8E5C8"}
              onMouseLeave={e => e.currentTarget.style.background = "#F7F4D5"}
            >
              <div style={{
                fontSize: "20px", color: "#D3968C",
                marginBottom: "12px",
              }}>{s.icon}</div>
              <div style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: "18px", color: "#0A3323",
                marginBottom: "4px",
              }}>{s.title}</div>
              <div style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontStyle: "italic",
                fontSize: "13px", color: "#5a8060",
              }}>{s.sub}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

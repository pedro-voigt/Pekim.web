import { useState, useRef } from "react";

import useMediaQuery from "./hooks/useMediaQuery";

// ─── PAGES ───────────────────────────────────────────────────────────────────

import HomePage from "./pages/HomePage";
import DatesPage from "./pages/DatesPage";
import MoviesPage from "./pages/MoviesPage";
import MemoriesPage from "./pages/MemoriesPage";
import DiarioPage from "./pages/DiarioPage";
import AbrirQuandoPage from "./pages/AbrirQuandoPage";
import BucketPage from "./pages/BucketPage";
import SorteadorPage from "./pages/SorteadorPage";

// ─── NAV ─────────────────────────────────────────────────────────────────────

const NAV_ITEMS = [
  { key: "home", label: "Início" },
  { key: "dates", label: "Dates" },
  { key: "filmes", label: "Filmes" },
  { key: "memorias", label: "Memórias" },
  { key: "diario", label: "Diário" },
  { key: "abrir-quando", label: "Abrir quando" },
  { key: "bucket", label: "Bucket List" },
  { key: "sorteador", label: "Sorteador" },
];

const NAV_ICONS = {
  home: "⌂", dates: "✦", filmes: "◎",
  memorias: "◇", diario: "◈", "abrir-quando": "⬡",
  bucket: "⊹", sorteador: "⟳",
};

// ─── APP ─────────────────────────────────────────────────────────────────────

export default function App() {
  const [page, setPage] = useState("home");
  const [navCollapsed, setNavCollapsed] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const contentRef = useRef(null);
  const isMobile = useMediaQuery("(max-width: 767px)");

  const navigate = (p) => {
    setPage(p);
    setMobileNavOpen(false);
    if (contentRef.current) contentRef.current.scrollTop = 0;
  };

  const pages = {
    home: <HomePage onNavigate={navigate} />,
    dates: <DatesPage />,
    filmes: <MoviesPage />,
    memorias: <MemoriesPage />,
    diario: <DiarioPage />,
    "abrir-quando": <AbrirQuandoPage />,
    bucket: <BucketPage />,
    sorteador: <SorteadorPage />,
  };

  // In mobile the drawer always renders fully expanded; collapsed only applies to desktop.
  const expanded = isMobile || !navCollapsed;

  const navStyle = isMobile ? {
    position: "fixed",
    top: 0, left: 0, bottom: 0,
    width: "260px",
    background: "#0A3323",
    zIndex: 100,
    padding: "32px 0",
    display: "flex",
    flexDirection: "column",
    overflowY: "auto",
    overflowX: "hidden",
    transform: mobileNavOpen ? "translateX(0)" : "translateX(-100%)",
    transition: "transform 0.3s ease",
    boxShadow: mobileNavOpen ? "2px 0 20px rgba(0,0,0,0.3)" : "none",
  } : {
    width: navCollapsed ? "56px" : "220px",
    flexShrink: 0,
    background: "#0A3323",
    padding: navCollapsed ? "24px 0" : "40px 0",
    display: "flex",
    flexDirection: "column",
    overflowY: "auto",
    overflowX: "hidden",
    transition: "width 0.3s ease",
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;1,400&family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #EEEBd8; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes pulse { 0%,100% { opacity: 0.4; } 50% { opacity: 1; } }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: #EEEBd8; }
        ::-webkit-scrollbar-thumb { background: #839958; }
        @media (max-width: 767px) {
          [data-form-grid] { grid-template-columns: 1fr !important; }
        }
      `}</style>

      <div style={{
        display: "flex",
        flexDirection: isMobile ? "column" : "row",
        height: "100dvh",
        background: "#EEEBd8",
        fontFamily: "system-ui, sans-serif",
      }}>

        {/* Mobile topbar */}
        {isMobile && (
          <header style={{
            height: "56px",
            background: "#0A3323",
            display: "flex",
            alignItems: "center",
            gap: "16px",
            padding: "0 16px",
            flexShrink: 0,
            zIndex: 50,
          }}>
            <button
              onClick={() => setMobileNavOpen(true)}
              aria-label="Abrir menu"
              style={{
                width: "36px", height: "36px",
                background: "transparent",
                border: "1px solid rgba(247,244,213,0.25)",
                color: "#F7F4D5",
                fontSize: "18px",
                cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}
            >☰</button>
            <span style={{
              fontFamily: "'Playfair Display', serif",
              fontStyle: "italic",
              fontSize: "18px",
              color: "#F7F4D5",
            }}>Pedro & Kim</span>
          </header>
        )}

        {/* Backdrop (mobile only, when drawer open) */}
        {isMobile && (
          <div
            onClick={() => setMobileNavOpen(false)}
            aria-hidden="true"
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0,0,0,0.4)",
              zIndex: 99,
              opacity: mobileNavOpen ? 1 : 0,
              pointerEvents: mobileNavOpen ? "auto" : "none",
              transition: "opacity 0.3s",
            }}
          />
        )}

        {/* Sidebar / drawer */}
        <nav style={navStyle}>

          {/* Desktop-only collapse toggle */}
          {!isMobile && (
            <button
              onClick={() => setNavCollapsed(c => !c)}
              title={navCollapsed ? "Expandir menu" : "Recolher menu"}
              style={{
                alignSelf: navCollapsed ? "center" : "flex-end",
                marginRight: navCollapsed ? "0" : "12px",
                marginBottom: "24px",
                width: "28px", height: "28px",
                background: "transparent",
                border: "1px solid rgba(247,244,213,0.25)",
                cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
                color: "#F7F4D5", fontSize: "13px",
                transition: "all 0.2s",
                flexShrink: 0,
              }}
            >
              <span style={{
                display: "inline-block",
                transform: navCollapsed ? "rotate(0deg)" : "rotate(180deg)",
                transition: "transform 0.3s",
              }}>‹</span>
            </button>
          )}

          {/* Logo / name */}
          {expanded && (
            <div style={{
              padding: "0 28px 32px",
              borderBottom: "1px solid rgba(247,244,213,0.15)",
              marginBottom: "24px",
              whiteSpace: "nowrap",
              overflow: "hidden",
            }}>
              <div style={{
                fontFamily: "'Playfair Display', serif",
                fontStyle: "italic",
                fontSize: "20px",
                color: "#F7F4D5",
              }}>Pedro & Kim</div>
              <div style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontStyle: "italic",
                fontSize: "12px",
                color: "#D3968C",
                marginTop: "4px",
              }}>desde dez. 2023</div>
            </div>
          )}

          {!expanded && (
            <div style={{
              width: "28px", height: "1px",
              background: "rgba(247,244,213,0.15)",
              alignSelf: "center",
              marginBottom: "16px",
            }} />
          )}

          {/* Nav items */}
          {NAV_ITEMS.map(item => (
            <button
              key={item.key}
              onClick={() => navigate(item.key)}
              title={!expanded ? item.label : undefined}
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontStyle: page === item.key ? "italic" : "normal",
                fontSize: "14px",
                color: page === item.key ? "#F7F4D5" : "rgba(247,244,213,0.55)",
                background: page === item.key ? "rgba(247,244,213,0.1)" : "transparent",
                border: "none",
                padding: expanded ? "12px 28px" : "12px 0",
                cursor: "pointer",
                textAlign: expanded ? "left" : "center",
                width: "100%",
                letterSpacing: "0.02em",
                transition: "all 0.2s",
                borderLeft: page === item.key ? "2px solid #D3968C" : "2px solid transparent",
                whiteSpace: "nowrap",
                overflow: "hidden",
                display: "flex",
                alignItems: "center",
                justifyContent: expanded ? "flex-start" : "center",
                gap: "10px",
              }}
            >
              <span style={{ fontSize: expanded ? "13px" : "16px", flexShrink: 0 }}>
                {NAV_ICONS[item.key]}
              </span>
              {expanded && <span>{item.label}</span>}
            </button>
          ))}
        </nav>

        {/* Content */}
        <main
          ref={contentRef}
          style={{
            flex: 1,
            overflowY: "auto",
            background: "#EEEBd8",
          }}
        >
          <div style={{ animation: "fadeIn 0.4s ease" }} key={page}>
            {pages[page]}
          </div>
        </main>

      </div>
    </>
  );
}

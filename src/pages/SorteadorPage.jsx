import { useState, useRef } from "react";

import useMediaQuery from "../hooks/useMediaQuery";

// ── Paleta do projeto ───────────────────────────────────────────────────────
const C = {
  green:    "#0A3323",
  sage:     "#839958",
  rose:     "#D3968C",
  paper:    "#F7F4D5",
  sagesoft: "#a8bc80",
};

// Fatias alternam os 4 tokens; texto contrastante por fatia.
const SLICE = [C.green, C.sage, C.rose, C.paper];
const SLICE_FG = { [C.green]: C.paper, [C.sage]: C.paper, [C.rose]: "#fff", [C.paper]: C.green };

// ── Mock data (fase 1) — imita as listas reais; leitura real é etapa posterior.
//    Formato do brief: { id, label, icone, tipo, itens: [{ id, nome, tags }] }
const SOURCES = [
  {
    id: "watchlist", label: "Watchlist", icone: "🎬", tipo: "pagina",
    pageKey: "filmes", pageNome: "Nossa Sessão",
    itens: [
      { id: "f1", nome: "Past Lives",            tags: ["leve", "romance"] },
      { id: "f2", nome: "A Viagem de Chihiro",   tags: ["animação", "leve"] },
      { id: "f3", nome: "La La Land",            tags: ["musical", "romance"] },
      { id: "f4", nome: "Up: Altas Aventuras",   tags: ["animação", "leve"] },
      { id: "f5", nome: "Amélie Poulain",        tags: ["leve", "comédia"] },
      { id: "f6", nome: "Coco",                  tags: ["animação"] },
    ],
  },
  {
    id: "sonhos", label: "Sonhos", icone: "✦", tipo: "pagina",
    pageKey: "bucket", pageNome: "Nossos Sonhos",
    itens: [
      { id: "s1", nome: "Ver a aurora boreal",        tags: ["viagem", "longo prazo"] },
      { id: "s2", nome: "Aprender a dançar juntos",   tags: ["em casa"] },
      { id: "s3", nome: "Plantar uma horta",          tags: ["em casa", "barato"] },
      { id: "s4", nome: "Piquenique no parque",       tags: ["ao ar livre", "barato"] },
      { id: "s5", nome: "Maratonar Studio Ghibli",    tags: ["em casa", "leve"] },
    ],
  },
  {
    id: "dates", label: "Dates", icone: "📍", tipo: "pagina",
    pageKey: "dates", pageNome: "Dates",
    itens: [
      { id: "d1", nome: "Cozinhar massa do zero",    tags: ["em casa", "barato"] },
      { id: "d2", nome: "Pôr do sol no mirante",     tags: ["ao ar livre", "barato"] },
      { id: "d3", nome: "Sessão de cinema em casa",  tags: ["em casa", "cozy"] },
      { id: "d4", nome: "Café da manhã na padaria",  tags: ["barato"] },
      { id: "d5", nome: "Passeio de bike",           tags: ["ao ar livre"] },
      { id: "d6", nome: "Noite de jogos",            tags: ["em casa", "cozy"] },
    ],
  },
  {
    id: "onde-comer", label: "Onde comer?", icone: "🍝", tipo: "categoria",
    itens: [
      { id: "c1", nome: "Aquele japonês",      tags: [] },
      { id: "c2", nome: "Pizza da esquina",    tags: [] },
      { id: "c3", nome: "Hambúrguer artesanal",tags: [] },
      { id: "c4", nome: "Comida caseira",      tags: [] },
      { id: "c5", nome: "Açaí da praça",       tags: [] },
    ],
  },
  {
    id: "personalizado", label: "Personalizado", icone: "+", tipo: "personalizado",
    itens: [], // preenchido na hora — fase 4
  },
];

const SPINS = 5; // voltas inteiras antes de desacelerar
const randInt = (n) => Math.floor(Math.random() * n);

// ── Helpers de geometria ────────────────────────────────────────────────────
const polar = (r, deg) => {
  const rad = (deg * Math.PI) / 180;
  return [100 + r * Math.cos(rad), 100 + r * Math.sin(rad)];
};
const truncate = (s, n) => (s.length > n ? s.slice(0, n - 1) + "…" : s);

const distinctTags = (itens) => {
  const seen = [];
  itens.forEach(i => (i.tags || []).forEach(t => { if (!seen.includes(t)) seen.push(t); }));
  return seen;
};

// Cor da fatia i, evitando que a última encoste na primeira (igual ao lado).
const sliceColor = (i, n) => {
  let c = SLICE[i % SLICE.length];
  if (i === n - 1 && c === SLICE[0]) c = SLICE[1];
  return c;
};

// ── A roleta ─────────────────────────────────────────────────────────────────
function Wheel({ items, rotation, spinning, reducedMotion, onSettled }) {
  const n = items.length;
  const ang = 360 / n;
  const fontSize = n <= 6 ? 9 : n <= 10 ? 8 : n <= 16 ? 7 : 6;
  const maxChars = n <= 6 ? 13 : n <= 12 ? 10 : 8;
  const labelR   = 58;

  return (
    <div style={{ position: "relative", width: "min(90vw, 460px)", aspectRatio: "1", margin: "0 auto" }}>
      {/* Ponteiro fixo no topo, apontando pra dentro */}
      <div style={{
        position: "absolute", top: "-4px", left: "50%", transform: "translateX(-50%)",
        width: 0, height: 0, zIndex: 3,
        borderLeft: "13px solid transparent", borderRight: "13px solid transparent",
        borderTop: "23px solid #0A3323",
        filter: "drop-shadow(0 2px 2px rgba(0,0,0,0.3))",
      }} />

      <svg
        viewBox="0 0 200 200"
        onTransitionEnd={onSettled}
        style={{
          width: "100%", height: "100%",
          transform: `rotate(${rotation}deg)`,
          transformOrigin: "center",
          transition: spinning && !reducedMotion ? "transform 4s cubic-bezier(0.16, 1, 0.3, 1)" : "none",
          filter: "drop-shadow(0 6px 18px rgba(10,51,35,0.22))",
        }}
      >
        {items.map((item, i) => {
          const a0 = i * ang, a1 = (i + 1) * ang, mid = a0 + ang / 2;
          const [x0, y0] = polar(96, a0);
          const [x1, y1] = polar(96, a1);
          const large = ang > 180 ? 1 : 0;
          const bg = sliceColor(i, n);
          const fg = SLICE_FG[bg];
          const flip = mid > 90 && mid < 270;
          const [lx] = polar(labelR, 0); // raio do rótulo (x antes da rotação)
          return (
            <g key={i}>
              <path
                d={`M100 100 L ${x0} ${y0} A 96 96 0 ${large} 1 ${x1} ${y1} Z`}
                fill={bg}
                stroke={C.paper}
                strokeWidth="1"
              />
              <text
                transform={`rotate(${mid} 100 100)${flip ? ` rotate(180 ${lx} 100)` : ""}`}
                x={lx}
                y="100"
                textAnchor="middle"
                dominantBaseline="middle"
                fill={fg}
                fontSize={fontSize}
                fontFamily="'Playfair Display', serif"
                fontWeight="700"
              >{truncate(item, maxChars)}</text>
            </g>
          );
        })}
        <circle cx="100" cy="100" r="96" fill="none" stroke={C.green} strokeWidth="3" />
      </svg>

      {/* Miolo decorativo — coração no centro (não gira, não é botão) */}
      <div style={{
        position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)",
        width: "15%", height: "15%", borderRadius: "50%",
        background: C.paper, border: "3px solid #0A3323", zIndex: 2,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: "clamp(13px, 3.4vw, 18px)", color: C.rose,
        boxShadow: "0 2px 6px rgba(10,51,35,0.2)",
      }}>❤</div>
    </div>
  );
}

// ── Chip de fonte (pílula) ──────────────────────────────────────────────────
function SourceChip({ icone, label, active, onClick }) {
  const [hover, setHover] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        fontFamily: "'Cormorant Garamond', serif",
        fontStyle:  "italic",
        fontSize:   "13px",
        padding:    "5px 15px",
        borderRadius: "14px",
        cursor:     "pointer",
        transition: "transform 0.15s, background 0.2s, color 0.2s",
        transform:  hover && !active ? "translateY(-1px)" : "none",
        background: active ? C.green : C.paper,
        color:      active ? C.paper : C.sage,
        border:     active ? "1px solid #0A3323" : "1px solid rgba(131,153,88,0.4)",
      }}
    >
      {icone} {label}
    </button>
  );
}

// ── Chip de filtro (pílula menor) ───────────────────────────────────────────
function FilterPill({ label, active, onClick }) {
  const [hover, setHover] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        fontFamily: "'Cormorant Garamond', serif",
        fontStyle:  "italic",
        fontSize:   "12px",
        padding:    "3px 12px",
        borderRadius: "12px",
        cursor:     "pointer",
        transition: "transform 0.18s, background 0.2s, color 0.2s, border-color 0.2s",
        transform:  hover && !active ? "translateY(-1px)" : "none",
        background: active ? C.rose : C.paper,
        color:      active ? "#fff" : (hover ? C.rose : C.sage),
        border:     active ? "1px solid #D3968C" : `1px solid ${hover ? "rgba(211,150,140,0.6)" : "rgba(131,153,88,0.35)"}`,
      }}
    >
      {label}{active ? " ✓" : ""}
    </button>
  );
}

// ── Link sutil pra página de origem do item sorteado ────────────────────────
function OriginLink({ label, onClick }) {
  const [hover, setHover] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic",
        fontSize: "15px", color: hover ? C.green : C.sage,
        background: "transparent", border: "none", cursor: "pointer",
        padding: "2px 0", marginTop: "10px",
        borderBottom: `1px solid ${hover ? C.sage : "transparent"}`,
        transition: "color 0.18s, border-color 0.18s",
      }}
    >
      ver em {label} →
    </button>
  );
}

// ── Fonte personalizada: input + chips removíveis ───────────────────────────
function CustomChip({ nome, onRemove }) {
  const [hover, setHover] = useState(false);
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: "6px",
      fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic",
      fontSize: "13px", color: C.green,
      background: C.paper, border: "1px solid rgba(131,153,88,0.4)",
      borderRadius: "14px", padding: "4px 6px 4px 13px",
    }}>
      {nome}
      <button
        onClick={onRemove}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        aria-label={`remover ${nome}`}
        style={{
          fontFamily: "inherit", fontSize: "14px", lineHeight: 1,
          color: hover ? "#fff" : C.sage,
          background: hover ? C.rose : "transparent",
          border: "none", borderRadius: "50%",
          width: "18px", height: "18px", cursor: "pointer",
          display: "inline-flex", alignItems: "center", justifyContent: "center",
          transition: "color 0.15s, background 0.15s",
        }}
      >×</button>
    </span>
  );
}

function CustomSource({ items, onAdd, onRemove, spinning }) {
  const [valor, setValor] = useState("");
  const [hoverAdd, setHoverAdd] = useState(false);
  const podeAdd = valor.trim().length > 0 && !spinning;

  const adicionar = () => {
    if (!podeAdd) return;
    onAdd(valor);
    setValor("");
  };

  return (
    <div style={{ marginBottom: "1.7rem" }}>
      <div style={{ display: "flex", justifyContent: "center", gap: "8px", flexWrap: "wrap" }}>
        <input
          value={valor}
          onChange={e => setValor(e.target.value)}
          onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); adicionar(); } }}
          disabled={spinning}
          placeholder="o que entra na roleta?"
          style={{
            fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic",
            fontSize: "15px", color: C.green,
            background: C.paper, border: "1px solid rgba(131,153,88,0.5)",
            borderRadius: "16px", padding: "7px 16px",
            width: "min(70vw, 260px)", outline: "none",
          }}
        />
        <button
          onClick={adicionar}
          onMouseEnter={() => setHoverAdd(true)}
          onMouseLeave={() => setHoverAdd(false)}
          disabled={!podeAdd}
          style={{
            fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic",
            fontSize: "14px",
            color: hoverAdd && podeAdd ? C.paper : C.green,
            background: hoverAdd && podeAdd ? C.green : "transparent",
            border: "1px solid #0A3323", borderRadius: "16px",
            padding: "7px 18px",
            cursor: podeAdd ? "pointer" : "default",
            opacity: podeAdd ? 1 : 0.45,
            transition: "color 0.2s, background 0.2s, opacity 0.2s",
          }}
        >
          + adicionar
        </button>
      </div>

      {items.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: "7px", justifyContent: "center", marginTop: "12px" }}>
          {items.map(it => (
            <CustomChip key={it.id} nome={it.nome} onRemove={() => onRemove(it.id)} />
          ))}
        </div>
      )}
    </div>
  );
}

// ── Estado vazio charmoso (molde do DatesEmptyState) ────────────────────────
function EmptyState({ title, body, actionLabel, onAction }) {
  const [hover, setHover] = useState(false);
  return (
    <div style={{ textAlign: "center", padding: "52px 20px", maxWidth: "420px", margin: "0 auto" }}>
      <div style={{
        fontFamily: "'Playfair Display', serif", fontSize: "32px",
        color: C.sage, opacity: 0.5, marginBottom: "18px", lineHeight: 1,
      }}>✦</div>
      <h2 style={{
        fontFamily: "'Playfair Display', serif", fontStyle: "italic", fontWeight: 400,
        fontSize: "clamp(18px, 4vw, 22px)", color: C.green,
        margin: "0 0 12px", lineHeight: 1.3, letterSpacing: "-0.01em",
      }}>{title}</h2>
      {body && (
        <p style={{
          fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic",
          fontSize: "15px", color: C.sage, lineHeight: 1.7, margin: "0 0 24px",
        }}>{body}</p>
      )}
      {actionLabel && (
        <button
          onClick={onAction}
          onMouseEnter={() => setHover(true)}
          onMouseLeave={() => setHover(false)}
          style={{
            fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic",
            fontSize: "14px",
            color: hover ? C.paper : C.green,
            background: hover ? C.green : "transparent",
            border: `1px solid ${C.green}`, padding: "10px 24px",
            cursor: "pointer", transition: "all 0.2s", letterSpacing: "0.02em",
          }}
        >{actionLabel}</button>
      )}
    </div>
  );
}

const PAGE_BG = {
  background: "#EEEBd8",
  backgroundImage: "radial-gradient(rgba(10,51,35,0.025) 1px, transparent 1px)",
  backgroundSize: "18px 18px",
  minHeight: "100vh",
};

export default function SorteadorPage({ onNavigate }) {
  const isMobile      = useMediaQuery("(max-width: 560px)");
  const reducedMotion = useMediaQuery("(prefers-reduced-motion: reduce)");

  const [sourceId, setSourceId] = useState("watchlist");
  const [activeTags, setActiveTags] = useState([]); // visual nesta fase; refino é fase 3
  const [spinHover, setSpinHover] = useState(false);
  const [rotation, setRotation] = useState(-18); // -18° dá um repouso levemente inclinado
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState(null);
  const [customItens, setCustomItens] = useState([]); // itens voláteis da fonte personalizada
  const pendingRef = useRef(null);
  const customIdRef = useRef(0);

  const source = SOURCES.find(s => s.id === sourceId) || SOURCES[0];
  // Personalizado usa a lista digitada na hora; as demais, a lista da fonte.
  const baseItens = source.tipo === "personalizado" ? customItens : source.itens;
  const tags = distinctTags(baseItens);

  // Refino por tag: item entra se carrega ALGUMA das tags ativas (OR).
  const itensFiltrados = activeTags.length === 0
    ? baseItens
    : baseItens.filter(i => (i.tags || []).some(t => activeTags.includes(t)));
  const pool = itensFiltrados.map(i => i.nome);

  const trocarFonte = (id) => {
    if (spinning) return;
    setSourceId(id);
    setActiveTags([]);
    setResult(null);
  };

  const toggleTag = (t) => {
    if (spinning) return;
    setResult(null); // resultado anterior pode não estar mais no pool
    setActiveTags(prev => prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t]);
  };

  const limparFiltros = () => {
    if (spinning) return;
    setActiveTags([]);
    setResult(null);
  };

  const addCustom = (nome) => {
    if (spinning) return;
    const v = nome.trim();
    if (!v) return;
    setCustomItens(prev =>
      prev.some(i => i.nome.toLowerCase() === v.toLowerCase())
        ? prev
        : [...prev, { id: `c${customIdRef.current++}`, nome: v, tags: [] }]
    );
  };

  const removeCustom = (id) => {
    if (spinning) return;
    setResult(null);
    setCustomItens(prev => prev.filter(i => i.id !== id));
  };

  // Sorteia um índice e calcula a rotação-alvo pra que a fatia escolhida
  // pare exatamente sob o ponteiro (topo = 270° no sistema polar usado).
  const girar = () => {
    if (spinning || pool.length === 0) return;
    const k = randInt(pool.length);
    pendingRef.current = pool[k];
    const ang     = 360 / pool.length;
    const centerK = (k + 0.5) * ang;
    const target  = (((270 - centerK) % 360) + 360) % 360;
    const current = ((rotation % 360) + 360) % 360;
    let delta = target - current;
    if (delta < 0) delta += 360;
    setResult(null);
    setSpinning(true);
    setRotation(rotation + SPINS * 360 + delta);
    if (reducedMotion) { // sem animação: revela direto
      setSpinning(false);
      setResult(pendingRef.current);
    }
  };

  const settled = () => {
    if (!spinning) return;
    setSpinning(false);
    setResult(pendingRef.current);
  };

  return (
    <div style={PAGE_BG}>
      <div style={{ maxWidth: "640px", margin: "0 auto", padding: isMobile ? "32px 18px" : "44px 24px" }}>

        {/* ── Cabeçalho editorial (sem contagem) ── */}
        <header style={{ textAlign: "center", maxWidth: "560px", margin: "0 auto 1.7rem" }}>
          <p style={{
            fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic",
            fontSize: "15px", letterSpacing: "0.18em", textTransform: "uppercase",
            color: C.sage, margin: "0 0 0.6rem",
          }}>
            quando a gente não decide
          </p>
          <h1 style={{
            fontFamily: "'Playfair Display', serif", fontWeight: 900,
            fontSize: "clamp(40px, 11vw, 54px)", lineHeight: 0.98,
            color: C.green, margin: "0 0 0.5rem", letterSpacing: "-0.01em",
          }}>
            A Sorte Decide
          </h1>
          <p style={{
            fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic",
            fontSize: "19px", color: C.green, opacity: 0.75, margin: 0,
          }}>
            Gira a roleta e deixa o destino escolher por nós dois.
          </p>
        </header>

        {/* ── Seletor de fonte ── */}
        <div style={{
          display: "flex", justifyContent: "center", flexWrap: "wrap",
          gap: "7px", marginBottom: "0.7rem",
        }}>
          {SOURCES.map(s => (
            <SourceChip
              key={s.id}
              icone={s.icone}
              label={s.label}
              active={s.id === sourceId}
              onClick={() => trocarFonte(s.id)}
            />
          ))}
        </div>

        {/* ── Fonte personalizada (input) ou filtros por tag ── */}
        {source.tipo === "personalizado" ? (
          <CustomSource items={customItens} onAdd={addCustom} onRemove={removeCustom} spinning={spinning} />
        ) : tags.length > 0 ? (
          <div style={{ marginBottom: "1.7rem" }}>
            <div style={{
              display: "flex", justifyContent: "center", alignItems: "center",
              flexWrap: "wrap", gap: "7px",
            }}>
              <span style={{
                fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic",
                fontSize: "12px", color: C.sage,
              }}>filtrar:</span>
              {tags.map(t => (
                <FilterPill key={t} label={t} active={activeTags.includes(t)} onClick={() => toggleTag(t)} />
              ))}
            </div>
            {activeTags.length > 0 && pool.length > 0 && (
              <p style={{
                textAlign: "center", marginTop: "8px",
                fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic",
                fontSize: "13px", color: C.sagesoft,
              }}>
                {pool.length} {pool.length === 1 ? "opção" : "opções"} na roda
              </p>
            )}
          </div>
        ) : (
          <div style={{ height: "1.7rem" }} />
        )}

        {/* ── A roleta ── */}
        {pool.length > 0 ? (
          <Wheel
            items={pool}
            rotation={rotation}
            spinning={spinning}
            reducedMotion={reducedMotion}
            onSettled={settled}
          />
        ) : source.tipo === "personalizado" ? (
          <EmptyState
            title="a roleta ainda está vazia"
            body="digite as opções aí em cima — o que vocês quiserem — e deixa a sorte cuidar do resto."
          />
        ) : activeTags.length > 0 ? (
          <EmptyState
            title={`nada com ${activeTags.length === 1 ? "esse filtro" : "esses filtros"} por aqui…`}
            body="afrouxa um pouco que o que vocês procuram pode estar logo ali."
            actionLabel="limpar filtros"
            onAction={limparFiltros}
          />
        ) : (
          <EmptyState
            title="nada pra sortear nessa fonte ainda"
            body="quando essa lista ganhar opções, elas aparecem aqui na roda."
          />
        )}

        {/* ── Botão Girar ── */}
        <div style={{ textAlign: "center", marginTop: "1.8rem" }}>
          <button
            onClick={girar}
            onMouseEnter={() => setSpinHover(true)}
            onMouseLeave={() => setSpinHover(false)}
            disabled={pool.length === 0 || spinning}
            style={{
              fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: "18px",
              color: "#fff", background: C.rose,
              border: "none", padding: "12px 40px", borderRadius: "30px",
              letterSpacing: "0.03em",
              cursor: pool.length === 0 || spinning ? "default" : "pointer",
              opacity: pool.length === 0 ? 0.5 : spinning ? 0.7 : 1,
              boxShadow: "0 4px 12px rgba(211,150,140,0.4)",
              transform: spinHover && !spinning && pool.length > 0 ? "scale(1.04)" : "scale(1)",
              transition: "transform 0.15s, opacity 0.2s",
            }}
          >
            {spinning ? "girando…" : "Girar ✨"}
          </button>
        </div>

        {/* ── Resultado (nome em destaque, fade-in suave) ── */}
        <div style={{ minHeight: "150px", marginTop: "1.6rem", textAlign: "center" }}>
          {result && !spinning && (
            <div style={{ animation: reducedMotion ? "none" : "popIn 0.5s cubic-bezier(0.16, 1, 0.3, 1) both" }}>
              <p style={{
                fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic",
                fontSize: "15px", color: C.sage, margin: "0 0 6px",
              }}>a sorte escolheu…</p>
              <h2 style={{
                fontFamily: "'Playfair Display', serif", fontWeight: 700,
                fontSize: "clamp(36px, 10vw, 52px)", color: C.green,
                margin: 0, lineHeight: 1.08,
              }}>{result}</h2>
              <p style={{
                fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic",
                fontSize: "16px", color: C.green, opacity: 0.7, margin: "10px 0 0",
              }}>"hoje é essa. sem trapaça."</p>
              {source.tipo === "pagina" && onNavigate && (
                <div>
                  <OriginLink label={source.pageNome} onClick={() => onNavigate(source.pageKey)} />
                </div>
              )}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

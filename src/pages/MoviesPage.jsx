import { useState, useRef, useEffect, useCallback } from "react";

import useMediaQuery from "../hooks/useMediaQuery";
import useCollection from "../hooks/useCollection";
import useTmdbPosters from "../hooks/useTmdbPosters";
import Avatar from "../components/ui/Avatar";
import WashiTape from "../components/ui/WashiTape";
import FilterChip from "../components/ui/FilterChip";
import ItemActions from "../components/ui/ItemActions";
import FormToggleButton from "../components/ui/FormToggleButton";
import FormActions from "../components/ui/FormActions";
import Collapsible from "../components/ui/Collapsible";
import LoadingDots from "../components/ui/LoadingDots";
import { Label, Input, Select } from "../components/ui/Field";
import { posterUrl, searchTitles, tmdbConfigured } from "../lib/tmdb";
import { posterGradient, cardRotation, washiDecor, formatRating } from "../lib/sessaoDecor";

const C = {
  cream:  "#EEEBd8",
  green:  "#0A3323",
  sage:   "#839958",
  rose:   "#D3968C",
  paper:  "#F7F4D5",
};

const AUTOR_NAME = { pedro: "Pedro", kim: "Kim" };

const FILTERS = [
  { key: "todos",     label: "tudo" },
  { key: "watchlist", label: "queremos ver" },
  { key: "assistido", label: "assistidos" },
];

const EMPTY_FORM = { title: "", status: "watchlist", year: "", poster_path: null, added_by: "", rating: "", comment: "", loved_by_both: false };

const PAGE_BG = {
  background: C.cream,
  backgroundImage: "radial-gradient(rgba(10,51,35,0.03) 1px, transparent 1px)",
  backgroundSize: "18px 18px",
  minHeight: "100vh",
};

// ─── Cabeçalho editorial (centralizado, espelha a estrutura da Dates) ─────────

function HeaderCount({ n, label, isMobile }) {
  return (
    <div>
      <div style={{
        fontFamily: "'Playfair Display', serif", fontWeight: 700,
        fontSize: isMobile ? "34px" : "40px", color: C.rose, lineHeight: 1,
      }}>{n}</div>
      <div style={{
        fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic",
        fontSize: "15px", letterSpacing: "0.08em", textTransform: "uppercase",
        color: C.sage, marginTop: "4px",
      }}>{label}</div>
    </div>
  );
}

function SessaoHeader({ assistidos, watchlist }) {
  const isMobile = useMediaQuery("(max-width: 560px)");

  return (
    <div style={{ textAlign: "center", maxWidth: "560px", margin: "0 auto 2.6rem" }}>
      <div style={{
        fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic",
        fontSize: "16px", letterSpacing: "0.18em", textTransform: "uppercase",
        color: C.sage, marginBottom: "0.7rem",
      }}>
        o que a gente assiste juntos
      </div>

      <h1 style={{
        fontFamily: "'Playfair Display', serif", fontWeight: 900,
        fontSize: "clamp(52px, 13vw, 68px)", lineHeight: 0.98,
        margin: "0 0 0.6rem", color: C.green, letterSpacing: "-0.01em",
      }}>
        Nossa Sessão
      </h1>

      <div style={{
        fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic",
        fontSize: isMobile ? "18px" : "21px", color: C.green, opacity: 0.75,
        lineHeight: 1.35,
      }}>
        Da pipoca às lágrimas — tudo o que vivemos na tela, e tudo o que ainda vamos.
      </div>

      <div style={{
        display: "flex", justifyContent: "center", alignItems: "stretch",
        gap: "2.5rem", marginTop: "1.6rem",
      }}>
        <HeaderCount n={assistidos} label="assistidos" isMobile={isMobile} />
        <div style={{ width: "1px", background: C.sage, opacity: 0.3 }} />
        <HeaderCount n={watchlist} label="na watchlist" isMobile={isMobile} />
      </div>
    </div>
  );
}

// Ações (editar/excluir) reveladas no hover. Em pílula clara p/ ler no pôster escuro.
function CardActions({ visible, onEdit, onDelete, confirmMessage, onDark, reducedMotion }) {
  return (
    <div style={{
      display: "flex",
      opacity: visible ? 1 : 0,
      transition: reducedMotion ? "none" : "opacity .2s",
      pointerEvents: visible ? "auto" : "none",
      ...(onDark ? {
        background: "rgba(247,244,213,0.92)", borderRadius: "20px",
        padding: "1px 4px", boxShadow: "0 2px 6px rgba(10,51,35,0.22)",
      } : {}),
    }}>
      <ItemActions onEdit={onEdit} onDelete={onDelete} confirmMessage={confirmMessage} />
    </div>
  );
}

// ─── Card WATCHLIST → pôster em destaque (TMDB com fallback de cor) ───────────

function PosterCard({ item, posterPath, reducedMotion, onEdit, onDelete, onMarkWatched }) {
  const [hovered, setHovered]     = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);
  const [imgBroken, setImgBroken] = useState(false);
  const washi = washiDecor(item.id);
  const rot   = cardRotation(item.id);

  const lift      = hovered && !reducedMotion;
  const showImage = posterPath && !imgBroken;

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: "relative",
        borderRadius: "4px",
        boxShadow: lift ? "0 12px 30px rgba(10,51,35,0.28)" : "0 4px 16px rgba(10,51,35,0.18)",
        ...(reducedMotion ? { transform: `rotate(${rot}deg)` } : {
          transform: `rotate(${rot}deg) translateY(${lift ? "-5px" : "0"})`,
          transition: "transform .28s cubic-bezier(.2,.8,.25,1), box-shadow .28s",
          willChange: "transform",
        }),
      }}
    >
      {/* Superfície do pôster — gradiente de fallback como base; o <img> real
          (quando o TMDB resolve) faz fade-in por cima, com scrim p/ o título. */}
      <div style={{ borderRadius: "4px", overflow: "hidden" }}>
        <div style={{
          position: "relative", aspectRatio: "2 / 3",
          background: posterGradient(item.id), color: C.paper,
        }}>
          {showImage && (
            <>
              <img
                src={posterUrl(posterPath)}
                alt=""
                loading="lazy"
                onLoad={() => setImgLoaded(true)}
                onError={() => setImgBroken(true)}
                style={{
                  position: "absolute", inset: 0, width: "100%", height: "100%",
                  objectFit: "cover", opacity: imgLoaded ? 1 : 0,
                  transition: reducedMotion ? "none" : "opacity .5s ease",
                }}
              />
              <div style={{
                position: "absolute", inset: 0,
                background: "linear-gradient(to top, rgba(10,51,35,0.9) 0%, rgba(10,51,35,0.15) 42%, rgba(10,51,35,0) 68%)",
                opacity: imgLoaded ? 1 : 0,
                transition: reducedMotion ? "none" : "opacity .5s ease",
              }} />
            </>
          )}

          <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, padding: "14px" }}>
            {onMarkWatched && (
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); onMarkWatched(); }}
                style={{
                  display: "inline-block", marginBottom: "10px",
                  fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontSize: "13px",
                  color: C.green, background: "rgba(247,244,213,0.94)",
                  border: "none", borderRadius: "3px", padding: "5px 12px", cursor: "pointer",
                  opacity: hovered ? 1 : 0,
                  transition: reducedMotion ? "none" : "opacity .2s",
                  pointerEvents: hovered ? "auto" : "none",
                  boxShadow: "0 2px 6px rgba(10,51,35,0.22)",
                }}
              >✓ já assistimos</button>
            )}
            <div style={{
              fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic",
              fontSize: "12px", letterSpacing: "0.1em", textTransform: "uppercase",
              opacity: 0.7,
            }}>queremos ver</div>
            <div style={{
              fontFamily: "'Playfair Display', serif", fontWeight: 700,
              fontSize: "21px", lineHeight: 1.05, marginTop: "2px",
            }}>
              {item.title}
              {item.year && (
                <span style={{
                  fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic",
                  fontWeight: 400, fontSize: "14px", opacity: 0.7, marginLeft: "7px",
                }}>{item.year}</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Washi por cima, transbordando o topo */}
      {washi && <WashiTape {...washi} />}

      {/* Ações no topo direito (pílula clara) */}
      <div style={{ position: "absolute", top: "10px", right: "10px" }}>
        <CardActions
          visible={hovered}
          onEdit={onEdit}
          onDelete={onDelete}
          confirmMessage={`Tirar "${item.title}" da watchlist?`}
          onDark
          reducedMotion={reducedMotion}
        />
      </div>

      {/* Avatar de autoria, canto inferior direito */}
      {item.added_by && (
        <div style={{ position: "absolute", bottom: "12px", right: "12px" }}>
          <Avatar name={AUTOR_NAME[item.added_by]} size={26} borderColor={C.paper} />
        </div>
      )}
    </div>
  );
}

// ─── Card ASSISTIDO → sóbrio, com a nota do casal ────────────────────────────

function WatchedCard({ item, reducedMotion, onEdit, onDelete }) {
  const [hovered, setHovered] = useState(false);
  const lift = hovered && !reducedMotion;

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: "relative",
        background: C.paper,
        border: "1px solid rgba(131,153,88,0.35)",
        borderRadius: "5px",
        padding: "14px 16px",
        boxShadow: lift ? "0 10px 24px rgba(10,51,35,0.14)" : "0 2px 8px rgba(10,51,35,0.06)",
        ...(reducedMotion ? {} : {
          transform: lift ? "translateY(-4px)" : "translateY(0)",
          transition: "transform .28s cubic-bezier(.2,.8,.25,1), box-shadow .28s",
          willChange: "transform",
        }),
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div style={{
          fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic",
          fontSize: "12px", letterSpacing: "0.1em", textTransform: "uppercase",
          color: C.sage,
        }}>assistido</div>
        {item.rating != null && (
          <div style={{
            background: C.rose, color: "#fff", fontSize: "11px",
            padding: "2px 8px", borderRadius: "10px", letterSpacing: "0.05em",
            whiteSpace: "nowrap",
          }}>{formatRating(item.rating)}</div>
        )}
      </div>

      <div style={{
        fontFamily: "'Playfair Display', serif", fontWeight: 700,
        fontSize: "20px", margin: "6px 0 4px", color: C.green, lineHeight: 1.15,
        paddingRight: "8px",
      }}>
        {item.title}
        {item.year && (
          <span style={{
            fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic",
            fontWeight: 400, fontSize: "14px", color: C.sage, marginLeft: "7px",
          }}>{item.year}</span>
        )}
      </div>

      {item.comment && (
        <div style={{
          fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic",
          fontSize: "15px", opacity: 0.8, color: C.green, lineHeight: 1.4,
        }}>"{item.comment}"</div>
      )}

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: "8px" }}>
        <Authorship item={item} />
        <div style={{ flexShrink: 0 }}>
          <CardActions
            visible={hovered}
            onEdit={onEdit}
            onDelete={onDelete}
            confirmMessage={`Excluir "${item.title}"?`}
            reducedMotion={reducedMotion}
          />
        </div>
      </div>
    </div>
  );
}

// Rodapé de autoria — um avatar + "Fulano adicionou", ou dois sobrepostos
// (estilo Spotify) + "os dois amaram". Sem autor e sem ambos → nada.
function Authorship({ item }) {
  if (item.loved_by_both) {
    return (
      <div style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "10px" }}>
        <div style={{ display: "flex" }}>
          <Avatar name="Pedro" size={22} borderColor={C.paper} />
          <span style={{ marginLeft: "-8px" }}>
            <Avatar name="Kim" size={22} borderColor={C.paper} />
          </span>
        </div>
        <span style={{
          fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic",
          fontSize: "13px", opacity: 0.7, color: C.green,
        }}>os dois amaram</span>
      </div>
    );
  }
  if (!item.added_by) return <div style={{ marginTop: "10px" }} />;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "10px" }}>
      <Avatar name={AUTOR_NAME[item.added_by]} size={22} />
      <span style={{
        fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic",
        fontSize: "13px", opacity: 0.7, color: C.green,
      }}>{AUTOR_NAME[item.added_by]} adicionou</span>
    </div>
  );
}

// ─── Estado vazio charmoso ───────────────────────────────────────────────────

const EMPTY_COPY = {
  todos:     { title: "a sessão ainda não começou…",     sub: "que tal escolher o primeiro filme da lista de vocês?" },
  watchlist: { title: "a watchlist está vazia…",          sub: "nenhum filme na fila ainda — qual vai ser o próximo?" },
  assistido: { title: "nada assistido por aqui… ainda",   sub: "a primeira sessão de vocês vai aparecer bem aqui." },
};

function SessaoEmptyState({ filter = "todos", onAdd }) {
  const [hover, setHover] = useState(false);
  const copy = EMPTY_COPY[filter] ?? EMPTY_COPY.todos;
  return (
    <div style={{ textAlign: "center", padding: "64px 24px", maxWidth: "420px", margin: "0 auto" }}>
      <div style={{
        fontFamily: "'Playfair Display', serif", fontSize: "32px",
        color: C.sage, opacity: 0.5, marginBottom: "20px", lineHeight: 1,
      }}>❍</div>
      <h2 style={{
        fontFamily: "'Playfair Display', serif", fontStyle: "italic", fontWeight: 400,
        fontSize: "clamp(18px, 4vw, 22px)", color: C.green, margin: "0 0 14px", lineHeight: 1.3,
      }}>
        {copy.title}
      </h2>
      <p style={{
        fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic",
        fontSize: "15px", color: C.sage, lineHeight: 1.7, margin: "0 0 26px",
      }}>
        {copy.sub}
      </p>
      <button
        onClick={onAdd}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        style={{
          fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontSize: "14px",
          color: hover ? C.paper : C.green, background: hover ? C.green : "transparent",
          border: `1px solid ${C.green}`, padding: "10px 24px", cursor: "pointer",
          transition: "all 0.2s", letterSpacing: "0.02em",
        }}
      >+ adicionar um filme</button>
    </div>
  );
}

// Campo de título com autocomplete do TMDB. Ao escolher um resultado, devolve
// { title, year, poster_path } via onPick; digitar livre cai em onText.
function TitleAutocomplete({ value, onText, onPick }) {
  const [results, setResults] = useState([]);
  const [open,    setOpen]    = useState(false);
  const [loading, setLoading] = useState(false);
  const [active,  setActive]  = useState(-1);
  const typedRef = useRef(false); // só busca após o usuário digitar (não no prefill)
  const boxRef   = useRef(null);

  // Busca com debounce, derivada do texto digitado. Todo setState fica dentro do
  // setTimeout (assíncrono) — nada de setState síncrono no corpo do efeito.
  useEffect(() => {
    if (!typedRef.current) return;
    const q = value.trim();
    const controller = new AbortController();

    const t = setTimeout(async () => {
      if (q.length < 2 || !tmdbConfigured) { setResults([]); setOpen(false); setLoading(false); return; }
      setOpen(true);
      setLoading(true);
      try {
        const list = await searchTitles(q, { signal: controller.signal });
        setResults(list);
        setActive(-1);
      } catch (err) {
        if (err.name !== "AbortError") setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => { clearTimeout(t); controller.abort(); };
  }, [value]);

  // Fecha ao clicar fora.
  useEffect(() => {
    const onDoc = (e) => { if (boxRef.current && !boxRef.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const pick = (r) => {
    typedRef.current = false;
    onPick(r);
    setResults([]);
    setOpen(false);
  };

  const onKeyDown = (e) => {
    if (!open || !results.length) return;
    if (e.key === "ArrowDown")      { e.preventDefault(); setActive(i => Math.min(i + 1, results.length - 1)); }
    else if (e.key === "ArrowUp")   { e.preventDefault(); setActive(i => Math.max(i - 1, 0)); }
    else if (e.key === "Enter" && active >= 0) { e.preventDefault(); pick(results[active]); }
    else if (e.key === "Escape")    { setOpen(false); }
  };

  const thumb = { width: "30px", height: "45px", objectFit: "cover", borderRadius: "2px", flexShrink: 0 };

  return (
    <div ref={boxRef} style={{ position: "relative" }}>
      <Input
        value={value}
        onChange={(e) => { typedRef.current = true; onText(e.target.value); }}
        onFocus={() => { if (results.length) setOpen(true); }}
        onKeyDown={onKeyDown}
        placeholder="Comece a digitar o nome…"
        autoComplete="off"
      />

      {open && (
        <div style={{
          position: "absolute", top: "calc(100% + 4px)", left: 0, right: 0,
          background: "#FBF9E6", border: "1px solid #D8D9B0", borderRadius: "4px",
          boxShadow: "0 8px 24px rgba(10,51,35,0.18)", zIndex: 30,
          maxHeight: "232px", overflowY: "auto", padding: "4px",
        }}>
          {loading && <div style={{ padding: "8px 10px", fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontSize: "14px", color: C.sage }}>buscando…</div>}

          {!loading && results.length === 0 && (
            <div style={{ padding: "8px 10px", fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontSize: "14px", color: C.sage }}>nenhum resultado — pode salvar assim mesmo</div>
          )}

          {!loading && results.map((r, i) => (
            <button
              key={r.key}
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onMouseEnter={() => setActive(i)}
              onClick={() => pick(r)}
              style={{
                display: "flex", alignItems: "center", gap: "10px", width: "100%",
                padding: "6px 8px", border: "none", borderRadius: "3px", cursor: "pointer",
                textAlign: "left", background: i === active ? "#efeccf" : "transparent",
              }}
            >
              {r.poster_path
                ? <img src={posterUrl(r.poster_path, "w92")} alt="" style={thumb} />
                : <div style={{ ...thumb, background: "#e3e0c4" }} />}
              <span style={{ flex: 1, minWidth: 0, display: "flex", alignItems: "baseline", gap: "6px" }}>
                <span style={{
                  fontFamily: "'Playfair Display', serif", fontSize: "15px", color: C.green,
                  whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                }}>{r.title}</span>
                {r.media_type === "tv" && (
                  <span style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontSize: "12px", color: C.sage, flexShrink: 0 }}>série</span>
                )}
              </span>
              {r.year && (
                <span style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontSize: "13px", color: C.sage, flexShrink: 0 }}>{r.year}</span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// Botão-pílula (autor único / "os dois amaram"), no estilo da Dates.
function PillToggle({ on, label, activeColor, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontSize: "14px",
        padding: "5px 18px", border: `1px solid ${activeColor}`, borderRadius: "2px",
        background: on ? activeColor : "transparent", color: on ? C.paper : activeColor,
        cursor: "pointer", transition: "background 0.15s, color 0.15s",
      }}
    >{label}</button>
  );
}

// ─── Página ──────────────────────────────────────────────────────────────────

export default function MoviesPage() {
  const isTablet      = useMediaQuery("(max-width: 900px)");
  const isMobile      = useMediaQuery("(max-width: 560px)");
  const reducedMotion = useMediaQuery("(prefers-reduced-motion: reduce)");

  const { items, loading, create, update, remove } = useCollection("sessao", {
    messages: {
      load:   "não foi possível carregar a sessão",
      create: "não foi possível guardar o filme",
      update: "não foi possível atualizar",
      remove: "não foi possível excluir",
    },
  });

  // Persistência do pôster resolvido — onResolve estável via ref (o `update` do
  // useCollection é recriado a cada render).
  const updateRef = useRef(update);
  useEffect(() => { updateRef.current = update; }, [update]);
  const persistMeta = useCallback((id, patch) => updateRef.current(id, patch), []);
  useTmdbPosters(items, persistMeta);

  const formRef = useRef(null);
  const scrollToForm = () =>
    requestAnimationFrame(() => formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }));

  const [filter,    setFilter]    = useState("todos");
  const [formOpen,  setFormOpen]  = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form,      setForm]      = useState(EMPTY_FORM);

  const assistidos = items.filter(i => i.status === "assistido").length;
  const watchlist  = items.filter(i => i.status === "watchlist").length;
  const filtered   = filter === "todos" ? items : items.filter(i => i.status === filter);

  const isEditing = editingId !== null;
  const cols = isMobile ? 1 : isTablet ? 2 : 3;
  const gap  = isMobile ? "12px" : "14px";

  const set = field => e => setForm(f => ({ ...f, [field]: e.target.value }));

  const cancelar = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setFormOpen(false);
  };

  const iniciarEdicao = (item) => {
    setEditingId(item.id);
    setForm({
      title:         item.title || "",
      status:        item.status || "watchlist",
      year:          item.year != null ? String(item.year) : "",
      poster_path:   item.poster_path ?? null,
      added_by:      item.added_by || "",
      rating:        item.rating != null ? String(item.rating) : "",
      comment:       item.comment || "",
      loved_by_both: !!item.loved_by_both,
    });
    setFormOpen(true);
  };

  // "já assistimos": move pra assistido e abre o form pronto p/ a nota.
  const marcarVisto = async (item) => {
    await update(item.id, { status: "assistido" }, { errorMessage: "não foi possível marcar como visto" });
    iniciarEdicao({ ...item, status: "assistido" });
    scrollToForm();
  };

  const salvar = async () => {
    if (!form.title.trim()) return;
    const assistido = form.status === "assistido";
    const payload = {
      title:         form.title.trim(),
      status:        form.status,
      year:          form.year !== "" ? parseInt(form.year, 10) : null,
      poster_path:   form.poster_path ?? null,
      added_by:      form.added_by || null,
      rating:        assistido && form.rating !== "" ? parseFloat(form.rating) : null,
      comment:       assistido && form.comment.trim() ? form.comment.trim() : null,
      loved_by_both: assistido ? !!form.loved_by_both : false,
    };
    const ok = editingId
      ? await update(editingId, payload)
      : await create(payload);
    if (ok) cancelar();
  };

  const showRating = form.status === "assistido";

  return (
    <div style={PAGE_BG}>
      <div style={{ maxWidth: "1040px", margin: "0 auto", padding: isMobile ? "28px 16px 48px" : "44px 32px 64px" }}>

        <SessaoHeader assistidos={assistidos} watchlist={watchlist} />

        {/* Toolbar: abrir formulário */}
        <div style={{ display: "flex", justifyContent: "center", marginBottom: "14px" }}>
          <FormToggleButton
            open={formOpen}
            editing={isEditing}
            onClick={() => isEditing ? cancelar() : setFormOpen(o => !o)}
            addLabel="adicionar filme ou série"
            editLabel="editando"
          />
        </div>

        {/* Formulário */}
        <div ref={formRef} style={{ maxWidth: "620px", margin: "0 auto 8px", scrollMarginTop: "16px" }}>
          <Collapsible open={formOpen} maxHeight="760px">
            <div data-form-grid style={{
              background: C.paper, padding: "26px 24px", marginTop: "2px",
              display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px 24px",
            }}>
              <div style={{ gridColumn: "1 / -1" }}>
                <Label>título *</Label>
                <TitleAutocomplete
                  value={form.title}
                  onText={(text) => setForm(f => ({ ...f, title: text, poster_path: null }))}
                  onPick={(r) => setForm(f => ({
                    ...f,
                    title:       r.title,
                    year:        r.year != null ? String(r.year) : f.year,
                    poster_path: r.poster_path,
                  }))}
                />
              </div>
              <div>
                <Label>onde entra</Label>
                <Select value={form.status} onChange={set("status")}>
                  <option value="watchlist">quero ver</option>
                  <option value="assistido">assistido</option>
                </Select>
              </div>
              <div>
                <Label>ano</Label>
                <Input type="number" min="1900" max="2100" value={form.year}
                  onChange={set("year")} placeholder="auto (TMDB)" style={{ fontStyle: "normal" }} />
              </div>
              <div style={{ gridColumn: "1 / -1" }}>
                <Label>quem adicionou</Label>
                <div style={{ display: "flex", gap: "10px", paddingTop: "6px" }}>
                  <PillToggle on={form.added_by === "pedro"} label="Pedro" activeColor={C.green}
                    onClick={() => setForm(f => ({ ...f, added_by: f.added_by === "pedro" ? "" : "pedro" }))} />
                  <PillToggle on={form.added_by === "kim"} label="Kim" activeColor={C.rose}
                    onClick={() => setForm(f => ({ ...f, added_by: f.added_by === "kim" ? "" : "kim" }))} />
                </div>
              </div>

              {showRating && (
                <>
                  <div>
                    <Label>nota (0–10)</Label>
                    <Input type="number" min="0" max="10" step="0.1" value={form.rating}
                      onChange={set("rating")} placeholder="8.5" style={{ fontStyle: "normal" }} />
                  </div>
                  <div>
                    <Label>os dois amaram?</Label>
                    <div style={{ paddingTop: "6px" }}>
                      <PillToggle on={form.loved_by_both} label="os dois amaram ♥" activeColor={C.rose}
                        onClick={() => setForm(f => ({ ...f, loved_by_both: !f.loved_by_both }))} />
                    </div>
                  </div>
                  <div style={{ gridColumn: "1 / -1" }}>
                    <Label>comentário do casal</Label>
                    <Input value={form.comment} onChange={set("comment")} placeholder="uma frase de vocês sobre o filme…" />
                  </div>
                </>
              )}

              <FormActions
                canSave={!!form.title.trim()}
                editing={isEditing}
                onSave={salvar}
                onCancel={cancelar}
              />
            </div>
          </Collapsible>
        </div>

        {/* Filtros */}
        <div style={{
          display: "flex", justifyContent: "center", flexWrap: "wrap",
          gap: "8px", marginBottom: isMobile ? "28px" : "36px",
        }}>
          {FILTERS.map(f => (
            <FilterChip key={f.key} label={f.label} active={filter === f.key} onClick={() => setFilter(f.key)} />
          ))}
        </div>

        {/* Mosaico */}
        {loading ? (
          <LoadingDots />
        ) : filtered.length === 0 ? (
          <SessaoEmptyState filter={filter} onAdd={() => { setFilter("todos"); setFormOpen(true); }} />
        ) : (
          <div style={{ columns: cols, columnGap: gap, maxWidth: "880px", margin: "0 auto" }}>
            {filtered.map(item => (
              <div key={item.id} style={{ breakInside: "avoid", marginBottom: gap }}>
                {item.status === "watchlist"
                  ? <PosterCard
                      item={item}
                      posterPath={item.poster_path || null}
                      reducedMotion={reducedMotion}
                      onEdit={() => iniciarEdicao(item)}
                      onDelete={() => remove(item.id)}
                      onMarkWatched={() => marcarVisto(item)}
                    />
                  : <WatchedCard
                      item={item}
                      reducedMotion={reducedMotion}
                      onEdit={() => iniciarEdicao(item)}
                      onDelete={() => remove(item.id)}
                    />}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

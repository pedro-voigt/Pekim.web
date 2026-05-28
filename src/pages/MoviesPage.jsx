import { useState, useEffect } from "react";

import { supabase } from "../lib/supabase";
import PageHeader from "../components/ui/PageHeader";
import FilterChip from "../components/ui/FilterChip";
import StarRating from "../components/ui/StarRating";

const CATEGORIES = ["Romance", "Nossa vibe", "Comédia", "Filmes tristes", "Comfort movies"];

const input = {
  fontFamily: "'Cormorant Garamond', serif",
  fontStyle: "italic", fontSize: "15px",
  color: "#0A3323", background: "transparent",
  border: "none", borderBottom: "1px solid #D8D9B0",
  outline: "none", width: "100%", padding: "6px 0",
};
const label = {
  fontSize: "10px", letterSpacing: "0.12em",
  textTransform: "uppercase", color: "#5a8060",
  fontFamily: "'Cormorant Garamond', serif",
  display: "block", marginBottom: "4px",
};

export default function MoviesPage() {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("Todos");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState({ title: "", year: "", category: "Romance", note: "" });

  useEffect(() => {
    supabase.from("movies").select("*").order("id")
      .then(({ data }) => {
        if (data) setMovies(data);
        setLoading(false);
      });
  }, []);

  const filtered = filter === "Todos" ? movies : movies.filter(m => m.category === filter);
  const watched = movies.filter(m => m.watched).length;
  const set = field => e => setForm(f => ({ ...f, [field]: e.target.value }));

  const adicionar = async () => {
    if (!form.title.trim()) return;
    const { data, error } = await supabase
      .from("movies")
      .insert({
        title: form.title.trim(),
        year: form.year ? parseInt(form.year) : null,
        category: form.category,
        note: form.note,
        watched: false, rating: null, fav: false,
      })
      .select().single();
    if (!error && data) {
      setMovies(prev => [...prev, data]);
      setForm({ title: "", year: "", category: "Romance", note: "" });
      setFormOpen(false);
    }
  };

  const toggleWatched = async (movie) => {
    const watched = !movie.watched;
    setMovies(prev => prev.map(m => m.id === movie.id ? { ...m, watched } : m));
    await supabase.from("movies").update({ watched }).eq("id", movie.id);
  };

  const saveRating = async (movie, rating) => {
    setMovies(prev => prev.map(m => m.id === movie.id ? { ...m, rating } : m));
    await supabase.from("movies").update({ rating }).eq("id", movie.id);
  };

  return (
    <div style={{ padding: "40px 24px", maxWidth: "900px", margin: "0 auto" }}>
      <PageHeader title="Filmes & Séries" sub={`${watched} de ${movies.length} assistidos juntos`} icon="◎" />

      {/* Formulário de adição */}
      <div style={{ marginBottom: "16px" }}>
        <button
          onClick={() => setFormOpen(o => !o)}
          style={{
            display: "flex", alignItems: "center", gap: "8px",
            fontFamily: "'Cormorant Garamond', serif",
            fontStyle: "italic", fontSize: "14px",
            color: formOpen ? "#F7F4D5" : "#2e5c3a",
            background: formOpen ? "#0A3323" : "transparent",
            border: "1px solid #0A3323", padding: "8px 18px",
            cursor: "pointer", transition: "all 0.2s",
          }}
        >
          <span style={{ fontSize: "16px", lineHeight: 1 }}>{formOpen ? "−" : "+"}</span>
          adicionar filme ou série
        </button>
        <div style={{ maxHeight: formOpen ? "320px" : "0px", overflow: "hidden", transition: "max-height 0.35s ease" }}>
          <div style={{
            background: "#F7F4D5", padding: "28px 24px", marginTop: "2px",
            display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px 24px",
          }}>
            <div style={{ gridColumn: "1 / -1" }}>
              <label style={label}>título *</label>
              <input value={form.title} onChange={set("title")} placeholder="Nome do filme ou série" style={input} />
            </div>
            <div>
              <label style={label}>ano</label>
              <input type="number" value={form.year} onChange={set("year")} placeholder="2024" style={input} />
            </div>
            <div>
              <label style={label}>categoria</label>
              <select value={form.category} onChange={set("category")} style={{ ...input, cursor: "pointer" }}>
                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div style={{ gridColumn: "1 / -1" }}>
              <label style={label}>nota</label>
              <input value={form.note} onChange={set("note")} placeholder="Uma frase sobre o filme..." style={input} />
            </div>
            <div>
              <button
                onClick={adicionar}
                style={{
                  fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontSize: "14px",
                  color: form.title.trim() ? "#F7F4D5" : "#a8bc80",
                  background: form.title.trim() ? "#0A3323" : "transparent",
                  border: `1px solid ${form.title.trim() ? "#0A3323" : "#D8D9B0"}`,
                  padding: "10px 28px",
                  cursor: form.title.trim() ? "pointer" : "default",
                  transition: "all 0.2s",
                }}
              >guardar</button>
            </div>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div style={{ marginBottom: "40px" }}>
        <button
          onClick={() => setFiltersOpen(o => !o)}
          style={{
            display: "flex", alignItems: "center", gap: "10px",
            fontFamily: "'Cormorant Garamond', serif",
            fontStyle: "italic", fontSize: "14px",
            color: "#2e5c3a", background: "transparent",
            border: "1px solid #a8bc80", padding: "8px 18px",
            cursor: "pointer", marginBottom: "12px", transition: "all 0.2s",
          }}
        >
          <span style={{ display: "inline-block", transform: filtersOpen ? "rotate(90deg)" : "rotate(0deg)", transition: "transform 0.25s", fontSize: "12px" }}>›</span>
          Filtros
          {filter !== "Todos" && (
            <span style={{ background: "#D3968C", color: "#fff", borderRadius: "50%", width: "18px", height: "18px", fontSize: "10px", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>1</span>
          )}
        </button>
        <div style={{ overflow: "hidden", maxHeight: filtersOpen ? "100px" : "0px", transition: "max-height 0.35s ease" }}>
          <div style={{ padding: "4px 0 12px", display: "flex", flexWrap: "wrap", gap: "8px" }}>
            {["Todos", ...CATEGORIES].map(c => (
              <FilterChip key={c} label={c} active={filter === c} onClick={() => setFilter(c)} />
            ))}
          </div>
        </div>
      </div>

      {/* Lista */}
      {loading ? (
        <div style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontSize: "16px", color: "#a8bc80", textAlign: "center", padding: "48px 0", animation: "pulse 1.2s infinite" }}>✦ ✦ ✦</div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
          {filtered.map(m => (
            <div key={m.id} style={{
              display: "flex", alignItems: "center",
              padding: "20px 24px", gap: "20px",
              background: m.watched ? "#F7F4D5" : "#EEEBd8",
              opacity: m.watched ? 1 : 0.7,
              transition: "opacity 0.2s",
            }}>
              <div
                onClick={() => toggleWatched(m)}
                title={m.watched ? "Marcar como não assistido" : "Marcar como assistido"}
                style={{
                  width: "40px", height: "56px",
                  background: m.fav ? "#c9ddb0" : "#D8D9B0",
                  borderRadius: "1px", cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "18px", flexShrink: 0, transition: "background 0.2s",
                }}
              >
                {m.fav ? "★" : m.watched ? "✓" : "○"}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "baseline", gap: "10px", flexWrap: "wrap" }}>
                  <span style={{ fontFamily: "'Playfair Display', serif", fontSize: "17px", color: "#0A3323" }}>{m.title}</span>
                  <span style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontSize: "13px", color: "#5a8060" }}>{m.year}</span>
                  <span style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontSize: "12px", color: "#D3968C" }}>{m.category}</span>
                </div>
                {m.note && (
                  <p style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontSize: "13px", color: "#2e5c3a", margin: "4px 0 0" }}>{m.note}</p>
                )}
              </div>
              <div style={{ flexShrink: 0 }}>
                {m.watched ? (
                  <StarRating value={m.rating} onChange={r => saveRating(m, r)} />
                ) : (
                  <span style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontSize: "12px", color: "#a8bc80" }}>na fila ✦</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

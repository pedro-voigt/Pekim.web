import { useState, useEffect } from "react";

import { supabase } from "../lib/supabase";
import PageHeader from "../components/ui/PageHeader";
import PageContainer from "../components/ui/PageContainer";
import Collapsible from "../components/ui/Collapsible";
import FilterChip from "../components/ui/FilterChip";
import StarRating from "../components/ui/StarRating";
import ItemActions from "../components/ui/ItemActions";
import { Label, Input, Select } from "../components/ui/Field";

const CATEGORIES = ["Romance", "Nossa vibe", "Comédia", "Filmes tristes", "Comfort movies"];

const EMPTY = { title: "", year: "", category: "Romance", note: "" };

export default function MoviesPage() {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("Todos");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY);

  useEffect(() => {
    supabase.from("movies").select("*").order("id")
      .then(({ data, error }) => {
        if (error) console.error("[movies]", error);
        if (data) setMovies(data);
        setLoading(false);
      });
  }, []);

  const filtered = filter === "Todos" ? movies : movies.filter(m => m.category === filter);
  const watched = movies.filter(m => m.watched).length;
  const set = field => e => setForm(f => ({ ...f, [field]: e.target.value }));

  const iniciarEdicao = (movie) => {
    setEditingId(movie.id);
    setForm({
      title: movie.title || "",
      year: movie.year != null ? String(movie.year) : "",
      category: movie.category || "Romance",
      note: movie.note || "",
    });
    setFormOpen(true);
  };

  const cancelarEdicao = () => {
    setEditingId(null);
    setForm(EMPTY);
    setFormOpen(false);
  };

  const salvar = async () => {
    if (!form.title.trim()) return;
    const payload = {
      title: form.title.trim(),
      year: form.year ? parseInt(form.year) : null,
      category: form.category,
      note: form.note,
    };
    if (editingId) {
      const previous = movies.find(m => m.id === editingId);
      setMovies(prev => prev.map(m => m.id === editingId ? { ...m, ...payload } : m));
      const { error } = await supabase.from("movies").update(payload).eq("id", editingId);
      if (error) {
        console.error("[movies update]", error);
        setMovies(prev => prev.map(m => m.id === editingId ? previous : m));
        return;
      }
    } else {
      const { data, error } = await supabase
        .from("movies")
        .insert({ ...payload, watched: false, rating: null, fav: false })
        .select().single();
      if (error || !data) return;
      setMovies(prev => [...prev, data]);
    }
    setForm(EMPTY);
    setEditingId(null);
    setFormOpen(false);
  };

  const excluir = async (movie) => {
    const previous = movies;
    setMovies(prev => prev.filter(m => m.id !== movie.id));
    const { error } = await supabase.from("movies").delete().eq("id", movie.id);
    if (error) {
      console.error("[movies delete]", error);
      setMovies(previous);
    }
  };

  const toggleWatched = async (movie) => {
    const watched = !movie.watched;
    setMovies(prev => prev.map(m => m.id === movie.id ? { ...m, watched } : m));
    const { error } = await supabase.from("movies").update({ watched }).eq("id", movie.id);
    if (error) {
      console.error("[movies toggle]", error);
      setMovies(prev => prev.map(m => m.id === movie.id ? { ...m, watched: !watched } : m));
    }
  };

  const saveRating = async (movie, rating) => {
    setMovies(prev => prev.map(m => m.id === movie.id ? { ...m, rating } : m));
    const { error } = await supabase.from("movies").update({ rating }).eq("id", movie.id);
    if (error) {
      console.error("[movies rating]", error);
      setMovies(prev => prev.map(m => m.id === movie.id ? { ...m, rating: movie.rating } : m));
    }
  };

  const isEditing = editingId !== null;

  return (
    <PageContainer>
      <PageHeader title="Filmes & Séries" sub={`${watched} de ${movies.length} assistidos juntos`} icon="◎" />

      {/* Formulário */}
      <div style={{ marginBottom: "16px" }}>
        <button
          onClick={() => isEditing ? cancelarEdicao() : setFormOpen(o => !o)}
          style={{
            display: "flex", alignItems: "center", gap: "8px",
            fontFamily: "'Cormorant Garamond', serif",
            fontStyle: "italic", fontSize: "14px",
            color: (formOpen || isEditing) ? "#F7F4D5" : "#2e5c3a",
            background: (formOpen || isEditing) ? "#0A3323" : "transparent",
            border: "1px solid #0A3323", padding: "8px 18px",
            cursor: "pointer", transition: "all 0.2s",
          }}
        >
          <span style={{ fontSize: "16px", lineHeight: 1 }}>{(formOpen || isEditing) ? "−" : "+"}</span>
          {isEditing ? "editando filme" : "adicionar filme ou série"}
        </button>
        <Collapsible open={formOpen} maxHeight="420px">
          <div data-form-grid style={{
            background: "#F7F4D5", padding: "28px 24px", marginTop: "2px",
            display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px 24px",
          }}>
            <div style={{ gridColumn: "1 / -1" }}>
              <Label>título *</Label>
              <Input value={form.title} onChange={set("title")} placeholder="Nome do filme ou série" />
            </div>
            <div>
              <Label>ano</Label>
              <Input type="number" value={form.year} onChange={set("year")} placeholder="2024" />
            </div>
            <div>
              <Label>categoria</Label>
              <Select value={form.category} onChange={set("category")}>
                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </Select>
            </div>
            <div style={{ gridColumn: "1 / -1" }}>
              <Label>nota</Label>
              <Input value={form.note} onChange={set("note")} placeholder="Uma frase sobre o filme..." />
            </div>
            <div style={{ display: "flex", gap: "12px" }}>
              <button
                onClick={salvar}
                style={{
                  fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontSize: "14px",
                  color: form.title.trim() ? "#F7F4D5" : "#a8bc80",
                  background: form.title.trim() ? "#0A3323" : "transparent",
                  border: `1px solid ${form.title.trim() ? "#0A3323" : "#D8D9B0"}`,
                  padding: "10px 28px",
                  cursor: form.title.trim() ? "pointer" : "default",
                  transition: "all 0.2s",
                }}
              >{isEditing ? "atualizar" : "guardar"}</button>
              {isEditing && (
                <button
                  onClick={cancelarEdicao}
                  style={{
                    fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontSize: "14px",
                    color: "#5a8060", background: "transparent",
                    border: "none", padding: "10px 8px", cursor: "pointer",
                  }}
                >cancelar</button>
              )}
            </div>
          </div>
        </Collapsible>
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
        <Collapsible open={filtersOpen} maxHeight="100px">
          <div style={{ padding: "4px 0 12px", display: "flex", flexWrap: "wrap", gap: "8px" }}>
            {["Todos", ...CATEGORIES].map(c => (
              <FilterChip key={c} label={c} active={filter === c} onClick={() => setFilter(c)} />
            ))}
          </div>
        </Collapsible>
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
              outline: editingId === m.id ? "2px solid #D3968C" : "none",
              outlineOffset: "-2px",
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
              <ItemActions
                onEdit={() => iniciarEdicao(m)}
                onDelete={() => excluir(m)}
                confirmMessage={`Excluir "${m.title}"?`}
              />
            </div>
          ))}
        </div>
      )}
    </PageContainer>
  );
}

import { useState, useEffect } from "react";

import { supabase } from "../lib/supabase";
import PageHeader from "../components/ui/PageHeader";
import FilterChip from "../components/ui/FilterChip";
import StatusBadge from "../components/ui/StatusBadge";

const CATEGORIES = ["Em casa", "Baratos", "Românticos", "Aventura", "Aesthetic", "Diferentes"];
const PLANNINGS = ["Baixo", "Médio", "Alto"];
const STATUS_CYCLE = { "Quero fazer": "Planejado", "Planejado": "Feito", "Feito": "Quero fazer" };

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

export default function DatesPage() {
  const [dates, setDates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("Todos");
  const [statusFilter, setStatusFilter] = useState("Todos");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState({ name: "", description: "", cost: "", vibe: "", category: "Em casa", planning: "Baixo" });

  useEffect(() => {
    supabase.from("dates").select("*").order("id")
      .then(({ data, error }) => {
        if (error) console.error("[dates]", error);
        if (data) setDates(data);
        setLoading(false);
      });
  }, []);

  const filtered = dates.filter(d => {
    const catOk = filter === "Todos" || d.category === filter;
    const stOk = statusFilter === "Todos" || d.status === statusFilter;
    return catOk && stOk;
  });

  const activeCount = (filter !== "Todos" ? 1 : 0) + (statusFilter !== "Todos" ? 1 : 0);
  const set = field => e => setForm(f => ({ ...f, [field]: e.target.value }));

  const adicionar = async () => {
    if (!form.name.trim()) return;
    const { data, error } = await supabase
      .from("dates")
      .insert({ ...form, name: form.name.trim(), status: "Quero fazer" })
      .select().single();
    if (!error && data) {
      setDates(prev => [...prev, data]);
      setForm({ name: "", description: "", cost: "", vibe: "", category: "Em casa", planning: "Baixo" });
      setFormOpen(false);
    }
  };

  const toggleStatus = async (date) => {
    const next = STATUS_CYCLE[date.status] || "Quero fazer";
    setDates(prev => prev.map(d => d.id === date.id ? { ...d, status: next } : d));
    await supabase.from("dates").update({ status: next }).eq("id", date.id);
  };

  return (
    <div style={{ padding: "40px 24px", maxWidth: "900px", margin: "0 auto" }}>
      <PageHeader title="Dates" sub="Momentos esperando para acontecer" icon="✦" />

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
          adicionar date
        </button>
        <div style={{ maxHeight: formOpen ? "420px" : "0px", overflow: "hidden", transition: "max-height 0.35s ease" }}>
          <div style={{
            background: "#F7F4D5", padding: "28px 24px", marginTop: "2px",
            display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px 24px",
          }}>
            <div style={{ gridColumn: "1 / -1" }}>
              <label style={label}>nome *</label>
              <input value={form.name} onChange={set("name")} placeholder="Que date é esse?" style={input} />
            </div>
            <div style={{ gridColumn: "1 / -1" }}>
              <label style={label}>descrição</label>
              <input value={form.description} onChange={set("description")} placeholder="Como vai ser..." style={input} />
            </div>
            <div>
              <label style={label}>custo</label>
              <input value={form.cost} onChange={set("cost")} placeholder="R$0–50" style={input} />
            </div>
            <div>
              <label style={label}>vibe</label>
              <input value={form.vibe} onChange={set("vibe")} placeholder="Cozy, Romântico..." style={input} />
            </div>
            <div>
              <label style={label}>categoria</label>
              <select value={form.category} onChange={set("category")} style={{ ...input, cursor: "pointer" }}>
                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label style={label}>planejamento</label>
              <select value={form.planning} onChange={set("planning")} style={{ ...input, cursor: "pointer" }}>
                {PLANNINGS.map(p => <option key={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <button
                onClick={adicionar}
                style={{
                  fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontSize: "14px",
                  color: form.name.trim() ? "#F7F4D5" : "#a8bc80",
                  background: form.name.trim() ? "#0A3323" : "transparent",
                  border: `1px solid ${form.name.trim() ? "#0A3323" : "#D8D9B0"}`,
                  padding: "10px 28px",
                  cursor: form.name.trim() ? "pointer" : "default",
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
          {activeCount > 0 && (
            <span style={{ background: "#D3968C", color: "#fff", borderRadius: "50%", width: "18px", height: "18px", fontSize: "10px", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>{activeCount}</span>
          )}
        </button>
        <div style={{ overflow: "hidden", maxHeight: filtersOpen ? "200px" : "0px", transition: "max-height 0.35s ease" }}>
          <div style={{ padding: "4px 0 12px", display: "flex", flexDirection: "column", gap: "10px" }}>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
              {["Todos", ...CATEGORIES].map(c => (
                <FilterChip key={c} label={c} active={filter === c} onClick={() => setFilter(c)} />
              ))}
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
              {["Todos", "Quero fazer", "Planejado", "Feito"].map(s => (
                <FilterChip key={s} label={s} active={statusFilter === s} onClick={() => setStatusFilter(s)} small />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Lista */}
      {loading ? (
        <div style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontSize: "16px", color: "#a8bc80", textAlign: "center", padding: "48px 0", animation: "pulse 1.2s infinite" }}>✦ ✦ ✦</div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "2px" }}>
          {filtered.map(d => (
            <div key={d.id} style={{ padding: "28px 24px", background: "#F7F4D5", borderBottom: "1px solid #D8D9B0", borderRight: "1px solid #D8D9B0" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
                <span style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontSize: "11px", color: "#D3968C", letterSpacing: "0.1em" }}>{d.vibe}</span>
                <div onClick={() => toggleStatus(d)} style={{ cursor: "pointer" }} title="Clique para mudar status">
                  <StatusBadge status={d.status} />
                </div>
              </div>
              <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: "18px", fontWeight: "400", color: "#0A3323", margin: "0 0 8px" }}>{d.name}</h3>
              <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "14px", color: "#2e5c3a", lineHeight: 1.6, margin: "0 0 16px" }}>{d.description}</p>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", color: "#5a8060", fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic" }}>
                <span>{d.cost}</span>
                <span>Planejamento {d.planning}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

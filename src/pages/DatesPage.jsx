import { useState, useEffect } from "react";

import { supabase } from "../lib/supabase";
import PageHeader from "../components/ui/PageHeader";
import PageContainer from "../components/ui/PageContainer";
import Collapsible from "../components/ui/Collapsible";
import FilterChip from "../components/ui/FilterChip";
import StatusBadge from "../components/ui/StatusBadge";
import ItemActions from "../components/ui/ItemActions";
import { Label, Input, Select } from "../components/ui/Field";

const CATEGORIES = ["Em casa", "Baratos", "Românticos", "Aventura", "Aesthetic", "Diferentes"];
const PLANNINGS = ["Baixo", "Médio", "Alto"];
const STATUS_CYCLE = { "Quero fazer": "Planejado", "Planejado": "Feito", "Feito": "Quero fazer" };

const EMPTY = { name: "", description: "", cost: "", vibe: "", category: "Em casa", planning: "Baixo" };

export default function DatesPage() {
  const [dates, setDates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("Todos");
  const [statusFilter, setStatusFilter] = useState("Todos");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY);

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

  const iniciarEdicao = (date) => {
    setEditingId(date.id);
    setForm({
      name: date.name || "",
      description: date.description || "",
      cost: date.cost || "",
      vibe: date.vibe || "",
      category: date.category || "Em casa",
      planning: date.planning || "Baixo",
    });
    setFormOpen(true);
  };

  const cancelarEdicao = () => {
    setEditingId(null);
    setForm(EMPTY);
    setFormOpen(false);
  };

  const salvar = async () => {
    if (!form.name.trim()) return;
    if (editingId) {
      const patch = { ...form, name: form.name.trim() };
      const previous = dates.find(d => d.id === editingId);
      setDates(prev => prev.map(d => d.id === editingId ? { ...d, ...patch } : d));
      const { error } = await supabase.from("dates").update(patch).eq("id", editingId);
      if (error) {
        console.error("[dates update]", error);
        setDates(prev => prev.map(d => d.id === editingId ? previous : d));
        return;
      }
    } else {
      const { data, error } = await supabase
        .from("dates")
        .insert({ ...form, name: form.name.trim(), status: "Quero fazer" })
        .select().single();
      if (error || !data) return;
      setDates(prev => [...prev, data]);
    }
    setForm(EMPTY);
    setEditingId(null);
    setFormOpen(false);
  };

  const excluir = async (date) => {
    const previous = dates;
    setDates(prev => prev.filter(d => d.id !== date.id));
    const { error } = await supabase.from("dates").delete().eq("id", date.id);
    if (error) {
      console.error("[dates delete]", error);
      setDates(previous);
    }
  };

  const toggleStatus = async (date) => {
    const next = STATUS_CYCLE[date.status] || "Quero fazer";
    setDates(prev => prev.map(d => d.id === date.id ? { ...d, status: next } : d));
    const { error } = await supabase.from("dates").update({ status: next }).eq("id", date.id);
    if (error) {
      console.error("[dates toggle]", error);
      setDates(prev => prev.map(d => d.id === date.id ? { ...d, status: date.status } : d));
    }
  };

  const isEditing = editingId !== null;

  return (
    <PageContainer>
      <PageHeader title="Dates" sub="Momentos esperando para acontecer" icon="✦" />

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
          {isEditing ? "editando date" : "adicionar date"}
        </button>
        <Collapsible open={formOpen} maxHeight="520px">
          <div data-form-grid style={{
            background: "#F7F4D5", padding: "28px 24px", marginTop: "2px",
            display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px 24px",
          }}>
            <div style={{ gridColumn: "1 / -1" }}>
              <Label>nome *</Label>
              <Input value={form.name} onChange={set("name")} placeholder="Que date é esse?" />
            </div>
            <div style={{ gridColumn: "1 / -1" }}>
              <Label>descrição</Label>
              <Input value={form.description} onChange={set("description")} placeholder="Como vai ser..." />
            </div>
            <div>
              <Label>custo</Label>
              <Input value={form.cost} onChange={set("cost")} placeholder="R$0–50" />
            </div>
            <div>
              <Label>vibe</Label>
              <Input value={form.vibe} onChange={set("vibe")} placeholder="Cozy, Romântico..." />
            </div>
            <div>
              <Label>categoria</Label>
              <Select value={form.category} onChange={set("category")}>
                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </Select>
            </div>
            <div>
              <Label>planejamento</Label>
              <Select value={form.planning} onChange={set("planning")}>
                {PLANNINGS.map(p => <option key={p}>{p}</option>)}
              </Select>
            </div>
            <div style={{ display: "flex", gap: "12px" }}>
              <button
                onClick={salvar}
                style={{
                  fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontSize: "14px",
                  color: form.name.trim() ? "#F7F4D5" : "#a8bc80",
                  background: form.name.trim() ? "#0A3323" : "transparent",
                  border: `1px solid ${form.name.trim() ? "#0A3323" : "#D8D9B0"}`,
                  padding: "10px 28px",
                  cursor: form.name.trim() ? "pointer" : "default",
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
          {activeCount > 0 && (
            <span style={{ background: "#D3968C", color: "#fff", borderRadius: "50%", width: "18px", height: "18px", fontSize: "10px", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>{activeCount}</span>
          )}
        </button>
        <Collapsible open={filtersOpen} maxHeight="200px">
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
        </Collapsible>
      </div>

      {/* Lista */}
      {loading ? (
        <div style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontSize: "16px", color: "#a8bc80", textAlign: "center", padding: "48px 0", animation: "pulse 1.2s infinite" }}>✦ ✦ ✦</div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "2px" }}>
          {filtered.map(d => (
            <div key={d.id} style={{
              padding: "28px 24px",
              background: "#F7F4D5",
              borderBottom: "1px solid #D8D9B0",
              borderRight: "1px solid #D8D9B0",
              outline: editingId === d.id ? "2px solid #D3968C" : "none",
              outlineOffset: "-2px",
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px", gap: "8px" }}>
                <span style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontSize: "11px", color: "#D3968C", letterSpacing: "0.1em" }}>{d.vibe}</span>
                <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                  <button
                    onClick={() => toggleStatus(d)}
                    title="Clique para mudar status"
                    aria-label={`Status: ${d.status}. Mudar para próximo.`}
                    style={{ background: "transparent", border: "none", padding: 0, cursor: "pointer" }}
                  >
                    <StatusBadge status={d.status} />
                  </button>
                  <ItemActions
                    onEdit={() => iniciarEdicao(d)}
                    onDelete={() => excluir(d)}
                    confirmMessage={`Excluir "${d.name}"?`}
                  />
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
    </PageContainer>
  );
}

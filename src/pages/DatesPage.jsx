import { useState } from "react";

import useCollection from "../hooks/useCollection";
import PageHeader from "../components/ui/PageHeader";
import PageContainer from "../components/ui/PageContainer";
import Collapsible from "../components/ui/Collapsible";
import FilterChip from "../components/ui/FilterChip";
import StatusBadge from "../components/ui/StatusBadge";
import ItemActions from "../components/ui/ItemActions";
import FormToggleButton from "../components/ui/FormToggleButton";
import FormActions from "../components/ui/FormActions";
import LoadingDots from "../components/ui/LoadingDots";
import { Label, Input, Select } from "../components/ui/Field";

const CATEGORIES = ["Em casa", "Baratos", "Românticos", "Aventura", "Aesthetic", "Diferentes"];
const PLANNINGS = ["Baixo", "Médio", "Alto"];
const STATUS_CYCLE = { "Quero fazer": "Planejado", "Planejado": "Feito", "Feito": "Quero fazer" };

const EMPTY = { name: "", description: "", cost: "", vibe: "", category: "Em casa", planning: "Baixo" };

export default function DatesPage() {
  const { items: dates, loading, create, update, remove } = useCollection("dates", {
    messages: {
      load: "não foi possível carregar os dates",
      create: "não foi possível guardar o date",
      update: "não foi possível atualizar o date",
    },
  });
  const [filter, setFilter] = useState("Todos");
  const [statusFilter, setStatusFilter] = useState("Todos");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY);

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
    const payload = { ...form, name: form.name.trim() };
    const ok = editingId
      ? await update(editingId, payload)
      : await create({ ...payload, status: "Quero fazer" });
    if (!ok) return;
    cancelarEdicao();
  };

  const toggleStatus = (date) =>
    update(date.id, { status: STATUS_CYCLE[date.status] || "Quero fazer" },
      { errorMessage: "não foi possível mudar o status" });

  const isEditing = editingId !== null;

  return (
    <PageContainer>
      <PageHeader title="Dates" sub="Momentos esperando para acontecer" icon="✦" />

      {/* Formulário */}
      <div style={{ marginBottom: "16px" }}>
        <FormToggleButton
          open={formOpen}
          editing={isEditing}
          onClick={() => isEditing ? cancelarEdicao() : setFormOpen(o => !o)}
          addLabel="adicionar date"
          editLabel="editando date"
        />
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
            <FormActions
              canSave={!!form.name.trim()}
              editing={isEditing}
              onSave={salvar}
              onCancel={cancelarEdicao}
            />
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
        <LoadingDots />
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
                    onDelete={() => remove(d.id)}
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

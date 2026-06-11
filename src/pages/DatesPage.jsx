import { useState } from "react";

import useCollection from "../hooks/useCollection";
import useMediaQuery from "../hooks/useMediaQuery";
import Collapsible from "../components/ui/Collapsible";
import FilterChip from "../components/ui/FilterChip";
import FormActions from "../components/ui/FormActions";
import LoadingDots from "../components/ui/LoadingDots";
import PhotoUploader from "../components/ui/PhotoUploader";
import { Label, Input, Select } from "../components/ui/Field";
import usePhotoUpload from "../hooks/usePhotoUpload";
import DatesHeader from "../components/dates/DatesHeader";
import DatesToolbar from "../components/dates/DatesToolbar";
import DateCard from "../components/dates/DateCard";
import DatesEmptyState from "../components/dates/DatesEmptyState";
import { getCardRoles, cardTheme } from "../lib/dateDecor";

const CATEGORIES = ["Em casa", "Baratos", "Românticos", "Aventura", "Aesthetic", "Diferentes"];
const PLANNINGS  = ["Baixo", "Médio", "Alto"];
const STATUS_CYCLE  = { "Quero fazer": "Planejado", "Planejado": "Feito", "Feito": "Quero fazer" };
const STATUS_ORDER  = { "Quero fazer": 0, "Planejado": 1, "Feito": 2 };

const EMPTY = { name: "", description: "", cost: "", vibe: "", category: "Em casa", planning: "Baixo", autores: [], feito_em: "" };

function applySort(arr, sort) {
  if (sort === 'id') return arr;
  const copy = [...arr];
  if (sort === 'category') copy.sort((a, b) => (a.category || '').localeCompare(b.category || ''));
  if (sort === 'cost')     copy.sort((a, b) => (a.cost || '').localeCompare(b.cost || ''));
  if (sort === 'status')   copy.sort((a, b) => (STATUS_ORDER[a.status] || 0) - (STATUS_ORDER[b.status] || 0));
  return copy;
}

const PAGE_BG = {
  background: [
    "radial-gradient(ellipse at 15% 60%, rgba(131,153,88,0.07) 0%, transparent 50%)",
    "radial-gradient(ellipse at 85% 15%, rgba(211,150,140,0.06) 0%, transparent 40%)",
    "#e9e6d0",
  ].join(", "),
  minHeight: "100vh",
};

export default function DatesPage() {
  const { items: dates, loading, create, update, remove } = useCollection("dates", {
    messages: {
      load:   "não foi possível carregar os dates",
      create: "não foi possível guardar o date",
      update: "não foi possível atualizar o date",
    },
  });
  const fotoHook = usePhotoUpload([], "dates");

  const [filter,       setFilter]       = useState("Todos");
  const [statusFilter, setStatusFilter] = useState("Todos");
  const [filtersOpen,  setFiltersOpen]  = useState(false);
  const [formOpen,     setFormOpen]     = useState(false);
  const [editingId,    setEditingId]    = useState(null);
  const [form,         setForm]         = useState(EMPTY);
  const [sort,         setSort]         = useState("id");

  const filtered = applySort(
    dates.filter(d => {
      const catOk = filter       === "Todos" || d.category === filter;
      const stOk  = statusFilter === "Todos" || d.status   === statusFilter;
      return catOk && stOk;
    }),
    sort,
  );

  const activeCount = (filter !== "Todos" ? 1 : 0) + (statusFilter !== "Todos" ? 1 : 0);
  const set = field => e => setForm(f => ({ ...f, [field]: e.target.value }));

  const iniciarEdicao = (date) => {
    setEditingId(date.id);
    setForm({
      name:        date.name        || "",
      description: date.description || "",
      cost:        date.cost        || "",
      vibe:        date.vibe        || "",
      category:    date.category    || "Em casa",
      planning:    date.planning    || "Baixo",
      autores:     date.autores     || [],
      feito_em:    date.feito_em    || "",
    });
    fotoHook.reset(date.foto_url ? [date.foto_url] : []);
    setFormOpen(true);
  };

  const toggleAutor = (autor) =>
    setForm(f => ({
      ...f,
      autores: f.autores.includes(autor)
        ? f.autores.filter(a => a !== autor)
        : [...f.autores, autor],
    }));

  const abrirFormComCategoria = (categoria) => {
    setForm(f => ({ ...f, category: CATEGORIES.includes(categoria) ? categoria : "Em casa" }));
    setFormOpen(true);
  };

  const cancelarEdicao = () => {
    fotoHook.cleanupCanceled(); // apaga do Storage fotos enviadas mas não salvas
    fotoHook.reset([]);
    setEditingId(null);
    setForm(EMPTY);
    setFormOpen(false);
  };

  const salvar = async () => {
    if (!form.name.trim()) return;
    const payload = {
      ...form,
      name:     form.name.trim(),
      feito_em: form.feito_em || null,
      autores:  form.autores  || [],
      foto_url: fotoHook.fotos[0] || null,
    };
    const ok = editingId
      ? await update(editingId, payload)
      : await create({ ...payload, status: "Quero fazer" });
    if (!ok) return;
    fotoHook.cleanupSaved(); // apaga do Storage fotos substituídas ou removidas
    fotoHook.reset([]);      // zera baseline antes de cancelarEdicao para não double-clean
    cancelarEdicao();
  };

  const toggleStatus = (date) =>
    update(date.id, { status: STATUS_CYCLE[date.status] || "Quero fazer" },
      { errorMessage: "não foi possível mudar o status" });

  const isEditing     = editingId !== null;
  const { heroId, rosaId } = getCardRoles(dates);
  const isTablet      = useMediaQuery("(max-width: 900px)");
  const isMobile      = useMediaQuery("(max-width: 560px)");
  const reducedMotion = useMediaQuery("(prefers-reduced-motion: reduce)");

  const masonryCols = isTablet ? 2 : 3;
  const masonryGap  = isMobile ? "11px" : "18px";

  return (
    <div style={PAGE_BG}>
      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: isMobile ? "24px 16px" : "40px 32px" }}>

        <DatesHeader total={dates.length} />

        <DatesToolbar
          isEditing={isEditing}
          onToggleForm={() => isEditing ? cancelarEdicao() : setFormOpen(o => !o)}
          onToggleFilters={() => setFiltersOpen(o => !o)}
          activeCount={activeCount}
          sort={sort}
          onSort={setSort}
        />

        {/* Formulário */}
        <div style={{ marginBottom: "16px" }}>
          <Collapsible open={formOpen} maxHeight="640px">
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

              {/* Autores */}
              <div style={{ gridColumn: "1 / -1" }}>
                <Label>quem teve a ideia</Label>
                <div style={{ display: "flex", gap: "10px", paddingTop: "6px" }}>
                  {[
                    { key: "pedro", label: "Pedro", activeColor: "#0A3323" },
                    { key: "kim",   label: "Kim",   activeColor: "#D3968C" },
                  ].map(({ key, label, activeColor }) => {
                    const on = form.autores.includes(key);
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => toggleAutor(key)}
                        style={{
                          fontFamily:    "'Cormorant Garamond', serif",
                          fontStyle:     "italic",
                          fontSize:      "14px",
                          padding:       "5px 18px",
                          border:        `1px solid ${activeColor}`,
                          borderRadius:  "2px",
                          background:    on ? activeColor : "transparent",
                          color:         on ? "#F7F4D5" : activeColor,
                          cursor:        "pointer",
                          transition:    "background 0.15s, color 0.15s",
                        }}
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Foto da polaroid — só aparece ao editar */}
              {isEditing && (
                <div style={{ gridColumn: "1 / -1" }}>
                  <PhotoUploader
                    label="foto da memória"
                    max={1}
                    fotos={fotoHook.fotos}
                    uploading={fotoHook.uploading}
                    addFiles={fotoHook.addFiles}
                    removeFoto={fotoHook.removeFoto}
                  />
                </div>
              )}

              {/* Feito em — só aparece ao editar */}
              {isEditing && (
                <div style={{ gridColumn: "1 / -1" }}>
                  <Label>feito em</Label>
                  <Input
                    type="date"
                    value={form.feito_em}
                    onChange={set("feito_em")}
                    style={{ fontStyle: "normal", colorScheme: "light" }}
                  />
                </div>
              )}

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
        <div style={{ marginBottom: "32px" }}>
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

        {/* Cards — masonry */}
        {loading ? (
          <LoadingDots />
        ) : filtered.length === 0 ? (
          <DatesEmptyState
            filter={filter}
            statusFilter={statusFilter}
            onInventar={() => abrirFormComCategoria(filter)}
          />
        ) : (
          <div style={{ columns: masonryCols, columnGap: masonryGap }}>
            {filtered.map(d => {
              const role = d.id === heroId ? "hero" : d.id === rosaId ? "rosa" : "default";
              return (
                <div key={d.id} style={{ marginBottom: masonryGap }}>
                  <DateCard
                    date={d}
                    role={role}
                    theme={cardTheme(role)}
                    isEditing={editingId === d.id}
                    reducedMotion={reducedMotion}
                    onToggleStatus={toggleStatus}
                    onEdit={() => iniciarEdicao(d)}
                    onDelete={() => remove(d.id)}
                  />
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

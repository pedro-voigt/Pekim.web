import { useState, useEffect, lazy, Suspense } from "react";

import useCollection from "../hooks/useCollection";
import usePhotoUpload from "../hooks/usePhotoUpload";
import { supabase } from "../lib/supabase";
import { toMuralMemory, normalizeAutor } from "../lib/muralAdapter";
import { deleteImage } from "../lib/uploadImage";
import useMediaQuery from "../hooks/useMediaQuery";
import PageContainer from "../components/ui/PageContainer";
import LoadingDots from "../components/ui/LoadingDots";
import Collapsible from "../components/ui/Collapsible";
import FormToggleButton from "../components/ui/FormToggleButton";
import MemoriesHeader from "../components/memories/MemoriesHeader";
import MuralFilters from "../components/memories/MuralFilters";
import MemoryForm from "../components/memories/MemoryForm";
import Mural from "../components/memories/Mural";
import MuralEmptyState from "../components/memories/MuralEmptyState";

const EMPTY = {
  title: "",
  date: new Date().toISOString().split("T")[0],
  description: "",
  local: "",
  autor: "",
};

const matchesFilter = (m, filter) =>
  filter === "sonhos"  ? m.origem === "sonho" :
  filter === "viagens" ? !!m.local :
  true; // "todos"

// Conta os lugares reais do mapa (tabela `lugares`) sem trazer as linhas.
function useLugaresCount() {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let active = true;
    supabase.from("lugares").select("*", { count: "exact", head: true })
      .then(({ count }) => { if (active) setCount(count || 0); })
      .catch(() => {});
    return () => { active = false; };
  }, []);
  return count;
}

// Leaflet (~150 KB) vive numa aba pouco usada → carrega sob demanda.
const CorkMap = lazy(() => import("../components/map/CorkMap"));

const TABS = [
  { key: "mural", label: "Mural" },
  { key: "mapa",  label: "Mapa 📍" },
];

function Tabs({ tab, setTab }) {
  return (
    <div style={{ display: "flex", justifyContent: "flex-start", gap: "6px", marginBottom: "22px" }}>
      {TABS.map(t => {
        const active = tab === t.key;
        return (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            style={{
              fontFamily:   "'Playfair Display', serif",
              fontWeight:   700,
              fontSize:     "15px",
              padding:      "8px 22px",
              borderRadius: "20px",
              cursor:       "pointer",
              transition:   "all 0.2s",
              background:   active ? "#0A3323" : "transparent",
              color:        active ? "#F7F4D5" : "#0A3323",
              border:       active ? "1px solid #0A3323" : "1px solid rgba(10,51,35,0.25)",
              opacity:      active ? 1 : 0.6,
            }}
          >
            {t.label}
          </button>
        );
      })}
    </div>
  );
}

export default function MemoriesPage() {
  const [tab, setTab] = useState("mural");
  const [filter, setFilter] = useState("todos");
  const reducedMotion = useMediaQuery("(prefers-reduced-motion: reduce)");

  const { items: rows, loading, create, update, remove } = useCollection("memories", {
    order: { column: "date", ascending: false }, // mais recentes fixadas primeiro
    messages: {
      load:   "não foi possível carregar as memórias",
      create: "não foi possível guardar a memória",
      update: "não foi possível atualizar a memória",
    },
  });
  const memories = rows.map(toMuralMemory);

  // "momentos" = memórias reais; "lugares no mapa" = pins reais da tabela `lugares`.
  const momentos = memories.length;
  const lugares  = useLugaresCount();

  const filtered = memories.filter(m => matchesFilter(m, filter));
  const counts = {
    todos:   memories.length,
    sonhos:  memories.filter(m => matchesFilter(m, "sonhos")).length,
    viagens: memories.filter(m => matchesFilter(m, "viagens")).length,
  };

  // ── Form criar/editar ───────────────────────────────────────────────────────
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing]   = useState(null); // linha crua de `memories` | null
  const [form, setForm]         = useState(EMPTY);
  const photo = usePhotoUpload([], "memorias");

  const field    = f   => e => setForm(s => ({ ...s, [f]: e.target.value }));
  const setAutor = key =>      setForm(s => ({ ...s, autor: s.autor === key ? "" : key }));

  const resetForm = () => { setEditing(null); setForm(EMPTY); photo.reset([]); setFormOpen(false); };

  const abrirNovo = () => { setEditing(null); setForm(EMPTY); photo.reset([]); setFormOpen(true); };

  const editarRow = (row) => {
    setEditing(row);
    setForm({
      title:       row.title || "",
      date:        row.date || EMPTY.date,
      description: row.description || "",
      local:       row.local?.nome || "",
      autor:       normalizeAutor(row.autor) || "",
    });
    photo.reset(Array.isArray(row.fotos) ? row.fotos : []);
    setFormOpen(true);
  };

  const cancelar = () => { photo.cleanupCanceled(); resetForm(); };

  const salvar = async () => {
    if (!form.title.trim()) return;
    const nome = form.local.trim();
    const payload = {
      title:       form.title.trim(),
      date:        form.date || null,
      description: form.description.trim() || null,
      autor:       form.autor || null,
      local:       nome ? { ...(editing?.local || {}), nome } : null,
      fotos:       photo.fotos,
    };
    const ok = editing ? await update(editing.id, payload) : await create(payload);
    if (!ok) return;
    photo.cleanupSaved(); // apaga do Storage as removidas-e-salvas
    photo.reset([]);
    resetForm();
  };

  // O Mural entrega a memória adaptada; recupera a linha crua p/ editar/excluir.
  const rowOf = (mm) => rows.find(r => String(r.id) === mm.id);

  const onEdit = (mm) => { const row = rowOf(mm); if (row) editarRow(row); };

  const onDelete = async (mm) => {
    const row = rowOf(mm);
    if (!row) return;
    const fotos = Array.isArray(row.fotos) ? row.fotos : [];
    const ok = await remove(row.id);
    if (ok) fotos.forEach(deleteImage); // limpa as fotos órfãs no Storage
  };

  const isEditing = editing !== null;
  const editingId = editing ? String(editing.id) : null;

  return (
    <PageContainer maxWidth="1200px">
      <MemoriesHeader momentos={momentos} lugares={lugares} />

      <Tabs tab={tab} setTab={setTab} />

      <div key={tab} style={{ animation: reducedMotion ? "none" : "fadeIn 0.4s ease both" }}>
        {tab === "mural" && (<>
          {/* Form (criar/editar) — alinhado à esquerda, largura cheia (como Dates) */}
          <div>
            <div style={{ display: "flex", justifyContent: "flex-start", marginBottom: "14px" }}>
              <FormToggleButton
                open={formOpen}
                editing={isEditing}
                onClick={() => (formOpen ? cancelar() : abrirNovo())}
                addLabel="adicionar memória"
                editLabel="editando memória"
              />
            </div>
            <div style={{ marginBottom: "20px" }}>
              <Collapsible open={formOpen} maxHeight="760px">
                <MemoryForm
                  form={form}
                  onField={field}
                  autor={form.autor}
                  onAutor={setAutor}
                  photo={photo}
                  editing={isEditing}
                  canSave={!!form.title.trim()}
                  onSave={salvar}
                  onCancel={cancelar}
                />
              </Collapsible>
            </div>
          </div>

          <MuralFilters value={filter} onChange={setFilter} counts={counts} />

          {loading ? (
            <LoadingDots size="15px" />
          ) : filtered.length === 0 ? (
            <MuralEmptyState filter={filter} onReset={() => setFilter("todos")} onAdd={abrirNovo} />
          ) : (
            <Mural
              memories={filtered}
              reducedMotion={reducedMotion}
              editingId={editingId}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          )}
        </>)}

        {tab === "mapa" && (
          <Suspense fallback={<LoadingDots size="15px" />}>
            <CorkMap />
          </Suspense>
        )}
      </div>
    </PageContainer>
  );
}

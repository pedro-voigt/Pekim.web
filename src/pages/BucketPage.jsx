import { useState } from "react";

import useCollection from "../hooks/useCollection";
import useMediaQuery from "../hooks/useMediaQuery";
import { supabase } from "../lib/supabase";
import { toast } from "../lib/toast";
import Collapsible from "../components/ui/Collapsible";
import FormToggleButton from "../components/ui/FormToggleButton";
import FormActions from "../components/ui/FormActions";
import LoadingDots from "../components/ui/LoadingDots";
import { Label, Input } from "../components/ui/Field";
import BucketHeader from "../components/bucket/BucketHeader";
import DreamCard from "../components/bucket/DreamCard";
import BucketEmptyState from "../components/bucket/BucketEmptyState";
import RealizarSonhoModal from "../components/bucket/RealizarSonhoModal";

const PAGE_BG = {
  background:      "#EEEBd8",
  backgroundImage: "radial-gradient(rgba(10,51,35,0.025) 1px, transparent 1px)",
  backgroundSize:  "18px 18px",
  minHeight:       "100vh",
};

const EMPTY_FORM = { titulo: "", microcopy: "", autores: [] };

const AUTOR_OPTS = [
  { key: "pedro", label: "Pedro", color: "#0A3323" },
  { key: "kim",   label: "Kim",   color: "#D3968C" },
];

// 1º dia do mês corrente, p/ registrar data_realizacao ao marcar.
function thisMonthISO() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-01`;
}

export default function BucketPage({ onNavigate }) {
  const { items: dreams, loading, create, update, remove } = useCollection("bucket_items", {
    order: { column: "id", ascending: true },
    messages: {
      load:   "não foi possível carregar os sonhos",
      create: "não foi possível guardar o sonho",
      update: "não foi possível atualizar o sonho",
      remove: "não foi possível remover o sonho",
    },
  });

  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [realizandoDream, setRealizandoDream] = useState(null); // sonho cujo form de memória está aberto

  const isTablet      = useMediaQuery("(max-width: 900px)");
  const isMobile      = useMediaQuery("(max-width: 560px)");
  const reducedMotion = useMediaQuery("(prefers-reduced-motion: reduce)");

  const masonryCols = isMobile ? 1 : isTablet ? 2 : 3;
  const masonryGap  = isMobile ? "12px" : "16px";

  const realizados = dreams.filter(d => d.status === "realizado").length;
  const pendentes  = dreams.length - realizados;

  // Masonry por colunas flex (distribuição round-robin), em vez de CSS
  // multi-column (`columns`): o multicol rebalanceava as colunas no hover
  // (mudança de compositing/camada dentro do fragmento) e mexia no espaçamento
  // das linhas dos outros cards. Flex não rebalanceia → layout estável no hover.
  const columns = Array.from({ length: masonryCols }, () => []);
  dreams.forEach((d, i) => columns[i % masonryCols].push({ d, i }));

  // Realizar = marca como feito (update otimista → card sutil na hora) e abre o
  // form-pergunta "guardar como memória?". Recusar deixa o sonho realizado e sem
  // vínculo; guardar cria a memória derivada (ver criarMemoria).
  const markDone = (dream) => {
    update(dream.id, { status: "realizado", data_realizacao: thisMonthISO(), foto_url: null });
    setRealizandoDream(dream);
  };

  // Desmarcar volta a pendente e desfaz o vínculo. NÃO apaga a foto do Storage:
  // ela pertence à memória (memories.fotos), que continua existindo.
  const unmark = (dream) =>
    update(dream.id, { status: "pendente", data_realizacao: null, foto_url: null, memoria_id: null });

  const toggle = (dream) =>
    dream.status === "pendente" ? markDone(dream) : unmark(dream);

  // Excluir o sonho não apaga a memória derivada nem sua foto (entidades próprias).
  const excluir = (dream) => remove(dream.id);

  const openMemoria = (/* dream */) => onNavigate?.("memorias");
  // futuro: deep-link via dream.memoria_id quando Memórias suportar foco por id

  // Modo "Mirror": cria a memória derivada e fecha o vínculo no sonho. A foto
  // (uma só) é referenciada pela memória E pela polaroid do sonho — mesmo arquivo.
  const criarMemoria = async (payload) => {
    const dream = realizandoDream;
    const { data, error } = await supabase.from("memories").insert(payload).select("id").single();
    if (error || !data) {
      console.error("[memoria from sonho]", error);
      toast.error("não foi possível criar a memória");
      return false;
    }
    await update(dream.id, {
      memoria_id:      data.id,
      foto_url:        payload.fotos[0] || null,
      data_realizacao: payload.date,
    });
    toast.success("virou memória ♥");
    return true;
  };

  // ── Formulário "sonhar um sonho" ────────────────────────────────────────────
  const setField = field => e => setForm(f => ({ ...f, [field]: e.target.value }));
  const toggleAutor = (a) =>
    setForm(f => ({ ...f, autores: f.autores.includes(a) ? f.autores.filter(x => x !== a) : [...f.autores, a] }));
  const fecharForm = () => { setForm(EMPTY_FORM); setFormOpen(false); };

  const salvar = async () => {
    const titulo = form.titulo.trim();
    if (!titulo) return;
    const sonhado_por = form.autores.length >= 2 ? "ambos" : (form.autores[0] || "ambos");
    const row = await create({
      titulo,
      microcopy: form.microcopy.trim() || null,
      status: "pendente", data_realizacao: null, foto_url: null,
      sonhado_por, memoria_id: null,
    });
    if (row) fecharForm();
  };

  return (
    <div style={PAGE_BG}>
      <div style={{ maxWidth: "880px", margin: "0 auto", padding: isMobile ? "32px 16px" : "48px 32px" }}>

        <BucketHeader realizados={realizados} pendentes={pendentes} />

        {/* Toolbar — só com a lista cheia; vazia, o CTA mora no estado vazio */}
        {!loading && dreams.length > 0 && (
          <div style={{ display: "flex", justifyContent: "center", marginBottom: "14px" }}>
            <FormToggleButton
              open={formOpen}
              editing={false}
              onClick={() => formOpen ? fecharForm() : setFormOpen(true)}
              addLabel="sonhar um sonho"
              editLabel=""
            />
          </div>
        )}

        {/* Formulário */}
        <Collapsible open={formOpen} maxHeight="440px">
          <div data-form-grid style={{
            background: "#F7F4D5", padding: "24px 22px", margin: "2px auto 24px",
            maxWidth: "520px", display: "grid", gridTemplateColumns: "1fr", gap: "18px",
            border: "1px solid rgba(131,153,88,0.35)", borderRadius: "5px",
          }}>
            <div>
              <Label>qual é o sonho? *</Label>
              <Input value={form.titulo} onChange={setField("titulo")} placeholder="O que vocês ainda querem viver..." />
            </div>
            <div>
              <Label>um sussurro do casal (opcional)</Label>
              <Input value={form.microcopy} onChange={setField("microcopy")} placeholder="nem que seja só na cozinha..." />
            </div>
            <div>
              <Label>de quem é o sonho</Label>
              <div style={{ display: "flex", gap: "10px", paddingTop: "6px" }}>
                {AUTOR_OPTS.map(({ key, label, color }) => {
                  const on = form.autores.includes(key);
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => toggleAutor(key)}
                      style={{
                        fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontSize: "14px",
                        padding: "5px 18px", border: `1px solid ${color}`, borderRadius: "2px",
                        background: on ? color : "transparent", color: on ? "#F7F4D5" : color,
                        cursor: "pointer", transition: "background 0.15s, color 0.15s",
                      }}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>
            <FormActions
              canSave={!!form.titulo.trim()}
              editing={false}
              showCancel
              onSave={salvar}
              onCancel={fecharForm}
            />
          </div>
        </Collapsible>

        {/* Mosaico, estado vazio ou loading */}
        {loading ? (
          <LoadingDots />
        ) : dreams.length === 0 ? (
          !formOpen && <BucketEmptyState onSonhar={() => setFormOpen(true)} />
        ) : (
          <div style={{ display: "flex", gap: masonryGap, alignItems: "flex-start" }}>
            {columns.map((col, ci) => (
              <div key={ci} style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: masonryGap }}>
                {col.map(({ d, i }) => (
                  <div
                    key={d.id}
                    style={{ animation: reducedMotion ? "none" : `fadeIn 0.5s ease ${Math.min(i, 10) * 0.05}s backwards` }}
                  >
                    <DreamCard
                      dream={d}
                      reducedMotion={reducedMotion}
                      onToggle={toggle}
                      onOpenMemoria={openMemoria}
                      onDelete={excluir}
                    />
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}
      </div>

      {realizandoDream && (
        <RealizarSonhoModal
          dream={realizandoDream}
          onSubmit={criarMemoria}
          onClose={() => setRealizandoDream(null)}
        />
      )}
    </div>
  );
}

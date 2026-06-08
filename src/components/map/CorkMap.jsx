import { useState } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";

import useCollection from "../../hooks/useCollection";
import { makePinIcon } from "./PinIcon";
import PlacePanel from "./PlacePanel";
import PlaceForm from "./PlaceForm";
import TravelRoute from "./TravelRoute";
import PinnedPolaroid from "./PinnedPolaroid";

// Composição "mural de cortiça": moldura de madeira > cortiça > mapa real +
// overlay de vinheta. O mapa Leaflet continua arrastável/zoomável; todas as
// camadas decorativas POR CIMA do mapa usam pointer-events:none. A moldura e a
// cortiça ficam só nas BORDAS (padding), então não cobrem o mapa.
//
// Mapa mantido RETO de propósito: rotacionar o container do Leaflet quebra a
// relação pixel↔coordenada (cliques erram o alvo). O "ar fixado" vem da sombra.

const INITIAL_CENTER = [-26.5, -52.5]; // entre Foz, Gramado, Canela, Nova Petrópolis
const INITIAL_ZOOM = 6;

// Tile claro/quente (CARTO Voyager) — combina com a paleta creme. Sem chave.
const TILE_URL = "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png";
const TILE_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>';

// ── Camada 1: moldura de madeira ──────────────────────────────────────────────
const frameStyle = {
  padding: "clamp(12px, 2.6vw, 18px)",
  borderRadius: "4px",
  // veios sutis (repeating) por cima de um gradiente diagonal marrom
  backgroundColor: "#5c4226",
  backgroundImage:
    "repeating-linear-gradient(96deg, rgba(0,0,0,0.10) 0 2px, transparent 2px 7px)," +
    "repeating-linear-gradient(90deg, rgba(255,255,255,0.05) 0 1px, transparent 1px 9px)," +
    "linear-gradient(135deg, #74552f, #3a2613)",
  boxShadow:
    "0 18px 40px -14px rgba(0,0,0,0.45)," +   // sombra solta (levanta do creme)
    "inset 0 2px 3px rgba(255,255,255,0.14)," + // brilho de relevo no topo
    "inset 0 -4px 7px rgba(0,0,0,0.45)",       // sombra de relevo embaixo
};

// ── Camada 2: cortiça (grão + pontinhos + bordas escurecidas) ─────────────────
// Grão fino via SVG feTurbulence (data-URI) por cima dos pontinhos de cortiça.
const CORK_NOISE =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='2' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.3'/%3E%3C/svg%3E\")";

const corkStyle = {
  position: "relative",            // contêiner das polaroids decorativas
  padding: "clamp(14px, 3.6vw, 30px)",
  borderRadius: "2px",
  backgroundColor: "#c4a06a",
  backgroundImage:
    CORK_NOISE + "," +
    "radial-gradient(rgba(86,58,28,0.40) 1px, transparent 1.6px)," +
    "radial-gradient(rgba(86,58,28,0.28) 1px, transparent 1.6px)",
  backgroundSize: "120px 120px, 7px 7px, 11px 11px",
  backgroundPosition: "0 0, 0 0, 3px 4px",
  boxShadow: "inset 0 0 38px rgba(60,38,16,0.6)",
};

// ── Camada 3: o mapa, com mat creme + sombra (parece "fixado") ────────────────
const mapWrapStyle = {
  position: "relative",
  height: "min(64vh, 520px)",
  border: "5px solid #F7F4D5",      // mat creme tipo print
  boxShadow: "0 8px 18px -4px rgba(0,0,0,0.4)",
  overflow: "hidden",
};

// ── Camada 4: vinheta envelhecida POR CIMA do mapa (nunca captura clique) ─────
const vignetteStyle = {
  position: "absolute",
  inset: 0,
  pointerEvents: "none",            // crítico: deixa o mapa navegável por baixo
  zIndex: 500,
  background:
    "radial-gradient(ellipse at center, transparent 55%, rgba(46,29,12,0.30) 100%)",
};

// Botão/etiqueta sobre o mapa (acima da vinheta, abaixo dos painéis em 600).
const overlayBtn = {
  fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontSize: "13px",
  color: "#0A3323", background: "#F7F4D5",
  border: "1px solid #0A3323", padding: "7px 14px",
  cursor: "pointer", boxShadow: "0 2px 8px -2px rgba(0,0,0,0.4)",
};

// Captura cliques no mapa enquanto está no modo "fixar lugar".
function ClickToPlace({ active, onPick }) {
  useMapEvents({
    click(e) {
      if (active) onPick(e.latlng);
    },
  });
  return null;
}

export default function CorkMap() {
  const { items: lugares, create, update, remove, setItems } = useCollection("lugares", {
    order: { column: "created_at", ascending: true },
    messages: {
      load: "não foi possível carregar os lugares",
      create: "não foi possível guardar o lugar",
      update: "não foi possível atualizar o lugar",
      remove: "não foi possível excluir o lugar",
    },
  });

  const [selectedId, setSelectedId] = useState(null);
  const [placing, setPlacing] = useState(false); // aguardando clique no mapa
  const [draft, setDraft] = useState(null);       // lugar em criação/edição

  const selected = lugares.find((l) => l.id === selectedId) || null;
  const formOpen = draft !== null;
  const panelOpen = selected && !formOpen;

  // guarda o GeoJSON calculado na lista em memória → re-clicar = cache hit (sem ORS)
  const handleRouteLoaded = (id, geojson) =>
    setItems((prev) => prev.map((l) => (l.id === id ? { ...l, rota_geojson: geojson } : l)));

  const startAdd = () => {
    setSelectedId(null);
    setDraft(null);
    setPlacing(true);
  };

  const handlePick = ({ lat, lng }) => {
    setDraft({ lat, lng }); // novo lugar (sem id)
    setPlacing(false);
  };

  const startEdit = () => {
    if (selected) setDraft({ ...selected });
  };

  const cancelForm = () => {
    setDraft(null);
    setPlacing(false);
  };

  const saveDraft = async (values) => {
    if (draft.id) {
      const ok = await update(draft.id, values);
      if (ok) setDraft(null);
      return ok;
    }
    const created = await create({ ...values, lat: draft.lat, lng: draft.lng });
    if (created) {
      setDraft(null);
      setSelectedId(created.id);
    }
    return !!created;
  };

  const deleteSelected = async () => {
    const ok = await remove(selected.id);
    if (ok) setSelectedId(null);
  };

  return (
    <div style={frameStyle}>
      <div style={corkStyle}>
        <div style={{ ...mapWrapStyle, cursor: placing ? "crosshair" : undefined }}>
          <MapContainer
            center={INITIAL_CENTER}
            zoom={INITIAL_ZOOM}
            minZoom={2}
            maxZoom={18}
            scrollWheelZoom
            worldCopyJump
            style={{ width: "100%", height: "100%", background: "#EEEBd8" }}
          >
            <TileLayer url={TILE_URL} attribution={TILE_ATTRIBUTION} />
            <ClickToPlace active={placing} onPick={handlePick} />
            {lugares.map((l) => (
              <Marker
                key={l.id}
                position={[l.lat, l.lng]}
                icon={makePinIcon({ active: l.id === selectedId })}
                eventHandlers={{ click: () => { if (!placing) setSelectedId(l.id); } }}
              />
            ))}
            {/* alfinete provisório do lugar sendo criado */}
            {draft && !draft.id && (
              <Marker position={[draft.lat, draft.lng]} icon={makePinIcon({ active: true })} />
            )}
            {panelOpen && (
              <TravelRoute key={selected.id} place={selected} onLoaded={handleRouteLoaded} />
            )}
          </MapContainer>
          <div style={vignetteStyle} />

          {/* Modo "fixar lugar": etiqueta de instrução + cancelar */}
          {placing && (
            <div style={{
              position: "absolute", top: "12px", left: "50%", transform: "translateX(-50%)",
              zIndex: 550, display: "flex", alignItems: "center", gap: "12px",
              ...overlayBtn, cursor: "default",
            }}>
              clique no mapa para fixar o lugar
              <button
                onClick={cancelForm}
                style={{
                  fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontSize: "13px",
                  color: "#D3968C", background: "transparent", border: "none",
                  padding: 0, cursor: "pointer",
                }}
              >cancelar</button>
            </div>
          )}

          {/* Botão adicionar (só no modo de visualização) */}
          {!placing && !formOpen && !selected && (
            <button
              onClick={startAdd}
              style={{ position: "absolute", top: "12px", right: "12px", zIndex: 550, ...overlayBtn }}
            >+ adicionar lugar</button>
          )}

          {panelOpen && (
            <PlacePanel
              place={selected}
              onClose={() => setSelectedId(null)}
              onEdit={startEdit}
              onDelete={deleteSelected}
            />
          )}

          {formOpen && (
            <PlaceForm
              key={draft.id || "new"}
              place={draft}
              coords={{ lat: draft.lat, lng: draft.lng }}
              onSave={saveDraft}
              onCancel={cancelForm}
            />
          )}
        </div>

        {/* Polaroids decorativas presas na borda (não somem ao arrastar o mapa).
            Troque o `src` pelas fotos de vocês. */}
        <PinnedPolaroid
          caption="nós ✦"
          rotate={5}
          pin="tape"
          style={{ top: "-6px", right: "8px" }}
          hidden={panelOpen || formOpen}  /* some quando um painel abre (evita ficar sob a aba) */
        />
        <PinnedPolaroid
          caption="a serra"
          rotate={-5}
          pin="tack"
          style={{ bottom: "-6px", left: "10px" }}
        />
      </div>
    </div>
  );
}

import { useEffect, useState } from "react";
import { GeoJSON, CircleMarker, Tooltip } from "react-leaflet";

import { getRouteGeoJSON } from "../../lib/routing";
import { toast } from "../../lib/toast";

// Linha da rota: rosa (#D3968C, acento do projeto), tracejada, leve sombra.
const ROUTE_STYLE = { color: "#D3968C", weight: 3, dashArray: "6 7", opacity: 0.95 };

// Desenha a rota da viagem do lugar selecionado.
// Montado com key={place.id} no pai → remonta por lugar (estado reinicia limpo,
// sem setState síncrono dentro do effect).
export default function TravelRoute({ place, onLoaded }) {
  const [geojson, setGeojson] = useState(place.rota_geojson || null);

  useEffect(() => {
    if (place.rota_geojson) return; // cache em memória, nada a buscar
    let cancelled = false;
    getRouteGeoJSON(place)
      .then((g) => {
        if (cancelled || !g) return;
        setGeojson(g);
        onLoaded?.(place.id, g); // sincroniza o cache na lista do pai
      })
      .catch((err) => {
        console.error("[rota]", err);
        toast.error("não foi possível traçar a rota");
      });
    return () => { cancelled = true; };
  }, [place.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const waypoints = Array.isArray(place.rota) ? place.rota : [];

  return (
    <>
      {geojson && <GeoJSON data={geojson} style={ROUTE_STYLE} />}

      {/* partida + paradas intermediárias como pontinhos (a chegada já tem o alfinete) */}
      {waypoints.slice(0, -1).map((w, i) => (
        <CircleMarker
          key={i}
          center={[w.lat, w.lng]}
          radius={4}
          pathOptions={{ color: "#0A3323", fillColor: "#F7F4D5", fillOpacity: 1, weight: 2 }}
        >
          <Tooltip direction="top">
            {w.nome}{w.nota ? ` — ${w.nota}` : ""}
          </Tooltip>
        </CircleMarker>
      ))}
    </>
  );
}

import { supabase } from "./supabase";

// Wrapper do OpenRouteService (Directions) + cache no Supabase.
// A chave fica no client (VITE_) — use uma chave com restrição de uso.
const ORS_KEY = import.meta.env.VITE_ORS_API_KEY;

// modo do lugar → profile do ORS (estrada). 'flight' não usa ORS (linha reta).
const PROFILE = { driving: "driving-car", walking: "foot-walking" };

// GeoJSON de linha reta entre os waypoints — usado para modo avião.
function straightLineGeoJSON(waypoints) {
  return {
    type: "FeatureCollection",
    features: [{
      type: "Feature",
      properties: { _mode: "flight" },
      geometry: {
        type: "LineString",
        coordinates: waypoints.map((w) => [w.lng, w.lat]), // GeoJSON = [lng, lat]
      },
    }],
  };
}

async function callORS(waypoints, modo) {
  if (!ORS_KEY) throw new Error("VITE_ORS_API_KEY ausente");
  const profile = PROFILE[modo] || "driving-car";
  const res = await fetch(
    `https://api.openrouteservice.org/v2/directions/${profile}/geojson`,
    {
      method: "POST",
      headers: { Authorization: ORS_KEY, "Content-Type": "application/json" },
      body: JSON.stringify({ coordinates: waypoints.map((w) => [w.lng, w.lat]) }),
    },
  );
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`ORS ${res.status} ${body.slice(0, 140)}`);
  }
  return res.json(); // FeatureCollection com a LineString da rota
}

// Retorna o GeoJSON da rota do lugar.
//  - cache (lugares.rota_geojson) tem prioridade;
//  - 'flight' → linha reta local; demais → ORS seguindo estradas;
//  - cacheia o resultado (best-effort) pra não rechamar o ORS.
export async function getRouteGeoJSON(place) {
  const waypoints = Array.isArray(place.rota) ? place.rota : [];
  if (waypoints.length < 2) return null;
  if (place.rota_geojson) return place.rota_geojson; // cache hit

  const geojson =
    place.modo === "flight"
      ? straightLineGeoJSON(waypoints)
      : await callORS(waypoints, place.modo);

  const { error } = await supabase
    .from("lugares")
    .update({ rota_geojson: geojson })
    .eq("id", place.id);
  if (error) console.error("[rota cache]", error); // cache falhou, mas a rota desenha

  return geojson;
}

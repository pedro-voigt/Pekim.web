// Adapta uma linha da tabela `memories` (Supabase) para o formato que o Mural
// consome. Mantém a UI desacoplada do schema: se a coluna mudar, mexe só aqui.
//
// Regras:
//  - tem foto (fotos[0]) → polaroid (mostra `titulo`);
//  - sem foto            → card de texto (título Playfair + `description` citada);
//  - `origem` é derivada de `bucket_item_id` (não há coluna `origem` no banco);
//  - autor normalizado p/ 'pedro' | 'kim' | 'ambos' (o banco às vezes guarda "Pedro").

export function normalizeAutor(a) {
  if (!a) return null;
  const v = String(a).trim().toLowerCase();
  return (v === "pedro" || v === "kim" || v === "ambos") ? v : null;
}

export function toMuralMemory(row) {
  const fotos   = Array.isArray(row.fotos) ? row.fotos : [];
  const fotoUrl = fotos[0] || null;

  return {
    id:             String(row.id),
    titulo:         row.title || "",
    texto:          fotoUrl ? undefined : (row.description || ""),
    foto_url:       fotoUrl,
    data:           row.date || null,
    autor:          normalizeAutor(row.autor),
    origem:         row.bucket_item_id ? "sonho" : "manual",
    bucket_item_id: row.bucket_item_id ?? null,
    local:          row.local ?? null,
  };
}

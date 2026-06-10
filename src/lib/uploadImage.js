import { supabase } from "./supabase";

// Bucket público (leitura via URL direta; escrita só autenticada — ver
// supabase/storage_fotos.sql).
const BUCKET = "fotos";

// Envia uma imagem pro Supabase Storage e devolve a URL pública (ou null em erro).
// `folder` agrupa por feature (ex.: "lugares", "memorias").
export async function uploadImage(file, folder = "") {
  const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
  const name = `${crypto.randomUUID()}.${ext}`;
  const path = folder ? `${folder}/${name}` : name;

  const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
    cacheControl: "3600",
    upsert: false,
    contentType: file.type || undefined,
  });
  if (error) {
    console.error("[upload]", error);
    return null;
  }

  return supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
}

// Apaga do Storage o arquivo de uma URL pública (best-effort; erros só logam).
export async function deleteImage(url) {
  const marker = `/object/public/${BUCKET}/`;
  const idx = (url || "").indexOf(marker);
  if (idx === -1) return;
  const path = url.slice(idx + marker.length);
  const { error } = await supabase.storage.from(BUCKET).remove([path]);
  if (error) console.error("[delete image]", error);
}

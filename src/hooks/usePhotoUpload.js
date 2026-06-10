import { useRef, useState } from "react";

import { uploadImage, deleteImage } from "../lib/uploadImage";
import { toast } from "../lib/toast";

// Gerencia a lista de fotos de um formulário, com upload pro Storage e limpeza
// de órfãs. Rastreia o conjunto ORIGINAL (já salvo) para apagar do Storage só:
//  - cleanupSaved():   removidas E salvas (original − atual)
//  - cleanupCanceled(): enviadas nesta sessão e nunca salvas (atual − original)
// Assim nunca apaga um arquivo ainda referenciado por um registro salvo.
export default function usePhotoUpload(initial = [], folder = "") {
  const [fotos, setFotos] = useState(initial);
  const [uploading, setUploading] = useState(false);
  const originalRef = useRef(initial);

  const addFiles = async (files) => {
    const list = Array.from(files || []);
    if (list.length === 0) return;
    setUploading(true);
    for (const file of list) {
      const url = await uploadImage(file, folder);
      if (url) setFotos(prev => [...prev, url]);
      else toast.error("não foi possível enviar a foto");
    }
    setUploading(false);
  };

  const removeFoto = (url) => setFotos(prev => prev.filter(u => u !== url));

  // Reinicia para um novo conjunto (ex.: ao começar a editar outro registro num
  // formulário que não remonta). Redefine o "original" para o novo baseline.
  const reset = (list = []) => {
    setFotos(list);
    originalRef.current = list;
  };

  const cleanupSaved = () =>
    originalRef.current.filter(u => !fotos.includes(u)).forEach(deleteImage);

  const cleanupCanceled = () =>
    fotos.filter(u => !originalRef.current.includes(u)).forEach(deleteImage);

  return { fotos, uploading, addFiles, removeFoto, reset, cleanupSaved, cleanupCanceled };
}

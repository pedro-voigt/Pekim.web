import { useEffect, useState } from "react";

import { supabase } from "../lib/supabase";
import { toast } from "../lib/toast";

// CRUD genérico sobre uma tabela do Supabase, com lista local otimista.
// Centraliza o padrão repetido em Dates/Movies/Memories/Bucket: fetch no mount,
// insert com append, update/remove otimistas com rollback e toasts de erro.
//
// useCollection("dates", {
//   order: { column: "id", ascending: true },   // ordenação do select inicial
//   sort: (a, b) => ...,                         // (opcional) reordena a lista local após mutações
//   messages: { load, create, update, remove },  // (opcional) textos dos toasts
// })
//
// Retorna { items, loading, setItems, create, update, remove }.
// - create(values, { errorMessage }?)        -> linha criada | null
// - update(id, patch, { errorMessage }?)     -> boolean (sucesso)
// - remove(id, { errorMessage }?)            -> boolean (sucesso)
export default function useCollection(table, options = {}) {
  const { order, sort, messages = {} } = options;
  const orderColumn = order?.column ?? "id";
  const orderAscending = order?.ascending ?? true;

  const msg = {
    load: "não foi possível carregar",
    create: "não foi possível guardar",
    update: "não foi possível atualizar",
    remove: "não foi possível excluir",
    ...messages,
  };

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    supabase.from(table).select("*").order(orderColumn, { ascending: orderAscending })
      .then(({ data, error }) => {
        if (!active) return;
        if (error) {
          console.error(`[${table} load]`, error);
          toast.error(msg.load);
        }
        if (data) setItems(data);
        setLoading(false);
      })
      .catch((err) => {
        if (!active) return;
        console.error(`[${table} fetch]`, err);
        toast.error(msg.load);
        setLoading(false);
      });
    return () => { active = false; };
    // fetch único no mount; mensagens/ordenação são estáveis por página
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [table]);

  const applySort = list => (sort ? [...list].sort(sort) : list);

  const create = async (values, opts = {}) => {
    const { data, error } = await supabase.from(table).insert(values).select().single();
    if (error || !data) {
      console.error(`[${table} insert]`, error);
      toast.error(opts.errorMessage || msg.create);
      return null;
    }
    setItems(prev => applySort([...prev, data]));
    return data;
  };

  const update = async (id, patch, opts = {}) => {
    const previous = items.find(x => x.id === id);
    setItems(prev => applySort(prev.map(x => x.id === id ? { ...x, ...patch } : x)));
    const { error } = await supabase.from(table).update(patch).eq("id", id);
    if (error) {
      console.error(`[${table} update]`, error);
      toast.error(opts.errorMessage || msg.update);
      setItems(prev => applySort(prev.map(x => x.id === id ? previous : x)));
      return false;
    }
    return true;
  };

  const remove = async (id, opts = {}) => {
    const previous = items;
    setItems(prev => prev.filter(x => x.id !== id));
    const { error } = await supabase.from(table).delete().eq("id", id);
    if (error) {
      console.error(`[${table} delete]`, error);
      toast.error(opts.errorMessage || msg.remove);
      setItems(previous);
      return false;
    }
    return true;
  };

  return { items, loading, setItems, create, update, remove };
}

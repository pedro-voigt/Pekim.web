// Confirmação estilizada, no mesmo espírito imperativo do toast.
// Uso: `if (await confirm("Excluir?")) onDelete();`
// Um único host (ConfirmDialog montado na raiz) escuta os pedidos. Sem host,
// cai no window.confirm nativo como fallback.

let listener = null;
let nextId = 0;

export function confirm(message, options = {}) {
  return new Promise((resolve) => {
    if (!listener) {
      resolve(window.confirm(message));
      return;
    }
    listener({
      id: ++nextId,
      message,
      confirmLabel: options.confirmLabel || "excluir",
      cancelLabel: options.cancelLabel || "cancelar",
      resolve,
    });
  });
}

export function subscribeConfirm(fn) {
  listener = fn;
  return () => {
    if (listener === fn) listener = null;
  };
}

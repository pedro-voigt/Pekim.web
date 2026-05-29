const listeners = new Set();
let nextId = 0;

function emit(type, message) {
  const toast = { id: ++nextId, type, message };
  listeners.forEach((fn) => fn(toast));
}

export const toast = {
  error: (message) => emit("error", message),
  success: (message) => emit("success", message),
};

export function subscribe(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

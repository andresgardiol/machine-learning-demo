// Almacén observable mínimo: leer, cambiar y suscribirse (design.md D9).

export function createStore(initial = {}) {
  let state = { ...initial };
  const listeners = new Set();
  return {
    get: () => state,
    set(partial) {
      const next = { ...state, ...partial };
      const changed = Object.keys(partial).some((k) => !Object.is(state[k], next[k]));
      if (!changed) return;
      const prev = state;
      state = next;
      for (const fn of [...listeners]) fn(state, prev);
    },
    subscribe(fn) {
      listeners.add(fn);
      return () => listeners.delete(fn);
    },
  };
}

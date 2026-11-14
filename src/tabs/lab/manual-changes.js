// Cambios a mano en el Laboratorio (pestana-laboratorio D15), sin DOM: una pila de copias de la red
// (pesos y lo apagado) tomadas justo antes de cada cambio. Un arrastre entero es un cambio. Se
// deshacen los últimos 50; la copia de antes del primero se guarda aparte para "Restablecer la red".
// Deshacer no devuelve la época ni las curvas: eso lo decide quien llama (la red vuelve, el tiempo no).
export const UNDO_LIMIT = 50;

export function createManualChanges({ limit = UNDO_LIMIT } = {}) {
  let stack = []; // copias de antes de cada cambio, la más reciente al final
  let first = null; // copia de antes del primer cambio
  let count = 0; // cambios hechos y no deshechos
  let gesture = null; // clave del arrastre en curso

  const changes = {
    /**
     * Antes de un cambio: guarda la copia `snap` (de antes). Con `gesture`, los cambios seguidos con la
     * misma clave son uno solo (un arrastre); `end()` lo cierra.
     */
    record(snap, { gesture: key = null } = {}) {
      if (key !== null && key === gesture) return false;
      gesture = key;
      if (count === 0 || first === null) first = snap;
      stack.push(snap);
      if (stack.length > limit) stack = stack.slice(stack.length - limit);
      count += 1;
      return true;
    },
    /** Terminó el arrastre: el próximo cambio cuenta aparte. */
    end() { gesture = null; },
    /** La copia a la que vuelve deshacer (la de antes del último cambio), o null. */
    undo() {
      if (stack.length === 0) return null;
      gesture = null;
      count -= 1;
      const snap = stack.pop();
      if (count === 0) first = null;
      return snap;
    },
    /** La copia de antes del primer cambio, o null si no hay cambios. Deja todo sin cambios. */
    reset() {
      if (count === 0) return null;
      const snap = first;
      changes.clear();
      return snap;
    },
    /** El aprendizaje empezó de nuevo: no quedan cambios. */
    clear() { stack = []; first = null; count = 0; gesture = null; },
    get count() { return count; },
    get canUndo() { return stack.length > 0; },
    get undoable() { return stack.length; },
  };
  return changes;
}

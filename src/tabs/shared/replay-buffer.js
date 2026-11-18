// Búfer circular de los últimos cuadros de un intento (reglas-el-choque-ensena D3 y red-al-centro D5), sin DOM.
// Reglas a mano guarda ahí la repetición del choque; Inspeccionar, además, el estado para volver el mundo atrás.

/** Cuadros de la repetición: 3 segundos a 60 por segundo. */
export const REPLAY_FRAMES = 180;

/**
 * Búfer circular de los últimos `capacity` cuadros (D3).
 * @param {{capacity?: number}} [spec]
 */
export function createReplayBuffer({ capacity = REPLAY_FRAMES } = {}) {
  const slots = new Array(capacity);
  let start = 0;
  let length = 0;
  return {
    /** Guarda un cuadro; con el búfer lleno, pisa el más viejo. */
    push(frame) {
      slots[(start + length) % capacity] = frame;
      if (length < capacity) length += 1;
      else start = (start + 1) % capacity;
    },
    /** Vacía el búfer (al reiniciar el intento). */
    clear() {
      slots.fill(undefined);
      start = 0;
      length = 0;
    },
    /**
     * Cuadro a `offset` cuadros del último: 0 es el último (el del choque), -1 el anterior… Fuera del
     * rango guardado, el más cercano. Sin cuadros, null.
     */
    at(offset) {
      if (length === 0) return null;
      const back = Math.min(length - 1, Math.max(0, -Math.round(offset)));
      return slots[(start + length - 1 - back) % capacity];
    },
    /** Cuadros del más viejo al más nuevo. */
    frames() { return Array.from({ length }, (_, i) => slots[(start + i) % capacity]); },
    get length() { return length; },
    get capacity() { return capacity; },
  };
}

// Cursor del paso a paso por la cuenta de un cuadro (pestana-inspeccionar, design.md D4). Sin DOM.
//
// La cuenta de un cuadro es una lista ordenada de operaciones: capa por capa (desde la primera que
// no es de entradas), neurona por neurona, y en cada neurona productos, suma, sesgo y activación.
// El cursor no calcula nada: dice hasta dónde se muestra. Los números salen de traceNetwork.
//
//   createPassCursor(sizes) → { done, position, next, count, total, advance(size), reset(), complete(),
//                               opsDone(layer, neuron), stateOf(layer, neuron) }
//   size: 'operation' | 'neuron' | 'layer' | 'frame'

export const OPERATIONS = Object.freeze(['products', 'sum', 'bias', 'activation']);
export const STEP_SIZES = Object.freeze(['frame', 'layer', 'neuron', 'operation']);

const OPS = OPERATIONS.length;

/** @param {number[]|{sizes:number[]}} shape las cantidades de neuronas por capa (o una red) */
export function createPassCursor(shape) {
  const sizes = Array.isArray(shape) ? shape.slice() : shape.sizes.slice();
  // Desplazamiento (en operaciones) donde empieza cada capa que no es de entradas.
  const starts = [0, 0];
  for (let l = 1; l < sizes.length; l++) starts[l + 1] = starts[l] + sizes[l] * OPS;
  const total = starts[sizes.length];
  let count = 0; // operaciones hechas

  /** Operación número `k` (0 = la primera) como { layer, neuron, op, index }. */
  function at(k) {
    if (k < 0 || k >= total) return null;
    let l = 1;
    while (k >= starts[l + 1]) l++;
    const inLayer = k - starts[l];
    return { layer: l, neuron: Math.floor(inLayer / OPS), op: OPERATIONS[inLayer % OPS], index: k };
  }

  /** Hasta qué cuenta lleva un avance de tamaño `size` desde la cuenta actual. */
  function targetFor(size) {
    if (count >= total) return total;
    const next = at(count);
    if (size === 'operation') return count + 1;
    if (size === 'neuron') return starts[next.layer] + (next.neuron + 1) * OPS;
    if (size === 'layer') return starts[next.layer + 1];
    if (size === 'frame') return total;
    throw new Error(`unknownStepSize: ${size}`);
  }

  const cursor = {
    /**
     * Avanza un paso del tamaño `size`. Devuelve { from, to, done, finished }: las operaciones hechas
     * en este paso son las de índice from a to − 1. `finished` es verdadero si ya estaba completa: no
     * cambia nada.
     */
    advance(size) {
      if (count >= total) return { from: count, to: count, done: true, finished: true };
      const from = count;
      count = targetFor(size);
      return { from, to: count, done: count >= total, finished: false };
    },
    /** Vuelve al principio de la cuenta: nada hecho. */
    reset() { count = 0; },
    /** Da la cuenta por completa (por ejemplo, al pausar después de reproducir de a cuadros). */
    complete() { count = total; },
    /** Operaciones hechas de una neurona (0 a 4); las entradas, siempre 4. */
    opsDone(layer, neuron) {
      if (layer === 0) return OPS;
      const start = starts[layer] + neuron * OPS;
      return Math.max(0, Math.min(OPS, count - start));
    },
    /** 'done', 'current' (la que se calcula: a medio hacer o la próxima) o 'pending'. */
    stateOf(layer, neuron) {
      const n = cursor.opsDone(layer, neuron);
      if (n === OPS) return 'done';
      const next = at(count);
      if (next && next.layer === layer && next.neuron === neuron) return 'current';
      return 'pending';
    },
    /** ¿Está hecha la operación `op` de esa neurona? */
    isDone(layer, neuron, op) { return cursor.opsDone(layer, neuron) > OPERATIONS.indexOf(op); },
    /** Operación número k. */
    at,
    /** ¿Está completa toda la capa `layer`? */
    layerDone(layer) { return layer === 0 || count >= starts[layer + 1]; },
    get count() { return count; },
    get total() { return total; },
    get done() { return count >= total; },
    get started() { return count > 0; },
    /** La última operación hecha, o null si no se hizo ninguna. */
    get position() { return at(count - 1); },
    /** La próxima operación, o null si la cuenta está completa. */
    get next() { return at(count); },
    get sizes() { return sizes.slice(); },
  };
  return cursor;
}

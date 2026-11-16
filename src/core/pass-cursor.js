// Cursor del paso a paso por la cuenta de un cuadro (pestana-inspeccionar; operacion-por-operacion D1 y
// D2). Sin DOM.
//
// La cuenta de un cuadro es una lista ordenada de operaciones finas, cada una con dos números como
// mucho y un resultado:
//   - capa de entradas: un paso `read` por entrada (no calcula: muestra lo que mide el auto);
//   - cada neurona de las capas siguientes, con n entradas: por cada entrada, en orden, `multiply`
//     (valor × peso = aporte) y `add` (suma hasta acá + aporte); después `bias` y `activation`.
//     Son 2n + 2 pasos.
// El cursor no calcula nada: dice hasta dónde se muestra. Los números salen de traceNetwork.
//
// Para lo compartido con el Laboratorio se conserva la etapa de cada neurona (`opsDone`, de 0 a 4):
// 0 nada; 1 algo multiplicado; 2 todo sumado; 3 sesgo; 4 activación. Las entradas, 0 o 4.
//
//   createPassCursor(sizes) → { done, position, next, count, total, advance(size), back(size), reset(),
//                               complete(), opsDone, stateOf, isDone, layerDone, terms, stepOf, doneIn, at }
//   size: 'operation' | 'neuron' | 'layer' | 'frame'

/** Etapas de una neurona (lo que entiende lo compartido): opsDone > índice de la etapa. */
export const STAGES = Object.freeze(['products', 'sum', 'bias', 'activation']);
/** Operaciones finas. */
export const OPERATIONS = Object.freeze(['read', 'multiply', 'add', 'bias', 'activation']);
export const STEP_SIZES = Object.freeze(['frame', 'layer', 'neuron', 'operation']);

/** Operaciones de cada neurona de la capa `layer`: 1 en las entradas; 2n + 2 en las demás. */
export const opsPerNeuron = (sizes, layer) => (layer === 0 ? 1 : 2 * sizes[layer - 1] + 2);

/**
 * Lo hecho de una neurona con `d` operaciones finas hechas: cuántas entradas van multiplicadas y
 * sumadas, y si el sesgo y la activación están hechos. En la capa de entradas, `read`.
 */
export function termsOf(sizes, layer, d) {
  if (layer === 0) return { read: d >= 1, multiplied: 0, added: 0, bias: false, activation: d >= 1, inputs: 0 };
  const n = sizes[layer - 1];
  return {
    read: false,
    multiplied: Math.min(n, Math.floor((d + 1) / 2)),
    added: Math.min(n, Math.floor(d / 2)),
    bias: d >= 2 * n + 1,
    activation: d >= 2 * n + 2,
    inputs: n,
  };
}

/** Etapa (0 a 4) de unos términos: la forma que entiende lo compartido. */
export function stageOfTerms(layer, terms) {
  if (layer === 0) return terms.read ? 4 : 0;
  if (terms.activation) return 4;
  if (terms.bias) return 3;
  if (terms.added >= terms.inputs) return 2;
  return terms.multiplied > 0 ? 1 : 0;
}

/** @param {number[]|{sizes:number[]}} shape las cantidades de neuronas por capa (o una red) */
export function createPassCursor(shape) {
  const sizes = Array.isArray(shape) ? shape.slice() : shape.sizes.slice();
  const per = sizes.map((_, l) => opsPerNeuron(sizes, l));
  // Desplazamiento (en operaciones) donde empieza cada capa.
  const starts = [0];
  for (let l = 0; l < sizes.length; l++) starts[l + 1] = starts[l] + sizes[l] * per[l];
  const total = starts[sizes.length];
  let count = 0; // operaciones hechas

  const neuronStart = (layer, neuron) => starts[layer] + neuron * per[layer];

  /** Operación número `k` (0 = la primera) como { layer, neuron, op, input, index }. */
  function at(k) {
    if (k < 0 || k >= total) return null;
    let l = 0;
    while (k >= starts[l + 1]) l++;
    const inLayer = k - starts[l];
    const neuron = Math.floor(inLayer / per[l]);
    const q = inLayer % per[l];
    if (l === 0) return { layer: 0, neuron, op: 'read', index: k };
    const n = sizes[l - 1];
    if (q < 2 * n) return { layer: l, neuron, op: q % 2 === 0 ? 'multiply' : 'add', input: Math.floor(q / 2), index: k };
    return { layer: l, neuron, op: q === 2 * n ? 'bias' : 'activation', index: k };
  }

  /** Hasta qué cuenta lleva un avance de tamaño `size` desde la cuenta actual. */
  function targetFor(size) {
    if (count >= total) return total;
    const next = at(count);
    if (size === 'operation') return count + 1;
    if (size === 'neuron') return neuronStart(next.layer, next.neuron) + per[next.layer];
    if (size === 'layer') return starts[next.layer + 1];
    if (size === 'frame') return total;
    throw new Error(`unknownStepSize: ${size}`);
  }

  /** Hasta qué cuenta vuelve un paso atrás de tamaño `size` (D2). */
  function backTargetFor(size) {
    if (count <= 0) return 0;
    if (size === 'operation') return count - 1;
    const last = at(count - 1); // la última hecha: su neurona (o su capa) es la que se deshace
    if (size === 'neuron') return neuronStart(last.layer, last.neuron);
    if (size === 'layer') return starts[last.layer];
    if (size === 'frame') return 0;
    throw new Error(`unknownStepSize: ${size}`);
  }

  /** Operaciones finas hechas de una neurona. */
  const doneIn = (layer, neuron) => Math.max(0, Math.min(per[layer], count - neuronStart(layer, neuron)));

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
    /**
     * Vuelve un paso del tamaño `size` dentro del cuadro (D7). Devuelve { from, to, moved }: quedan
     * deshechas las operaciones de índice to a from − 1. Al principio no hace nada.
     */
    back(size) {
      const from = count;
      count = backTargetFor(size);
      return { from, to: count, moved: count !== from };
    },
    /** Vuelve al principio de la cuenta: nada hecho. */
    reset() { count = 0; },
    /** Da la cuenta por completa (por ejemplo, al pausar después de reproducir de a cuadros). */
    complete() { count = total; },
    /** Operaciones finas hechas de una neurona (0 a 2n + 2; las entradas, 0 o 1). */
    doneIn,
    /** Qué lleva hecho una neurona: { read, multiplied, added, bias, activation, inputs }. */
    terms(layer, neuron) { return termsOf(sizes, layer, doneIn(layer, neuron)); },
    /** Número de paso de esa neurona: { done, total } ("paso 5 de 14"). */
    stepOf(layer, neuron) { return { done: doneIn(layer, neuron), total: per[layer] }; },
    /** Etapa de una neurona (0 a 4), para lo compartido. */
    opsDone(layer, neuron) { return stageOfTerms(layer, cursor.terms(layer, neuron)); },
    /** 'done', 'current' (la que se calcula: a medio hacer o la próxima) o 'pending'. */
    stateOf(layer, neuron) {
      if (doneIn(layer, neuron) === per[layer]) return 'done';
      const next = at(count);
      if (next && next.layer === layer && next.neuron === neuron) return 'current';
      return 'pending';
    },
    /** ¿Está hecha la etapa `op` ('products', 'sum', 'bias', 'activation') de esa neurona? */
    isDone(layer, neuron, op) { return cursor.opsDone(layer, neuron) > STAGES.indexOf(op); },
    /** Operación número k. */
    at,
    /** ¿Está completa toda la capa `layer`? */
    layerDone(layer) { return count >= starts[layer + 1]; },
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

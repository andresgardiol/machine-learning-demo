// Línea de tiempo del paso animado (pestana-inspeccionar, design.md D7b; operacion-por-operacion D5),
// sin DOM. Lo que se anima son las operaciones reales que hizo un paso del cursor (de la operación
// `from` a la `to` − 1): la vista dibuja cada una con los valores de traceNetwork.
//
// Orden: capa por capa (una ola de las entradas a las salidas); dentro de una capa, todas sus neuronas
// a la vez; dentro de una neurona, sus fases encadenadas. De a operaciones, cada fase es una sola
// operación fina (leer, multiplicar, sumar, sesgo o activación). De a neuronas, capas o cuadros, las
// operaciones de una neurona se agrupan en fases breves como siempre: leer; los productos, que viajan
// todos a la vez; la suma, que se va juntando; el sesgo y la activación. Un paso está hecho en cuanto se
// pide: la animación solo muestra cómo se llegó, y pedir otro paso la completa al instante.
import { termsOf, stageOfTerms, opsPerNeuron, STAGES } from '../../core/pass-cursor.js';

/** Duración de un paso a mano (ms): una operación, 300; una neurona o una capa, 450; un cuadro, 600. */
export const STEP_DURATION = Object.freeze({ operation: 300, neuron: 450, layer: 450, frame: 600 });

/** Al reproducir sola, cada animación dura como mucho esta fracción del intervalo entre pasos. */
export const AUTO_FRACTION = 0.8;

/** Duración de la animación de un paso: la de un paso a mano, con el tope del 80 % del intervalo al reproducir. */
export function stepDuration(size, { intervalMs = null } = {}) {
  const base = STEP_DURATION[size] ?? STEP_DURATION.operation;
  return intervalMs === null ? base : Math.min(base, AUTO_FRACTION * intervalMs);
}

/** Aplica una operación fina a unos términos (copia). */
function apply(terms, o) {
  const t = { ...terms };
  if (o.op === 'read') { t.read = true; t.activation = true; }
  else if (o.op === 'multiply') t.multiplied = Math.max(t.multiplied, o.input + 1);
  else if (o.op === 'add') t.added = Math.max(t.added, o.input + 1);
  else if (o.op === 'bias') t.bias = true;
  else if (o.op === 'activation') t.activation = true;
  return t;
}

/** Fases de una neurona: de a una operación, o agrupadas (productos, suma, sesgo, activación). */
function phasesOf(ops, fine) {
  if (fine) return ops.map((o) => ({ op: o.op, input: o.input, ops: [o] }));
  const kind = (o) => (o.op === 'multiply' ? 'products' : o.op === 'add' ? 'sum' : o.op);
  const byKind = new Map();
  for (const o of ops) {
    const k = kind(o);
    if (!byKind.has(k)) byKind.set(k, { op: k, ops: [] });
    byKind.get(k).ops.push(o);
  }
  const order = ['read', 'products', 'sum', 'bias', 'activation'];
  return order.filter((k) => byKind.has(k)).map((k) => {
    const ph = byKind.get(k);
    if (k === 'products' || k === 'sum') ph.inputs = ph.ops.map((o) => o.input);
    return ph;
  });
}

/**
 * @param {{from:number, to:number}} range operaciones hechas en el paso
 * @param {(k:number) => {layer:number, neuron:number, op:string, input?:number}} at la operación número k (cursor.at)
 * @param {{start:number, duration:number, sizes?:number[], fine?:boolean}} timing en ms; `fine`: de a operaciones
 */
export function createStepAnimation({ from, to }, at, { start, duration, sizes = null, fine = false }) {
  // Operaciones agrupadas por capa y, en cada capa, por neurona.
  const layers = [];
  for (let k = from; k < to; k++) {
    const o = at(k);
    let L = layers[layers.length - 1];
    if (!L || L.layer !== o.layer) { L = { layer: o.layer, neurons: new Map() }; layers.push(L); }
    if (!L.neurons.has(o.neuron)) L.neurons.set(o.neuron, { first: k, ops: [] });
    L.neurons.get(o.neuron).ops.push(o);
  }
  // Fases de cada neurona y lo que se ve antes de cada una (términos).
  for (const L of layers) {
    for (const [neuron, N] of L.neurons) {
      N.phases = phasesOf(N.ops, fine);
      if (sizes) {
        // Lo hecho de esta neurona antes del paso: la operación fina donde empieza dentro de la neurona.
        const per = opsPerNeuron(sizes, L.layer);
        let startIn = 0;
        for (let k = N.first - 1; k >= 0 && startIn < per; k--) { const o = at(k); if (o.layer !== L.layer || o.neuron !== neuron) break; startIn += 1; }
        let t = termsOf(sizes, L.layer, startIn);
        for (const ph of N.phases) { ph.before = t; for (const o of ph.ops) t = apply(t, o); ph.after = t; }
      }
    }
  }
  const slots = layers.length;
  let finished = slots === 0 || duration <= 0;

  /** Fracción [0, 1] del tiempo transcurrido. */
  const progress = (now) => (finished ? 1 : Math.max(0, Math.min(1, (now - start) / duration)));

  /**
   * Estado en el instante `now`: { items, hidden, shown, done }. `items`: las fases en curso, cada una
   * { layer, neuron, op, input?, inputs?, p } con p entre 0 y 1. `hidden`: por neurona ('l:j'), cuántas
   * de sus operaciones finas de este paso todavía no terminaron. `shown`: por neurona, los términos que
   * la vista muestra (lo de antes de la fase en curso), si se pasaron las formas (`sizes`).
   */
  function state(now) {
    const t = progress(now);
    if (t >= 1) { finished = true; return { items: [], hidden: new Map(), shown: new Map(), done: true }; }
    const items = [];
    const hidden = new Map();
    const shown = new Map();
    layers.forEach((L, s) => {
      const t0 = s / slots;
      const t1 = (s + 1) / slots;
      for (const [neuron, N] of L.neurons) {
        const key = `${L.layer}:${neuron}`;
        if (t >= t1) continue; // capa terminada
        if (t < t0) { // la ola no llegó
          hidden.set(key, N.ops.length);
          if (N.phases[0]?.before) shown.set(key, N.phases[0].before);
          continue;
        }
        const local = (t - t0) / (t1 - t0); // [0, 1) dentro de la capa
        const m = N.phases.length;
        const k = Math.min(m - 1, Math.floor(local * m));
        const p = local * m - k;
        const ph = N.phases[k];
        // Lo que falta: las operaciones de la fase en curso y de las siguientes.
        hidden.set(key, N.phases.slice(k).reduce((x, q) => x + q.ops.length, 0));
        if (ph.before) shown.set(key, ph.before);
        const item = { layer: L.layer, neuron, op: ph.op, p };
        if (ph.input !== undefined) item.input = ph.input;
        if (ph.inputs) item.inputs = ph.inputs;
        items.push(item);
      }
    });
    return { items, hidden, shown, done: false };
  }

  return {
    state,
    progress,
    /** La completa al instante (al pedir otro paso). */
    finish() { finished = true; },
    get done() { return finished; },
    get layers() { return layers.map((L) => ({ layer: L.layer, neurons: [...L.neurons.keys()] })); },
  };
}

/**
 * Cursor que ve la vista durante una animación: el real, menos las operaciones de este paso que
 * todavía no terminaron de animarse. Fuera de una animación es el real. Tiene `terms` si el real lo
 * tiene.
 */
export function displayCursor(cursor, anim) {
  if (!anim || anim.items.length + anim.hidden.size === 0) return cursor;
  const first = anim.items[0] ?? null;
  const sizes = cursor.sizes;
  const doneIn = (layer, neuron) => Math.max(0, cursor.doneIn(layer, neuron) - (anim.hidden.get(`${layer}:${neuron}`) ?? 0));
  const terms = (layer, neuron) => anim.shown?.get(`${layer}:${neuron}`) ?? termsOf(sizes, layer, doneIn(layer, neuron));
  const opsDone = (layer, neuron) => stageOfTerms(layer, terms(layer, neuron));
  const per = (layer) => opsPerNeuron(sizes, layer);
  return {
    opsDone,
    terms,
    doneIn,
    stepOf: (layer, neuron) => ({ done: doneIn(layer, neuron), total: per(layer) }),
    stateOf: (layer, neuron) => (opsDone(layer, neuron) === 4 ? 'done' : first && first.layer === layer && first.neuron === neuron ? 'current' : 'pending'),
    isDone: (layer, neuron, op) => opsDone(layer, neuron) > STAGES.indexOf(op),
    get done() { return false; },
    get next() {
      if (!first) return cursor.next;
      const n = { layer: first.layer, neuron: first.neuron, op: first.op };
      if (first.input !== undefined) n.input = first.input;
      return n;
    },
    get position() { return cursor.position; },
    get sizes() { return sizes; },
  };
}

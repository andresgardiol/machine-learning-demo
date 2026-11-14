// Línea de tiempo del paso animado (pestana-inspeccionar, design.md D7b), sin DOM. Lo que se anima
// son las operaciones reales que hizo un paso del cursor (de la operación `from` a la `to` − 1): la
// vista dibuja cada una con los valores de traceNetwork.
//
// Orden: capa por capa (una ola de las entradas a las salidas); dentro de una capa, todas sus neuronas
// a la vez; dentro de una neurona, sus operaciones encadenadas. Un paso está hecho en cuanto se pide:
// la animación solo muestra cómo se llegó, y pedir otro paso la completa al instante.

/** Duración de un paso a mano (ms): una operación, 300; una neurona o una capa, 450; un cuadro, 600. */
export const STEP_DURATION = Object.freeze({ operation: 300, neuron: 450, layer: 450, frame: 600 });

/** Al reproducir sola, cada animación dura como mucho esta fracción del intervalo entre pasos. */
export const AUTO_FRACTION = 0.8;

/** Duración de la animación de un paso: la de un paso a mano, con el tope del 80 % del intervalo al reproducir. */
export function stepDuration(size, { intervalMs = null } = {}) {
  const base = STEP_DURATION[size] ?? STEP_DURATION.operation;
  return intervalMs === null ? base : Math.min(base, AUTO_FRACTION * intervalMs);
}

/**
 * @param {{from:number, to:number}} range operaciones hechas en el paso
 * @param {(k:number) => {layer:number, neuron:number, op:string}} at la operación número k (cursor.at)
 * @param {{start:number, duration:number}} timing en ms
 */
export function createStepAnimation({ from, to }, at, { start, duration }) {
  // Operaciones agrupadas por capa y, en cada capa, por neurona.
  const layers = [];
  for (let k = from; k < to; k++) {
    const o = at(k);
    let L = layers[layers.length - 1];
    if (!L || L.layer !== o.layer) { L = { layer: o.layer, neurons: new Map() }; layers.push(L); }
    if (!L.neurons.has(o.neuron)) L.neurons.set(o.neuron, []);
    L.neurons.get(o.neuron).push(o.op);
  }
  const slots = layers.length;
  let finished = slots === 0 || duration <= 0;

  /** Fracción [0, 1] del tiempo transcurrido. */
  const progress = (now) => (finished ? 1 : Math.max(0, Math.min(1, (now - start) / duration)));

  /**
   * Estado en el instante `now`: { items, hidden, done }. `items`: las operaciones en curso, cada una
   * { layer, neuron, op, p } con p entre 0 y 1. `hidden`: por neurona ('l:j'), cuántas de sus
   * operaciones de este paso todavía no terminaron (la vista las muestra sin hacer).
   */
  function state(now) {
    const t = progress(now);
    if (t >= 1) { finished = true; return { items: [], hidden: new Map(), done: true }; }
    const items = [];
    const hidden = new Map();
    layers.forEach((L, s) => {
      const t0 = s / slots;
      const t1 = (s + 1) / slots;
      for (const [neuron, ops] of L.neurons) {
        const key = `${L.layer}:${neuron}`;
        if (t >= t1) continue; // capa terminada
        if (t < t0) { hidden.set(key, ops.length); continue; } // la ola no llegó
        const local = (t - t0) / (t1 - t0); // [0, 1) dentro de la capa
        const m = ops.length;
        const k = Math.min(m - 1, Math.floor(local * m));
        const p = local * m - k;
        hidden.set(key, m - k); // la que está en curso todavía no terminó
        items.push({ layer: L.layer, neuron, op: ops[k], p });
      }
    });
    return { items, hidden, done: false };
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
 * todavía no terminaron de animarse. Fuera de una animación es el real.
 */
export function displayCursor(cursor, anim) {
  if (!anim || anim.items.length + anim.hidden.size === 0) return cursor;
  const OPS = 4;
  const opsDone = (layer, neuron) => Math.max(0, cursor.opsDone(layer, neuron) - (anim.hidden.get(`${layer}:${neuron}`) ?? 0));
  const first = anim.items[0] ?? null;
  return {
    opsDone,
    stateOf: (layer, neuron) => (opsDone(layer, neuron) === OPS ? 'done' : first && first.layer === layer && first.neuron === neuron ? 'current' : 'pending'),
    isDone: (layer, neuron, op) => opsDone(layer, neuron) > ['products', 'sum', 'bias', 'activation'].indexOf(op),
    get done() { return false; },
    get next() { return first ? { layer: first.layer, neuron: first.neuron, op: first.op } : cursor.next; },
    get position() { return cursor.position; },
  };
}

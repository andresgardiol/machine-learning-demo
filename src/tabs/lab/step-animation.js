// Línea de tiempo del paso animado del aprendizaje (pestana-laboratorio, design.md D10), sin DOM.
// Anima las unidades reales que hizo un paso (de la ida, el error, la vuelta o la corrección): la
// vista dibuja cada una con los valores de la cuenta del ejemplo.
//
// Orden: un tramo por (fase, capa), en el orden en que se hicieron; dentro de un tramo, todas sus
// neuronas a la vez. En la ida, cada neurona encadena sus cuatro operaciones (productos, suma, sesgo y
// activación), como en Inspeccionar. Un paso está hecho en cuanto se pide: pedir otro lo completa.

/** Duración de un paso a mano (ms): una neurona, 300; una capa, 400; una fase, 450; un ejemplo, 600. */
export const STEP_DURATION = Object.freeze({ neuron: 300, layer: 400, phase: 450, example: 600 });
/** Al reproducir, cada animación dura como mucho esta fracción del intervalo entre pasos. */
export const AUTO_FRACTION = 0.8;
const FORWARD_OPS = Object.freeze(['products', 'sum', 'bias', 'activation']);

export function stepDuration(size, { intervalMs = null } = {}) {
  const base = STEP_DURATION[size] ?? STEP_DURATION.neuron;
  return intervalMs === null ? base : Math.min(base, AUTO_FRACTION * intervalMs);
}

/**
 * @param {{phase:string, layer:number, neuron:number}[]} units las unidades del paso, en orden
 * @param {{start:number, duration:number}} timing ms
 */
export function createLearningAnimation(units, { start, duration }) {
  const slots = [];
  for (const u of units) {
    let s = slots[slots.length - 1];
    if (!s || s.phase !== u.phase || s.layer !== u.layer) { s = { phase: u.phase, layer: u.layer, neurons: [] }; slots.push(s); }
    s.neurons.push(u.neuron);
  }
  let finished = slots.length === 0 || duration <= 0;
  const progress = (now) => (finished ? 1 : Math.max(0, Math.min(1, (now - start) / duration)));

  /**
   * { items, hidden, done }: `items` son { phase, layer, neuron, op, p } en curso (op en la ida es la
   * operación; en las demás fases, la fase); `hidden` las unidades del paso que todavía no terminaron
   * ('fase:l:j'), que la vista muestra sin hacer.
   */
  function state(now) {
    const t = progress(now);
    if (t >= 1) { finished = true; return { items: [], hidden: new Set(), done: true }; }
    const items = [];
    const hidden = new Set();
    slots.forEach((s, k) => {
      const t0 = k / slots.length;
      const t1 = (k + 1) / slots.length;
      if (t >= t1) return;
      for (const j of s.neurons) {
        const key = `${s.phase}:${s.layer}:${j}`;
        hidden.add(key);
        if (t < t0) continue;
        const local = (t - t0) / (t1 - t0);
        if (s.phase === 'forward') {
          const m = FORWARD_OPS.length;
          const q = Math.min(m - 1, Math.floor(local * m));
          items.push({ phase: s.phase, layer: s.layer, neuron: j, op: FORWARD_OPS[q], p: local * m - q });
        } else {
          items.push({ phase: s.phase, layer: s.layer, neuron: j, op: s.phase, p: local });
        }
      }
    });
    return { items, hidden, done: false };
  }
  return {
    state,
    progress,
    finish() { finished = true; },
    get done() { return finished; },
    get slots() { return slots.map((s) => ({ ...s, neurons: [...s.neurons] })); },
  };
}

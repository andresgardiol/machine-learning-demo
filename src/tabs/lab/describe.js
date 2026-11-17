// Operación en curso del aprendizaje (pestana-laboratorio, design.md D11), sin DOM: el texto de lo
// que se acaba de hacer, con los números reales (redondeados recién al mostrarlos), y por dónde va.
//
//   Error:      "Salida: 0,82 − 0 = 0,82"
//   Culpa:      "Oculta 1 · neurona 2: 0,82 × 0,70 = 0,57 · pendiente 0,36 · culpa 0,21"
//   Corrección: "Oculta 1 · neurona 2: 0,62 − 0,1 × 0,21 × 0,48 = 0,6 · …"
// Con muchos términos se muestran los más grandes y cuántos más hay, sin pasar de dos renglones.

/** Con más términos que estos, se muestran los más grandes y "y N más". */
export const MAX_TERMS = 4;
export const SHOWN_TERMS = 3;

/** Índices de los términos más grandes (en valor absoluto), en su orden; y cuántos quedan afuera. */
export function topTerms(values, max = MAX_TERMS, shown = SHOWN_TERMS) {
  const idx = values.map((_, i) => i);
  if (values.length <= max) return { shown: idx, more: 0 };
  const top = idx.slice().sort((a, b) => (Math.abs(values[b]) - Math.abs(values[a])) || (a - b)).slice(0, shown).sort((a, b) => a - b);
  return { shown: top, more: values.length - top.length };
}

/** Nombre de una capa: Entradas, Oculta n o Salida(s). */
export function layerName(t, layer, count) {
  if (layer === 0) return t('lab.layer.inputs');
  if (layer === count - 1) return t('lab.layer.outputs');
  return t('lab.layer.hidden', { n: layer });
}

/**
 * Nombre de una neurona. Las entradas y salidas se llaman según los datos: x e y y "Color" con
 * puntos; A, B y "Respuesta" con compuertas; los sensores, la velocidad y las cuatro acciones con tu manejo.
 */
export function neuronName(t, { kind, sizes }, layer, neuron) {
  const L = sizes.length - 1;
  if (layer === 0) {
    if (kind === 'gates') return t(neuron === 0 ? 'lab.input.a' : 'lab.input.b');
    if (kind === 'points') return t(neuron === 0 ? 'lab.input.x' : 'lab.input.y');
    return neuron === sizes[0] - 1 ? t('network.input.speed') : t('network.input.sensor', { n: neuron + 1 });
  }
  if (layer === L && kind === 'gates') return t('lab.output.answer');
  if (layer === L) return kind === 'points' ? t('lab.output.color') : t(`network.output.${['forward', 'left', 'right', 'reverse'][neuron]}`);
  return t('lab.neuron.n', { n: neuron + 1 });
}

const placeOf = (t, ctx, layer, neuron) => (layer === ctx.sizes.length - 1 && ctx.sizes[layer] === 1
  ? layerName(t, layer, ctx.sizes.length)
  : `${layerName(t, layer, ctx.sizes.length)} · ${neuronName(t, ctx, layer, neuron)}`);

/** Producto de varios factores con su signo: "0,82 × (−0,5)"; los negativos, entre paréntesis. */
const times = (fmt, ...xs) => xs.map((x) => (x < 0 && fmt(x) !== fmt(0) ? `(${fmt(x)})` : fmt(x))).join(' × ');
/** Una respuesta correcta (0 o 1) se escribe tal cual. */
const target = (fmt, v) => (Number.isInteger(v) ? String(v) : fmt(v));

/**
 * Texto de un paso.
 * @param {object} spec
 * @param {(k:string, p?:object)=>string} spec.t
 * @param {(v:number)=>string} spec.fmt
 * @param {{phase:string, layer:number, neuron:number}} spec.last la última unidad hecha
 * @param {object} spec.detail la cuenta del ejemplo (exampleDetail)
 * @param {{kind:string, sizes:number[]}} spec.ctx
 */
export function describeLearningStep({ t, fmt, last, detail, ctx }) {
  if (!last || !detail) return '';
  const { phase, layer, neuron } = last;
  const place = placeOf(t, ctx, layer, neuron);
  if (phase === 'forward') {
    const n = detail.forward.trace.layers[layer].neurons[neuron];
    return t('lab.op.forward', { place, total: fmt(n.total), value: fmt(n.output) });
  }
  if (phase === 'error') {
    const term = detail.backward.terms[layer][neuron];
    return t('lab.op.error', { place, op: `${fmt(term.output)} − ${target(fmt, term.target)}`, value: fmt(term.error) });
  }
  if (phase === 'backward') {
    const term = detail.backward.terms[layer][neuron];
    if (layer === ctx.sizes.length - 1) return t('lab.op.blameOutput', { place, value: fmt(term.delta) });
    const { shown, more } = topTerms(term.parts.map((p) => p.product));
    const parts = shown.map((k) => times(fmt, term.parts[k].blame, term.parts[k].weight));
    const sum = parts.join(' + ') + (more > 0 ? ` ${t('lab.op.more', { value: more })}` : '');
    return t('lab.op.blame', { place, sum, total: fmt(term.sum), slope: fmt(term.slope), value: fmt(term.delta) });
  }
  // Corrección: los pesos más corregidos de esa neurona (y el sesgo si entra).
  const ws = detail.corrections.weights[layer][neuron];
  const b = detail.corrections.biases[layer][neuron];
  const delta = detail.backward.deltas[layer][neuron];
  const rate = detail.rate;
  const { shown, more } = topTerms(ws.map((w) => w.change), 3, 2);
  const items = shown.map((i) => `${fmt(ws[i].before)} − ${times(fmt, rate, delta, ws[i].input)} = ${fmt(ws[i].after)}`);
  const extra = more > 0 ? ` ${t('lab.op.more', { value: more })}` : '';
  return t('lab.op.update', { place, items: items.join(' · ') + extra, bias: `${fmt(b.before)} → ${fmt(b.after)}` });
}

/**
 * Por dónde va, con palabras: "Época 12 · ejemplo 37 de 140 · vuelta · Oculta 1 · neurona 2".
 * @param {{t:Function, run:object, ctx:{kind:string, sizes:number[]}, running:boolean}} spec
 */
export function whereText({ t, run, ctx, running }) {
  const a = run.active;
  if (running || !a) {
    if (run.epoch === 0 && !a) return t('lab.where.start');
    return t('lab.where.epoch', { epoch: run.epoch });
  }
  const head = t('lab.where.example', { epoch: a.epoch, n: a.order + 1, total: run.size });
  if (a.done) return `${head} · ${t('lab.where.done')}`;
  const next = a.cursor.next;
  const pos = a.cursor.position;
  const at = pos ?? next;
  const phase = t(`lab.phase.${(pos ?? next).phase}`);
  if (!pos) return `${head} · ${t('lab.where.ready')}`;
  return `${head} · ${phase} · ${placeOf(t, ctx, at.layer, at.neuron)}`;
}

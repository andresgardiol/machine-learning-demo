// Operación en curso (pestana-inspeccionar, design.md D7c), sin DOM: el texto de lo que se acaba de
// hacer, escrito con sus números reales. Con muchas entradas muestra los términos más grandes y
// cuántos más hay, para no pasar de dos renglones; la cuenta completa está en la tarjeta.
import { OUTPUT_KEYS } from '../../render/network-view.js';

/** Con más términos que estos, se muestran los más grandes y "y N más". */
export const MAX_TERMS = 6;
/** Cuántos términos se muestran cuando no entran todos. */
export const SHOWN_TERMS = 4;

/** Nombre de una capa: Entradas, Oculta n o Salidas. */
export function layerName(t, layer, count) {
  if (layer === 0) return t('inspect.layer.inputs');
  if (layer === count - 1) return t('inspect.layer.outputs');
  return t('inspect.layer.hidden', { n: layer });
}

/** Nombre de una neurona: la entrada (sensor o velocidad), la acción de salida, o "neurona n". */
export function neuronLabel(t, sizes, layer, neuron) {
  if (layer === 0) return neuron === sizes[0] - 1 ? t('network.input.speed') : t('network.input.sensor', { n: neuron + 1 });
  if (layer === sizes.length - 1) return t(`network.output.${OUTPUT_KEYS[neuron] ?? 'forward'}`);
  return t('inspect.neuron.n', { n: neuron + 1 });
}

/** Lugar completo: "Oculta 1 · neurona 3" o "Salidas · Derecha". */
export const placeName = (t, sizes, layer, neuron) => `${layerName(t, layer, sizes.length)} · ${neuronLabel(t, sizes, layer, neuron)}`;

/** Índices de los términos a mostrar: todos si son pocos; si no, los más grandes, en su orden. */
export function shownTerms(products) {
  const idx = products.map((_, i) => i);
  if (products.length <= MAX_TERMS) return { shown: idx, more: 0 };
  const top = idx.slice().sort((a, b) => (Math.abs(products[b]) - Math.abs(products[a])) || (a - b)).slice(0, SHOWN_TERMS).sort((a, b) => a - b);
  return { shown: top, more: products.length - top.length };
}

/** Una suma escrita con sus signos: "0,39 − 0,21 + 0,59". */
function signedSum(values, fmt) {
  return values.map((v, k) => {
    const neg = v < 0 && fmt(v) !== fmt(0);
    const abs = fmt(Math.abs(v));
    if (k === 0) return neg ? `−${abs}` : abs;
    return neg ? `− ${abs}` : `+ ${abs}`;
  }).join(' ');
}

/** Nombre de la activación en el idioma activo. */
export const activationName = (t, activation) => t(`inspect.activation.${activation}`);

/**
 * Texto de un paso.
 * @param {object} spec
 * @param {(k:string, p?:object)=>string} spec.t
 * @param {(v:number)=>string} spec.fmt número con dos decimales en el idioma activo
 * @param {'operation'|'neuron'|'layer'|'frame'} spec.size
 * @param {{layer:number, neuron:number, op:string}} spec.last la última operación hecha
 * @param {object} spec.trace la cuenta (traceNetwork)
 * @param {number[]} spec.sizes
 */
export function describeStep({ t, fmt, size, last, trace, sizes }) {
  if (!last) return '';
  const n = trace.layers[last.layer].neurons[last.neuron];
  const isOutput = last.layer === sizes.length - 1;
  if (size === 'frame') {
    const on = trace.outputs.map((v, i) => (v === 1 ? t(`network.output.${OUTPUT_KEYS[i]}`) : null)).filter(Boolean);
    return on.length === 0 ? t('inspect.step.frame.none') : t('inspect.step.frame', { actions: on.join(', ') });
  }
  if (size === 'layer') {
    const neurons = trace.layers[last.layer].neurons;
    const lit = neurons.filter((x) => x.output > 0).length;
    return t(isOutput ? 'inspect.step.layer.outputs' : 'inspect.step.layer', { layer: layerName(t, last.layer, sizes.length), on: lit, total: neurons.length });
  }
  if (size === 'neuron') {
    const value = isOutput ? t(n.output === 1 ? 'inspect.yes' : 'inspect.no') : fmt(n.output);
    return t('inspect.step.neuron', { place: placeName(t, sizes, last.layer, last.neuron), value });
  }
  // Una operación
  if (last.op === 'products') {
    const { shown, more } = shownTerms(n.products);
    const terms = shown.map((i) => `${fmt(n.from[i])} × ${fmt(n.weights[i])} = ${fmt(n.products[i])}`).join(' · ');
    return more > 0 ? t('inspect.step.more', { terms, more }) : terms;
  }
  if (last.op === 'sum') {
    const { shown, more } = shownTerms(n.products);
    const terms = signedSum(shown.map((i) => n.products[i]), fmt);
    return more > 0 ? t('inspect.step.sum.more', { terms, more, sum: fmt(n.sum) }) : `${terms} = ${fmt(n.sum)}`;
  }
  if (last.op === 'bias') {
    const bias = n.bias < 0 && fmt(n.bias) !== fmt(0) ? `(${fmt(n.bias)})` : fmt(n.bias);
    return `${fmt(n.sum)} + ${bias} = ${fmt(n.total)}`;
  }
  // Activación
  if (isOutput) {
    const action = t(`network.output.${OUTPUT_KEYS[last.neuron]}`);
    return t(n.total > 0 ? 'inspect.step.output.yes' : 'inspect.step.output.no', { total: fmt(n.total), action });
  }
  return `${activationName(t, n.activation)}(${fmt(n.total)}) = ${fmt(n.output)}`;
}

/** Dónde va la cuenta, en palabras: "Cuadro 132 · Oculta 1 · neurona 3 · suma". */
export function whereText({ t, frame, sizes, cursor, realTimePlaying }) {
  const parts = [t('inspect.where.frame', { n: frame })];
  if (realTimePlaying || !cursor) return parts[0];
  const p = cursor.done ? null : (cursor.position ?? null);
  const next = cursor.next;
  if (cursor.done) return `${parts[0]} · ${t('inspect.where.done')}`;
  if (!p) return `${parts[0]} · ${t('inspect.where.start')}`;
  // La operación que se acaba de hacer; si la neurona terminó, la que sigue.
  const at = p ?? next;
  parts.push(layerName(t, at.layer, sizes.length), neuronLabel(t, sizes, at.layer, at.neuron), t(`inspect.op.${at.op}`));
  return parts.join(' · ');
}

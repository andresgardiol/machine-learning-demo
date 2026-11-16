// Operación en curso (pestana-inspeccionar, design.md D7c; operacion-por-operacion D4), sin DOM: lo
// que se acaba de hacer, con sus números reales.
//
// De a operaciones, `describeOperation` devuelve la cuenta como datos para la franja: el lugar y la
// operación, el número de paso de la neurona, los números de la cuenta con su nombre (y cuál es el
// resultado), una frase que dice qué se hizo y el recorrido de la neurona. `describeStep` es la oración
// para el lector de pantalla (de a operaciones) o el resumen de lo hecho (de a neuronas, capas o
// cuadros).
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
 * @param {object} [spec.cursor] el cursor, para el recorrido de la neurona (de a operaciones)
 * @param {(number|null)[]} [spec.manual] entradas puestas a mano
 */
export function describeStep({ t, fmt, size, last, trace, sizes, cursor = null, manual = null }) {
  if (!last) return '';
  const n = trace.layers[last.layer].neurons[last.neuron];
  if (last.layer === 0 && size !== 'frame' && size !== 'operation') {
    // Las entradas (D3): de a neuronas se lee una; de a capas, todas.
    if (size === 'layer') return t('inspect.step.inputs', { count: sizes[0] });
    return t('inspect.step.neuron', { place: placeName(t, sizes, 0, last.neuron), value: fmt(n.output) });
  }
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
  // Una operación: la cuenta en una oración, con el nombre de cada número.
  return describeOperation({ t, fmt, last, trace, sizes, cursor, manual }).spoken;
}

/**
 * Dónde va la cuenta, en palabras: "Cuadro 132 · Oculta 1 · neurona 2 · Sensor 3 · Multiplicar". Con
 * multiplicar y sumar dice de qué entrada se trata.
 */
export function whereText({ t, frame, sizes, cursor, realTimePlaying }) {
  const parts = [t('inspect.where.frame', { n: frame })];
  if (realTimePlaying || !cursor) return parts[0];
  const p = cursor.done ? null : (cursor.position ?? null);
  const next = cursor.next;
  if (cursor.done) return `${parts[0]} · ${t('inspect.where.done')}`;
  if (!p) return `${parts[0]} · ${t('inspect.where.start')}`;
  // La operación que se acaba de hacer; si la neurona terminó, la que sigue.
  const at = p ?? next;
  parts.push(layerName(t, at.layer, sizes.length), neuronLabel(t, sizes, at.layer, at.neuron));
  if (at.input !== undefined) parts.push(neuronLabel(t, sizes, at.layer - 1, at.input));
  parts.push(t(`inspect.op.${at.op}`));
  return parts.join(' · ');
}

/** Más que estas marcas en el recorrido de una neurona, se resume (D4). */
export const MAX_TRACK = 12;

/** Un término que se suma, con su signo: "0,12" o "(−0,12)" (sin «−0,00»). Así el número es el aporte. */
const addend = (v, fmt) => (v < 0 && fmt(v) !== fmt(0) ? `(${fmt(v)})` : fmt(Math.abs(v)));

/**
 * La cuenta de una operación fina como datos (D4).
 * @returns {{place:string, op:string, step:string, tokens:object[], say:string, track:object, spoken:string}}
 *   tokens: { kind:'num', text, name, help, result? }, { kind:'fn', text, name, help } o { kind:'sym', text, spoken }.
 */
export function describeOperation({ t, fmt, last, trace, sizes, cursor = null, manual = null }) {
  const { layer, neuron, op } = last;
  const n = trace.layers[layer].neurons[neuron];
  const isOutput = layer === sizes.length - 1;
  const opName = t(`inspect.op.${op}`);
  const num = (value, nameKey, params, help, extra = {}) => ({ kind: 'num', text: typeof value === 'string' ? value : fmt(value), name: t(nameKey, params), help, ...extra });
  const sym = (text, spokenKey) => ({ kind: 'sym', text, spoken: t(spokenKey) });
  const tokens = [];
  let say;
  let step;
  let place;
  if (layer === 0) {
    // Leer una entrada: muestra lo que mide el auto; no calcula (D3).
    const name = neuronLabel(t, sizes, 0, neuron);
    place = `${layerName(t, 0, sizes.length)} · ${name} · ${opName}`;
    step = t('inspect.opStep.input', { done: neuron + 1, total: sizes[0] });
    tokens.push(num(n.output, 'inspect.name.value', { name }, 'inspect.card.value', { result: true }));
    const isSpeed = neuron === sizes[0] - 1;
    let what;
    if (manual?.[neuron] !== null && manual?.[neuron] !== undefined) what = t('inspect.say.read.manual', { name });
    else if (n.off) what = t('inspect.say.read.off', { name });
    else if (isSpeed) what = t(n.raw < 0 ? 'inspect.say.read.speedBack' : 'inspect.say.read.speed', { pct: Math.round(Math.abs(n.raw) * 100) });
    else if (n.raw <= 0) what = t('inspect.say.read.nothing', { name });
    else {
      const at = Math.round((1 - n.raw) * 100); // a qué parte del alcance está lo que ve
      what = t(at >= 85 ? 'inspect.say.read.far' : at <= 15 ? 'inspect.say.read.near' : 'inspect.say.read.at', { name, pct: at });
    }
    say = `${what} ${t('inspect.say.read.noMath')}`;
  } else {
    const inputs = sizes[layer - 1];
    place = `${placeName(t, sizes, layer, neuron)} · ${opName}`;
    const within = op === 'multiply' ? 2 * last.input : op === 'add' ? 2 * last.input + 1 : op === 'bias' ? 2 * inputs : 2 * inputs + 1;
    step = t('inspect.opStep.neuron', { done: within + 1, total: 2 * inputs + 2 });
    // Las sumas parciales, en el orden de las entradas, con los aportes de la cuenta (D1).
    const partial = (k) => { let x = 0; for (let q = 0; q < k; q++) x += n.products[q]; return x; };
    if (op === 'multiply' || op === 'add') {
      const i = last.input;
      const from = neuronLabel(t, sizes, layer - 1, i);
      if (op === 'multiply') {
        tokens.push(num(n.from[i], 'inspect.name.value', { name: from }, 'inspect.card.value'), sym('×', 'inspect.sym.times'),
          num(n.weights[i], 'inspect.name.weight', {}, 'inspect.card.weight'), sym('=', 'inspect.sym.equals'),
          num(n.products[i], 'inspect.name.contribution', { name: from }, 'inspect.card.product', { result: true }));
        const connOff = Boolean(n.offConnections?.[i]);
        const srcOff = Boolean(trace.layers[layer - 1].neurons[i].off);
        say = t(connOff ? 'inspect.say.multiply.connOff' : srcOff ? 'inspect.say.multiply.srcOff' : 'inspect.say.multiply', { name: from });
      } else {
        const p = n.products[i];
        tokens.push(num(partial(i), 'inspect.name.partial', {}, 'inspect.card.sum'), sym('+', 'inspect.sym.plus'),
          num(addend(p, fmt), 'inspect.name.contribution', { name: from }, 'inspect.card.product'), sym('=', 'inspect.sym.equals'),
          num(partial(i + 1), 'inspect.name.partial', {}, 'inspect.card.sum', { result: true }));
        say = i === 0 ? t('inspect.say.add.first', { name: from }) : t('inspect.say.add', { name: from, done: i + 1, total: inputs });
      }
    } else if (op === 'bias') {
      tokens.push(num(n.sum, 'inspect.name.partial', {}, 'inspect.card.sum'), sym('+', 'inspect.sym.plus'),
        num(addend(n.bias, fmt), 'inspect.name.bias', {}, 'inspect.term.bias'), sym('=', 'inspect.sym.equals'),
        num(n.total, 'inspect.name.total', {}, 'inspect.term.total', { result: true }));
      say = t('inspect.say.bias');
    } else if (isOutput) {
      const action = t(`network.output.${OUTPUT_KEYS[neuron] ?? 'forward'}`);
      tokens.push(num(n.total, 'inspect.name.total', {}, 'inspect.term.total'), sym('>', 'inspect.sym.greater'),
        num(0, 'inspect.name.zero', {}, 'inspect.term.zero'), sym('→', 'inspect.sym.gives'),
        num(t(n.output === 1 ? 'inspect.yes' : 'inspect.no'), 'inspect.name.outputAction', { action }, 'inspect.card.output', { result: true }));
      say = n.off ? t('inspect.say.activation.off') : t(n.total > 0 ? 'inspect.say.output.yes' : 'inspect.say.output.no', { action });
    } else {
      const fn = activationName(t, n.activation);
      tokens.push({ kind: 'fn', text: fn, name: t('inspect.name.activation'), help: 'inspect.term.activation', spoken: t('inspect.sym.fn', { fn }) },
        { kind: 'sym', text: '(', spoken: '' }, num(n.total, 'inspect.name.total', {}, 'inspect.term.total'), { kind: 'sym', text: ')', spoken: '' }, sym('=', 'inspect.sym.equals'),
        num(n.output, 'inspect.name.output', {}, 'inspect.card.output', { result: true }));
      say = n.off ? t('inspect.say.activation.off') : t(`inspect.say.activation.${n.activation}`);
    }
  }
  const track = trackOf({ t, sizes, layer, neuron, cursor });
  const spokenMath = tokens.map((k) => (k.kind === 'num' ? `${k.name}, ${k.text}` : k.spoken)).filter(Boolean).join(' ');
  return { place, op: opName, step, tokens, say, track, spoken: `${opName}: ${spokenMath}. ${say}` };
}

/**
 * El recorrido de una neurona (D4): una marca por entrada, el sesgo y la activación, cada una 'done',
 * 'current' o 'pending'. En la capa de entradas, una marca por entrada. Con más de MAX_TRACK entradas se
 * resume: "Entradas 3 de 21 · Sesgo · Activación".
 * @returns {{marks:{label:string, state:string}[]}}
 */
export function trackOf({ t, sizes, layer, neuron, cursor }) {
  const next = cursor?.next ?? null;
  const here = Boolean(next) && next.layer === layer && (layer === 0 || next.neuron === neuron);
  const state = (done, cur) => (done ? 'done' : cur ? 'current' : 'pending');
  if (layer === 0) {
    return {
      marks: Array.from({ length: sizes[0] }, (_, i) => ({
        label: i === sizes[0] - 1 ? t('inspect.curve.chip.speed') : t('inspect.curve.chip.sensor', { n: i + 1 }),
        state: state(!cursor || cursor.opsDone(0, i) === 4, here && next.neuron === i),
      })),
    };
  }
  const inputs = sizes[layer - 1];
  const tm = cursor ? cursor.terms(layer, neuron) : { added: inputs, bias: true, activation: true };
  const curInput = here && (next.op === 'multiply' || next.op === 'add') ? next.input : null;
  const tail = [
    { label: t('inspect.op.bias'), state: state(tm.bias, here && next.op === 'bias') },
    { label: t('inspect.op.activation'), state: state(tm.activation, here && next.op === 'activation') },
  ];
  if (inputs > MAX_TRACK) {
    return { marks: [{ label: t('inspect.track.inputs', { done: tm.added, total: inputs }), state: state(tm.added >= inputs, curInput !== null), wide: true }, ...tail] };
  }
  return { marks: [...Array.from({ length: inputs }, (_, i) => ({ label: String(i + 1), state: state(i < tm.added, i === curInput) })), ...tail] };
}

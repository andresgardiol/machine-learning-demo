// Backpropagation (pestana-laboratorio, design.md D2), sin DOM: la cuenta de aprender de un ejemplo
// sobre la red de siempre (network.js).
//
//   forwardSoft(net, inputs)                → { trace, outputs, values, totals }
//   exampleError(outputs, targets)          → { errors, loss }
//   backward(net, forward, targets)         → { deltas, terms }
//   corrections(net, forward, deltas, rate) → { weights, biases }
//   applyCorrections(net, corrections)      → red corregida (la original no cambia)
//
// Índices: las capas se cuentan como en traceNetwork, por columna: 0 son las entradas y 1 a L las
// capas con pesos. `deltas[l][j]` es la culpa de la neurona j de la columna l; `deltas[0]` es null.
//
// La salida usa la sigmoide sobre el mismo total que usa computeNetwork (sesgo primero y después
// cada producto, en orden). Como la sigmoide pasa de 0,5 justo cuando el total pasa de 0, una red
// aprendida acá decide igual al manejar. La medida del error es la entropía cruzada sumada sobre las
// salidas: con sigmoide, la culpa de una salida es exactamente su respuesta menos la correcta.
//
// Partes apagadas (pestana-laboratorio D15): cada función acepta un `off` opcional con la forma de
// applyChanges (network-changes.js): { offNeurons[col][j], offConnections[col][j][i] }. Una neurona
// apagada vale cero y no recibe culpa; una conexión apagada no aporta a la suma ni lleva culpa; lo
// apagado no se corrige. Las salidas no se pueden apagar. Sin `off`, la cuenta es la de siempre.
//
// Lo que se aprende de corrido (learnExample) y lo que se recorre paso a paso (corrections +
// applyCorrections) hacen las mismas operaciones en el mismo orden: dan la misma red bit a bit.
import { activationFunction, copyNetwork, NetworkError } from './network.js';

/** Activaciones con pendiente: las que admite el aprendizaje en las capas ocultas. */
export const LEARNING_ACTIVATIONS = Object.freeze(['tanh', 'sigmoid', 'relu']);

const sigmoid = activationFunction('sigmoid');

/** Respuesta suave de una salida: sigmoide del total. */
export const softOutput = (total) => sigmoid(total);

/**
 * Pendiente de la activación de una capa oculta en el punto que tomó: con tanh, 1 − valor²; con
 * sigmoide, valor × (1 − valor); con ReLU, 1 si el total pasó de 0 y 0 si no.
 */
export function slopeOf(activation, value, total) {
  if (activation === 'tanh') return 1 - value * value;
  if (activation === 'sigmoid') return value * (1 - value);
  if (activation === 'relu') return total > 0 ? 1 : 0;
  throw new NetworkError('noSlope', { activation, allowed: [...LEARNING_ACTIVATIONS] });
}

/** Lanza un error si `off` apaga una salida: con una salida apagada el error no está definido. */
export function assertOff(net, off) {
  if (!off) return;
  const L = net.sizes.length - 1;
  if (off.offNeurons?.[L]?.some(Boolean)) throw new NetworkError('outputOff', { layer: L });
}

/** Lanza un error que lo explica si la red no puede aprender (el escalón no tiene pendiente). */
export function assertLearnable(net) {
  if (!LEARNING_ACTIVATIONS.includes(net.activation)) {
    throw new NetworkError('noSlope', { activation: net.activation, allowed: [...LEARNING_ACTIVATIONS] });
  }
}

/** Corrección de un peso: menos la tasa por la culpa por lo que traía la conexión. */
export const weightChange = (rate, delta, input) => -rate * delta * input;
/** Corrección de un sesgo: menos la tasa por la culpa. */
export const biasChange = (rate, delta) => -rate * delta;

const EPS = 1e-12;
const clampProb = (y) => (y < EPS ? EPS : y > 1 - EPS ? 1 - EPS : y);

/** Medida del error de una salida (entropía cruzada): 0 si acierta del todo, crece si está segura de algo equivocado. */
export function outputLoss(y, target) {
  const p = clampProb(y);
  return target >= 0.5 ? -Math.log(p) : -Math.log(1 - p);
}

/**
 * La ida: los valores de cada capa, con sigmoide en la salida. Devuelve además una cuenta con la
 * forma de traceNetwork (para dibujarla con el inspector), con la salida en 'sigmoid'.
 */
export function forwardSoft(net, inputs, off = null) {
  assertLearnable(net);
  assertOff(net, off);
  if (off) return forwardSoftOff(net, inputs, off);
  const expected = net.sizes[0];
  if (!Array.isArray(inputs) || inputs.length !== expected) {
    throw new NetworkError('inputCount', { expected, received: Array.isArray(inputs) ? inputs.length : null });
  }
  const hiddenFn = activationFunction(net.activation);
  const values = [inputs.slice()];
  const totals = [null];
  const layers = [{ neurons: inputs.map((v) => ({ input: true, raw: v, output: v, off: false })) }];
  let current = values[0];
  const last = net.layers.length - 1;
  for (let l = 0; l <= last; l++) {
    const { weights, biases } = net.layers[l];
    const isOutput = l === last;
    const fn = isOutput ? sigmoid : hiddenFn;
    const layerTotals = new Array(biases.length);
    const next = new Array(biases.length);
    const neurons = new Array(biases.length);
    for (let j = 0; j < biases.length; j++) {
      const row = weights[j];
      const products = new Array(row.length);
      let total = biases[j];
      let sum = 0;
      for (let i = 0; i < row.length; i++) {
        const p = row[i] * current[i];
        products[i] = p === 0 ? 0 : p;
        total += p;
        sum += p;
      }
      layerTotals[j] = total;
      next[j] = fn(total);
      neurons[j] = {
        from: current, weights: row, products, sum, bias: biases[j], total,
        activation: isOutput ? 'sigmoid' : net.activation, output: next[j], off: false, offConnections: null,
      };
    }
    totals.push(layerTotals);
    values.push(next);
    layers.push({ neurons });
    current = next;
  }
  return { trace: { layers, inputs: inputs.slice(), outputs: current }, outputs: current, values, totals };
}

function forwardSoftOff(net, inputs, off) {
  const expected = net.sizes[0];
  if (!Array.isArray(inputs) || inputs.length !== expected) {
    throw new NetworkError('inputCount', { expected, received: Array.isArray(inputs) ? inputs.length : null });
  }
  const { offNeurons: offN, offConnections: offC } = off;
  const hiddenFn = activationFunction(net.activation);
  const first = inputs.map((v, i) => (offN?.[0]?.[i] ? 0 : v));
  const values = [first];
  const totals = [null];
  const layers = [{ neurons: inputs.map((v, i) => ({ input: true, raw: v, output: first[i], off: Boolean(offN?.[0]?.[i]) })) }];
  let current = first;
  const last = net.layers.length - 1;
  for (let l = 0; l <= last; l++) {
    const { weights, biases } = net.layers[l];
    const col = l + 1;
    const isOutput = l === last;
    const fn = isOutput ? sigmoid : hiddenFn;
    const layerTotals = new Array(biases.length);
    const next = new Array(biases.length);
    const neurons = new Array(biases.length);
    for (let j = 0; j < biases.length; j++) {
      const row = weights[j];
      const offRow = offC?.[col]?.[j] ?? null;
      const products = new Array(row.length);
      let total = biases[j];
      let sum = 0;
      for (let i = 0; i < row.length; i++) {
        const p = offRow && offRow[i] ? 0 : row[i] * current[i];
        products[i] = p === 0 ? 0 : p;
        total += p;
        sum += p;
      }
      const isOff = Boolean(offN?.[col]?.[j]);
      layerTotals[j] = total;
      next[j] = isOff ? 0 : fn(total);
      neurons[j] = {
        from: current, weights: row, products, sum, bias: biases[j], total,
        activation: isOutput ? 'sigmoid' : net.activation, output: next[j], off: isOff, offConnections: offRow,
      };
    }
    totals.push(layerTotals);
    values.push(next);
    layers.push({ neurons });
    current = next;
  }
  return { trace: { layers, inputs: inputs.slice(), outputs: current }, outputs: current, values, totals, off };
}

/** El error de un ejemplo: por salida, la respuesta menos la correcta; y la medida del error, sumada. */
export function exampleError(outputs, targets) {
  const errors = outputs.map((y, k) => y - targets[k]);
  let loss = 0;
  for (let k = 0; k < outputs.length; k++) loss += outputLoss(outputs[k], targets[k]);
  return { errors, loss };
}

/**
 * La vuelta: la culpa de cada neurona, de la última capa a la primera. En una salida, su error; en
 * una oculta, la suma de (culpa siguiente × peso que las une), por la pendiente de su activación.
 * `terms[l][j]` informa cada término: en una salida { error, delta }; en una oculta
 * { parts: [{ to, blame, weight, product }], sum, slope, value, delta }.
 */
export function backward(net, forward, targets, off = forward.off ?? null) {
  assertLearnable(net);
  assertOff(net, off);
  const offN = off?.offNeurons ?? null;
  const offC = off?.offConnections ?? null;
  const { values, totals } = forward;
  const L = net.sizes.length - 1;
  const deltas = new Array(L + 1).fill(null);
  const terms = new Array(L + 1).fill(null);
  const out = values[L];
  deltas[L] = out.map((y, k) => y - targets[k]);
  terms[L] = deltas[L].map((d, k) => ({ output: out[k], target: targets[k], error: d, delta: d }));
  for (let l = L - 1; l >= 1; l--) {
    const nextW = net.layers[l].weights; // pesos que salen de la columna l (llegan a la l + 1)
    const nextD = deltas[l + 1];
    const count = net.sizes[l];
    const layerD = new Array(count);
    const layerT = new Array(count);
    for (let j = 0; j < count; j++) {
      let sum = 0;
      const parts = new Array(nextD.length);
      for (let k = 0; k < nextD.length; k++) {
        // Una conexión apagada no lleva culpa hacia atrás.
        const cut = offC && offC[l + 1][k][j];
        const product = cut ? 0 : nextD[k] * nextW[k][j];
        parts[k] = cut ? { to: k, blame: nextD[k], weight: nextW[k][j], product, off: true } : { to: k, blame: nextD[k], weight: nextW[k][j], product };
        sum += product;
      }
      const value = values[l][j];
      // Una neurona apagada no recibe culpa.
      const isOff = Boolean(offN && offN[l][j]);
      const slope = isOff ? 0 : slopeOf(net.activation, value, totals[l][j]);
      const delta = isOff ? 0 : sum * slope;
      layerD[j] = delta;
      layerT[j] = { parts, sum, slope, value, delta };
    }
    deltas[l] = layerD;
    terms[l] = layerT;
  }
  return { deltas, terms };
}

/**
 * La corrección de cada peso y sesgo, sin aplicarla. `weights[l][j][i]` y `biases[l][j]` son
 * { before, change, after } (y en los pesos, `input`: lo que traía la conexión).
 */
export function corrections(net, forward, deltas, rate, off = forward.off ?? null) {
  const offC = off?.offConnections ?? null;
  const offN = off?.offNeurons ?? null;
  const { values } = forward;
  const L = net.sizes.length - 1;
  const weights = new Array(L + 1).fill(null);
  const biases = new Array(L + 1).fill(null);
  for (let l = 1; l <= L; l++) {
    const layer = net.layers[l - 1];
    const prev = values[l - 1];
    weights[l] = layer.weights.map((row, j) => row.map((w, i) => {
      // Lo apagado no se corrige: la conexión apagada y los pesos que entran a una neurona apagada.
      if (off && ((offC && offC[l][j][i]) || (offN && offN[l][j]))) return { before: w, change: 0, after: w, input: prev[i], off: true };
      const change = weightChange(rate, deltas[l][j], prev[i]);
      return { before: w, change, after: w + change, input: prev[i] };
    }));
    biases[l] = layer.biases.map((b, j) => {
      if (off && offN && offN[l][j]) return { before: b, change: 0, after: b, off: true };
      const change = biasChange(rate, deltas[l][j]);
      return { before: b, change, after: b + change };
    });
  }
  return { weights, biases, rate };
}

/** Red nueva con las correcciones aplicadas; la original no cambia. */
export function applyCorrections(net, corr) {
  const out = copyNetwork(net);
  for (let l = 1; l < net.sizes.length; l++) {
    const layer = out.layers[l - 1];
    for (let j = 0; j < layer.biases.length; j++) {
      const row = layer.weights[j];
      for (let i = 0; i < row.length; i++) row[i] = corr.weights[l][j][i].after;
      layer.biases[j] = corr.biases[l][j].after;
    }
  }
  return out;
}

/**
 * Todo el aprendizaje de un ejemplo en el lugar: corrige `net` (que se modifica) con las mismas
 * operaciones que forwardSoft + backward + corrections + applyCorrections. Es lo que se usa de corrido.
 * Devuelve la medida del error del ejemplo antes de corregir.
 */
export function learnExample(net, inputs, targets, rate, off = null) {
  if (off) return learnExampleOff(net, inputs, targets, rate, off);
  const fwd = forwardValues(net, inputs);
  const { values, totals } = fwd;
  const L = net.sizes.length - 1;
  const deltas = new Array(L + 1);
  const out = values[L];
  let loss = 0;
  const dL = new Array(out.length);
  for (let k = 0; k < out.length; k++) { dL[k] = out[k] - targets[k]; loss += outputLoss(out[k], targets[k]); }
  deltas[L] = dL;
  for (let l = L - 1; l >= 1; l--) {
    const nextW = net.layers[l].weights;
    const nextD = deltas[l + 1];
    const count = net.sizes[l];
    const layerD = new Array(count);
    for (let j = 0; j < count; j++) {
      let sum = 0;
      for (let k = 0; k < nextD.length; k++) sum += nextD[k] * nextW[k][j];
      layerD[j] = sum * slopeOf(net.activation, values[l][j], totals[l][j]);
    }
    deltas[l] = layerD;
  }
  for (let l = 1; l <= L; l++) {
    const layer = net.layers[l - 1];
    const prev = values[l - 1];
    for (let j = 0; j < layer.biases.length; j++) {
      const row = layer.weights[j];
      const d = deltas[l][j];
      for (let i = 0; i < row.length; i++) row[i] = row[i] + weightChange(rate, d, prev[i]);
      layer.biases[j] = layer.biases[j] + biasChange(rate, d);
    }
  }
  return loss;
}

/** learnExample con partes apagadas: las mismas operaciones que el camino desglosado con `off`. */
function learnExampleOff(net, inputs, targets, rate, off) {
  assertOff(net, off);
  const f = forwardSoftOff(net, inputs, off);
  const back = backward(net, f, targets, off);
  const corr = corrections(net, f, back.deltas, rate, off);
  for (let l = 1; l < net.sizes.length; l++) {
    const layer = net.layers[l - 1];
    for (let j = 0; j < layer.biases.length; j++) {
      const row = layer.weights[j];
      for (let i = 0; i < row.length; i++) row[i] = corr.weights[l][j][i].after;
      layer.biases[j] = corr.biases[l][j].after;
    }
  }
  return exampleError(f.outputs, targets).loss;
}

/** Solo los valores y los totales de la ida (sin la cuenta desglosada), con sigmoide en la salida. */
export function forwardValues(net, inputs, off = null) {
  if (off) { const f = forwardSoftOff(net, inputs, off); return { values: f.values, totals: f.totals, outputs: f.outputs }; }
  const hiddenFn = activationFunction(net.activation);
  const values = [inputs];
  const totals = [null];
  let current = inputs;
  const last = net.layers.length - 1;
  for (let l = 0; l <= last; l++) {
    const { weights, biases } = net.layers[l];
    const fn = l === last ? sigmoid : hiddenFn;
    const layerTotals = new Array(biases.length);
    const next = new Array(biases.length);
    for (let j = 0; j < biases.length; j++) {
      const row = weights[j];
      let total = biases[j];
      for (let i = 0; i < row.length; i++) total += row[i] * current[i];
      layerTotals[j] = total;
      next[j] = fn(total);
    }
    totals.push(layerTotals);
    values.push(next);
    current = next;
  }
  return { values, totals, outputs: current };
}

/** Respuesta suave de la red (solo las salidas). */
export const softOutputs = (net, inputs, off = null) => forwardValues(net, inputs, off).outputs;

/**
 * ¿Una salida queda del lado correcto de 0,5? Exactamente 0,5 no se decide: no es acierto con ninguna
 * respuesta (laboratorio-empieza-por-compuertas D6).
 */
export const outputCorrect = (out, target) => (target >= 0.5 ? out > 0.5 : out < 0.5);

/** ¿Todas las salidas quedan del lado correcto de 0,5? */
export function isCorrect(outputs, targets) {
  for (let k = 0; k < outputs.length; k++) if (!outputCorrect(outputs[k], targets[k])) return false;
  return true;
}

/**
 * Error medio y aciertos de la red sobre unos ejemplos ({ inputs, targets }).
 * @returns {{loss:number|null, accuracy:number|null, correct:number, count:number}}
 */
export function evaluate(net, examples, off = null) {
  if (examples.length === 0) return { loss: null, accuracy: null, correct: 0, count: 0 };
  let loss = 0;
  let correct = 0;
  for (const ex of examples) {
    const out = forwardValues(net, ex.inputs, off).outputs;
    for (let k = 0; k < out.length; k++) loss += outputLoss(out[k], ex.targets[k]);
    if (isCorrect(out, ex.targets)) correct += 1;
  }
  return { loss: loss / examples.length, accuracy: correct / examples.length, correct, count: examples.length };
}

/**
 * Orden mezclado de `count` ejemplos (Fisher-Yates) con un generador con semilla.
 * @param {number} count
 * @param {() => number} random
 */
export function shuffledOrder(count, random) {
  const order = Array.from({ length: count }, (_, i) => i);
  for (let i = count - 1; i > 0; i--) {
    const k = Math.floor(random() * (i + 1));
    const tmp = order[i]; order[i] = order[k]; order[k] = tmp;
  }
  return order;
}

/**
 * Una época de corrido: corrige una copia de la red una vez con cada ejemplo de práctica, en el
 * orden dado. Devuelve la red nueva; la original no cambia.
 */
export function trainEpoch(net, practice, order, rate, off = null) {
  assertLearnable(net);
  const work = copyNetwork(net);
  for (const idx of order) learnExample(work, practice[idx].inputs, practice[idx].targets, rate, off);
  return work;
}

/**
 * Red para guardar como cerebro con lo apagado hecho pesos en cero (pestana-laboratorio D15): los que
 * salen de una neurona apagada (o de una entrada apagada) y el de cada conexión apagada. Una oculta
 * apagada que vale cero hacia adelante es lo mismo que una cuyos pesos de salida son cero. Devuelve
 * otra red; la original no cambia.
 */
export function bakeOff(net, off) {
  const out = copyNetwork(net);
  if (!off) return out;
  for (let l = 1; l < net.sizes.length; l++) {
    const layer = out.layers[l - 1];
    for (let j = 0; j < layer.weights.length; j++) {
      for (let i = 0; i < layer.weights[j].length; i++) {
        if (off.offConnections?.[l]?.[j]?.[i] || off.offNeurons?.[l - 1]?.[i]) layer.weights[j][i] = 0;
      }
    }
  }
  return out;
}

/**
 * Valores de todas las neuronas sobre una grilla del plano (vista-de-la-red D12), para una red de dos
 * entradas: una pasada por punto, en el centro de cada celda de una grilla de size × size sobre el rango
 * [lo, hi]² (por defecto [−1, 1]², con compuertas [−0,5; 1,5]², fila 0 arriba), con lo apagado tenido en cuenta. `layers[l][j]` es la grilla de la neurona j de la
 * columna l (l ≥ 1); la de la salida es la misma que pinta el fondo del plano.
 * @returns {{size:number, layers:(Float32Array[]|null)[]}}
 */
export function neuronGrid(net, size = 50, off = null, range = [-1, 1]) {
  const [lo, hi] = range;
  const span = hi - lo;
  const layers = net.sizes.map((n, l) => (l === 0 ? null : Array.from({ length: n }, () => new Float32Array(size * size))));
  const point = [0, 0];
  for (let r = 0; r < size; r++) {
    point[1] = hi - ((r + 0.5) / size) * span;
    for (let c = 0; c < size; c++) {
      point[0] = lo + ((c + 0.5) / size) * span;
      const { values } = forwardValues(net, [point[0], point[1]], off);
      const k = r * size + c;
      for (let l = 1; l < values.length; l++) {
        const row = values[l];
        const out = layers[l];
        for (let j = 0; j < row.length; j++) out[j][k] = row[j];
      }
    }
  }
  return { size, layers };
}

// Red neuronal de capas totalmente conectadas, como dato plano (design.md D3).
//
//   { sizes: [6, 6, 4],
//     activation: 'step',                 // capas ocultas: step | sigmoid | tanh | relu
//     layers: [ { weights: [[...6] x6], biases: [x6] },   // weights[j][i]: de la neurona i
//               { weights: [[...6] x4], biases: [x4] } ] } // de la capa anterior a la j
//
// Valor de una neurona: activación(suma(peso × entrada) + sesgo). La capa de salida usa siempre
// escalón (suma > 0). Sin clases: se serializa a JSON tal cual y se copia sin sorpresas.
//
// Orden canónico de los valores (para inicializar, mutar y cruzar): capa por capa, y dentro de
// cada capa primero los pesos neurona por neurona (weights[0][0], weights[0][1], …) y después los
// sesgos.

export const NETWORK_LIMITS = Object.freeze({
  hiddenLayers: Object.freeze({ min: 0, max: 3 }),
  neurons: Object.freeze({ min: 1, max: 16 }),
});

export const ACTIVATIONS = Object.freeze(['step', 'sigmoid', 'tanh', 'relu']);
export const DEFAULT_ACTIVATION = 'step';

/** Error de la red con un código y datos para que la interfaz lo explique en su idioma. */
export class NetworkError extends Error {
  constructor(code, details = {}) {
    super(`${code}: ${JSON.stringify(details)}`);
    this.name = 'NetworkError';
    this.code = code;
    this.details = details;
  }
}

const ACTIVATION_FUNCTIONS = Object.freeze({
  step: (x) => (x > 0 ? 1 : 0),
  sigmoid: (x) => 1 / (1 + Math.exp(-x)),
  tanh: (x) => Math.tanh(x),
  relu: (x) => (x > 0 ? x : 0),
});

/** Función de activación por nombre. */
export function activationFunction(name) {
  const fn = ACTIVATION_FUNCTIONS[name];
  if (!fn) throw new NetworkError('unknownActivation', { activation: name, allowed: [...ACTIVATIONS] });
  return fn;
}

const isCount = (n) => Number.isInteger(n) && n >= 1;

/**
 * Verifica una forma: entradas y salidas enteras positivas, de 0 a 3 capas ocultas con 1 a 16
 * neuronas y una activación admitida. Lanza NetworkError con los límites si no se cumple.
 */
export function checkShape({ inputs, hidden = [], outputs, activation = DEFAULT_ACTIVATION }) {
  const limits = { hiddenLayers: { ...NETWORK_LIMITS.hiddenLayers }, neurons: { ...NETWORK_LIMITS.neurons } };
  if (!isCount(inputs) || !isCount(outputs)) throw new NetworkError('invalidShape', { inputs, outputs, limits });
  if (!Array.isArray(hidden) || hidden.length > NETWORK_LIMITS.hiddenLayers.max) {
    throw new NetworkError('invalidShape', { hidden, limits });
  }
  for (const n of hidden) {
    if (!Number.isInteger(n) || n < NETWORK_LIMITS.neurons.min || n > NETWORK_LIMITS.neurons.max) {
      throw new NetworkError('invalidShape', { hidden, limits });
    }
  }
  activationFunction(activation);
}

/**
 * Crea una red nueva con pesos y sesgos al azar entre -1 y 1.
 * @param {{inputs:number, hidden?:number[], outputs:number, activation?:string, random:()=>number}} spec
 *   random: generador de [0, 1) (ver random.js); determina todos los valores.
 */
export function createNetwork({ inputs, hidden = [], outputs, activation = DEFAULT_ACTIVATION, random }) {
  checkShape({ inputs, hidden, outputs, activation });
  if (typeof random !== 'function') throw new NetworkError('missingRandom');
  const sizes = [inputs, ...hidden, outputs];
  const layers = [];
  for (let l = 1; l < sizes.length; l++) {
    const weights = Array.from({ length: sizes[l] }, () => Array.from({ length: sizes[l - 1] }, () => random() * 2 - 1));
    const biases = Array.from({ length: sizes[l] }, () => random() * 2 - 1);
    layers.push({ weights, biases });
  }
  return { sizes, activation, layers };
}

/** Cantidad de entradas, de capas ocultas (como lista de tamaños) y de salidas. */
export const shapeOf = (net) => ({
  inputs: net.sizes[0],
  hidden: net.sizes.slice(1, -1),
  outputs: net.sizes[net.sizes.length - 1],
  activation: net.activation,
});

/**
 * Calcula todas las capas. Devuelve los valores de cada capa, desde las entradas hasta las
 * salidas, y las sumas (antes de la activación) de cada capa que no es de entradas.
 */
export function computeDetailed(net, inputs) {
  const expected = net.sizes[0];
  if (!Array.isArray(inputs) || inputs.length !== expected) {
    throw new NetworkError('inputCount', { expected, received: Array.isArray(inputs) ? inputs.length : null });
  }
  const hiddenFn = activationFunction(net.activation);
  const outputFn = ACTIVATION_FUNCTIONS.step;
  const values = [inputs.slice()];
  const sums = [];
  let current = values[0];
  const last = net.layers.length - 1;
  for (let l = 0; l <= last; l++) {
    const { weights, biases } = net.layers[l];
    const fn = l === last ? outputFn : hiddenFn;
    const layerSums = new Array(biases.length);
    const next = new Array(biases.length);
    for (let j = 0; j < biases.length; j++) {
      const row = weights[j];
      let sum = biases[j];
      for (let i = 0; i < row.length; i++) sum += row[i] * current[i];
      layerSums[j] = sum;
      next[j] = fn(sum);
    }
    sums.push(layerSums);
    values.push(next);
    current = next;
  }
  return { values, sums, outputs: current };
}

/** Salidas de la red para unas entradas (0 o 1 cada una). No modifica la red. */
export function computeNetwork(net, inputs) {
  return computeDetailed(net, inputs).outputs;
}

/** Copia independiente: cambiar la copia no cambia el original. */
export function copyNetwork(net) {
  return {
    sizes: net.sizes.slice(),
    activation: net.activation,
    layers: net.layers.map((layer) => ({
      weights: layer.weights.map((row) => row.slice()),
      biases: layer.biases.slice(),
    })),
  };
}

/** Recorre los valores en el orden canónico; `fn(value)` devuelve el valor nuevo. Devuelve una red nueva. */
export function mapValues(net, fn) {
  const out = copyNetwork(net);
  for (const layer of out.layers) {
    for (const row of layer.weights) for (let i = 0; i < row.length; i++) row[i] = fn(row[i]);
    for (let j = 0; j < layer.biases.length; j++) layer.biases[j] = fn(layer.biases[j]);
  }
  return out;
}

/** Todos los valores en el orden canónico, como lista plana. */
export function flatValues(net) {
  const out = [];
  for (const layer of net.layers) {
    for (const row of layer.weights) out.push(...row);
    out.push(...layer.biases);
  }
  return out;
}

/**
 * Valida una red recibida como dato (por ejemplo, desde un archivo). No lanza: devuelve null si es
 * válida o { code, details } con el problema:
 *   shapeMismatch  falta alguna parte, o la cantidad de pesos o sesgos no corresponde a la forma
 *   notFinite      algún peso o sesgo no es un número finito
 *   unknownActivation / invalidShape  la forma declarada no es admitida
 */
export function validateNetwork(net) {
  if (!net || typeof net !== 'object' || !Array.isArray(net.sizes) || !Array.isArray(net.layers)) {
    return { code: 'shapeMismatch', details: { missing: 'network' } };
  }
  const { sizes } = net;
  if (sizes.length < 2) return { code: 'shapeMismatch', details: { sizes } };
  try {
    checkShape({ inputs: sizes[0], hidden: sizes.slice(1, -1), outputs: sizes[sizes.length - 1], activation: net.activation });
  } catch (err) {
    if (err instanceof NetworkError) return { code: err.code, details: err.details };
    throw err;
  }
  if (net.layers.length !== sizes.length - 1) return { code: 'shapeMismatch', details: { layers: net.layers.length, expected: sizes.length - 1 } };
  for (let l = 0; l < net.layers.length; l++) {
    const layer = net.layers[l];
    if (!layer || !Array.isArray(layer.weights) || !Array.isArray(layer.biases)) return { code: 'shapeMismatch', details: { layer: l } };
    if (layer.weights.length !== sizes[l + 1] || layer.biases.length !== sizes[l + 1]) return { code: 'shapeMismatch', details: { layer: l } };
    for (const row of layer.weights) {
      if (!Array.isArray(row) || row.length !== sizes[l]) return { code: 'shapeMismatch', details: { layer: l } };
    }
  }
  for (const layer of net.layers) {
    for (const row of layer.weights) for (const w of row) if (typeof w !== 'number' || !Number.isFinite(w)) return { code: 'notFinite', details: {} };
    for (const b of layer.biases) if (typeof b !== 'number' || !Number.isFinite(b)) return { code: 'notFinite', details: {} };
  }
  return null;
}

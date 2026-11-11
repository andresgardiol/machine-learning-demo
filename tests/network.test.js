import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createNetwork, computeNetwork, computeDetailed, copyNetwork, validateNetwork, flatValues,
  NetworkError, NETWORK_LIMITS, ACTIVATIONS,
} from '../src/core/network.js';
import { createRandom } from '../src/core/random.js';

const close = (a, b, eps = 1e-12) => assert.ok(Math.abs(a - b) < eps, `${a} ≈ ${b}`);
const countOf = (layer) => ({ weights: layer.weights.flat().length, biases: layer.biases.length });

// Red armada a mano: una capa oculta de `sums.length` neuronas que reciben una sola entrada 1 con
// peso 0, de modo que la suma de cada neurona oculta es su sesgo.
function hiddenProbe(activation, sums) {
  return {
    sizes: [1, sums.length, 1],
    activation,
    layers: [
      { weights: sums.map(() => [0]), biases: sums.slice() },
      { weights: [sums.map(() => 0)], biases: [0] },
    ],
  };
}
const hiddenValues = (net) => computeDetailed(net, [1]).values[1];

// --- 3.1 Estructura por capas y activaciones admitidas ---------------------------------

test('red con una capa oculta: 36 pesos y 6 sesgos en la oculta, 24 pesos y 4 sesgos en la salida', () => {
  const net = createNetwork({ inputs: 6, hidden: [6], outputs: 4, random: createRandom(1) });
  assert.deepEqual(net.sizes, [6, 6, 4]);
  assert.equal(net.layers.length, 2);
  assert.deepEqual(countOf(net.layers[0]), { weights: 36, biases: 6 });
  assert.deepEqual(countOf(net.layers[1]), { weights: 24, biases: 4 });
});

test('red sin capas ocultas: 24 pesos y 4 sesgos, cada salida conectada con las 6 entradas', () => {
  const net = createNetwork({ inputs: 6, hidden: [], outputs: 4, random: createRandom(1) });
  assert.deepEqual(net.sizes, [6, 4]);
  assert.equal(net.layers.length, 1);
  assert.deepEqual(countOf(net.layers[0]), { weights: 24, biases: 4 });
  for (const row of net.layers[0].weights) assert.equal(row.length, 6);
});

test('forma fuera de los límites: 4 capas ocultas no se crea y se informan los límites', () => {
  assert.throws(
    () => createNetwork({ inputs: 6, hidden: [4, 4, 4, 4], outputs: 4, random: createRandom(1) }),
    (err) => err instanceof NetworkError && err.code === 'invalidShape'
      && err.details.limits.hiddenLayers.max === 3 && err.details.limits.neurons.max === 16
      && err.details.limits.hiddenLayers.min === 0 && err.details.limits.neurons.min === 1,
  );
});

test('forma fuera de los límites: una capa oculta de 20 neuronas no se crea y se informan los límites', () => {
  assert.throws(
    () => createNetwork({ inputs: 6, hidden: [20], outputs: 4, random: createRandom(1) }),
    (err) => err instanceof NetworkError && err.code === 'invalidShape' && err.details.limits.neurons.max === 16,
  );
  assert.throws(() => createNetwork({ inputs: 6, hidden: [0], outputs: 4, random: createRandom(1) }), NetworkError);
  assert.deepEqual(NETWORK_LIMITS.hiddenLayers, { min: 0, max: 3 });
});

test('activación desconocida: la red no se crea y se informan las activaciones admitidas', () => {
  assert.throws(
    () => createNetwork({ inputs: 6, hidden: [6], outputs: 4, activation: 'softmax', random: createRandom(1) }),
    (err) => err instanceof NetworkError && err.code === 'unknownActivation'
      && JSON.stringify(err.details.allowed) === JSON.stringify(['step', 'sigmoid', 'tanh', 'relu']),
  );
  assert.deepEqual([...ACTIVATIONS], ['step', 'sigmoid', 'tanh', 'relu']);
});

test('activación por defecto: escalón', () => {
  const net = createNetwork({ inputs: 2, hidden: [3], outputs: 1, random: createRandom(1) });
  assert.equal(net.activation, 'step');
});

// --- 3.2 Cálculo, salida escalón y activaciones ------------------------------------------

const simple = () => ({ sizes: [2, 1], activation: 'step', layers: [{ weights: [[0.5, -0.5]], biases: [0.1] }] });

test('suma positiva: entradas 1 y 0,5 dan suma 0,35 y salida 1', () => {
  const d = computeDetailed(simple(), [1, 0.5]);
  close(d.sums[0][0], 0.35);
  assert.deepEqual(d.outputs, [1]);
  assert.deepEqual(computeNetwork(simple(), [1, 0.5]), [1]);
});

test('suma negativa: entradas 0 y 1 dan suma -0,4 y salida 0', () => {
  const d = computeDetailed(simple(), [0, 1]);
  close(d.sums[0][0], -0.4);
  assert.deepEqual(d.outputs, [0]);
});

test('cantidad de entradas incorrecta: una red de 6 entradas rechaza 5 valores indicando cuántas espera', () => {
  const net = createNetwork({ inputs: 6, hidden: [6], outputs: 4, random: createRandom(3) });
  assert.throws(
    () => computeNetwork(net, [0, 0, 0, 0, 0]),
    (err) => err instanceof NetworkError && err.code === 'inputCount' && err.details.expected === 6 && err.details.received === 5,
  );
});

test('salida con suma exactamente 0: vale 0', () => {
  const net = { sizes: [1, 1], activation: 'relu', layers: [{ weights: [[1]], biases: [0] }] };
  const d = computeDetailed(net, [0]);
  assert.equal(d.sums[0][0], 0);
  assert.deepEqual(d.outputs, [0]);
});

test('la salida usa escalón aunque las capas ocultas usen otra activación', () => {
  const net = { sizes: [1, 1, 1], activation: 'sigmoid', layers: [
    { weights: [[1]], biases: [0] },
    { weights: [[1]], biases: [0] },
  ] };
  assert.deepEqual(computeDetailed(net, [0]).outputs, [1]); // sigmoide(0) = 0,5 > 0 → 1
});

test('escalón: una neurona oculta con suma 0,2 vale 1', () => {
  assert.deepEqual(hiddenValues(hiddenProbe('step', [0.2])), [1]);
  assert.deepEqual(hiddenValues(hiddenProbe('step', [0])), [0]);
});

test('sigmoide: una neurona oculta con suma 0 vale 0,5', () => {
  assert.deepEqual(hiddenValues(hiddenProbe('sigmoid', [0])), [0.5]);
});

test('tangente hiperbólica: una neurona oculta con suma 0 vale 0', () => {
  assert.deepEqual(hiddenValues(hiddenProbe('tanh', [0])), [0]);
});

test('ReLU: sumas -0,7 y 0,7 dan 0 y 0,7', () => {
  assert.deepEqual(hiddenValues(hiddenProbe('relu', [-0.7, 0.7])), [0, 0.7]);
});

// --- 3.3 Inicialización, detalle y copia ---------------------------------------------------

test('misma semilla: dos redes de la misma forma tienen los mismos pesos y sesgos', () => {
  const a = createNetwork({ inputs: 6, hidden: [6], outputs: 4, random: createRandom(42) });
  const b = createNetwork({ inputs: 6, hidden: [6], outputs: 4, random: createRandom(42) });
  assert.deepEqual(a, b);
});

test('semilla distinta: los pesos y sesgos difieren', () => {
  const a = flatValues(createNetwork({ inputs: 6, hidden: [6], outputs: 4, random: createRandom(42) }));
  const b = flatValues(createNetwork({ inputs: 6, hidden: [6], outputs: 4, random: createRandom(43) }));
  assert.equal(a.length, 70);
  assert.equal(b.length, 70);
  assert.ok(a.filter((v, i) => v !== b[i]).length === 70, 'todos los valores difieren');
});

test('valores dentro del rango: todos los pesos y sesgos están entre -1 y 1', () => {
  for (const seed of [1, 2, 3, 4, 5]) {
    const values = flatValues(createNetwork({ inputs: 101, hidden: [16, 16, 16], outputs: 4, random: createRandom(seed) }));
    assert.equal(values.length, 101 * 16 + 16 + 16 * 16 + 16 + 16 * 16 + 16 + 16 * 4 + 4);
    for (const v of values) assert.ok(v >= -1 && v <= 1, String(v));
  }
});

test('valores por capa: 6 de entrada, 6 de la oculta y 4 de salida, y las salidas coinciden con el cálculo', () => {
  const net = createNetwork({ inputs: 6, hidden: [6], outputs: 4, random: createRandom(9) });
  const inputs = [0.1, 0.9, 0, 0.5, 0.3, 0.7];
  const d = computeDetailed(net, inputs);
  assert.deepEqual(d.values.map((v) => v.length), [6, 6, 4]);
  assert.deepEqual(d.values[0], inputs);
  assert.deepEqual(d.values[2], computeNetwork(net, inputs));
  for (const v of d.values[2]) assert.ok(v === 0 || v === 1);
});

test('cálculo repetido: tras mil cálculos con otras entradas, el primero se repite y la red no cambió', () => {
  const net = createNetwork({ inputs: 6, hidden: [6], outputs: 4, activation: 'tanh', random: createRandom(5) });
  const before = JSON.stringify(net);
  const first = [0.2, 0.4, 0.6, 0.8, 1, -0.5];
  const r1 = computeDetailed(net, first);
  const rnd = createRandom(77);
  for (let i = 0; i < 1000; i++) computeNetwork(net, Array.from({ length: 6 }, () => rnd() * 2 - 1));
  const r2 = computeDetailed(net, first);
  assert.deepEqual(r2, r1);
  assert.equal(JSON.stringify(net), before);
});

test('copia independiente: cambiar la copia no cambia el original', () => {
  const net = createNetwork({ inputs: 3, hidden: [2], outputs: 4, random: createRandom(1) });
  const copy = copyNetwork(net);
  assert.deepEqual(copy, net);
  copy.layers[0].weights[0][0] = 99;
  copy.layers[1].biases[0] = 99;
  copy.sizes[0] = 99;
  assert.notEqual(net.layers[0].weights[0][0], 99);
  assert.notEqual(net.layers[1].biases[0], 99);
  assert.equal(net.sizes[0], 3);
});

test('validación de una red: válida, con un peso faltante y con un valor no numérico', () => {
  const net = createNetwork({ inputs: 6, hidden: [6], outputs: 4, random: createRandom(1) });
  assert.equal(validateNetwork(net), null);
  const missing = copyNetwork(net);
  missing.layers[0].weights[2].pop();
  assert.equal(validateNetwork(missing).code, 'shapeMismatch');
  const nan = copyNetwork(net);
  nan.layers[1].biases[1] = 'x';
  assert.equal(validateNetwork(nan).code, 'notFinite');
  const inf = JSON.parse(JSON.stringify(net));
  inf.layers[1].biases[1] = null; // JSON convierte Infinity en null
  assert.equal(validateNetwork(inf).code, 'notFinite');
  assert.equal(validateNetwork(null).code, 'shapeMismatch');
});

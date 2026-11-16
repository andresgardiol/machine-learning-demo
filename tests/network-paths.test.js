import test from 'node:test';
import assert from 'node:assert/strict';
import { upstream, responseCurve } from '../src/core/network-paths.js';
import { traceNetwork } from '../src/core/network-trace.js';
import { createChanges } from '../src/core/network-changes.js';
import { forwardValues } from '../src/core/backprop.js';
import { createNetwork } from '../src/core/network.js';
import { createRandom } from '../src/core/random.js';
import { EXAMPLE_BRAINS } from '../src/data/example-brains.js';

const near = (a, b, eps = 1e-9) => Math.abs(a - b) < eps;
/** Cuenta mínima armada a mano: products/weights por neurona. */
const fakeTrace = (layers) => ({ layers: layers.map((neurons) => ({ neurons: neurons.map((n) => ({ off: false, offConnections: null, ...n })) })) });

test('upstream, una sola capa atrás: productos 0,6, −0,3 y 0,1 dan importancias 0,6, 0,3 y 0,1', () => {
  const t = fakeTrace([[{}, {}, {}], [{ products: [0.6, -0.3, 0.1], weights: [1, 1, 1] }]]);
  const { links } = upstream(t, { layer: 1, neuron: 0 });
  assert.ok(near(links.get('1:0:0'), 0.6));
  assert.ok(near(links.get('1:0:1'), 0.3));
  assert.ok(near(links.get('1:0:2'), 0.1));
});

test('upstream, dos capas atrás: una conexión de importancia 0,5 cuya neurona recibe dos productos iguales da 0,25 y 0,25', () => {
  const t = fakeTrace([
    [{}, {}],
    [{ products: [0.2, 0.2], weights: [1, 1] }, { products: [1, 0], weights: [1, 1] }],
    [{ products: [0.5, -0.5], weights: [1, 1] }],
  ]);
  const { links } = upstream(t, { layer: 2, neuron: 0 });
  assert.ok(near(links.get('2:0:0'), 0.5));
  assert.ok(near(links.get('1:0:0'), 0.25));
  assert.ok(near(links.get('1:0:1'), 0.25));
});

test('upstream sin señal: se reparte según el tamaño de los pesos', () => {
  const t = fakeTrace([[{}, {}], [{ products: [0, 0], weights: [0.3, -0.1] }]]);
  const { links } = upstream(t, { layer: 1, neuron: 0 });
  assert.ok(near(links.get('1:0:0'), 0.75));
  assert.ok(near(links.get('1:0:1'), 0.25));
});

test('upstream con límite 1: un solo camino hasta una entrada; en un empate, la de más arriba', () => {
  const t = fakeTrace([
    [{}, {}, {}],
    [{ products: [0.2, 0.2, 0.1], weights: [1, 1, 1] }, { products: [0.1, 0.5, 0.1], weights: [1, 1, 1] }],
    [{ products: [0.4, 0.4], weights: [1, 1] }],
  ]);
  const { links } = upstream(t, { layer: 2, neuron: 0 }, 1);
  assert.deepEqual([...links.keys()].sort(), ['1:0:0', '2:0:0']);
});

test('upstream con partes apagadas: importancia cero y el camino no sigue por ahí', () => {
  const t = fakeTrace([
    [{}, {}],
    [{ products: [0.3, 0.3], weights: [1, 1] }, { products: [0.3, 0.3], weights: [1, 1], off: true }],
    [{ products: [0.4, 0], weights: [1, 1], offConnections: null }],
  ]);
  const { links } = upstream(t, { layer: 2, neuron: 0 });
  assert.equal(links.get('2:0:1') ?? 0, 0);
  assert.equal(links.get('1:1:0') ?? 0, 0);
  const t2 = fakeTrace([[{}, {}], [{ products: [0.4, 0], weights: [1, 2], offConnections: [false, true] }]]);
  assert.equal(upstream(t2, { layer: 1, neuron: 0 }).links.get('1:0:1') ?? 0, 0);
});

test('upstream: mismo resultado con la misma cuenta, y en una red de verdad suma 1 en cada capa', () => {
  const net = EXAMPLE_BRAINS[0].network;
  const trace = traceNetwork(net, [0.47, 0.02, 0, 0, 0.12, 1]);
  const a = upstream(trace, { layer: 2, neuron: 0 });
  const b = upstream(trace, { layer: 2, neuron: 0 });
  assert.deepEqual([...a.links], [...b.links]);
  const sumLayer = (l) => [...a.links].filter(([k]) => k.startsWith(`${l}:`)).reduce((s, [, v]) => s + v, 0);
  assert.ok(near(sumLayer(2), 1));
  assert.ok(sumLayer(1) <= 1 + 1e-9);
});

const stepNet = () => ({
  sizes: [2, 2, 1], activation: 'step',
  layers: [
    { weights: [[0.4, 0.1], [-1, 0.2]], biases: [0, 0.5] },
    { weights: [[1, 1]], biases: [-0.5] },
  ],
});

test('respuesta, primera capa: con peso 0,4 la suma crece 0,4 de 0 a 1, en línea recta', () => {
  const c = responseCurve(stepNet(), [0.3, 0.6], { layer: 1, neuron: 0 }, 0);
  assert.equal(c.xs.length, 41);
  assert.ok(near(c.totals.at(-1) - c.totals[0], 0.4));
  for (let k = 1; k < 41; k++) assert.ok(near(c.totals[k] - c.totals[k - 1], 0.01));
});

test('respuesta: el valor en la entrada de ahora coincide con la cuenta de la red', () => {
  const net = EXAMPLE_BRAINS[0].network;
  const inputs = [0.47, 0.02, 0, 0, 0.12, 1];
  const c = responseCurve(net, inputs, { layer: 2, neuron: 1 }, 0);
  assert.equal(c.now.total, traceNetwork(net, inputs).layers[2].neurons[1].total);
  assert.equal(c.now.x, 0.47);
});

test('respuesta de una salida con escalón: cambia solo donde una oculta se enciende o se apaga', () => {
  const net = stepNet();
  const c = responseCurve(net, [0, 0.6], { layer: 2, neuron: 0 }, 0, { samples: 101 });
  const hidden = responseCurve(net, [0, 0.6], { layer: 1, neuron: 1 }, 0, { samples: 101 });
  for (let k = 1; k < 101; k++) {
    if (c.totals[k] !== c.totals[k - 1]) assert.notEqual(hidden.outputs[k], hidden.outputs[k - 1]);
  }
  assert.ok(c.totals.some((v, k) => k > 0 && v !== c.totals[k - 1]), 'tiene al menos un salto');
  // La oculta 2 cambia de salida donde su suma cruza el cero: 0,5 + 0,2 × 0,6 − x = 0 → x = 0,62.
  assert.equal(hidden.flips.length, 1);
  assert.ok(near(hidden.flips[0], 0.62, 1e-9));
});

test('respuesta con la entrada apagada: la misma para todos sus valores', () => {
  const net = stepNet();
  const changes = createChanges(net);
  changes.set({ kind: 'neuronOff', layer: 0, neuron: 0, value: true });
  const c = responseCurve(net, [0.3, 0.6], { layer: 1, neuron: 0 }, 0, { changes });
  assert.ok(c.totals.every((v) => v === c.totals[0]));
});

test('respuesta con un peso cambiado: usa el peso cambiado', () => {
  const net = stepNet();
  const changes = createChanges(net);
  changes.set({ kind: 'weight', layer: 1, neuron: 0, input: 0, value: -0.8 });
  const c = responseCurve(net, [0.3, 0.6], { layer: 1, neuron: 0 }, 0, { changes });
  assert.ok(near(c.totals.at(-1) - c.totals[0], -0.8));
});

test('respuesta en una red que aprende (suave): coincide con forwardValues y es reproducible', () => {
  const net = createNetwork({ inputs: 2, hidden: [3], outputs: 1, activation: 'tanh', random: createRandom(3) });
  const a = responseCurve(net, [0.2, -0.4], { layer: 2, neuron: 0 }, 1, { soft: true, range: [-1, 1] });
  const b = responseCurve(net, [0.2, -0.4], { layer: 2, neuron: 0 }, 1, { soft: true, range: [-1, 1] });
  assert.deepEqual(a, b);
  assert.equal(a.now.total, forwardValues(net, [0.2, -0.4]).totals[2][0]);
  assert.equal(a.xs[0], -1);
});

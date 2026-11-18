// La decisión y la neurona que más aportó en el caso del choque de Inspeccionar (red-al-centro D5, tarea 4.3).
import test from 'node:test';
import assert from 'node:assert/strict';
import { decisionOf, topContributor, caseOf, CASE_FRAMES, CASE_START } from '../src/tabs/inspect/crash-case.js';
import { createNetwork } from '../src/core/network.js';
import { createRandom } from '../src/core/random.js';
import { traceNetwork } from '../src/core/network-trace.js';
import { createChanges } from '../src/core/network-changes.js';

/** Red con los pesos y sesgos dados: layers[k] = { weights: [[...] por neurona], biases: [...] }. */
function netWith(sizes, layers) {
  const net = createNetwork({ inputs: sizes[0], hidden: sizes.slice(1, -1), outputs: sizes.at(-1), random: createRandom(1) });
  layers.forEach((L, k) => {
    L.weights.forEach((row, j) => row.forEach((w, i) => { net.layers[k].weights[j][i] = w; }));
    L.biases.forEach((b, j) => { net.layers[k].biases[j] = b; });
  });
  return net;
}

test('memoria de 3 s y deslizador 1 s antes del choque', () => {
  assert.equal(CASE_FRAMES, 180);
  assert.equal(CASE_START, 60);
});

test('con capas ocultas: la decisión es la acción encendida de mayor valor y la neurona, la oculta de mayor aporte', () => {
  // 2 entradas → 3 ocultas → 4 salidas. Salidas 0 y 2 encendidas; la 2 con más total.
  const net = netWith([2, 3, 4], [
    { weights: [[1, 0], [0, 1], [1, 1]], biases: [0, 0, 0] },
    { weights: [[0.5, 0, 0], [-1, -1, -1], [0.2, 0.9, 0.4], [-1, -1, -1]], biases: [0, 0, 0, 0] },
  ]);
  const trace = traceNetwork(net, [1, 1]);
  const d = decisionOf(trace);
  assert.equal(d.index, 2);
  const c = topContributor(trace, 2);
  assert.equal(c.layer, 1);
  assert.equal(c.neuron, 1, 'la neurona 2 de la oculta aporta valor × 0,9');
  assert.ok(c.product > 0);
  assert.deepEqual(caseOf(trace), { decision: d, contributor: c });
});

test('sin capas ocultas: la que más aportó es una entrada', () => {
  const net = netWith([3, 4], [{ weights: [[0.1, 0.8, 0.3], [-1, -1, -1], [-1, -1, -1], [-1, -1, -1]], biases: [0, 0, 0, 0] }]);
  const trace = traceNetwork(net, [1, 0.5, 1]);
  const { decision, contributor } = caseOf(trace);
  assert.equal(decision.index, 0);
  assert.deepEqual({ layer: contributor.layer, neuron: contributor.neuron }, { layer: 0, neuron: 1 });
});

test('sin ninguna acción encendida: no hay decisión ni neurona', () => {
  const net = netWith([2, 4], [{ weights: [[-1, -1], [-1, -1], [-1, -1], [-1, -1]], biases: [-1, -1, -1, -1] }]);
  assert.deepEqual(caseOf(traceNetwork(net, [1, 1])), { decision: null, contributor: null });
});

test('empates: la acción y la neurona de menor índice', () => {
  const net = netWith([2, 2, 4], [
    { weights: [[1, 0], [0, 1]], biases: [0, 0] },
    { weights: [[0.5, 0.5], [0.5, 0.5], [-1, -1], [-1, -1]], biases: [0, 0, 0, 0] },
  ]);
  const trace = traceNetwork(net, [1, 1]);
  const { decision, contributor } = caseOf(trace);
  assert.equal(decision.index, 0);
  assert.equal(contributor.neuron, 0);
});

test('una conexión apagada no aporta; sin aportes positivos no hay neurona', () => {
  const net = netWith([2, 2, 4], [
    { weights: [[1, 0], [0, 1]], biases: [0, 0] },
    { weights: [[0.9, 0.2], [-1, -1], [-1, -1], [-1, -1]], biases: [0, 0, 0, 0] },
  ]);
  const changes = createChanges(net, [{ kind: 'connectionOff', layer: 2, neuron: 0, input: 0, value: true }]);
  const trace = traceNetwork(net, [1, 1], changes);
  assert.equal(topContributor(trace, 0).neuron, 1);
  const neg = netWith([2, 2, 4], [
    { weights: [[1, 0], [0, 1]], biases: [0, 0] },
    { weights: [[-0.5, -0.5], [-1, -1], [-1, -1], [-1, -1]], biases: [1.5, 0, 0, 0] },
  ]);
  const t2 = traceNetwork(neg, [1, 1]);
  assert.equal(decisionOf(t2).index, 0);
  assert.equal(topContributor(t2, 0), null);
});

import test from 'node:test';
import assert from 'node:assert/strict';
import { topConnections, createChanges } from '../src/core/network-changes.js';
import { traceNetwork } from '../src/core/network-trace.js';
import { createNetwork } from '../src/core/network.js';
import { createRandom } from '../src/core/random.js';

const net = {
  sizes: [6, 2, 4], activation: 'tanh',
  layers: [
    { weights: [[0.1, -0.9, 0.3, 0.5, -0.2, 0.05], [0.4, 0.4, -0.4, 0.1, 0.2, 0.3]], biases: [0, 0] },
    { weights: [[1, -2], [0.5, 0.5], [0.1, 0.2], [-0.3, 0.3]], biases: [0, 0, 0, 0] },
  ],
};

test('todas: sin filtro', () => {
  assert.equal(topConnections(net, null, 'all'), null);
});

test('las tres más importantes: las de mayor peso sin el signo, en cada neurona', () => {
  const top = topConnections(net, null, 3);
  assert.equal(top[0], null);
  assert.deepEqual([...top[1][0]].sort(), [1, 2, 3]);
  assert.equal(top[1][0].size, 3);
});

test('empate: entra la entrada de más arriba, siempre la misma', () => {
  const top = topConnections(net, null, 1);
  assert.deepEqual([...top[1][1]], [0], '0,4, 0,4 y −0,4 empatan: gana la primera');
  assert.deepEqual([...topConnections(net, null, 2)[1][1]].sort(), [0, 1]);
  assert.deepEqual([...top[2][1]], [0]);
  assert.deepEqual([...top[2][3]], [0]);
});

test('menos entradas que el filtro: entran todas', () => {
  const top = topConnections(net, null, 5);
  assert.deepEqual([...top[2][0]].sort(), [0, 1]);
});

test('peso cambiado: lo destacado se actualiza', () => {
  const changes = createChanges(net);
  assert.ok(!topConnections(net, changes, 1)[1][0].has(4));
  changes.set({ kind: 'weight', layer: 1, neuron: 0, input: 4, value: -1 });
  assert.deepEqual([...topConnections(net, changes, 1)[1][0]], [4]);
  changes.set({ kind: 'weight', layer: 1, neuron: 0, input: 1, value: 0.01 });
  assert.ok(!topConnections(net, changes, 3)[1][0].has(1));
});

test('la cuenta no cambia con el filtro', () => {
  const big = createNetwork({ inputs: 21, hidden: [16], outputs: 4, random: createRandom(2) });
  const inputs = Array.from({ length: 21 }, (_, i) => i / 21);
  const before = traceNetwork(big, inputs).outputs;
  for (const n of ['all', 5, 3, 1]) topConnections(big, null, n);
  assert.deepEqual(traceNetwork(big, inputs).outputs, before);
});

import test from 'node:test';
import assert from 'node:assert/strict';
import { neuronGrid } from '../src/core/backprop.js';
import { planeGrid } from '../src/render/plane-view.js';
import { createNetwork } from '../src/core/network.js';
import { createRandom } from '../src/core/random.js';
import { createLearningRun, WEIGHT_HISTORY_MAX } from '../src/core/learning-cursor.js';
import { pointsDataset, splitDataset } from '../src/core/datasets.js';

const net = () => createNetwork({ inputs: 2, hidden: [4], outputs: 1, activation: 'tanh', random: createRandom(2) });
const offWith = (n, col, j) => ({
  offNeurons: n.sizes.map((s, l) => Array.from({ length: s }, (_, k) => l === col && k === j)),
  offConnections: n.sizes.map((s, l) => (l === 0 ? [] : Array.from({ length: s }, () => new Array(n.sizes[l - 1]).fill(false)))),
});

test('grilla de 50 × 50 de una red de 2, 4 y 1: 2500 valores para cada oculta y para la salida', () => {
  const g = neuronGrid(net(), 50);
  assert.equal(g.layers[0], null);
  assert.equal(g.layers[1].length, 4);
  for (const m of g.layers[1]) assert.equal(m.length, 2500);
  assert.equal(g.layers[2][0].length, 2500);
});

test('la salida de la grilla es la misma que pinta el fondo del plano', () => {
  const n = net();
  assert.deepEqual(neuronGrid(n, 50).layers[2][0], planeGrid(n, 50));
  const off = offWith(n, 1, 2);
  assert.deepEqual(neuronGrid(n, 50, off).layers[2][0], planeGrid(n, 50, off));
});

test('una oculta apagada vale cero en todos los puntos', () => {
  const n = net();
  const g = neuronGrid(n, 20, offWith(n, 1, 1));
  assert.ok(g.layers[1][1].every((v) => v === 0));
  assert.ok(g.layers[1][0].some((v) => v !== 0));
});

const runOf = () => {
  const data = pointsDataset({ shape: 'circle', count: 40, noise: 0, seed: 1 });
  const s = splitDataset(data, { holdout: 20, seed: 1 });
  return createLearningRun({ network: net(), practice: s.practice, heldOut: s.heldOut, rate: 0.3, seed: 1 });
};

test('historia: una muestra por época, cada una con su época', () => {
  const r = runOf();
  r.runEpochs(40);
  const h = r.weightHistory(1, 2, 0);
  assert.equal(h.points.length, 40);
  assert.deepEqual(h.points.map((p) => p.epoch), Array.from({ length: 40 }, (_, k) => k + 1));
  assert.equal(h.points.at(-1).value, r.network.layers[0].weights[2][0]);
  assert.equal(r.weightHistory(2, 0, 'bias').points.at(-1).value, r.network.layers[1].biases[0]);
  assert.equal(typeof h.initial, 'number');
});

test('historia con muchas épocas: 300 o menos, de la primera parte a la última época', () => {
  const r = runOf();
  r.runEpochs(1000);
  const h = r.weightHistory(1, 0, 1);
  assert.ok(h.points.length <= WEIGHT_HISTORY_MAX && h.points.length > 100, `${h.points.length}`);
  assert.equal(h.points.at(-1).epoch, 1000);
  assert.ok(h.points[0].epoch <= 8, `primera ${h.points[0].epoch}`);
  for (let k = 1; k < h.points.length; k++) assert.ok(h.points[k].epoch > h.points[k - 1].epoch);
});

test('historia: un cambio a mano queda anotado en su época; reiniciar la vacía; misma semilla, misma historia', () => {
  const r = runOf();
  r.runEpochs(30);
  r.setWeight(1, 0, 1, 2.5);
  r.runEpochs(5);
  assert.deepEqual(r.weightHistory(1, 0, 1).manual, [30]);
  assert.deepEqual(r.weightHistory(1, 0, 0).manual, []);
  const fresh = runOf();
  assert.equal(fresh.weightHistory(1, 0, 1).points.length, 0);
  const again = runOf();
  again.runEpochs(30);
  again.setWeight(1, 0, 1, 2.5);
  again.runEpochs(5);
  assert.deepEqual(again.weightHistory(1, 0, 1), r.weightHistory(1, 0, 1));
});

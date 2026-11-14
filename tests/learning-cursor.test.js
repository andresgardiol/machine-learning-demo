import test from 'node:test';
import assert from 'node:assert/strict';
import { createNetwork } from '../src/core/network.js';
import { createRandom } from '../src/core/random.js';
import { createExampleCursor, createLearningRun, exampleUnits } from '../src/core/learning-cursor.js';
import { trainEpoch, shuffledOrder } from '../src/core/backprop.js';
import { randomFor } from '../src/core/random.js';
import { overfitting, OVERFIT_RULE } from '../src/core/overfitting.js';
import { pointsDataset, splitDataset } from '../src/core/datasets.js';

const net = (hidden = [3, 2], activation = 'tanh') => createNetwork({ inputs: 2, hidden, outputs: 1, activation, random: createRandom(5) });

test('unidades de un ejemplo: ida, error, vuelta y corrección, en orden', () => {
  const units = exampleUnits([2, 3, 2, 1]);
  assert.deepEqual([...new Set(units.map((u) => u.phase))], ['forward', 'error', 'backward', 'update']);
  const back = units.filter((u) => u.phase === 'backward');
  assert.deepEqual(back.map((u) => `${u.layer}:${u.neuron}`), ['3:0', '2:0', '2:1', '1:0', '1:1', '1:2']);
  assert.equal(units.filter((u) => u.phase === 'forward')[0].layer, 1);
});

test('de a una fase desde el principio: queda hecha la ida entera y nada más', () => {
  const c = createExampleCursor([2, 3, 2, 1]);
  const r = c.advance('phase');
  assert.equal(r.to - r.from, 6);
  assert.ok(c.phaseDone('forward'));
  assert.ok(!c.isDone('error', 3, 0));
  assert.equal(c.phase, 'error');
});

test('de a una neurona en la vuelta: una culpa más, empezando por las salidas', () => {
  const c = createExampleCursor([2, 3, 2, 1]);
  c.advance('phase'); c.advance('phase');
  assert.equal(c.phase, 'backward');
  c.advance('neuron');
  assert.ok(c.isDone('backward', 3, 0));
  assert.ok(!c.isDone('backward', 2, 0));
  c.advance('neuron');
  assert.ok(c.isDone('backward', 2, 0));
  assert.ok(!c.isDone('backward', 2, 1));
  const r = c.advance('layer');
  assert.equal(r.to - r.from, 1); // termina la capa 2
  assert.ok(c.isDone('backward', 2, 1));
});

test('de a un ejemplo con uno a medio hacer: se completan sus fases y la red queda corregida', () => {
  const data = pointsDataset({ shape: 'circle', count: 40, seed: 2 }).examples;
  const run = createLearningRun({ network: net(), practice: data, rate: 0.3, seed: 1 });
  const before = JSON.stringify(run.network);
  run.advance('neuron');
  assert.equal(JSON.stringify(run.network), before); // a medio hacer, la red no cambió
  const r = run.advance('example');
  assert.ok(r.exampleDone);
  assert.notEqual(JSON.stringify(run.network), before);
  assert.ok(run.active.done);
});

test('paso a paso igual que de corrido: una época de a una neurona deja la red idéntica', () => {
  for (const activation of ['tanh', 'sigmoid', 'relu']) {
    const data = pointsDataset({ shape: 'xor', count: 30, seed: 3 }).examples;
    const a = createLearningRun({ network: net([3, 2], activation), practice: data, rate: 0.3, seed: 9 });
    const b = createLearningRun({ network: net([3, 2], activation), practice: data, rate: 0.3, seed: 9 });
    let guard = 0;
    while (a.epoch === 0 && guard++ < 100000) a.advance('neuron');
    b.advance('epoch');
    assert.deepEqual(a.network, b.network);
    // Y es la misma que trainEpoch con el orden de la época 1.
    const order = shuffledOrder(data.length, randomFor(9, 1));
    assert.deepEqual(trainEpoch(net([3, 2], activation), data, order, 0.3), b.network);
    // Mezcla de tamaños en la segunda época.
    const sizes = ['neuron', 'layer', 'phase', 'example'];
    let k = 0;
    while (a.epoch === 1) a.advance(sizes[k++ % sizes.length]);
    b.advance('epoch');
    assert.deepEqual(a.network, b.network);
    assert.equal(a.history.length, 2);
    assert.deepEqual(a.history, b.history);
  }
});

test('una época a medio hacer de a una época se completa', () => {
  const data = pointsDataset({ count: 20, seed: 4 }).examples;
  const a = createLearningRun({ network: net(), practice: data, rate: 0.2 });
  const b = createLearningRun({ network: net(), practice: data, rate: 0.2 });
  for (let k = 0; k < 7; k++) a.advance('example');
  a.advance('neuron');
  a.advance('epoch');
  b.advance('epoch');
  assert.equal(a.epoch, 1);
  assert.deepEqual(a.network, b.network);
  assert.equal(a.active, null);
});

test('la red que se ve durante la corrección tiene los pesos nuevos solo de las neuronas corregidas', () => {
  const data = pointsDataset({ count: 20, seed: 4 }).examples;
  const run = createLearningRun({ network: net([3]), practice: data, rate: 0.5 });
  run.advance('phase'); run.advance('phase'); run.advance('phase');
  assert.equal(run.active.cursor.phase, 'update');
  const orig = run.active.original;
  assert.deepEqual(run.shownNetwork(), orig);
  run.advance('neuron'); // corrige la salida
  const shown = run.shownNetwork();
  assert.deepEqual(shown.layers[0], orig.layers[0]);
  assert.notDeepEqual(shown.layers[1], orig.layers[1]);
});

test('la tasa se aplica desde el ejemplo siguiente', () => {
  const data = pointsDataset({ count: 20, seed: 4 }).examples;
  const a = createLearningRun({ network: net(), practice: data, rate: 0.2 });
  const b = createLearningRun({ network: net(), practice: data, rate: 0.2 });
  a.advance('neuron');
  a.rate = 0.9; // el ejemplo a medio hacer termina con 0,2
  a.advance('example');
  b.advance('example');
  assert.deepEqual(a.network, b.network);
});

test('historial: error y aciertos de práctica y apartados en cada época', () => {
  const data = pointsDataset({ count: 60, seed: 4 });
  const split = splitDataset(data, { holdout: 30, seed: 1 });
  const run = createLearningRun({ network: net([4]), practice: split.practice, heldOut: split.heldOut, rate: 0.3 });
  run.runEpochs(3);
  assert.equal(run.history.length, 3);
  assert.equal(run.history[2].epoch, 3);
  assert.equal(run.history[0].practice.count, 42);
  assert.equal(run.history[0].heldOut.count, 18);
});

test('sin navegador: funciona sin DOM (el núcleo no lo usa)', () => {
  assert.equal(typeof globalThis.document, 'undefined');
  const run = createLearningRun({ network: net(), practice: pointsDataset({ count: 20 }).examples, rate: 0.3 });
  run.runEpochs(2);
  assert.equal(run.epoch, 2);
});

// --- Sobreajuste -------------------------------------------------------------------------------------
const hist = (held, practice = held.map((_, k) => 1 - k * 0.01)) => held.map((h, k) => ({ epoch: k + 1, practice: { loss: practice[k] }, heldOut: { loss: h } }));

test('sobreajuste: sin aviso si los dos errores bajan juntos', () => {
  const h = hist(Array.from({ length: 60 }, (_, k) => 1 - k * 0.01));
  assert.equal(overfitting(h).warning, false);
});

test('sobreajuste: aviso cuando los apartados suben 10 épocas seguidas más de un 10 % y la práctica baja', () => {
  const held = Array.from({ length: 40 }, (_, k) => (k < 20 ? 1 - k * 0.02 : 0.62 + (k - 19) * 0.02));
  const r = overfitting(hist(held));
  assert.equal(r.bestEpoch, 20);
  assert.equal(r.warning, true);
  // No antes de la época 20.
  const early = overfitting(hist(held.slice(0, 20)));
  assert.equal(early.warning, false);
  // Si la práctica no bajó desde el mínimo, no avisa.
  const flat = overfitting(hist(held, held.map(() => 1)));
  assert.equal(flat.warning, false);
  assert.equal(OVERFIT_RULE.run, 10);
});

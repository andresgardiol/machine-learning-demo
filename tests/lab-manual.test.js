import test from 'node:test';
import assert from 'node:assert/strict';
import { createNetwork, copyNetwork, computeNetwork } from '../src/core/network.js';
import { createRandom } from '../src/core/random.js';
import {
  forwardSoft, backward, corrections, exampleError, learnExample, bakeOff, LEARNING_ACTIVATIONS, forwardValues,
} from '../src/core/backprop.js';
import { createLearningRun } from '../src/core/learning-cursor.js';
import { pointsDataset, splitDataset, evaluatedRows, filterRows } from '../src/core/datasets.js';
import { createManualChanges, UNDO_LIMIT } from '../src/tabs/lab/manual-changes.js';

const net = (hidden, activation = 'tanh', seed = 3, inputs = 3, outputs = 2) => createNetwork({ inputs, hidden, outputs, activation, random: createRandom(seed) });
function offFor(n) {
  return {
    offNeurons: n.sizes.map((k) => new Array(k).fill(false)),
    offConnections: n.sizes.map((k, l) => (l === 0 ? [] : Array.from({ length: k }, () => new Array(n.sizes[l - 1]).fill(false)))),
  };
}

// --- 11.1 Aprender con partes apagadas -----------------------------------------------------------------
test('neurona oculta apagada: vale cero, culpa cero, y no cambian sus pesos de entrada, su sesgo ni los de salida', () => {
  const n = net([4, 3]);
  const off = offFor(n);
  off.offNeurons[1][2] = true;
  const f = forwardSoft(n, [0.3, -0.5, 0.8], off);
  assert.equal(f.values[1][2], 0);
  assert.equal(f.trace.layers[1].neurons[2].off, true);
  const b = backward(n, f, [1, 0], off);
  assert.equal(b.deltas[1][2], 0);
  const c = corrections(n, f, b.deltas, 0.5, off);
  c.weights[1][2].forEach((w) => assert.equal(w.after, w.before));
  assert.equal(c.biases[1][2].after, c.biases[1][2].before);
  c.weights[2].forEach((row) => assert.equal(row[2].after, row[2].before));
});

test('entrada apagada: la red calcula como si valiera cero y los pesos que salen de ella no cambian', () => {
  const n = net([4]);
  const off = offFor(n);
  off.offNeurons[0][1] = true;
  const a = forwardSoft(n, [0.3, -0.5, 0.8], off).outputs;
  const b = forwardSoft(n, [0.3, 0, 0.8]).outputs;
  assert.deepEqual(a, b);
  const f = forwardSoft(n, [0.3, -0.5, 0.8], off);
  const c = corrections(n, f, backward(n, f, [1, 0], off).deltas, 0.5, off);
  c.weights[1].forEach((row) => assert.equal(row[1].after, row[1].before));
});

test('conexión apagada: no aporta, no lleva culpa hacia atrás y su peso no cambia', () => {
  const n = net([4]);
  const off = offFor(n);
  off.offConnections[2][0][1] = true; // de la oculta 1 a la salida 0
  const f = forwardSoft(n, [0.3, -0.5, 0.8], off);
  assert.equal(f.trace.layers[2].neurons[0].products[1], 0);
  const b = backward(n, f, [1, 0], off);
  assert.equal(b.terms[1][1].parts[0].product, 0);
  const c = corrections(n, f, b.deltas, 0.5, off);
  assert.equal(c.weights[2][0][1].after, c.weights[2][0][1].before);
});

test('salida apagada: se rechaza con un error que lo dice', () => {
  const n = net([4]);
  const off = offFor(n);
  off.offNeurons[2][0] = true;
  assert.throws(() => forwardSoft(n, [0, 0, 0], off), (e) => e.code === 'outputOff');
});

test('con partes apagadas, la corrección coincide con las diferencias finitas (tres activaciones, de 0 a 3 capas)', () => {
  const h = 1e-6;
  let checked = 0;
  for (const activation of LEARNING_ACTIVATIONS) {
    for (const hidden of [[], [4], [5, 3], [3, 4, 2]]) {
      const n = net(hidden, activation, 21 + hidden.length);
      const off = offFor(n);
      off.offNeurons[0][1] = true; // una entrada
      if (hidden.length > 0) off.offNeurons[1][0] = true; // una oculta
      off.offConnections[n.sizes.length - 1][1][0] = true; // una conexión a la salida
      const inputs = [0.42, -0.31, 0.77];
      const targets = [1, 0];
      const lossOf = () => exampleError(forwardSoft(n, inputs, off).outputs, targets).loss;
      const f = forwardSoft(n, inputs, off);
      const c = corrections(n, f, backward(n, f, targets, off).deltas, 1, off);
      for (let l = 1; l < n.sizes.length; l++) {
        const layer = n.layers[l - 1];
        for (let j = 0; j < layer.biases.length; j++) {
          const params = layer.weights[j].map((_, i) => ({ get: () => layer.weights[j][i], set: (v) => { layer.weights[j][i] = v; }, item: c.weights[l][j][i] }));
          params.push({ get: () => layer.biases[j], set: (v) => { layer.biases[j] = v; }, item: c.biases[l][j] });
          for (const p of params) {
            if (p.item.off) continue; // lo apagado no se corrige
            const v = p.get();
            p.set(v + h); const up = lossOf();
            p.set(v - h); const down = lossOf();
            p.set(v);
            const numeric = (up - down) / (2 * h);
            const analytic = -p.item.change;
            const scale = Math.max(Math.abs(numeric), Math.abs(analytic));
            const rel = scale < 1e-7 ? Math.abs(numeric - analytic) : Math.abs(numeric - analytic) / scale;
            assert.ok(rel < 1e-3, `${activation} ${hidden} l${l} j${j}: ${analytic} vs ${numeric}`);
            checked += 1;
          }
        }
      }
    }
  }
  assert.ok(checked > 150, String(checked));
});

test('sin nada apagado: cada valor, culpa y corrección es idéntico bit a bit', () => {
  for (const activation of LEARNING_ACTIVATIONS) {
    const n = net([5, 3], activation, 7);
    const inputs = [0.2, -0.9, 0.4];
    const a = forwardSoft(n, inputs);
    const b = forwardSoft(n, inputs, offFor(n));
    assert.deepEqual(b.values, a.values);
    assert.deepEqual(b.totals, a.totals);
    const ba = backward(n, a, [1, 0]);
    const bb = backward(n, b, [1, 0], offFor(n));
    assert.deepEqual(bb.deltas, ba.deltas);
    const ca = corrections(n, a, ba.deltas, 0.3);
    const cb = corrections(n, b, bb.deltas, 0.3, offFor(n));
    assert.deepEqual(cb.weights.map((L) => L && L.map((r) => r.map((w) => w.after))), ca.weights.map((L) => L && L.map((r) => r.map((w) => w.after))));
    const x = copyNetwork(n); const y = copyNetwork(n);
    learnExample(x, inputs, [1, 0], 0.3);
    learnExample(y, inputs, [1, 0], 0.3, offFor(n));
    assert.deepEqual(y, x);
  }
});

// --- 11.2 Cambios a mano durante el aprendizaje -----------------------------------------------------
const data = () => { const d = pointsDataset({ count: 40, seed: 2 }); const s = splitDataset(d, { holdout: 30 }); return { d, s }; };
const runFor = () => { const { s } = data(); return createLearningRun({ network: createNetwork({ inputs: 2, hidden: [4], outputs: 1, activation: 'tanh', random: createRandom(1) }), practice: s.practice, heldOut: s.heldOut, rate: 0.3, seed: 1 }); };

test('cambio entre dos ejemplos: el siguiente se calcula y se corrige con el peso nuevo', () => {
  const run = runFor();
  run.advance('example');
  assert.ok(run.setWeight(1, 0, 0, 2.5));
  run.advance('phase');
  assert.equal(run.active.detail.forward.trace.layers[1].neurons[0].weights[0], 2.5);
});

test('cambio a mitad de un ejemplo: vuelve a la ida con el peso nuevo y no se aplica la corrección anterior', () => {
  const run = runFor();
  run.advance('phase'); run.advance('phase'); run.advance('phase'); // en la vuelta... ya hecha
  const before = run.active.example;
  run.setWeight(2, 0, 1, -1.5);
  assert.equal(run.active.example, before);
  assert.equal(run.active.cursor.count, 0);
  assert.ok(run.active.restarted);
  assert.equal(run.network.layers[1].weights[0][1], -1.5); // la red tiene el cambio y nada más
  run.advance('example');
  assert.notEqual(run.network.layers[1].weights[0][1], -1.5); // ahora sí, corregida desde el valor nuevo
});

test('volver a una copia: pesos y apagado de la copia; la época y la historia siguen', () => {
  const run = runFor();
  run.runEpochs(3);
  const snap = run.snapshot();
  run.setWeight(1, 1, 0, 3);
  run.setOff({ kind: 'neuron', layer: 1, neuron: 2 }, true);
  run.runEpochs(10);
  run.restore(snap);
  assert.deepEqual(run.network, snap.network);
  assert.equal(run.off, null);
  assert.equal(run.epoch, 13);
  assert.equal(run.history.length, 13);
});

test('valor que no es un número: se rechaza y la red no cambia; la salida no se apaga', () => {
  const run = runFor();
  const before = JSON.stringify(run.network);
  assert.equal(run.setWeight(1, 0, 0, Number.NaN), false);
  assert.equal(run.setBias(1, 0, Infinity), false);
  assert.equal(JSON.stringify(run.network), before);
  assert.throws(() => run.setOff({ kind: 'neuron', layer: 2, neuron: 0 }, true));
});

test('mismos cambios en los mismos momentos: misma red y misma historia', () => {
  const go = () => {
    const run = runFor();
    run.runEpochs(2);
    run.setWeight(1, 0, 1, 1.25);
    run.setOff({ kind: 'connection', layer: 2, neuron: 0, input: 3 }, true);
    run.advance('neuron'); run.advance('phase');
    run.setBias(1, 3, -0.5);
    run.runEpochs(4);
    return { net: run.network, hist: run.history };
  };
  assert.deepEqual(go(), go());
});

test('apagado durante el aprendizaje: lo apagado no se corrige; encender devuelve los pesos de antes', () => {
  const run = runFor();
  run.setOff({ kind: 'neuron', layer: 1, neuron: 1 }, true);
  const w = JSON.stringify(run.network.layers[0].weights[1]);
  const b = run.network.layers[0].biases[1];
  run.runEpochs(3);
  assert.equal(JSON.stringify(run.network.layers[0].weights[1]), w);
  assert.equal(run.network.layers[0].biases[1], b);
  run.setOff({ kind: 'neuron', layer: 1, neuron: 1 }, false);
  assert.equal(run.off, null);
  run.runEpochs(1);
  assert.notEqual(JSON.stringify(run.network.layers[0].weights[1]), w);
});

test('paso a paso igual que de corrido, también con partes apagadas', () => {
  const a = runFor(); const b = runFor();
  for (const r of [a, b]) r.setOff({ kind: 'connection', layer: 1, neuron: 0, input: 1 }, true);
  while (a.epoch === 0) a.advance('neuron');
  b.advance('epoch');
  assert.deepEqual(a.network, b.network);
});

// --- 11.3 Ejemplos evaluados ---------------------------------------------------------------------
test('ejemplos evaluados: acertado si contesta del lado correcto; el resumen coincide con la historia', () => {
  const { d, s } = data();
  const run = createLearningRun({ network: createNetwork({ inputs: 2, hidden: [4], outputs: 1, activation: 'tanh', random: createRandom(1) }), practice: s.practice, heldOut: s.heldOut, rate: 0.3, seed: 1 });
  run.runEpochs(5);
  const { rows, summary } = evaluatedRows(run.network, d.examples, s.held);
  const last = run.history.at(-1);
  assert.equal(summary.practice.correct, last.practice.correct);
  assert.equal(summary.heldOut.correct, last.heldOut.correct);
  assert.equal(summary.correct, last.practice.correct + last.heldOut.correct);
  for (const r of rows) assert.equal(r.correct, (r.outputs[0] > 0.5) === (r.targets[0] === 1));
});

test('manejo: tres de cuatro controles coinciden → fallado, con el control que no', () => {
  const n = createNetwork({ inputs: 2, hidden: [], outputs: 4, activation: 'tanh', random: createRandom(1) });
  const out = forwardValues(n, [0.1, 0.2]).outputs.map((y) => (y > 0.5 ? 1 : 0));
  const targets = out.slice();
  targets[2] = 1 - targets[2];
  const { rows } = evaluatedRows(n, [{ inputs: [0.1, 0.2], targets }], [false]);
  assert.equal(rows[0].correct, false);
  assert.deepEqual(rows[0].mismatched, [2]);
});

test('filtro: solo los apartados que falla, con su número original; con partes apagadas cambia la respuesta', () => {
  const { d, s } = data();
  const n = createNetwork({ inputs: 2, hidden: [4], outputs: 1, activation: 'tanh', random: createRandom(1) });
  const { rows } = evaluatedRows(n, d.examples, s.held);
  const f = filterRows(rows, { failing: true, group: 'heldOut' });
  assert.ok(f.every((r) => !r.correct && r.group === 'heldOut' && s.held[r.index]));
  assert.deepEqual(filterRows(rows, {}), rows);
  const off = offFor(n);
  off.offNeurons[1][0] = true;
  const withOff = evaluatedRows(n, d.examples, s.held, off).rows;
  assert.deepEqual(withOff[0].outputs, forwardValues(n, d.examples[0].inputs, off).outputs);
});

// --- 11.4 Pila de cambios a mano ------------------------------------------------------------------
test('pila de cambios: un arrastre es uno, deshacer, restablecer, vaciar y el tope de 50', () => {
  const m = createManualChanges();
  m.record('s0', { gesture: 'w:1:0:0' });
  m.record('s0b', { gesture: 'w:1:0:0' }); // mismo arrastre
  m.end();
  assert.equal(m.count, 1);
  m.record('s1'); m.record('s2'); m.record('s3');
  assert.equal(m.count, 4);
  assert.equal(m.undo(), 's3');
  assert.equal(m.undo(), 's2');
  assert.equal(m.count, 2);
  assert.equal(m.reset(), 's0');
  assert.equal(m.count, 0);
  assert.equal(m.undo(), null);
  for (let k = 0; k < 60; k++) m.record(`x${k}`);
  assert.equal(m.undoable, UNDO_LIMIT);
  for (let k = 0; k < UNDO_LIMIT; k++) m.undo();
  assert.equal(m.canUndo, false);
  assert.equal(m.reset(), 'x0');
  m.record('y'); m.clear();
  assert.equal(m.count, 0);
});

// --- 11.5 Guardar con partes apagadas ----------------------------------------------------------
test('guardar con partes apagadas: el cerebro (pesos en cero) decide igual que la red del Laboratorio', () => {
  for (const activation of LEARNING_ACTIVATIONS) {
    const n = createNetwork({ inputs: 6, hidden: [5, 4], outputs: 4, activation, random: createRandom(4) });
    const off = offFor(n);
    off.offNeurons[0][2] = true;
    off.offNeurons[1][3] = true;
    off.offNeurons[2][1] = true;
    off.offConnections[3][0][2] = true;
    const baked = bakeOff(n, off);
    const r = createRandom(8);
    for (let k = 0; k < 500; k++) {
      const x = Array.from({ length: 6 }, () => r() * 2 - 1);
      const soft = forwardValues(n, x, off).outputs.map((y) => (y > 0.5 ? 1 : 0));
      assert.deepEqual(computeNetwork(baked, x), soft);
    }
  }
});

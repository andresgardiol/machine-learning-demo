import test from 'node:test';
import assert from 'node:assert/strict';
import { createNetwork, computeNetwork, copyNetwork } from '../src/core/network.js';
import { createRandom } from '../src/core/random.js';
import {
  forwardSoft, exampleError, backward, corrections, applyCorrections, learnExample, evaluate, trainEpoch,
  shuffledOrder, isCorrect, outputLoss, LEARNING_ACTIVATIONS,
} from '../src/core/backprop.js';

const net = (hidden, activation = 'tanh', seed = 3, inputs = 2, outputs = 1) => createNetwork({ inputs, hidden, outputs, activation, random: createRandom(seed) });

/** Red a mano: una entrada, una oculta, una salida. */
function tiny({ w1 = 0.5, b1 = 0, w2 = 0.5, b2 = 0, activation = 'tanh' } = {}) {
  return { sizes: [1, 1, 1], activation, layers: [{ weights: [[w1]], biases: [b1] }, { weights: [[w2]], biases: [b2] }] };
}

// --- Respuesta suave ------------------------------------------------------------------------------
test('respuesta suave: mayor que 0,5 exactamente cuando la red dice sí al manejar (mil entradas)', () => {
  for (const activation of LEARNING_ACTIVATIONS) {
    const n = net([6], activation, 11, 6, 4);
    const r = createRandom(99);
    for (let k = 0; k < 1000; k++) {
      const inputs = Array.from({ length: 6 }, () => r() * 2 - 1);
      const soft = forwardSoft(n, inputs).outputs;
      const hard = computeNetwork(n, inputs);
      soft.forEach((y, i) => assert.equal(y > 0.5, hard[i] === 1));
    }
  }
});

test('respuesta suave: el escalón se rechaza con un error que lo explica', () => {
  const n = net([3], 'step');
  assert.throws(() => forwardSoft(n, [0, 0]), (e) => e.code === 'noSlope' && e.details.activation === 'step');
  assert.throws(() => learnExample(n, [0, 0], [1], 0.1));
});

test('respuesta suave: la red no cambia', () => {
  const n = net([4, 3]);
  const before = JSON.stringify(n);
  forwardSoft(n, [0.3, -0.2]);
  assert.equal(JSON.stringify(n), before);
});

test('respuesta suave: la cuenta tiene la forma de traceNetwork con la salida en sigmoide', () => {
  const f = forwardSoft(net([4]), [0.3, -0.2]);
  assert.equal(f.trace.layers.length, 3);
  assert.equal(f.trace.layers[2].neurons[0].activation, 'sigmoid');
  assert.equal(f.trace.layers[1].neurons[0].activation, 'tanh');
  assert.equal(f.trace.layers[1].neurons.length, 4);
});

// --- Error de un ejemplo ---------------------------------------------------------------------------
test('error: acierto da error chico', () => {
  const e = exampleError([0.98], [1]);
  assert.ok(Math.abs(e.errors[0] - -0.02) < 1e-12);
  assert.ok(e.loss < 0.03);
});

test('error: equivocada y segura pesa mucho más que dudosa', () => {
  const sure = exampleError([0.98], [0]);
  const unsure = exampleError([0.6], [0]);
  assert.ok(Math.abs(sure.errors[0] - 0.98) < 1e-12);
  assert.ok(sure.loss > 3 * unsure.loss);
  assert.equal(outputLoss(1, 1) < 1e-9, true);
});

// --- Culpa ----------------------------------------------------------------------------------------
test('culpa de una salida: su error', () => {
  // Salida que contesta 0,8: total = ln(4).
  const n = tiny({ w1: 0, b1: 0, w2: 0, b2: Math.log(4) });
  const f = forwardSoft(n, [0]);
  assert.ok(Math.abs(f.outputs[0] - 0.8) < 1e-12);
  const b = backward(n, f, [0]);
  assert.ok(Math.abs(b.deltas[2][0] - 0.8) < 1e-12);
});

test('culpa de una neurona oculta con tanh: 0,8 × 0,5 × 0,64 = 0,256', () => {
  // Oculta que toma 0,6 (total atanh(0,6)), peso 0,5 a una salida que contesta 0,8 con correcta 0.
  const n = tiny({ w1: 0, b1: Math.atanh(0.6), w2: 0.5, b2: Math.log(4) - 0.5 * 0.6 });
  const f = forwardSoft(n, [0]);
  assert.ok(Math.abs(f.values[1][0] - 0.6) < 1e-12);
  assert.ok(Math.abs(f.outputs[0] - 0.8) < 1e-12);
  const b = backward(n, f, [0]);
  const term = b.terms[1][0];
  assert.ok(Math.abs(term.slope - 0.64) < 1e-12);
  assert.ok(Math.abs(term.sum - 0.4) < 1e-12);
  assert.ok(Math.abs(b.deltas[1][0] - 0.256) < 1e-12);
  assert.equal(term.parts.length, 1);
  assert.ok(Math.abs(term.parts[0].blame - 0.8) < 1e-12);
  assert.equal(term.parts[0].weight, 0.5);
});

test('culpa: una neurona con ReLU que quedó en cero no tiene culpa ni cambian sus pesos de entrada', () => {
  const n = tiny({ w1: 1, b1: -5, w2: 0.7, b2: 0.1, activation: 'relu' });
  const f = forwardSoft(n, [0.4]);
  assert.equal(f.values[1][0], 0);
  const b = backward(n, f, [1]);
  assert.equal(b.deltas[1][0] === 0, true);
  const c = corrections(n, f, b.deltas, 0.5);
  assert.equal(c.weights[1][0][0].change === 0, true);
  assert.equal(c.weights[1][0][0].after, 1);
  assert.equal(c.biases[1][0].after, -5);
});

// --- Corrección ------------------------------------------------------------------------------------
test('corregir un peso: 0,62 − 0,3 × 0,2 × 0,5 = 0,59', () => {
  // Salida con culpa 0,2: contesta 0,2 con correcta 0; la conexión trae 0,5 (la oculta vale 0,5).
  const h = Math.atanh(0.5);
  const n = tiny({ w1: 0, b1: h, w2: 0.62, b2: Math.log(0.25) - 0.62 * 0.5 });
  const f = forwardSoft(n, [0]);
  assert.ok(Math.abs(f.outputs[0] - 0.2) < 1e-12);
  const b = backward(n, f, [0]);
  const c = corrections(n, f, b.deltas, 0.3);
  const w = c.weights[2][0][0];
  assert.ok(Math.abs(w.change - -0.03) < 1e-12);
  assert.ok(Math.abs(w.after - 0.59) < 1e-12);
  assert.equal(w.before, 0.62);
  assert.ok(Math.abs(w.input - 0.5) < 1e-12);
});

test('corrección: con la entrada en cero el peso no cambia; con tasa cero ninguno cambia', () => {
  const n = tiny({ w1: 0.9, b1: 0.2 });
  const f = forwardSoft(n, [0]);
  const b = backward(n, f, [1]);
  const c = corrections(n, f, b.deltas, 0.5);
  assert.equal(c.weights[1][0][0].after, 0.9);
  const big = net([4, 3]);
  const f2 = forwardSoft(big, [0.3, 0.7]);
  const c0 = corrections(big, f2, backward(big, f2, [1]).deltas, 0);
  assert.deepEqual(applyCorrections(big, c0), copyNetwork(big));
});

test('corrección: ver sin aplicar no cambia la red', () => {
  const n = net([4]);
  const before = JSON.stringify(n);
  const f = forwardSoft(n, [0.3, 0.7]);
  const c = corrections(n, f, backward(n, f, [1]).deltas, 0.5);
  applyCorrections(n, c);
  assert.equal(JSON.stringify(n), before);
});

// --- La corrección achica el error -----------------------------------------------------------------
function lossOf(n, inputs, targets) {
  return exampleError(forwardSoft(n, inputs).outputs, targets).loss;
}

test('comprobación con diferencias finitas: peso por peso, de 0 a 3 capas y con las tres activaciones', () => {
  const shapes = [[], [4], [5, 3], [3, 4, 2]];
  const h = 1e-6;
  let checked = 0;
  let worst = 0;
  for (const activation of LEARNING_ACTIVATIONS) {
    for (const hidden of shapes) {
      for (const outputs of [1, 4]) {
        const n = net(hidden, activation, 17 + hidden.length, 3, outputs);
        const inputs = [0.42, -0.31, 0.77];
        const targets = Array.from({ length: outputs }, (_, k) => (k % 2 === 0 ? 1 : 0));
        const f = forwardSoft(n, inputs);
        const b = backward(n, f, targets);
        const rate = 1; // la corrección es −gradiente
        const c = corrections(n, f, b.deltas, rate);
        for (let l = 1; l < n.sizes.length; l++) {
          const layer = n.layers[l - 1];
          for (let j = 0; j < layer.biases.length; j++) {
            const params = layer.weights[j].map((_, i) => ({ get: () => layer.weights[j][i], set: (v) => { layer.weights[j][i] = v; }, analytic: -c.weights[l][j][i].change }));
            params.push({ get: () => layer.biases[j], set: (v) => { layer.biases[j] = v; }, analytic: -c.biases[l][j].change });
            for (const p of params) {
              // ReLU: si el total queda casi en 0 la derivada no existe; no pasa con estas semillas.
              const v = p.get();
              p.set(v + h); const up = lossOf(n, inputs, targets);
              p.set(v - h); const down = lossOf(n, inputs, targets);
              p.set(v);
              const numeric = (up - down) / (2 * h);
              const scale = Math.max(Math.abs(numeric), Math.abs(p.analytic));
              const rel = scale < 1e-7 ? Math.abs(numeric - p.analytic) : Math.abs(numeric - p.analytic) / scale;
              worst = Math.max(worst, rel);
              assert.ok(rel < 1e-3, `${activation} ${hidden} l${l} j${j}: analítica ${p.analytic} numérica ${numeric}`);
              checked += 1;
            }
          }
        }
      }
    }
  }
  assert.ok(checked > 300, `pesos comprobados: ${checked}`);
  assert.ok(worst < 1e-3, `peor diferencia relativa ${worst}`);
});

test('un paso con tasa chica mejora el error del ejemplo', () => {
  for (const activation of LEARNING_ACTIVATIONS) {
    const n = net([4, 3], activation, 5);
    const inputs = [0.5, -0.4];
    const before = lossOf(n, inputs, [1]);
    const f = forwardSoft(n, inputs);
    const after = lossOf(applyCorrections(n, corrections(n, f, backward(n, f, [1]).deltas, 0.01)), inputs, [1]);
    assert.ok(after < before, `${activation}: ${after} < ${before}`);
  }
});

test('de corrido y paso a paso dan la misma red bit a bit', () => {
  for (const activation of LEARNING_ACTIVATIONS) {
    const n = net([5, 3], activation, 8);
    const ex = { inputs: [0.2, -0.9], targets: [1] };
    const f = forwardSoft(n, ex.inputs);
    const detailed = applyCorrections(n, corrections(n, f, backward(n, f, ex.targets).deltas, 0.3));
    const fast = copyNetwork(n);
    learnExample(fast, ex.inputs, ex.targets, 0.3);
    assert.deepEqual(fast, detailed);
  }
});

// --- Una época ------------------------------------------------------------------------------------
function someData(n, seed) {
  const r = createRandom(seed);
  return Array.from({ length: n }, () => { const x = r() * 2 - 1; const y = r() * 2 - 1; return { inputs: [x, y], targets: [x * x + y * y < 0.4 ? 1 : 0] }; });
}

test('época: orden reproducible, misma red peso por peso', () => {
  const data = someData(60, 4);
  let a = net([4]);
  let b = net([4]);
  for (let e = 1; e <= 5; e++) {
    a = trainEpoch(a, data, shuffledOrder(data.length, createRandom(100 + e)), 0.3);
    b = trainEpoch(b, data, shuffledOrder(data.length, createRandom(100 + e)), 0.3);
    assert.deepEqual(a, b);
  }
});

test('época: los apartados no enseñan', () => {
  const data = someData(60, 4);
  const order = shuffledOrder(data.length, createRandom(1));
  const a = trainEpoch(net([4]), data, order, 0.3);
  const b = trainEpoch(net([4]), data, order, 0.3);
  assert.deepEqual(a, b);
  // La evaluación sobre otros apartados no cambia la red.
  const before = JSON.stringify(a);
  evaluate(a, someData(30, 9));
  assert.equal(JSON.stringify(a), before);
});

test('época: un ejemplo es acierto si todas las salidas quedan del lado correcto de 0,5', () => {
  assert.equal(isCorrect([0.7, 0.2, 0.9, 0.1], [1, 0, 1, 0]), true);
  assert.equal(isCorrect([0.7, 0.6, 0.9, 0.1], [1, 0, 1, 0]), false);
  const ev = evaluate(net([4]), someData(40, 2));
  assert.equal(ev.count, 40);
  assert.equal(ev.accuracy, ev.correct / 40);
  assert.ok(Number.isFinite(ev.loss));
});

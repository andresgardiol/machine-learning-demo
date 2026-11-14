import test from 'node:test';
import assert from 'node:assert/strict';
import { createNetwork, computeNetwork, copyNetwork, ACTIVATIONS } from '../src/core/network.js';
import { createRandom } from '../src/core/random.js';
import { traceNetwork, createTraceController } from '../src/core/network-trace.js';
import { createChanges, applyChanges } from '../src/core/network-changes.js';
import { createPassCursor } from '../src/core/pass-cursor.js';

const close = (a, b, eps = 1e-12) => assert.ok(Math.abs(a - b) < eps, `${a} ≈ ${b}`);

/** Red de una neurona oculta con dos entradas: pesos 0,4 y −0,2, sesgo 0,1. */
const oneNeuron = (activation = 'tanh') => ({
  sizes: [2, 1, 1],
  activation,
  layers: [
    { weights: [[0.4, -0.2]], biases: [0.1] },
    { weights: [[1]], biases: [0] },
  ],
});

// --- Cuenta desglosada ------------------------------------------------------------------------

test('una neurona: productos 0,2 y −0,2, suma 0, sesgo 0,1 y total 0,1', () => {
  const t = traceNetwork(oneNeuron(), [0.5, 1]);
  const n = t.layers[1].neurons[0];
  close(n.products[0], 0.2);
  close(n.products[1], -0.2);
  close(n.sum, 0);
  assert.equal(n.bias, 0.1);
  close(n.total, 0.1);
  assert.equal(n.activation, 'tanh');
  close(n.output, Math.tanh(n.total));
  assert.deepEqual(n.from, [0.5, 1]);
  assert.deepEqual(n.weights, [0.4, -0.2]);
});

test('igual que al manejar: bit a bit con computeNetwork en mil entradas, con las cuatro activaciones', () => {
  for (const activation of ACTIVATIONS) {
    const random = createRandom(7);
    const net = createNetwork({ inputs: 21, hidden: [16, 16, 16], outputs: 4, activation, random });
    const inputsRandom = createRandom(99);
    for (let k = 0; k < 1000; k++) {
      const inputs = Array.from({ length: 21 }, () => inputsRandom() * 2 - 1);
      const t = traceNetwork(net, inputs);
      const expected = computeNetwork(net, inputs);
      assert.deepEqual(t.outputs, expected);
      for (let i = 0; i < expected.length; i++) assert.ok(Object.is(t.outputs[i], expected[i]));
    }
  }
});

test('los totales internos coinciden bit a bit con los de la red (también en las capas ocultas)', async () => {
  const { computeDetailed } = await import('../src/core/network.js');
  const net = createNetwork({ inputs: 6, hidden: [6, 5], outputs: 4, activation: 'sigmoid', random: createRandom(3) });
  const inputs = [0.1, 0.9, 0.3, 0, 1, 0.5];
  const d = computeDetailed(net, inputs);
  const t = traceNetwork(net, inputs);
  for (let l = 1; l < net.sizes.length; l++) {
    t.layers[l].neurons.forEach((n, j) => {
      assert.ok(Object.is(n.total, d.sums[l - 1][j]));
      assert.ok(Object.is(n.output, d.values[l][j]));
    });
  }
});

test('neurona de salida: activación escalón, salida 1 si el total es mayor que cero', () => {
  const net = oneNeuron();
  net.layers[1].biases = [0.5];
  const t = traceNetwork(net, [0, 0]);
  const out = t.layers[2].neurons[0];
  assert.equal(out.activation, 'step');
  assert.ok(out.total > 0);
  assert.equal(out.output, 1);
});

test('sin efectos: pedir la cuenta no cambia la red', () => {
  const net = createNetwork({ inputs: 6, hidden: [6], outputs: 4, random: createRandom(1) });
  const before = JSON.stringify(net);
  const changes = createChanges(net);
  changes.set({ kind: 'weight', layer: 1, neuron: 0, input: 0, value: 0.9 });
  traceNetwork(net, [1, 1, 1, 1, 1, 1]);
  traceNetwork(net, [1, 1, 1, 1, 1, 1], changes);
  assert.equal(JSON.stringify(net), before);
});

// --- Cambios de prueba ----------------------------------------------------------------------

test('peso cambiado: la cuenta usa −0,9 y la original sigue con 0,4', () => {
  const net = oneNeuron();
  const changes = createChanges(net);
  changes.set({ kind: 'weight', layer: 1, neuron: 0, input: 0, value: -0.9 });
  const n = traceNetwork(net, [0.5, 1], changes).layers[1].neurons[0];
  assert.equal(n.weights[0], -0.9);
  close(n.products[0], -0.45);
  assert.equal(net.layers[0].weights[0][0], 0.4);
});

test('sesgo cambiado: el total usa el sesgo nuevo', () => {
  const net = oneNeuron();
  const changes = createChanges(net);
  changes.set({ kind: 'bias', layer: 1, neuron: 0, value: -0.3 });
  const n = traceNetwork(net, [0.5, 1], changes).layers[1].neurons[0];
  assert.equal(n.bias, -0.3);
  close(n.total, -0.3);
});

test('conexión apagada: su producto vale 0 con cualquier entrada', () => {
  const net = oneNeuron();
  const changes = createChanges(net);
  changes.set({ kind: 'connectionOff', layer: 1, neuron: 0, input: 1 });
  for (const x of [0, 0.3, 1, -1]) {
    const n = traceNetwork(net, [0.5, x], changes).layers[1].neurons[0];
    assert.equal(n.products[1], 0);
    assert.equal(n.offConnections[1], true);
  }
});

test('neurona oculta apagada: su salida vale 0 con cualquier activación y las siguientes reciben 0', () => {
  for (const activation of ACTIVATIONS) {
    const net = createNetwork({ inputs: 3, hidden: [4], outputs: 4, activation, random: createRandom(5) });
    net.layers[0].biases[2] = 2; // encendida sin el apagado
    const changes = createChanges(net);
    changes.set({ kind: 'neuronOff', layer: 1, neuron: 2 });
    const t = traceNetwork(net, [1, 1, 1], changes);
    assert.equal(t.layers[1].neurons[2].output, 0);
    assert.equal(t.layers[1].neurons[2].off, true);
    for (const n of t.layers[2].neurons) {
      assert.equal(n.from[2], 0);
      assert.equal(n.products[2], 0);
    }
  }
});

test('salida apagada: la red nunca decide doblar a la izquierda', () => {
  const net = createNetwork({ inputs: 6, hidden: [6], outputs: 4, random: createRandom(2) });
  net.layers[1].biases[1] = 5; // sin el apagado, siempre doblaría
  const changes = createChanges(net);
  changes.set({ kind: 'neuronOff', layer: 2, neuron: 1 });
  const random = createRandom(4);
  for (let k = 0; k < 200; k++) {
    const t = traceNetwork(net, Array.from({ length: 6 }, () => random()), changes);
    assert.equal(t.outputs[1], 0);
  }
  const controller = createTraceController(net, 5, () => changes);
  assert.equal(controller.control({ sensors: [1, 1, 1, 1, 1], speed: 1 }).left, false);
});

test('entrada apagada: la red recibe 0 de ese sensor, vea lo que vea', () => {
  const net = createNetwork({ inputs: 6, hidden: [6], outputs: 4, random: createRandom(2) });
  const changes = createChanges(net);
  changes.set({ kind: 'neuronOff', layer: 0, neuron: 2 });
  for (const x of [0, 0.5, 1]) {
    const t = traceNetwork(net, [0.1, 0.2, x, 0.4, 0.5, 0.6], changes);
    assert.equal(t.layers[0].neurons[2].output, 0);
    assert.equal(t.layers[0].neurons[2].raw, x);
    for (const n of t.layers[1].neurons) assert.equal(n.from[2], 0);
  }
});

test('sin cambios: un conjunto vacío da las mismas salidas que la red original', () => {
  const net = createNetwork({ inputs: 21, hidden: [16, 16], outputs: 4, activation: 'relu', random: createRandom(8) });
  const changes = createChanges(net);
  const random = createRandom(10);
  for (let k = 0; k < 200; k++) {
    const inputs = Array.from({ length: 21 }, () => random());
    assert.deepEqual(traceNetwork(net, inputs, changes).outputs, computeNetwork(net, inputs));
  }
  const applied = applyChanges(net, []);
  assert.deepEqual(applied.network, copyNetwork(net));
});

test('el controlador de la pestaña maneja como el de la red sin cambios', async () => {
  const { createNetworkController } = await import('../src/core/brain.js');
  const net = createNetwork({ inputs: 6, hidden: [6], outputs: 4, random: createRandom(11) });
  const a = createNetworkController(net, 5);
  const b = createTraceController(net, 5);
  const random = createRandom(12);
  for (let k = 0; k < 300; k++) {
    const p = { sensors: Array.from({ length: 5 }, () => random()), speed: random() * 2 - 1 };
    assert.deepEqual(b.control(p), a.control(p));
  }
  assert.ok(b.lastTrace);
});

// --- Cambios que se deshacen ----------------------------------------------------------------

test('deshacer el último: el peso vuelve y la neurona sigue apagada', () => {
  const net = oneNeuron();
  const changes = createChanges(net);
  changes.set({ kind: 'neuronOff', layer: 1, neuron: 0 });
  changes.set({ kind: 'weight', layer: 1, neuron: 0, input: 0, value: 0.9 });
  changes.undo();
  assert.equal(changes.valueOf({ kind: 'weight', layer: 1, neuron: 0, input: 0 }), 0.4);
  assert.equal(changes.valueOf({ kind: 'neuronOff', layer: 1, neuron: 0 }), true);
  assert.equal(changes.count, 1);
});

test('mismo peso dos veces: un solo cambio, y deshacer vuelve al original, no a 0,2', () => {
  const net = oneNeuron();
  const changes = createChanges(net);
  changes.set({ kind: 'weight', layer: 1, neuron: 0, input: 0, value: 0.2 });
  changes.set({ kind: 'weight', layer: 1, neuron: 0, input: 0, value: 0.6 });
  assert.equal(changes.count, 1);
  assert.equal(changes.valueOf({ kind: 'weight', layer: 1, neuron: 0, input: 0 }), 0.6);
  changes.undo();
  assert.equal(changes.valueOf({ kind: 'weight', layer: 1, neuron: 0, input: 0 }), 0.4);
  assert.equal(changes.count, 0);
});

test('vaciar: la red resultante es igual a la original', () => {
  const net = createNetwork({ inputs: 6, hidden: [6], outputs: 4, random: createRandom(1) });
  const changes = createChanges(net);
  changes.set({ kind: 'weight', layer: 1, neuron: 1, input: 2, value: 0.7 });
  changes.set({ kind: 'connectionOff', layer: 2, neuron: 0, input: 3 });
  changes.set({ kind: 'neuronOff', layer: 1, neuron: 4 });
  changes.clear();
  assert.equal(changes.count, 0);
  const inputs = [0.2, 0.4, 0.6, 0.8, 1, 0.5];
  assert.deepEqual(traceNetwork(net, inputs, changes).outputs, computeNetwork(net, inputs));
});

test('volver al valor original deja de contar como cambio', () => {
  const net = oneNeuron();
  const changes = createChanges(net);
  changes.set({ kind: 'weight', layer: 1, neuron: 0, input: 1, value: 0.5 });
  assert.equal(changes.count, 1);
  changes.set({ kind: 'weight', layer: 1, neuron: 0, input: 1, value: -0.2 });
  assert.equal(changes.count, 0);
  changes.set({ kind: 'neuronOff', layer: 1, neuron: 0 });
  changes.set({ kind: 'neuronOff', layer: 1, neuron: 0, value: false });
  assert.equal(changes.count, 0);
});

test('cuatro cambios y cuatro deshacer: la red queda igual a la del cerebro', () => {
  const net = createNetwork({ inputs: 6, hidden: [6], outputs: 4, random: createRandom(1) });
  const changes = createChanges(net);
  changes.set({ kind: 'weight', layer: 1, neuron: 1, input: 2, value: 0.7 });
  changes.set({ kind: 'bias', layer: 2, neuron: 1, value: -0.7 });
  changes.set({ kind: 'connectionOff', layer: 2, neuron: 0, input: 3 });
  changes.set({ kind: 'neuronOff', layer: 0, neuron: 4 });
  for (let k = 0; k < 4; k++) assert.ok(changes.undo());
  assert.equal(changes.undo(), null);
  assert.deepEqual(changes.applied().network, copyNetwork(net));
});

test('un cambio fuera de la red se rechaza sin tocar la lista', () => {
  const net = oneNeuron();
  const changes = createChanges(net);
  assert.throws(() => changes.set({ kind: 'weight', layer: 1, neuron: 3, input: 0, value: 1 }));
  assert.throws(() => changes.set({ kind: 'bias', layer: 0, neuron: 0, value: 1 }));
  assert.throws(() => changes.set({ kind: 'weight', layer: 1, neuron: 0, input: 0, value: Number.NaN }));
  assert.equal(changes.count, 0);
});

// --- Cuenta reproducible y sin navegador ------------------------------------------------------

test('sin navegador: recorrer la cuenta entera termina y da las mismas salidas que la red', () => {
  assert.equal(typeof globalThis.document, 'undefined');
  const net = createNetwork({ inputs: 21, hidden: [16, 16, 16], outputs: 4, activation: 'tanh', random: createRandom(21) });
  const inputs = Array.from({ length: 21 }, (_, i) => i / 21);
  const cursor = createPassCursor(net);
  let guard = 0;
  while (!cursor.done && guard++ < 10_000) cursor.advance('operation');
  assert.ok(cursor.done);
  assert.equal(cursor.count, (16 * 3 + 4) * 4);
  assert.deepEqual(traceNetwork(net, inputs).outputs, computeNetwork(net, inputs));
});

test('reproducible: mismos datos, mismo resultado', () => {
  const net = createNetwork({ inputs: 6, hidden: [6], outputs: 4, activation: 'sigmoid', random: createRandom(1) });
  const changes = createChanges(net, [{ kind: 'weight', layer: 1, neuron: 0, input: 0, value: 0.3 }]);
  const a = traceNetwork(net, [0.1, 0.2, 0.3, 0.4, 0.5, 0.6], changes);
  const b = traceNetwork(net, [0.1, 0.2, 0.3, 0.4, 0.5, 0.6], changes);
  assert.deepEqual(JSON.parse(JSON.stringify(a)), JSON.parse(JSON.stringify(b)));
});

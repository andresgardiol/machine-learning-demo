// Sesión del Laboratorio por clase de datos (laboratorio-empieza-por-compuertas, grupo 2): el registro
// de cada clase, el arranque en pausa, los contadores de XOR y "a mano".
import test from 'node:test';
import assert from 'node:assert/strict';
import { createLabSession } from '../src/tabs/lab/session.js';
import { createLabPlayback, kindPlayback } from '../src/tabs/lab/playback.js';
import { KIND_DEFAULTS, XOR_EXPLAIN } from '../src/tabs/lab/defaults.js';
import { EXAMPLE_BRAINS } from '../src/data/example-brains.js';

const brainFor = (key) => EXAMPLE_BRAINS.find((b) => `example:${b.id}` === key) ?? null;
const session = () => createLabSession({ brainFor });
const zeros = (net) => net.layers.every((l) => l.weights.flat().every((w) => w === 0) && l.biases.every((b) => b === 0));
/** Un cambio a mano como lo hace la pestaña: copia de antes, cambio y registro. */
function manual(s, apply, gesture = null) {
  const snap = s.run.snapshot();
  if (apply()) s.recordManual(snap, { gesture });
}

// --- 2.1 Registro por clase ------------------------------------------------------------------------
test('abre con compuertas: AND, red 2 → 1 con pesos y sesgo en cero, 0 de 4, los cuatro de práctica', () => {
  const s = session();
  assert.equal(s.kind, 'gates');
  assert.equal(s.gate, 'and');
  assert.deepEqual(s.run.network.sizes, [2, 1]);
  assert.ok(zeros(s.run.network));
  assert.equal(s.score.correct, 0);
  assert.equal(s.split.practice.length, 4);
  assert.equal(s.split.heldOut.length, 0);
  assert.equal(s.settings.rate, KIND_DEFAULTS.gates.rate);
  assert.deepEqual(s.range, [-0.5, 1.5]);
});

test('volver a compuertas conserva pesos, cambios a mano y curva', () => {
  const s = session();
  manual(s, () => s.run.setWeight(1, 0, 0, 1));
  manual(s, () => s.run.setWeight(1, 0, 1, 1));
  manual(s, () => s.run.setBias(1, 0, -1.5));
  assert.equal(s.score.correct, 4);
  s.advance('epoch');
  const before = JSON.stringify(s.run.network);
  assert.ok(s.setKind('points'));
  s.run.runEpochs(5);
  assert.ok(s.setKind('gates'));
  assert.equal(JSON.stringify(s.run.network), before);
  assert.equal(s.manual.count, 3);
  assert.equal(s.run.history.length, 1);
});

test('primera vez en puntos: la red de siempre (una capa de 4, tanh, tasa 0,1) con los puntos en círculo', () => {
  const s = session();
  s.setKind('points');
  assert.deepEqual(s.run.network.sizes, [2, 4, 1]);
  assert.equal(s.run.network.activation, 'tanh');
  assert.equal(s.settings.rate, 0.1);
  assert.equal(s.data.shape, 'circle');
  assert.deepEqual(s.range, [-1, 1]);
  assert.ok(!zeros(s.run.network));
});

test('compuertas no le pasan la red a puntos: armar 2 → 2 → 1 en compuertas deja la red de siempre en puntos', () => {
  const s = session();
  s.setLayers(1);
  assert.deepEqual(s.run.network.sizes, [2, 2, 1], 'la capa nueva en compuertas tiene 2 neuronas');
  s.setKind('points');
  assert.deepEqual(s.run.network.sizes, [2, 4, 1]);
  s.setLayers(2);
  assert.deepEqual(s.run.network.sizes, [2, 4, 4, 1], 'en puntos, 4');
});

test('"Red de siempre" en compuertas: 2 → 1 con pesos y sesgo en cero y la tasa de las compuertas', () => {
  const s = session();
  s.setLayers(1);
  s.setActivation('relu');
  s.setRate(0.01);
  s.resetNetwork();
  assert.deepEqual(s.run.network.sizes, [2, 1]);
  assert.ok(zeros(s.run.network));
  assert.equal(s.settings.rate, KIND_DEFAULTS.gates.rate);
  assert.equal(s.settings.activation, 'tanh');
});

test('"Reiniciar pesos" en compuertas: en cero sin capa oculta; con capa oculta, pesos al azar de la serie', () => {
  const s = session();
  manual(s, () => s.run.setBias(1, 0, 1));
  s.resetWeights();
  assert.ok(zeros(s.run.network));
  assert.equal(s.manual.count, 0);
  s.setLayers(1);
  const a = JSON.stringify(s.run.network);
  assert.ok(!zeros(s.run.network));
  s.resetWeights();
  assert.notEqual(JSON.stringify(s.run.network), a);
  const t = session();
  t.resetWeights(); t.setLayers(1); t.resetWeights();
  assert.equal(JSON.stringify(t.run.network), JSON.stringify(s.run.network), 'la misma serie para todos');
});

test('cambiar de compuerta conserva pesos y cambios a mano, y vacía la curva', () => {
  const s = session();
  manual(s, () => s.run.setWeight(1, 0, 0, 1));
  manual(s, () => s.run.setWeight(1, 0, 1, 1));
  manual(s, () => s.run.setBias(1, 0, -1.5));
  s.run.runEpochs(3);
  const net = JSON.stringify(s.run.network);
  const v = s.version;
  assert.ok(s.setGate('or'));
  assert.equal(s.gate, 'or');
  assert.equal(JSON.stringify(s.run.network), net);
  assert.equal(s.run.history.length, 0);
  assert.equal(s.manual.count, 3);
  assert.ok(s.version > v);
  assert.equal(s.data.examples[1].targets[0], 1, 'los casos de OR');
  assert.ok(s.score.correct < 4 || s.score.correct === 4);
  s.resetGates();
  assert.equal(s.gate, 'and');
  assert.equal(JSON.stringify(s.run.network), net, 'restablecer los datos no toca la red');
});

// --- 2.2 Nada aprende sin pedirlo -----------------------------------------------------------------
test('la reproducción arranca en pausa; paso por defecto: neurona a 1 por segundo con compuertas, época con puntos y tu manejo', () => {
  const p = createLabPlayback(kindPlayback('gates'));
  assert.equal(p.playing, false);
  assert.equal(p.size, 'neuron');
  assert.equal(p.rate, 1);
  let n = 0;
  for (let k = 0; k < 120; k++) n += p.tick();
  assert.equal(n, 0, 'en pausa no da pasos');
  for (const kind of ['points', 'driving']) {
    p.apply(kindPlayback(kind));
    assert.equal(p.size, 'epoch');
    assert.equal(p.rate, 10);
    assert.equal(p.playing, false, 'cambiar de clase no pone a reproducir');
  }
  p.play();
  p.apply(kindPlayback('gates'));
  assert.equal(p.playing, true, 'si estaba reproduciendo, sigue');
});

test('nada aprende sin pedirlo: cambiar la clase, la compuerta, los datos o la red no avanza el aprendizaje', () => {
  const s = session();
  s.setGate('xor'); s.setLayers(1); s.setActivation('sigmoid');
  assert.equal(s.run.epoch, 0);
  assert.equal(s.run.active, null);
  s.setKind('points'); s.setPoints({ shape: 'spiral' }); s.setLayers(2);
  assert.equal(s.run.epoch, 0);
  s.setKind('driving');
  assert.equal(s.run.epoch, 0);
});

// --- 2.3 Contadores de XOR y "a mano" ------------------------------------------------------------
test(`XOR sin capas: ${XOR_EXPLAIN.changes} cambios a mano sin 4 de 4 activan la explicación`, () => {
  const s = session();
  s.setGate('xor');
  assert.deepEqual(s.xor, { changes: 0, epochs: 0, explain: false });
  for (let k = 1; k <= 5; k++) {
    manual(s, () => s.run.setWeight(1, 0, k % 2, k * 0.3), `g${k}`);
    assert.ok(s.score.correct <= 3);
    assert.equal(s.xor.explain, k >= 5, `con ${k} cambios`);
  }
  // Un arrastre entero cuenta como un cambio.
  const t = session();
  t.setGate('xor');
  for (let k = 0; k < 10; k++) manual(t, () => t.run.setBias(1, 0, k * 0.1 + 0.1), 'arrastre');
  assert.equal(t.xor.changes, 1);
});

test(`XOR sin capas: ${XOR_EXPLAIN.epochs} épocas sin 4 de 4 activan la explicación; con capa oculta no hay contador`, () => {
  const s = session();
  s.setGate('xor');
  for (let k = 0; k < 49; k++) s.advance('epoch');
  assert.equal(s.xor.explain, false);
  s.advance('epoch');
  assert.equal(s.xor.epochs, 50);
  assert.ok(s.score.correct <= 3);
  assert.equal(s.xor.explain, true);
  s.setLayers(1);
  assert.equal(s.xor, null);
  s.setLayers(0);
  assert.deepEqual(s.xor, { changes: 0, epochs: 0, explain: false }, 'volver a cero capas empieza a contar de nuevo');
});

test('"a mano": un paso del aprendizaje la apaga para esa compuerta; reiniciar pesos la vuelve a encender', () => {
  const s = session();
  assert.equal(s.handOnly, true);
  s.advance('neuron');
  assert.equal(s.handOnly, false);
  s.setGate('or');
  assert.equal(s.handOnly, true, 'OR no aprendió nada todavía');
  s.setGate('and');
  assert.equal(s.handOnly, false);
  s.resetWeights();
  assert.equal(s.handOnly, true);
  s.advance('epoch');
  assert.equal(s.handOnly, false);
  s.resetNetwork();
  assert.equal(s.handOnly, true);
});

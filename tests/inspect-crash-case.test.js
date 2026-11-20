// La decisión y la neurona que más aportó en el caso del choque de Inspeccionar (red-al-centro D5, tarea 4.3).
import test from 'node:test';
import assert from 'node:assert/strict';
import { decisionOf, topContributor, caseOf, nowLineOf, sameChangeList, CASE_FRAMES, CASE_START } from '../src/tabs/inspect/crash-case.js';
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

// --- cambios-visibles-en-el-choque: la cuenta con la red de ahora y la línea "con tus cambios" (D1, D2 y D4) ---

/** 2 entradas → 2 ocultas → 4 salidas; con [1, 1] decide avanzar (0) y la izquierda (1) queda apenas apagada. */
const caseNet = () => netWith([2, 2, 4], [
  { weights: [[1, 0], [0, 1]], biases: [0, 0] },
  { weights: [[0.6, 0.2], [0.3, 0.3], [-1, -1], [-1, -1]], biases: [0, -0.7, 0, 0] },
]);

test('un sesgo cambiado cambia la cuenta del mismo cuadro; la decisión real sale de la red de entonces', () => {
  const net = caseNet();
  const then = createChanges(net, []);
  const now = createChanges(net, []);
  const before = traceNetwork(net, [1, 1], now);
  now.set({ kind: 'bias', layer: 2, neuron: 0, value: -1 });
  const after = traceNetwork(net, [1, 1], now);
  assert.notEqual(after.layers[2].neurons[0].total, before.layers[2].neurons[0].total, 'la suma de avanzar cambia con el sesgo');
  assert.equal(caseOf(traceNetwork(net, [1, 1], then)).decision.index, 0, 'la decisión real sigue siendo avanzar');
});

test('la línea: la acción nueva, lo mismo o ninguna', () => {
  const net = caseNet();
  const real = caseOf(traceNetwork(net, [1, 1], createChanges(net, []))).decision;
  assert.equal(real.index, 0);
  // Apagar avanzar con el sesgo y encender izquierda: decidiría izquierda.
  const flip = createChanges(net, [{ kind: 'bias', layer: 2, neuron: 0, value: -1 }, { kind: 'bias', layer: 2, neuron: 1, value: 0 }]);
  assert.deepEqual(nowLineOf(real, traceNetwork(net, [1, 1], flip)), { key: 'inspect.case.now', index: 1 });
  // Un cambio que no alcanza: lo mismo.
  const small = createChanges(net, [{ kind: 'bias', layer: 2, neuron: 0, value: -0.1 }]);
  assert.deepEqual(nowLineOf(real, traceNetwork(net, [1, 1], small)), { key: 'inspect.case.now.same' });
  // Todo apagado: ninguna.
  const none = createChanges(net, [{ kind: 'bias', layer: 2, neuron: 0, value: -1 }]);
  assert.deepEqual(nowLineOf(real, traceNetwork(net, [1, 1], none)), { key: 'inspect.case.now.none' });
  // Sin decisión real y sin decisión ahora: lo mismo.
  assert.deepEqual(nowLineOf(null, traceNetwork(net, [1, 1], none)), { key: 'inspect.case.now.same' });
  // Mismos cambios, mismo cuadro: misma línea.
  assert.deepEqual(nowLineOf(real, traceNetwork(net, [1, 1], flip)), nowLineOf(real, traceNetwork(net, [1, 1], flip)));
});

test('las listas de cambios se comparan por contenido: deshacer todo vuelve a la misma red', () => {
  const net = caseNet();
  const changes = createChanges(net, []);
  const empty = changes.list();
  changes.set({ kind: 'bias', layer: 2, neuron: 0, value: -0.5 });
  assert.equal(sameChangeList(empty, changes.list()), false);
  changes.undo();
  assert.notEqual(changes.list(), empty, 'otra lista');
  assert.equal(sameChangeList(empty, changes.list()), true, 'pero la misma red');
  const a = [{ kind: 'bias', layer: 2, neuron: 0, value: -0.5 }, { kind: 'neuronOff', layer: 1, neuron: 1, value: true }];
  assert.equal(sameChangeList(a, [a[1], a[0]]), true, 'el orden no importa');
  assert.equal(sameChangeList(a, [a[0], { ...a[1], neuron: 0 }]), false);
  assert.equal(sameChangeList([a[0]], [{ ...a[0], value: -0.4 }]), false);
});

// Compuertas (laboratorio-empieza-por-compuertas, grupo 1): los datos, el acierto con 0,5 exacto y
// las soluciones preparadas.
import test from 'node:test';
import assert from 'node:assert/strict';
import { gatesDataset, splitDataset, GATES } from '../src/core/datasets.js';
import { evaluate, isCorrect, softOutputs } from '../src/core/backprop.js';
import { createNetwork } from '../src/core/network.js';
import { createRandom } from '../src/core/random.js';
import { gateSolution, solutionShapeOk } from '../src/tabs/lab/gate-solutions.js';

const answers = (gate) => gatesDataset({ gate }).examples.map((ex) => `${ex.inputs.join(',')}:${ex.targets[0]}`);

test('AND: cuatro casos y solo (1, 1) contesta sí', () => {
  assert.deepEqual(answers('and'), ['0,0:0', '0,1:0', '1,0:0', '1,1:1']);
});
test('OR: solo (0, 0) contesta no', () => {
  assert.deepEqual(answers('or'), ['0,0:0', '0,1:1', '1,0:1', '1,1:1']);
});
test('XOR: sí con entradas distintas, no con iguales', () => {
  assert.deepEqual(answers('xor'), ['0,0:0', '0,1:1', '1,0:1', '1,1:0']);
});
test('siempre iguales: dos veces la misma compuerta da los mismos ejemplos en el mismo orden', () => {
  for (const gate of GATES) assert.deepEqual(gatesDataset({ gate }), gatesDataset({ gate }));
});
test('sin apartados: con cualquier parte apartada, los cuatro quedan en práctica', () => {
  for (const holdout of [10, 30, 50]) {
    const s = splitDataset(gatesDataset({ gate: 'xor' }), { holdout, seed: 3 });
    assert.equal(s.practice.length, 4);
    assert.equal(s.heldOut.length, 0);
    assert.deepEqual(s.held, [false, false, false, false]);
  }
});
test('compuerta desconocida: se generan los datos de AND', () => {
  assert.deepEqual(gatesDataset({ gate: 'nand' }), gatesDataset({ gate: 'and' }));
  assert.equal(gatesDataset().gate, 'and');
});

test('0,5 exacto no es acierto: AND con pesos y sesgo en cero acierta 0 de 4', () => {
  const net = createNetwork({ inputs: 2, hidden: [], outputs: 1, random: () => 0.5 }); // random 0,5 → pesos 0
  assert.deepEqual(net.layers[0], { weights: [[0, 0]], biases: [0] });
  const r = evaluate(net, gatesDataset({ gate: 'and' }).examples);
  assert.equal(r.correct, 0);
  assert.equal(isCorrect([0.5], [0]), false);
  assert.equal(isCorrect([0.5], [1]), false);
  assert.equal(isCorrect([0.49], [0]), true);
  assert.equal(isCorrect([0.51], [1]), true);
});

for (const activation of ['tanh', 'sigmoid', 'relu']) {
  for (const [gate, hidden] of [['and', []], ['or', []], ['and', [2]], ['or', [2]], ['xor', [2]]]) {
    test(`solución de ${gate} con ${hidden.length ? '2 ocultas' : '0 ocultas'} (${activation}): 4 de 4, todo entre −3 y 3`, () => {
      const layers = gateSolution(gate, { hidden, activation });
      const net = { ...createNetwork({ inputs: 2, hidden, outputs: 1, activation, random: createRandom(1) }), layers };
      const r = evaluate(net, gatesDataset({ gate }).examples);
      assert.equal(r.correct, 4);
      for (const l of layers) for (const v of [...l.weights.flat(), ...l.biases]) assert.ok(v >= -3 && v <= 3, `${v}`);
      // Con margen: ninguna respuesta queda pegada a 0,5.
      for (const ex of gatesDataset({ gate }).examples) assert.ok(Math.abs(softOutputs(net, ex.inputs)[0] - 0.5) > 0.05);
    });
  }
}
test('solución de XOR con una capa de 2: la oculta 1 hace OR y la 2 hace AND', () => {
  const [h] = gateSolution('xor', { hidden: [2], activation: 'tanh' });
  const fire = (j, a, b) => h.weights[j][0] * a + h.weights[j][1] * b + h.biases[j] > 0;
  assert.deepEqual([[0, 0], [0, 1], [1, 0], [1, 1]].map(([a, b]) => fire(0, a, b)), [false, true, true, true]);
  assert.deepEqual([[0, 0], [0, 1], [1, 0], [1, 1]].map(([a, b]) => fire(1, a, b)), [false, false, false, true]);
});
test('sin solución preparada: XOR sin capas, dos capas o una de otro tamaño', () => {
  assert.equal(gateSolution('xor', { hidden: [], activation: 'tanh' }), null);
  assert.equal(gateSolution('and', { hidden: [2, 2], activation: 'tanh' }), null);
  assert.equal(gateSolution('or', { hidden: [4], activation: 'tanh' }), null);
  assert.equal(solutionShapeOk('xor', [2]), true);
});

test('tabla de verdad: con pesos en cero, cuatro "no se decide" y 0 de 4; con la solución de AND, 4 de 4', async () => {
  const { truthRows } = await import('../src/tabs/lab/truth-table.js');
  const net = createNetwork({ inputs: 2, hidden: [], outputs: 1, random: () => 0.5 });
  const data = gatesDataset({ gate: 'and' });
  const zero = truthRows(net, data.examples);
  assert.equal(zero.correct, 0);
  assert.deepEqual(zero.rows.map((r) => r.verdict), ['undecided', 'undecided', 'undecided', 'undecided']);
  const solved = truthRows({ ...net, layers: gateSolution('and', { hidden: [], activation: 'tanh' }) }, data.examples);
  assert.equal(solved.correct, 4);
  assert.deepEqual(solved.rows.map((r) => r.verdict), ['no', 'no', 'no', 'yes']);
});

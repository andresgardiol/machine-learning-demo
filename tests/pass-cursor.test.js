import test from 'node:test';
import assert from 'node:assert/strict';
import { createPassCursor, OPERATIONS, STEP_SIZES, opsPerNeuron } from '../src/core/pass-cursor.js';

const SHAPES = {
  none: [6, 4], // sin capas ocultas
  one: [6, 6, 4],
  three: [21, 16, 16, 16, 4],
};

/** Operaciones de un cuadro: una por entrada y 2n + 2 por neurona. */
const expectedTotal = (sizes) => sizes[0] + sizes.slice(1).reduce((s, k, i) => s + k * (2 * sizes[i] + 2), 0);

test('cantidad de operaciones por forma: 6 → 6 → 4 son 146', () => {
  assert.equal(createPassCursor(SHAPES.one).total, 146);
  for (const sizes of Object.values(SHAPES)) assert.equal(createPassCursor(sizes).total, expectedTotal(sizes));
  assert.equal(opsPerNeuron([6, 6, 4], 0), 1);
  assert.equal(opsPerNeuron([6, 6, 4], 1), 14);
});

test('la cuenta empieza por las entradas: un paso read por entrada', () => {
  const c = createPassCursor(SHAPES.one);
  assert.deepEqual(c.next, { layer: 0, neuron: 0, op: 'read', index: 0 });
  assert.equal(c.stateOf(0, 0), 'current');
  assert.equal(c.opsDone(0, 0), 0);
  c.advance('operation');
  assert.equal(c.opsDone(0, 0), 4);
  assert.equal(c.stateOf(0, 0), 'done');
  assert.equal(c.opsDone(0, 1), 0);
  assert.equal(c.stateOf(0, 1), 'current');
  assert.ok(!c.layerDone(0));
});

test('orden dentro de una neurona con seis entradas: multiplicar y sumar cada una; al final, sesgo y activación', () => {
  const c = createPassCursor(SHAPES.one);
  c.advance('layer'); // las entradas
  const seen = [];
  for (let k = 0; k < 14; k++) { c.advance('operation'); const p = c.position; seen.push(p.input === undefined ? p.op : `${p.op}${p.input}`); }
  assert.deepEqual(seen, ['multiply0', 'add0', 'multiply1', 'add1', 'multiply2', 'add2', 'multiply3', 'add3', 'multiply4', 'add4', 'multiply5', 'add5', 'bias', 'activation']);
  assert.equal(c.stateOf(1, 0), 'done');
  assert.equal(c.stateOf(1, 1), 'current');
});

test('términos, etapa y número de paso a medio hacer', () => {
  const c = createPassCursor(SHAPES.one);
  c.advance('layer');
  c.advance('operation'); // multiply0
  assert.deepEqual(c.terms(1, 0), { read: false, multiplied: 1, added: 0, bias: false, activation: false, inputs: 6 });
  assert.equal(c.opsDone(1, 0), 1);
  assert.ok(c.isDone(1, 0, 'products'));
  assert.ok(!c.isDone(1, 0, 'sum'));
  for (let k = 0; k < 4; k++) c.advance('operation'); // add0 m1 a1 m2
  assert.deepEqual(c.terms(1, 0), { read: false, multiplied: 3, added: 2, bias: false, activation: false, inputs: 6 });
  assert.deepEqual(c.stepOf(1, 0), { done: 5, total: 14 });
  assert.deepEqual(c.next, { layer: 1, neuron: 0, op: 'add', input: 2, index: 6 + 5 });
  for (let k = 0; k < 7; k++) c.advance('operation'); // hasta add5
  assert.equal(c.opsDone(1, 0), 2);
  c.advance('operation');
  assert.equal(c.opsDone(1, 0), 3);
  assert.ok(c.terms(1, 0).bias);
  c.advance('operation');
  assert.equal(c.opsDone(1, 0), 4);
});

for (const [name, sizes] of Object.entries(SHAPES)) {
  test(`advance de cada tamaño desde cualquier punto (${name})`, () => {
    const total = expectedTotal(sizes);
    for (const start of [0, 1, sizes[0], sizes[0] + 3, Math.floor(total / 2), total - 1]) {
      for (const size of STEP_SIZES) {
        const c = createPassCursor(sizes);
        for (let k = 0; k < start; k++) c.advance('operation');
        const next = c.next;
        const r = c.advance(size);
        assert.equal(r.from, start);
        if (size === 'operation') assert.equal(r.to, start + 1);
        if (size === 'frame') assert.equal(r.to, total);
        if (size === 'neuron') { assert.equal(c.stateOf(next.layer, next.neuron), 'done'); assert.equal(c.position.layer, next.layer); assert.equal(c.position.neuron, next.neuron); }
        if (size === 'layer') { assert.ok(c.layerDone(next.layer)); assert.equal(c.position.layer, next.layer); }
      }
    }
  });

  test(`de a una neurona en las entradas lee una; de a una capa, todas (${name})`, () => {
    const c = createPassCursor(sizes);
    c.advance('neuron');
    assert.deepEqual([c.opsDone(0, 0), c.opsDone(0, 1)], [4, 0]);
    c.advance('layer');
    assert.ok(c.layerDone(0));
    assert.equal(c.opsDone(1, 0), 0);
    assert.deepEqual(c.next, { layer: 1, neuron: 0, op: 'multiply', input: 0, index: sizes[0] });
  });

  test(`hasta el final (${name}): todo hecho; avanzar otra vez informa que terminó sin cambiar nada`, () => {
    const c = createPassCursor(sizes);
    const r = c.advance('frame');
    assert.ok(r.done);
    for (let l = 0; l < sizes.length; l++) for (let j = 0; j < sizes[l]; j++) assert.equal(c.stateOf(l, j), 'done');
    const again = c.advance('operation');
    assert.equal(again.finished, true);
    assert.equal(c.count, c.total);
    assert.equal(c.next, null);
  });
}

test('back de a una operación: tres pasos y atrás deja la cuenta como después del segundo', () => {
  const c = createPassCursor(SHAPES.one);
  c.advance('layer');
  c.advance('operation');
  c.advance('operation');
  const after2 = c.count;
  c.advance('operation');
  const r = c.back('operation');
  assert.deepEqual(r, { from: after2 + 1, to: after2, moved: true });
  assert.equal(c.count, after2);
  assert.deepEqual(c.terms(1, 0).multiplied, 1);
  assert.deepEqual(c.terms(1, 0).added, 1);
});

test('back de a una neurona: a mitad, al principio de esa neurona; en su principio, al de la anterior', () => {
  const c = createPassCursor(SHAPES.one);
  c.advance('layer');
  c.advance('neuron'); // neurona 1 hecha
  for (let k = 0; k < 5; k++) c.advance('operation'); // mitad de la neurona 2
  c.back('neuron');
  assert.equal(c.doneIn(1, 1), 0);
  assert.equal(c.doneIn(1, 0), 14);
  c.back('neuron');
  assert.equal(c.doneIn(1, 0), 0);
  assert.ok(c.layerDone(0));
  c.back('neuron'); // vuelve a la última entrada
  assert.equal(c.opsDone(0, 5), 0);
  assert.equal(c.opsDone(0, 4), 4);
});

test('back de a una capa y de a un cuadro; al principio no hace nada', () => {
  const c = createPassCursor(SHAPES.one);
  assert.deepEqual(c.back('operation'), { from: 0, to: 0, moved: false });
  c.advance('layer');
  c.advance('layer');
  c.advance('operation');
  c.back('layer');
  assert.ok(c.layerDone(1));
  assert.equal(c.doneIn(2, 0), 0);
  c.back('layer');
  assert.ok(c.layerDone(0));
  assert.ok(c.started);
  c.back('frame');
  assert.equal(c.count, 0);
  assert.equal(c.back('layer').moved, false);
});

test('cambiar el tamaño a mitad de la cuenta no pierde lo hecho', () => {
  const c = createPassCursor(SHAPES.one);
  c.advance('layer');
  c.advance('operation');
  c.advance('operation');
  c.advance('layer');
  assert.ok(c.layerDone(1));
  assert.equal(c.opsDone(2, 0), 0);
});

test('las operaciones finas son las cinco de siempre', () => {
  const c = createPassCursor([2, 1]);
  const seen = new Set();
  while (!c.done) { c.advance('operation'); seen.add(c.position.op); }
  assert.deepEqual([...seen].sort(), [...OPERATIONS].sort());
  assert.equal(c.total, 2 + 6);
});

test('reiniciar y completar', () => {
  const c = createPassCursor({ sizes: SHAPES.three });
  c.complete();
  assert.ok(c.done);
  c.reset();
  assert.equal(c.count, 0);
  assert.equal(c.position, null);
  assert.equal(c.stateOf(0, 0), 'current');
  assert.equal(c.stateOf(1, 0), 'pending');
});

test('un tamaño desconocido se rechaza', () => {
  const c = createPassCursor(SHAPES.one);
  assert.throws(() => c.advance('bogus'));
  c.advance('operation');
  assert.throws(() => c.back('bogus'));
});

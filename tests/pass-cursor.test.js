import test from 'node:test';
import assert from 'node:assert/strict';
import { createPassCursor, OPERATIONS } from '../src/core/pass-cursor.js';

const SHAPES = {
  none: [6, 4], // sin capas ocultas
  one: [6, 6, 4],
  three: [21, 16, 16, 16, 4],
};

for (const [name, sizes] of Object.entries(SHAPES)) {
  test(`de a una operación (${name}): quedan hechos los productos de la primera neurona de la primera capa calculada`, () => {
    const c = createPassCursor(sizes);
    const r = c.advance('operation');
    assert.deepEqual(r, { from: 0, to: 1, done: false, finished: false });
    assert.deepEqual(c.position, { layer: 1, neuron: 0, op: 'products', index: 0 });
    assert.equal(c.opsDone(1, 0), 1);
    assert.equal(c.opsDone(1, 1), 0);
    assert.ok(c.isDone(1, 0, 'products'));
    assert.ok(!c.isDone(1, 0, 'sum'));
    assert.equal(c.stateOf(1, 0), 'current');
    assert.equal(c.stateOf(1, 1), 'pending');
    assert.equal(c.stateOf(0, 3), 'done');
  });

  test(`de a una neurona con una a medio hacer (${name}): completa lo que le faltaba, y nada más`, () => {
    const c = createPassCursor(sizes);
    c.advance('operation');
    c.advance('operation');
    const r = c.advance('neuron');
    assert.deepEqual([r.from, r.to], [2, 4]);
    assert.equal(c.opsDone(1, 0), 4);
    assert.equal(c.opsDone(1, 1), 0);
    assert.equal(c.stateOf(1, 0), 'done');
    assert.equal(c.stateOf(1, 1), 'current');
    c.advance('neuron');
    assert.equal(c.opsDone(1, 1), 4);
    assert.equal(c.opsDone(1, 2), 0);
  });

  test(`de a una capa (${name}): completa las neuronas que faltaban de la capa en curso`, () => {
    const c = createPassCursor(sizes);
    c.advance('neuron');
    c.advance('operation');
    c.advance('layer');
    assert.ok(c.layerDone(1));
    for (let j = 0; j < sizes[1]; j++) assert.equal(c.opsDone(1, j), 4);
    if (sizes.length > 2) assert.equal(c.opsDone(2, 0), 0);
  });

  test(`hasta el final (${name}): todo hecho; avanzar otra vez informa que terminó sin cambiar nada`, () => {
    const c = createPassCursor(sizes);
    const r = c.advance('frame');
    assert.ok(r.done);
    assert.ok(c.done);
    for (let l = 1; l < sizes.length; l++) for (let j = 0; j < sizes[l]; j++) assert.equal(c.stateOf(l, j), 'done');
    const again = c.advance('operation');
    assert.equal(again.finished, true);
    assert.equal(c.count, c.total);
    assert.equal(c.next, null);
  });
}

test('red sin capas ocultas: el recorrido empieza por la primera neurona de salida', () => {
  const c = createPassCursor(SHAPES.none);
  assert.deepEqual(c.next, { layer: 1, neuron: 0, op: 'products', index: 0 });
  assert.equal(c.total, 4 * 4);
});

test('cuatro operaciones por neurona, en orden: productos, suma, sesgo y activación', () => {
  const c = createPassCursor([2, 1]);
  const seen = [];
  while (!c.done) { c.advance('operation'); seen.push(c.position.op); }
  assert.deepEqual(seen, [...OPERATIONS]);
});

test('cambiar el tamaño a mitad de la cuenta no pierde lo hecho', () => {
  const c = createPassCursor(SHAPES.one);
  c.advance('operation');
  c.advance('operation');
  c.advance('layer');
  assert.ok(c.layerDone(1));
  assert.equal(c.opsDone(2, 0), 0);
});

test('reiniciar y completar', () => {
  const c = createPassCursor({ sizes: SHAPES.three });
  c.complete();
  assert.ok(c.done);
  c.reset();
  assert.equal(c.count, 0);
  assert.equal(c.position, null);
  assert.equal(c.stateOf(1, 0), 'current');
});

test('un tamaño desconocido se rechaza', () => {
  const c = createPassCursor(SHAPES.one);
  assert.throws(() => c.advance('bogus'));
});

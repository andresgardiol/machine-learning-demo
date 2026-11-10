import test from 'node:test';
import assert from 'node:assert/strict';
import { createRandom, deriveSeed, randomFor } from '../src/core/random.js';

const take = (rnd, n) => Array.from({ length: n }, () => rnd());

test('misma semilla, misma secuencia', () => {
  assert.deepEqual(take(createRandom(42), 100), take(createRandom(42), 100));
});

test('semillas distintas, secuencias distintas', () => {
  assert.notDeepEqual(take(createRandom(1), 10), take(createRandom(2), 10));
});

test('valores en [0, 1) y secuencia conocida de la semilla 1', () => {
  const values = take(createRandom(1), 1000);
  assert.ok(values.every((v) => v >= 0 && v < 1));
  assert.equal(values[0], 0.6270739405881613);
});

test('derivación por índice: igual entrada, igual salida; índices distintos, semillas distintas', () => {
  assert.equal(deriveSeed(7, 3), deriveSeed(7, 3));
  const seeds = new Set(Array.from({ length: 1000 }, (_, k) => deriveSeed(7, k)));
  assert.equal(seeds.size, 1000);
  assert.notEqual(deriveSeed(7, 3), deriveSeed(8, 3));
});

test('randomFor es reproducible por índice e independiente del orden de consulta', () => {
  const a = randomFor(5, 10)();
  randomFor(5, 99)();
  const b = randomFor(5, 10)();
  assert.equal(a, b);
  assert.notEqual(randomFor(5, 10)(), randomFor(5, 11)());
});

// Versión corta y determinista de la comprobación de aprendizaje (fitness-que-premia-superar D6).
// La medida completa corre aparte: npm run test:learning.
import test from 'node:test';
import assert from 'node:assert/strict';
import { measureLearning, LEARNING_PROTOCOL, LEARNING_THRESHOLDS } from '../tools/measure-learning.mjs';

test('comprobación de aprendizaje: con una semilla y 5 generaciones, dos corridas dan exactamente lo mismo', () => {
  const short = { seeds: [1], generations: 5, measured: 5, config: { population: 100 } };
  const a = measureLearning(short);
  const b = measureLearning(short);
  assert.deepEqual(a, b);
  assert.equal(a.perSeed.length, 1);
  assert.ok(Number.isFinite(a.average) && a.average >= 0);
  assert.ok(a.crashRate >= 0 && a.crashRate <= 1);
});

test('comprobación de aprendizaje: el protocolo y los umbrales son los de design.md D6', () => {
  assert.deepEqual([...LEARNING_PROTOCOL.seeds], [1, 2, 3, 4, 5, 6, 7, 8]);
  assert.equal(LEARNING_PROTOCOL.population, 100);
  assert.equal(LEARNING_PROTOCOL.generations, 60);
  assert.equal(LEARNING_PROTOCOL.measured, 10);
  assert.deepEqual([...LEARNING_PROTOCOL.testSeeds], [5000, 5001, 5002, 5003, 5004, 5005, 5006, 5007, 5008, 5009]);
  assert.equal(LEARNING_PROTOCOL.seconds, 60);
  assert.equal(LEARNING_PROTOCOL.maxSpeed, 20);
  assert.deepEqual({ ...LEARNING_THRESHOLDS }, { minAverage: 8, minPerSeed: 5, maxDistance: 2 });
});

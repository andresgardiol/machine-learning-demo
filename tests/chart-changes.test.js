// Marcas de cambios en la curva (entrenar-la-generacion-ensena D6): el modelo, sin DOM.
import test from 'node:test';
import assert from 'node:assert/strict';
import { chartModel } from '../src/ui/chart.js';
import { createTraining } from '../src/core/training.js';

const rec = (generation, changes = [], fitness = 'lead') => ({ generation, best: generation, average: generation / 2, fitness, changes });

test('sin cambios no hay marcas', () => {
  assert.deepEqual(chartModel([1, 2, 3, 4, 5].map((g) => rec(g))).marks, []);
  assert.deepEqual(chartModel([]).marks, [], 'la curva vacía tampoco');
  // Registros de antes del cambio, sin `changes`: tampoco.
  assert.deepEqual(chartModel([{ generation: 1, best: 1, average: 1, fitness: 'lead' }]).marks, []);
});

test('un cambio que rige en la generación 4 da una marca en la 4, en la x de su punto', () => {
  const change = { key: 'mutationStrength', from: 29, to: 40 };
  const m = chartModel([rec(1), rec(2), rec(3), rec(4, [change]), rec(5)]);
  assert.equal(m.marks.length, 1);
  assert.equal(m.marks[0].generation, 4);
  assert.equal(m.marks[0].x, m.best[3].x);
  assert.deepEqual(m.marks[0].changes, [change]);
});

test('con otra función de fitness la curva empieza de nuevo y la marca queda en su primer punto', () => {
  const m = chartModel([rec(1), rec(2), rec(3, [{ key: 'fitness', from: 'lead', to: 'distance' }], 'distance'), rec(4, [], 'distance')]);
  assert.equal(m.restarted, true);
  assert.deepEqual(m.marks.map((k) => k.generation), [3]);
  assert.equal(m.marks[0].x, m.best[0].x);
});

test('reiniciar borra las marcas: un entrenamiento nuevo empieza sin historial', () => {
  let t = createTraining({ seed: 1, config: { population: 10 } });
  t.finishGeneration();
  t.configure({ population: 20 });
  t.finishGeneration();
  t.finishGeneration();
  assert.equal(chartModel(t.history).marks.length, 1);
  t = createTraining({ seed: 1, config: { population: 10 } });
  assert.deepEqual(chartModel(t.history).marks, []);
});

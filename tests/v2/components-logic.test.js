import test from 'node:test';
import assert from 'node:assert/strict';
import { createUndo, UNDO_MS, visibleSettings, LEARN_VISIBILITY, sheetToOpen, clampStep } from '../../src/v2/components/logic.js';

test('v2/deshacer: dura al menos 8 s, devuelve lo perdido una sola vez y después vence', () => {
  assert.ok(UNDO_MS >= 8000);
  let t = 0;
  const u = createUndo({ now: () => t });
  let restored = 0;
  u.offer(() => { restored += 1; });
  t = 7999;
  assert.equal(u.open, true);
  assert.equal(u.use(), true);
  assert.equal(restored, 1);
  assert.equal(u.use(), false);
  u.offer(() => { restored += 1; });
  t += UNDO_MS + 1;
  assert.equal(u.open, false);
  assert.equal(u.use(), false);
  assert.equal(restored, 1);
});

test('v2/deshacer: una oferta nueva reemplaza a la anterior', () => {
  let t = 0;
  const u = createUndo({ now: () => t });
  const log = [];
  u.offer(() => log.push('a'));
  u.offer(() => log.push('b'));
  u.use();
  assert.deepEqual(log, ['b']);
});

test('v2/ocultar lo que no aplica: neuronas solo de las capas que hay', () => {
  const keys = ['hiddenLayers', 'neurons1', 'neurons2', 'neurons3', 'activation'];
  assert.deepEqual(visibleSettings(keys, LEARN_VISIBILITY, { hiddenLayers: 1 }), ['hiddenLayers', 'neurons1', 'activation']);
  assert.deepEqual(visibleSettings(keys, LEARN_VISIBILITY, { hiddenLayers: 3 }), keys);
  assert.deepEqual(visibleSettings(keys, LEARN_VISIBILITY, { hiddenLayers: 0 }), ['hiddenLayers']);
});

test('v2/hoja recordada: la recordada si existe, si no la primera', () => {
  assert.equal(sheetToOpen(['entrenamiento', 'evolucion', 'red-pista'], 'red-pista'), 'red-pista');
  assert.equal(sheetToOpen(['entrenamiento', 'evolucion'], 'otra'), 'entrenamiento');
  assert.equal(sheetToOpen([], 'x'), null);
});

test('v2/deslizador: ajusta al rango y al paso', () => {
  assert.equal(clampStep(523, { min: 2, max: 500, step: 1 }), 500);
  assert.equal(clampStep(0.237, { min: 0, max: 1, step: 0.05 }), 0.25);
  assert.equal(clampStep(-3, { min: 0, max: 10 }), 0);
});

// Cambiar la red o los sensores siguiendo un cerebro (panel-de-entrenar-por-vistas D16).
import test from 'node:test';
import assert from 'node:assert/strict';
import { createTraining } from '../src/core/training.js';
import { DEFAULT_SETTINGS, normalizeSettings, classifyChanges, trainingConfig, adoptBrain, followingAfter } from '../src/tabs/train/settings.js';
import es from '../src/i18n/es.js';
import en from '../src/i18n/en.js';

/** Un cerebro "Prudente" de 5 sensores, entrenado unas generaciones. */
function prudente() {
  const t = createTraining({ seed: 4, config: { ...trainingConfig(DEFAULT_SETTINGS), population: 6, elite: 1 } });
  t.finishGeneration();
  return t.brain({ id: 'b1', name: 'Prudente', now: '2026-11-13T00:00:00.000Z' });
}

/** Lo que hace la pestaña al aplicar un cambio de red o de sensores confirmado. */
function applyChange(following, settings, patch) {
  const target = normalizeSettings({ ...settings, ...patch });
  const changes = classifyChanges(settings, target);
  const next = followingAfter(following, changes);
  return { ...next, settings: target, training: createTraining({ seed: 1, config: { ...trainingConfig(target), population: 6, elite: 1 }, brain: next.brain }) };
}

test('Cambio mientras se sigue entrenando un cerebro: 18 sensores, población al azar y sin seguir a "Prudente"', () => {
  const brain = prudente();
  const following = { brain, brainSource: 'b1' };
  const settings = adoptBrain(DEFAULT_SETTINGS, brain);
  const r = applyChange(following, settings, { sensorCount: 18 });
  assert.equal(r.brain, null);
  assert.equal(r.brainSource, null);
  assert.equal(r.training.config.sensors.count, 18);
  assert.equal(r.training.networks[0].sizes[0], 19); // 18 sensores y la velocidad
  assert.equal(r.training.fromBrain, null);
});

test('cambio de red siguiendo un cerebro: también deja de seguirlo', () => {
  const brain = prudente();
  const r = applyChange({ brain, brainSource: 'b1' }, adoptBrain(DEFAULT_SETTINGS, brain), { hiddenLayers: 2 });
  assert.equal(r.brain, null);
  assert.equal(r.training.networks[0].sizes.length, 4);
});

test('otros cambios siguen al cerebro', () => {
  const brain = prudente();
  const settings = adoptBrain(DEFAULT_SETTINGS, brain);
  const target = normalizeSettings({ ...settings, elite: 3, density: 70 });
  assert.deepEqual(followingAfter({ brain, brainSource: 'b1' }, classifyChanges(settings, target)), { brain, brainSource: 'b1' });
});

test('La confirmación lo avisa: se deja de seguir al cerebro, que sigue en la biblioteca, y se empieza al azar', () => {
  assert.match(es['train.confirm.newTraining.brain'], /se deja de seguir a «\{name\}», que sigue en la biblioteca/);
  assert.match(es['train.confirm.newTraining.brain'], /población al azar/);
  assert.match(en['train.confirm.newTraining.brain'], /stops following “\{name\}”, which stays in the library/);
});

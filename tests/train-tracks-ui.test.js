// Pistas en la pestaña Entrenar (circuitos-y-paisaje, tareas 8.1 y 8.2): ajuste, indicadores y modo
// ver como la máquina, sin DOM.
import test from 'node:test';
import assert from 'node:assert/strict';
import {
  DEFAULT_SETTINGS, normalizeSettings, classifyChanges, trainingConfig, toggleTrack, onlyCircuits, TRAFFIC_SETTINGS,
} from '../src/tabs/train/settings.js';
import { indicators } from '../src/tabs/train/session.js';
import { createTraining } from '../src/core/training.js';

test('pistas del entrenamiento: solo la calle recta por defecto, en el grupo de la próxima generación', () => {
  assert.deepEqual([...DEFAULT_SETTINGS.tracks], ['straight']);
  assert.deepEqual(trainingConfig(DEFAULT_SETTINGS).tracks, ['straight']);
  const changes = classifyChanges(DEFAULT_SETTINGS, { ...DEFAULT_SETTINGS, tracks: ['straight', 'oval'] });
  assert.deepEqual(changes.nextGeneration, ['tracks']);
  assert.deepEqual(classifyChanges(DEFAULT_SETTINGS, { ...DEFAULT_SETTINGS, tracks: ['straight'] }).nextGeneration, []);
  assert.deepEqual([...normalizeSettings({ tracks: ['grandPrix', 'monza', 'oval'] }).tracks], ['oval', 'grandPrix']);
  assert.deepEqual([...normalizeSettings({ tracks: [] }).tracks], ['straight']);
});

test('Última pista marcada: no se puede desmarcar; marcar y desmarcar mantiene el orden del catálogo', () => {
  assert.deepEqual(toggleTrack(['straight'], 'straight'), ['straight']);
  assert.deepEqual(toggleTrack(['straight'], 'kidney'), ['straight', 'kidney']);
  assert.deepEqual(toggleTrack(['kidney'], 'oval'), ['oval', 'kidney']);
  assert.deepEqual(toggleTrack(['straight', 'oval'], 'straight'), ['oval']);
  assert.deepEqual(toggleTrack(['oval'], 'oval'), ['oval']);
  assert.deepEqual(toggleTrack(['oval'], 'monza'), ['oval']);
});

test('Restablecer: vuelve a entrenarse solo en la calle recta desde la generación siguiente', () => {
  const marked = normalizeSettings({ ...DEFAULT_SETTINGS, tracks: ['straight', 'oval', 'kidney'] });
  const t = createTraining({ seed: 1, config: { ...trainingConfig(marked), population: 6, elite: 1 } });
  t.finishGeneration();
  assert.equal(t.trackId, 'oval');
  t.configure({ tracks: trainingConfig(DEFAULT_SETTINGS).tracks });
  assert.equal(t.trackId, 'oval');
  t.finishGeneration();
  assert.equal(t.trackId, 'straight');
  t.finishGeneration();
  assert.equal(t.trackId, 'straight');
});

test('Solo circuitos: carriles, densidad, irregularidad y modo de tráfico no aplican', () => {
  assert.equal(onlyCircuits(['oval', 'kidney']), true);
  assert.equal(onlyCircuits(['straight', 'oval']), false);
  assert.deepEqual([...TRAFFIC_SETTINGS], ['lanes', 'density', 'irregularity', 'trafficMode']);
});

test('Generación en un circuito: indicadores con la pista y las vueltas del líder, un decimal hacia abajo', () => {
  const t = createTraining({ seed: 2, config: { population: 20, elite: 1, tracks: ['straight', 'oval'] } });
  let ind = indicators(t);
  assert.equal(ind.trackId, 'straight');
  assert.equal(ind.laps, null);
  t.finishGeneration();
  ind = indicators(t);
  assert.equal(ind.generation, 2);
  assert.equal(ind.trackId, 'oval');
  assert.equal(ind.laps, 0);
  for (let i = 0; i < 600; i++) {
    t.step();
    if (t.generation !== 2) break;
    const laps = indicators(t).laps;
    assert.equal(laps, Math.floor(10 * t.lapsOf() + 1e-9) / 10);
  }
  // Vuelta a la calle: el cuarto indicador vuelve a los vehículos superados.
  while (t.generation === 2) t.finishGeneration();
  assert.equal(indicators(t).laps, null);
});

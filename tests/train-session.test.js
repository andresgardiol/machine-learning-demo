import test from 'node:test';
import assert from 'node:assert/strict';
import { indicators, fitnessText, createTrainSession, MISSIONS } from '../src/tabs/train/session.js';
import { SHORTCUTS, shortcutFor, toggleTurbo } from '../src/tabs/train/shortcuts.js';
import { createTraining } from '../src/core/training.js';

// --- 16.1 Indicadores --------------------------------------------------------------------------

test('indicadores al empezar: generación 1, 100 de 100 en carrera y el mejor anterior no disponible (no cero)', () => {
  const t = createTraining({ seed: 1 });
  const ind = indicators(t);
  assert.equal(ind.generation, 1);
  assert.equal(ind.alive, 100);
  assert.equal(ind.total, 100);
  assert.equal(ind.lastBest, null);
  assert.equal(ind.lastReason, null);
  assert.deepEqual(ind.leader, { key: 'train.value.meters', params: { value: 0 } });
});

test('autos que chocan: con veinte autos fuera de carrera, el indicador muestra 80 de 100', () => {
  const t = createTraining({ seed: 1 });
  for (let i = 0; i < 20; i++) t.world.retire(i, 'test');
  const ind = indicators(t);
  assert.equal(ind.alive, 80);
  assert.equal(ind.total, 100);
});

test('fin de una generación: el número aumenta y se muestran el mejor con su unidad y el motivo', () => {
  const t = createTraining({ seed: 1, config: { population: 10 } });
  let record = null;
  while (!record) record = t.step();
  const ind = indicators(t);
  assert.equal(ind.generation, 2);
  assert.equal(ind.lastReason, record.reason);
  assert.deepEqual(ind.lastBest, { key: 'train.value.meters', params: { value: Math.floor(record.best) } });
});

test('valores de fitness con su unidad: metros sin decimales, segundos y m/s con uno', () => {
  assert.deepEqual(fitnessText(412.87, 'distance'), { key: 'train.value.meters', params: { value: 412 } });
  assert.deepEqual(fitnessText(28.34, 'survival'), { key: 'train.value.seconds', params: { value: 28.3 } });
  assert.deepEqual(fitnessText(15.06, 'speed'), { key: 'train.value.metersPerSecond', params: { value: 15.1 } });
  assert.deepEqual(fitnessText(-3, 'distance'), { key: 'train.value.meters', params: { value: 0 } });
});

test('con la función "tiempo sin chocar", los indicadores pasan a mostrar segundos desde la generación siguiente', () => {
  const t = createTraining({ seed: 1, config: { population: 6 } });
  t.configure({ fitness: 'survival' });
  for (let i = 0; i < 60; i++) t.step();
  assert.equal(indicators(t).leader.key, 'train.value.meters');
  t.finishGeneration();
  for (let i = 0; i < 60; i++) t.step();
  assert.equal(indicators(t).leader.key, 'train.value.seconds');
});

// --- 16.2 Atajos ----------------------------------------------------------------------------------

test('atajos: barra espaciadora pausa, T alterna la velocidad máxima, N pasa de generación', () => {
  assert.deepEqual({ ...SHORTCUTS }, { Space: 'pause', KeyT: 'turbo', KeyN: 'next' });
  assert.equal(shortcutFor({ code: 'Space' }), 'pause');
  assert.equal(shortcutFor({ code: 'KeyT' }), 'turbo');
  assert.equal(shortcutFor({ code: 'KeyN' }), 'next');
  assert.equal(shortcutFor({ code: 'KeyR' }), null);
  assert.equal(shortcutFor({ code: 'KeyN', ctrlKey: true }), null);
  assert.equal(shortcutFor({ code: 'KeyT', target: { tagName: 'INPUT', type: 'text' } }), null);
});

test('T: de la velocidad máxima vuelve a la normal; de cualquier otra pasa a la máxima', () => {
  assert.equal(toggleTurbo('max'), 1);
  assert.equal(toggleTurbo(1), 'max');
  assert.equal(toggleTurbo(4), 'max');
});

// --- 16.9 Misiones --------------------------------------------------------------------------------

const missionOf = (s, id) => s.missions.find((m) => m.id === id);

test('misiones: cuatro, en orden', () => {
  assert.deepEqual(MISSIONS.map((m) => [m.id, m.goal]), [['generations', 5], ['distance', 300], ['save', 1], ['fitness', 1]]);
});

test('progreso: en la generación 3 la primera misión muestra 3 de 5, y se cumple al llegar a la 5', () => {
  const s = createTrainSession();
  const fake = (generation, progress = 0) => ({ generation, leaderIndex: 0, world: { agents: [{ progress }] } });
  s.observe(fake(3));
  assert.deepEqual([missionOf(s, 'generations').progress, missionOf(s, 'generations').done], [3, false]);
  s.observe(fake(5));
  assert.equal(missionOf(s, 'generations').done, true);
  s.observe(fake(1, 250));
  assert.equal(missionOf(s, 'distance').progress, 250);
  s.observe(fake(1, 301));
  assert.equal(missionOf(s, 'distance').done, true);
  assert.equal(missionOf(s, 'distance').progress, 300);
});

test('misión cumplida: guardar el primer cerebro la cumple y sigue cumplida tras reiniciar el entrenamiento', () => {
  const completed = new Set();
  const s = createTrainSession({ completed });
  assert.equal(missionOf(s, 'save').done, false);
  s.brainSaved();
  assert.equal(missionOf(s, 'save').done, true);
  s.restart();
  assert.equal(missionOf(s, 'save').done, true);
  // Y también en una sesión nueva de la pestaña (al volver a montarla).
  assert.equal(missionOf(createTrainSession({ completed }), 'save').done, true);
});

test('misión de la función de fitness: terminar una generación con otra función la cumple', () => {
  const s = createTrainSession();
  s.generationEnded({ fitness: 'distance' });
  assert.equal(missionOf(s, 'fitness').done, false);
  s.generationEnded({ fitness: 'survival' });
  assert.equal(missionOf(s, 'fitness').done, true);
});

test('misiones con un entrenamiento real: la generación en curso se observa paso a paso', () => {
  const s = createTrainSession();
  const t = createTraining({ seed: 1, config: { population: 6 } });
  t.finishGeneration();
  t.finishGeneration();
  t.step();
  s.observe(t);
  assert.equal(missionOf(s, 'generations').progress, 3);
});

// --- Línea de la última generación (design.md D8) ------------------------------------------------
import { lastGeneration } from '../src/tabs/train/session.js';
import { END_REASONS } from '../src/core/training.js';

const withHistory = (...history) => ({ history });
const record = (generation, best, fitness, reason) => ({ generation, best, average: best / 4, fitness, reason });

test('última generación: antes de la primera devuelve null', () => {
  assert.equal(lastGeneration(createTraining({ seed: 1 })), null);
  assert.equal(lastGeneration(withHistory()), null);
});

test('última generación: generación 12 con 350 m porque todos quedaron fuera de carrera', () => {
  const r = lastGeneration(withHistory(record(11, 200, 'distance', 'timeLimit'), record(12, 350.8, 'distance', 'allCrashed')));
  assert.deepEqual(r, {
    best: { key: 'train.last.best.meters', params: { generation: 12, value: 350 } },
    reason: 'train.last.reason.allCrashed',
  });
});

test('última generación: la clave de cada unidad', () => {
  assert.deepEqual(lastGeneration(withHistory(record(3, 412.87, 'distance', 'timeLimit'))).best,
    { key: 'train.last.best.meters', params: { generation: 3, value: 412 } });
  assert.deepEqual(lastGeneration(withHistory(record(4, 28.34, 'survival', 'timeLimit'))).best,
    { key: 'train.last.best.seconds', params: { generation: 4, value: 28.3 } });
  assert.deepEqual(lastGeneration(withHistory(record(5, 11.06, 'speed', 'timeLimit'))).best,
    { key: 'train.last.best.metersPerSecond', params: { generation: 5, value: 11.1 } });
});

test('última generación: la clave de cada uno de los cuatro motivos', () => {
  assert.deepEqual([...END_REASONS], ['allCrashed', 'timeLimit', 'stalled', 'requested']);
  assert.equal(lastGeneration(withHistory(record(1, 10, 'distance', 'allCrashed'))).reason, 'train.last.reason.allCrashed');
  assert.equal(lastGeneration(withHistory(record(1, 10, 'distance', 'timeLimit'))).reason, 'train.last.reason.timeLimit');
  assert.equal(lastGeneration(withHistory(record(1, 10, 'distance', 'stalled'))).reason, 'train.last.reason.stalled');
  assert.equal(lastGeneration(withHistory(record(1, 10, 'distance', 'requested'))).reason, 'train.last.reason.requested');
});

test('última generación: con un entrenamiento real, la generación terminada a pedido', () => {
  const t = createTraining({ seed: 1, config: { population: 10 } });
  t.finishGeneration();
  const r = lastGeneration(t);
  assert.equal(r.best.params.generation, 1);
  assert.equal(r.best.key, 'train.last.best.meters');
  assert.equal(r.best.params.value, Math.floor(t.history[0].best));
  assert.equal(r.reason, 'train.last.reason.requested');
});

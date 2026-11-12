import test from 'node:test';
import assert from 'node:assert/strict';
import { indicators, fitnessText, shortFitnessText, leaderLabelKey, createTrainSession, MISSIONS } from '../src/tabs/train/session.js';
import { SHORTCUTS, shortcutFor, toggleTurbo } from '../src/tabs/train/shortcuts.js';
import { createTraining } from '../src/core/training.js';
import { createBrain } from '../src/core/brain.js';

// --- 16.1 Indicadores --------------------------------------------------------------------------

test('indicadores al empezar: generación 1, 100 de 100 en carrera y el mejor anterior no disponible (no cero)', () => {
  const t = createTraining({ seed: 1, config: { fitness: 'distance', population: 100 } });
  const ind = indicators(t);
  assert.equal(ind.generation, 1);
  assert.equal(ind.alive, 100);
  assert.equal(ind.total, 100);
  assert.equal(ind.lastBest, null);
  assert.equal(ind.lastReason, null);
  assert.deepEqual(ind.leader, { key: 'train.value.meters', params: { value: 0 } });
});

test('autos que chocan: con veinte autos fuera de carrera, el indicador muestra 80 de 100', () => {
  const t = createTraining({ seed: 1, config: { population: 100 } });
  for (let i = 0; i < 20; i++) t.world.retire(i, 'test');
  const ind = indicators(t);
  assert.equal(ind.alive, 80);
  assert.equal(ind.total, 100);
});

test('fin de una generación: el número aumenta y se muestran el mejor con su unidad y el motivo', () => {
  const t = createTraining({ seed: 1, config: { population: 10, fitness: 'distance' } });
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
  const t = createTraining({ seed: 1, config: { population: 6, fitness: 'distance' } });
  t.configure({ fitness: 'survival' });
  for (let i = 0; i < 60; i++) t.step();
  assert.equal(indicators(t).leader.key, 'train.value.meters');
  t.finishGeneration();
  for (let i = 0; i < 60; i++) t.step();
  assert.equal(indicators(t).leader.key, 'train.value.seconds');
});

// --- 16.2 Atajos ----------------------------------------------------------------------------------

test('atajos: barra espaciadora pausa, T alterna la velocidad máxima, N pasa de generación', () => {
  assert.deepEqual({ ...SHORTCUTS }, { Space: 'pause', KeyT: 'turbo', KeyN: 'next', KeyE: 'choose', KeyZ: 'undo' });
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
  assert.deepEqual(MISSIONS.map((m) => [m.id, m.goal]), [['generations', 5], ['passed', 5], ['save', 1], ['fitness', 1]]);
});

test('progreso: en la generación 3 la primera misión muestra 3 de 5, y se cumple al llegar a la 5', () => {
  const s = createTrainSession();
  const fake = (generation, passed = 0) => ({ generation, leaderIndex: 0, passedOf: () => passed });
  s.observe(fake(3));
  assert.deepEqual([missionOf(s, 'generations').progress, missionOf(s, 'generations').done], [3, false]);
  s.observe(fake(5));
  assert.equal(missionOf(s, 'generations').done, true);
  s.observe(fake(1, 3));
  assert.equal(missionOf(s, 'passed').progress, 3);
  s.observe(fake(1, 6));
  assert.equal(missionOf(s, 'passed').done, true);
  assert.equal(missionOf(s, 'passed').progress, 5);
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
  s.generationEnded({ fitness: 'lead' });
  assert.equal(missionOf(s, 'fitness').done, false);
  s.generationEnded({ fitness: 'survival' });
  assert.equal(missionOf(s, 'fitness').done, true);
});

test('misión de superar vehículos: con el líder en 3 y nadie antes con más, muestra 3 de 5; no baja si el líder cambia', () => {
  const s = createTrainSession();
  const fake = (passed) => ({ generation: 1, leaderIndex: 0, passedOf: () => passed });
  s.observe(fake(3));
  assert.deepEqual([missionOf(s, 'passed').progress, missionOf(s, 'passed').goal, missionOf(s, 'passed').done], [3, 5, false]);
  s.observe(fake(1));
  assert.equal(missionOf(s, 'passed').progress, 3);
  s.restart();
  assert.equal(missionOf(s, 'passed').progress, 0);
});

test('seguir al tráfico no la cumple: un auto que recorre 600 m detrás del primer vehículo deja la misión en 0 de 5', () => {
  // Acelera mientras no ve un vehículo cerca adelante: alcanza al primero y va detrás a su velocidad.
  const follower = {
    sizes: [6, 4], activation: 'step',
    layers: [{ weights: [[0, 0, -10, 0, 0, 0], [0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0]], biases: [1, -1, -1, -1] }],
  };
  const brain = createBrain({
    id: 'b', name: 'B', now: '2026-11-12T10:00:00.000Z', network: follower, sensors: { count: 5, range: 3, spread: 90 },
    training: { generations: 0, seed: 1, maxSpeed: 20, fitness: { kind: 'distance', best: 1 }, evolution: {}, scenarios: [] },
  });
  const t = createTraining({ seed: 2, config: { population: 2, mutationStrength: 0, mutationCooling: false, slowRule: false }, brain });
  const s = createTrainSession();
  while (t.leader.progress < 600) { assert.equal(t.step(), null); s.observe(t); }
  assert.equal(t.leader.crashed, false);
  assert.equal(missionOf(s, 'passed').progress, 0);
  assert.equal(missionOf(s, 'passed').done, false);
});

test('misión de la función de fitness: elegir una función distinta de la ventaja y terminar una generación la cumple', () => {
  const s = createTrainSession();
  const t = createTraining({ seed: 1, config: { population: 4 } });
  t.onGeneration((r) => s.generationEnded(r));
  t.finishGeneration();
  assert.equal(missionOf(s, 'fitness').done, false);
  t.configure({ fitness: 'distance' });
  t.finishGeneration();
  assert.equal(missionOf(s, 'fitness').done, false, 'la generación que terminó todavía era con ventaja');
  t.finishGeneration();
  assert.equal(missionOf(s, 'fitness').done, true);
});

test('indicadores: vehículos superados por el líder', () => {
  const t = createTraining({ seed: 1, config: { population: 4 } });
  assert.equal(indicators(t).passed, 0);
  for (let i = 0; i < 300; i++) t.step();
  assert.equal(indicators(t).passed, t.passedOf(t.leaderIndex));
});

test('valores de ventaja: 120,7 m de ventaja se muestran como 120 m de ventaja', () => {
  assert.deepEqual(fitnessText(120.7, 'lead'), { key: 'train.value.metersAhead', params: { value: 120 } });
  assert.deepEqual(fitnessText(-2, 'lead'), { key: 'train.value.metersAhead', params: { value: 0 } });
  assert.deepEqual(fitnessText(120.7, 'distance'), { key: 'train.value.meters', params: { value: 120 } });
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
  const t = createTraining({ seed: 1, config: { population: 10, fitness: 'distance' } });
  t.finishGeneration();
  const r = lastGeneration(t);
  assert.equal(r.best.params.generation, 1);
  assert.equal(r.best.key, 'train.last.best.meters');
  assert.equal(r.best.params.value, Math.floor(t.history[0].best));
  assert.equal(r.reason, 'train.last.reason.requested');
});

// --- Línea de estado del padre elegido (cambio seleccion-manual) --------------------------------

import { parentStatus } from '../src/tabs/train/session.js';

/** Entrenamiento de mentira con lo único que parentStatus lee. */
const fakeTraining = (parent, applied = 'manual', desired = applied) => ({ parent, selection: { applied, desired } });

test('estado del padre: el líder elegido, con la generación y el fitness redondeado en cada unidad', () => {
  assert.deepEqual(parentStatus(fakeTraining({ source: 'leader', generation: 4, fitness: 310.87, fitnessKind: 'distance' })),
    { key: 'train.parent.leader.meters', params: { generation: 4, value: 310 } });
  assert.deepEqual(parentStatus(fakeTraining({ source: 'leader', generation: 9, fitness: 12.34, fitnessKind: 'survival' })),
    { key: 'train.parent.leader.seconds', params: { generation: 9, value: 12.3 } });
  assert.deepEqual(parentStatus(fakeTraining({ source: 'leader', generation: 2, fitness: 17.96, fitnessKind: 'speed' })),
    { key: 'train.parent.leader.metersPerSecond', params: { generation: 2, value: 18 } });
});

test('estado del padre: el campeón que quedó al pasar a manual, en cada unidad', () => {
  assert.deepEqual(parentStatus(fakeTraining({ source: 'champion', generation: 12, fitness: 1194.2, fitnessKind: 'distance' })),
    { key: 'train.parent.champion.meters', params: { generation: 12, value: 1194 } });
  assert.deepEqual(parentStatus(fakeTraining({ source: 'champion', generation: 3, fitness: 41.25, fitnessKind: 'survival' })),
    { key: 'train.parent.champion.seconds', params: { generation: 3, value: 41.3 } });
  assert.deepEqual(parentStatus(fakeTraining({ source: 'champion', generation: 5, fitness: 9.04, fitnessKind: 'speed' })),
    { key: 'train.parent.champion.metersPerSecond', params: { generation: 5, value: 9 } });
});

test('estado del padre: un cerebro, por su nombre', () => {
  assert.deepEqual(parentStatus(fakeTraining({ source: 'brain', generation: 15, fitness: 400, fitnessKind: 'distance', name: 'Prudente' })),
    { key: 'train.parent.brain', params: { name: 'Prudente' } });
});

test('estado del padre: sin padre con el cambio a manual todavía sin regir, y sin padre con manual', () => {
  assert.deepEqual(parentStatus(fakeTraining(null, 'auto', 'manual')), { key: 'train.parent.pending', params: {} });
  assert.deepEqual(parentStatus(fakeTraining(null, 'manual')), { key: 'train.parent.none', params: {} });
});

test('estado del padre con un entrenamiento real: pendiente, campeón, líder elegido y, tras deshacer todo, ninguno', () => {
  const t = createTraining({ seed: 3, config: { population: 6, maxDuration: 10, fitness: 'distance' } });
  t.configure({ selectionMode: 'manual' });
  assert.equal(parentStatus(t).key, 'train.parent.pending');
  for (let i = 0; i < 30; i++) t.step();
  t.finishGeneration();
  const champ = t.champion;
  assert.deepEqual(parentStatus(t), { key: 'train.parent.champion.meters', params: { generation: 1, value: Math.floor(champ.fitness) } });
  for (let i = 0; i < 200 && !t.chooseLeader(); i++) t.step();
  assert.deepEqual(parentStatus(t).key, 'train.parent.leader.meters');
  assert.equal(parentStatus(t).params.generation, 2);
  while (t.undoChoice());
  assert.deepEqual(parentStatus(t), { key: 'train.parent.none', params: {} });
});

test('atajos de la selección manual: E elige al líder y Z deshace; con Ctrl o Cmd, o escribiendo, no hacen nada', () => {
  assert.equal(shortcutFor({ code: 'KeyE' }), 'choose');
  assert.equal(shortcutFor({ code: 'KeyZ' }), 'undo');
  assert.equal(shortcutFor({ code: 'KeyE', ctrlKey: true }), null);
  assert.equal(shortcutFor({ code: 'KeyZ', metaKey: true }), null);
  assert.equal(shortcutFor({ code: 'KeyZ', ctrlKey: true }), null);
  assert.equal(shortcutFor({ code: 'KeyE', metaKey: true }), null);
  assert.equal(shortcutFor({ code: 'KeyE', target: { tagName: 'INPUT', type: 'text' } }), null);
});

test('indicador del líder con la ventaja: se llama «Ventaja del líder» y dice 120 m', () => {
  assert.deepEqual(shortFitnessText(120.7, 'lead'), { key: 'train.value.meters', params: { value: 120 } });
  assert.deepEqual(shortFitnessText(12.34, 'survival'), fitnessText(12.34, 'survival'));
  const t = createTraining({ seed: 1, config: { population: 4 } });
  for (let i = 0; i < 120; i++) t.step();
  const ind = indicators(t);
  assert.equal(ind.leaderLabel, 'train.stats.leader.lead');
  assert.deepEqual(ind.leader, shortFitnessText(t.fitnessOf(t.leaderIndex), 'lead'));
  assert.equal(ind.leader.key, 'train.value.meters');
});

test('indicador con otra función: con la distancia vigente se llama «Distancia del líder»', () => {
  const t = createTraining({ seed: 1, config: { population: 4 } });
  t.configure({ fitness: 'distance' });
  assert.equal(indicators(t).leaderLabel, 'train.stats.leader.lead', 'hasta que rige, sigue la ventaja');
  t.finishGeneration();
  assert.equal(indicators(t).leaderLabel, 'train.stats.leader.distance');
  assert.deepEqual(['lead', 'distance', 'survival', 'speed'].map(leaderLabelKey),
    ['train.stats.leader.lead', 'train.stats.leader.distance', 'train.stats.leader.survival', 'train.stats.leader.speed']);
});

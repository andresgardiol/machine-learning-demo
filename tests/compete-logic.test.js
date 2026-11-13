// Lógica sin DOM de Competir: marcas (D7), resultados (D8), misiones (D15) y semillas (D2).
import test from 'node:test';
import assert from 'node:assert/strict';
import { trainedOn, sameTrafficOnly, markFor, practicedTraffic } from '../src/tabs/compete/marks.js';
import { createResults, otherSettings } from '../src/tabs/compete/results.js';
import { createCompeteMissions, MISSIONS } from '../src/tabs/compete/missions.js';
import { createSeedSeries, RACE_FIRST_SEED, seedFor, SCENARIO_TRAFFIC_SEED } from '../src/tabs/compete/seeds.js';

const scenario = (track, { mode = 'new', generations = 10, lanes = 3, density = 50, irregularity = 0 } = {}) => ({
  track, lanes, density, irregularity, trafficMode: mode, generations,
});
const brainWith = (...scenarios) => ({ training: { scenarios } });

// --- Marcas ------------------------------------------------------------------------------------

test('cerebro de una pista: practicó ahí y nunca vio las otras', () => {
  const b = brainWith(scenario('oval'));
  assert.equal(trainedOn(b, 'oval'), true);
  assert.equal(markFor(b, 'oval'), 'trained');
  for (const t of ['straight', 'kidney', 'grandPrix']) assert.equal(markFor(b, t), 'unseen');
});

test('cerebro de varias pistas (alternadas): practicó en las dos y no vio las otras', () => {
  const b = brainWith(scenario('straight+oval'));
  assert.equal(markFor(b, 'straight'), 'trained');
  assert.equal(markFor(b, 'oval'), 'trained');
  assert.equal(markFor(b, 'kidney'), 'unseen');
  assert.equal(markFor(b, 'grandPrix'), 'unseen');
});

test('modo same: en la calle, practicó con un solo tráfico', () => {
  const b = brainWith(scenario('straight', { mode: 'same' }));
  assert.equal(sameTrafficOnly(b), true);
  assert.equal(markFor(b, 'straight'), 'trainedSame');
});

test('los dos modos: practicó, sin la aclaración de un tráfico', () => {
  const b = brainWith(scenario('straight', { mode: 'same' }), scenario('straight', { mode: 'new' }));
  assert.equal(sameTrafficOnly(b), false);
  assert.equal(markFor(b, 'straight'), 'trained');
});

test('escenarios sin generaciones no cuentan', () => {
  const b = brainWith(scenario('oval', { generations: 0 }), scenario('straight', { mode: 'same', generations: 0 }));
  assert.equal(markFor(b, 'oval'), 'unseen');
  assert.equal(markFor(b, 'straight'), 'unseen');
  assert.equal(sameTrafficOnly(b), false);
  assert.equal(markFor(brainWith(), 'straight'), 'unseen');
});

test('el programa y la persona no llevan marca', () => {
  assert.equal(markFor(null, 'straight'), null);
});

test('practicó con el tráfico de práctica: calle, modo same, mismos carriles, densidad e irregularidad', () => {
  const b = brainWith(scenario('straight', { mode: 'same' }));
  assert.equal(practicedTraffic(b, { lanes: 3, density: 50, irregularity: 0 }), true);
  assert.equal(practicedTraffic(b, { lanes: 3, density: 60, irregularity: 0 }), false);
  assert.equal(practicedTraffic(b, { lanes: 4, density: 50, irregularity: 0 }), false);
  assert.equal(practicedTraffic(brainWith(scenario('straight')), { lanes: 3, density: 50, irregularity: 0 }), false);
});

// --- Resultados ------------------------------------------------------------------------------------

const settings = { lanes: 3, density: 50, irregularity: 0, maxSpeed: 20, crashPenalty: 0.1 };
const arrived = (time, crashes = 0) => ({ arrived: true, time, share: 1, crashes });
const unfinished = (share, crashes) => ({ arrived: false, time: null, share, crashes });

test('la calle recta guarda un resultado por tráfico; el circuito, uno', () => {
  const r = createResults();
  r.record({ track: 'straight', traffic: 'practice', settings, entries: [{ key: 'b', signature: 's1', result: arrived(50.3) }] });
  r.record({ track: 'straight', traffic: 'new', settings, entries: [{ key: 'b', signature: 's1', result: unfinished(0.64, 7) }] });
  r.record({ track: 'straight', traffic: 'new', settings, entries: [{ key: 'b', signature: 's1', result: arrived(52, 1) }] });
  const cell = r.cell('b', 's1', 'straight', settings);
  assert.deepEqual(cell.map((c) => c.traffic), ['new', 'practice']);
  assert.equal(cell[0].result.time, 52, 'el último de cada tráfico');
  r.record({ track: 'oval', settings, entries: [{ key: 'b', signature: 's1', result: arrived(60) }] });
  assert.equal(r.cell('b', 's1', 'oval', settings).length, 1);
  assert.deepEqual(r.cell('b', 's1', 'kidney', settings), []);
});

test('solo un tráfico nuevo: no dice nada del de práctica', () => {
  const r = createResults();
  r.record({ track: 'straight', settings, entries: [{ key: 'b', signature: 's', result: arrived(50) }] });
  assert.deepEqual(r.cell('b', 's', 'straight', settings).map((c) => c.traffic), ['new']);
});

test('con otros ajustes (incluida otra penalización), el resultado se marca y no se borra', () => {
  const r = createResults();
  r.record({ track: 'straight', settings, entries: [{ key: 'b', signature: 's', result: arrived(50) }] });
  r.record({ track: 'oval', settings, entries: [{ key: 'b', signature: 's', result: arrived(60) }] });
  assert.equal(r.cell('b', 's', 'straight', settings)[0].other, false);
  for (const change of [{ crashPenalty: 2 }, { maxSpeed: 25 }, { density: 80 }, { lanes: 4 }, { irregularity: 50 }]) {
    assert.equal(r.cell('b', 's', 'straight', { ...settings, ...change })[0].other, true, JSON.stringify(change));
  }
  assert.equal(r.cell('b', 's', 'oval', { ...settings, density: 80 })[0].other, false, 'en un circuito el tráfico no cuenta');
  assert.equal(r.cell('b', 's', 'oval', { ...settings, crashPenalty: 0 })[0].other, true);
  assert.equal(otherSettings(settings, settings, 'straight'), false);
});

test('competidor desmarcado y vuelto a marcar: sus resultados se conservan', () => {
  const r = createResults();
  r.record({ track: 'oval', settings, entries: [{ key: 'x', signature: 's', result: arrived(60) }] });
  r.record({ track: 'kidney', settings, entries: [{ key: 'y', signature: 't', result: arrived(40) }] });
  // "x" no corrió en kidney, pero su resultado del óvalo sigue.
  assert.equal(r.cell('x', 's', 'oval', settings).length, 1);
});

test('cerebro actualizado o programa cambiado: pierde sus resultados; eliminado: también', () => {
  const r = createResults();
  r.record({ track: 'oval', settings, entries: [
    { key: 'brain:a', signature: 'brain:a:1', result: arrived(60) },
    { key: 'program', signature: 'program:avanzar', result: arrived(65) },
    { key: 'brain:gone', signature: 'g', result: arrived(70) },
  ] });
  assert.deepEqual(r.cell('brain:a', 'brain:a:2', 'oval', settings), [], 'otra firma, sin resultados');
  r.prune([{ key: 'brain:a', signature: 'brain:a:2' }, { key: 'program', signature: 'program:retroceder' }]);
  assert.equal(r.has('brain:a', 'brain:a:1'), false);
  assert.equal(r.has('program', 'program:avanzar'), false);
  assert.equal(r.has('brain:gone', 'g'), false);
  assert.equal(r.size, 0);
});

test('borrar resultados vacía todo', () => {
  const r = createResults();
  r.record({ track: 'oval', settings, entries: [{ key: 'x', signature: 's', result: arrived(60) }] });
  r.clear();
  assert.equal(r.size, 0);
  assert.deepEqual(r.cell('x', 's', 'oval', settings), []);
});

// --- Misiones ------------------------------------------------------------------------------------

const human = (result) => ({ key: 'human', kind: 'human', result });
const brainEntry = (brain, result) => ({ key: 'example:x', kind: 'example', brain, result });

test('misiones: tres, en orden', () => {
  assert.deepEqual(MISSIONS.map((m) => m.id), ['tracks', 'unseen', 'beatBrain']);
});

test('progreso de las pistas: dos pistas distintas, 2 de 4; las cuatro, cumplida', () => {
  const m = createCompeteMissions();
  const entries = [human(arrived(60))];
  m.raceEnded({ track: 'straight', entries, standings: [0] });
  m.raceEnded({ track: 'straight', entries, standings: [0] });
  m.raceEnded({ track: 'oval', entries, standings: [0] });
  assert.equal(m.missions[0].progress, 2);
  assert.equal(m.missions[0].done, false);
  m.raceEnded({ track: 'kidney', entries, standings: [0] });
  m.raceEnded({ track: 'grandPrix', entries, standings: [0] });
  assert.equal(m.missions[0].done, true);
});

test('cerebro fuera de lo que vio: chocó en una pista donde no entrenó', () => {
  const m = createCompeteMissions();
  const ovalBrain = brainWith(scenario('oval'));
  m.raceEnded({ track: 'oval', entries: [brainEntry(ovalBrain, arrived(60, 3))], standings: [0] });
  assert.equal(m.missions[1].done, false, 'chocar donde entrenó no cuenta');
  m.raceEnded({ track: 'straight', entries: [brainEntry(ovalBrain, unfinished(0.3, 0))], standings: [0] });
  assert.equal(m.missions[1].done, false, 'sin choques no cuenta');
  m.raceEnded({ track: 'straight', entries: [brainEntry(ovalBrain, unfinished(0.3, 2))], standings: [0] });
  assert.equal(m.missions[1].done, true);
});

test('ganarle a un cerebro: vos llegaste y quedaste por delante de al menos uno', () => {
  const m = createCompeteMissions();
  const b = brainWith(scenario('straight'));
  m.raceEnded({ track: 'straight', entries: [human(unfinished(0.8, 0)), brainEntry(b, unfinished(0.5, 9))], standings: [0, 1] });
  assert.equal(m.missions[2].done, false, 'sin llegar no cuenta');
  m.raceEnded({ track: 'straight', entries: [human(arrived(60)), brainEntry(b, arrived(52))], standings: [1, 0] });
  assert.equal(m.missions[2].done, false, 'llegar detrás no cuenta');
  m.raceEnded({ track: 'straight', entries: [human(arrived(60)), { key: 'program:seven', kind: 'program', result: unfinished(0.5, 1) }], standings: [0, 1] });
  assert.equal(m.missions[2].done, false, 'ganarle a un programa no cuenta');
  m.raceEnded({ track: 'straight', entries: [human(arrived(51)), brainEntry(b, arrived(52))], standings: [0, 1] });
  assert.equal(m.missions[2].done, true);
});

test('una misión cumplida sigue marcada en otra sesión de la pestaña', () => {
  const completed = new Set();
  const tracks = new Set();
  createCompeteMissions({ completed, tracks }).raceEnded({ track: 'straight', entries: [brainEntry(brainWith(scenario('oval')), unfinished(0.1, 1))], standings: [0] });
  const again = createCompeteMissions({ completed, tracks });
  assert.equal(again.missions[1].done, true);
  assert.equal(again.missions[0].progress, 1);
});

// --- Semillas --------------------------------------------------------------------------------------

test('la primera carrera tiene una semilla fija, distinta de la del tráfico de práctica', () => {
  assert.equal(createSeedSeries().first, RACE_FIRST_SEED);
  assert.notEqual(RACE_FIRST_SEED, SCENARIO_TRAFFIC_SEED);
});

test('otra carrera: no repite ninguna semilla ni usa la del tráfico de práctica', () => {
  const s = createSeedSeries();
  const seen = new Set([RACE_FIRST_SEED]);
  for (let i = 0; i < 500; i++) {
    const n = s.next();
    assert.equal(seen.has(n), false);
    assert.notEqual(n, SCENARIO_TRAFFIC_SEED);
    seen.add(n);
  }
  assert.equal(createSeedSeries().next(), createSeedSeries().next(), 'la serie es la misma en cada visita a la aplicación');
});

test('el tráfico de práctica usa siempre su semilla', () => {
  assert.equal(seedFor('practice', 1234), SCENARIO_TRAFFIC_SEED);
  assert.equal(seedFor('new', 1234), 1234);
});

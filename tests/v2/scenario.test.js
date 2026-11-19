import test from 'node:test';
import assert from 'node:assert/strict';
import { createScenario, DEFAULT_SCENARIO, parseScenario, normalizeScenario } from '../../src/v2/scenario.js';

test('v2/escenario: un cambio del común se ve en todas las etapas que no lo fijan', () => {
  const s = createScenario();
  s.set('problema', 'density', 80);
  for (const st of ['problema', 'reglas', 'evolucion', 'evaluar']) assert.equal(s.forStage(st).density, 80, st);
});

test('v2/escenario: los valores de etapa no tocan el común', () => {
  const s = createScenario();
  assert.equal(s.forStage('problema').irregularity, 50);
  assert.equal(s.forStage('evolucion').irregularity, 0);
  assert.equal(s.isFixed('evolucion', 'irregularity'), true);
  s.set('evolucion', 'irregularity', 30);
  assert.equal(s.forStage('evolucion').irregularity, 30);
  assert.equal(s.common.irregularity, 50);
  assert.equal(s.forStage('evaluar').irregularity, 0);
  s.fix('entender', { track: 'oval', density: 0 });
  assert.equal(s.forStage('entender').track, 'oval');
  assert.equal(s.common.track, 'straight');
  s.resetStage('evolucion');
  assert.equal(s.forStage('evolucion').irregularity, 0);
});

test('v2/escenario: mismas entradas, mismo resultado, y se guarda solo el común', () => {
  const guardado = [];
  const a = createScenario({ save: (j) => guardado.push(j) });
  const b = createScenario();
  for (const x of [a, b]) { x.set('reglas', 'lanes', 4); x.set('evolucion', 'irregularity', 20); x.set(null, 'maxSpeed', 25); }
  for (const st of ['problema', 'evolucion', 'evaluar']) assert.deepEqual(a.forStage(st), b.forStage(st));
  assert.deepEqual(JSON.parse(guardado.at(-1)), { ...DEFAULT_SCENARIO, lanes: 4, maxSpeed: 25 });
});

test('v2/escenario: lo guardado inválido vuelve a fábrica y lo fuera de rango se ajusta', () => {
  assert.deepEqual(parseScenario('{malo'), { ...DEFAULT_SCENARIO });
  assert.deepEqual(parseScenario(null), { ...DEFAULT_SCENARIO });
  const n = normalizeScenario({ lanes: 9, density: 400, track: 'luna', maxSpeed: 2 });
  assert.equal(n.lanes, DEFAULT_SCENARIO.lanes);
  assert.equal(n.density, 100);
  assert.equal(n.track, 'straight');
  assert.ok(n.maxSpeed >= 12);
});

test('v2/escenario: avisa a los suscriptores', () => {
  const s = createScenario();
  const vistos = [];
  const off = s.subscribe((e) => vistos.push(e.stage));
  s.set('problema', 'density', 10);
  off();
  s.set('problema', 'density', 20);
  assert.deepEqual(vistos, ['problema']);
});

test('restablecer avisa que viene de restablecer (las etapas vuelven al tráfico de la semilla, trafico-vivo)', () => {
  const s = createScenario();
  const seen = [];
  s.subscribe((e) => seen.push(e.reset));
  s.set(null, 'irregularity', 0);
  s.resetCommon();
  s.resetStage('problema');
  assert.deepEqual(seen, [false, true, true]);
});

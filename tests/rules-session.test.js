// Lógica sin DOM de la pestaña Reglas a mano (design.md D9, tarea 5.2): indicadores, reintento
// automático a los 90 pasos y misiones.
import test from 'node:test';
import assert from 'node:assert/strict';
import es from '../src/i18n/es.js';
import { createRulesSession, MISSIONS, RETRY_STEPS } from '../src/tabs/rules/session.js';
import { parseProgram, createRulesController } from '../src/core/rules.js';
import { createWorld } from '../src/core/world.js';
import { DEFAULT_SETTINGS, worldSpec } from '../src/tabs/shared/street-settings.js';
import { EXAMPLES, DEFAULT_SEED, sensorSettings } from '../src/tabs/rules/examples.js';

/**
 * Mundo de mentira: el auto está en `progress` y hay un vehículo cada 20 m desde los 30 m; los que
 * quedaron atrás cuentan como superados.
 */
function fakeWorld() {
  return {
    progress: 0, crashed: false, paused: false,
    vehiclesIn(from, to) {
      const out = [];
      for (let d = 30; d <= to; d += 20) if (d >= from) out.push({ id: `v${d}`, distance: d });
      return out;
    },
  };
}
/** Posición en la que el auto superó `n` vehículos (deja el último 10 m atrás). */
const passedAt = (n) => (n === 0 ? 0 : 30 + 20 * (n - 1) + 10);
/** Lleva el auto, de a 5 m y observando cada paso, hasta superar `n` vehículos. */
function passVehicles(world, n, session = null, options = { seed: 2 }) {
  const target = passedAt(n);
  if (!session || target < world.progress) { world.progress = target; return; }
  while (world.progress < target) {
    world.progress = Math.min(target, world.progress + 5);
    session.step(world, options);
  }
}
const missions = (session) => Object.fromEntries(session.missions.map((m) => [m.id, `${m.progress}/${m.goal}${m.done ? ' ✓' : ''}`]));

test('misiones de la pestaña: superar 3 y 10 vehículos, y 10 vehículos en 3 tráficos', () => {
  assert.deepEqual(MISSIONS.map((m) => [m.id, m.goal]), [['pass', 3], ['passMany', 10], ['traffics', 3]]);
  assert.equal(RETRY_STEPS, 90);
});

test('Progreso: con dos vehículos superados, la primera misión muestra 2 de 3 y la segunda 2 de 10', () => {
  const session = createRulesSession();
  const world = fakeWorld();
  passVehicles(world, 2, session);
  assert.equal(session.passed, 2);
  assert.deepEqual(missions(session), { pass: '2/3', passMany: '2/10', traffics: '0/3' });
});

test('Frenar no alcanza: el ejemplo que frena recorre un kilómetro sin chocar y ninguna misión avanza', () => {
  const three = EXAMPLES.find((e) => e.id === 'three');
  const { program } = parseProgram(es[three.textKey], { sensors: three.sensors.count });
  const world = createWorld({ ...worldSpec({ ...DEFAULT_SETTINGS, ...sensorSettings(three) }, DEFAULT_SEED), controller: createRulesController({ program }) });
  const session = createRulesSession();
  while (session.distance < 1000) {
    world.step();
    session.step(world, { seed: DEFAULT_SEED });
    assert.ok(world.steps < 120 * 60, 'no llegó al kilómetro en dos minutos');
  }
  assert.equal(world.crashed, false);
  assert.ok(session.distance >= 1000);
  assert.deepEqual(missions(session), { pass: '0/3', passMany: '0/10', traffics: '0/3' });
});

test('Tráficos distintos: 10 vehículos, tráfico nuevo y otros 10 → la tercera misión muestra 2 de 3', () => {
  const session = createRulesSession();
  const world = fakeWorld();
  passVehicles(world, 10, session, { seed: 2 });
  assert.equal(missions(session).traffics, '1/3');
  // el mismo tráfico otra vez no suma
  session.restart();
  world.progress = 0;
  passVehicles(world, 10, session, { seed: 2 });
  assert.equal(missions(session).traffics, '1/3');
  session.restart();
  world.progress = 0;
  passVehicles(world, 10, session, { seed: 3 });
  assert.equal(missions(session).traffics, '2/3');
});

test('Cambiar el programa: con la tercera misión en 2 de 3, vuelve a 0 de 3', () => {
  const session = createRulesSession();
  const world = fakeWorld();
  for (const seed of [2, 3]) {
    session.restart();
    world.progress = 0;
    passVehicles(world, 10, session, { seed });
  }
  assert.equal(missions(session).traffics, '2/3');
  session.programChanged();
  assert.equal(missions(session).traffics, '0/3');
  // el intento en curso (con 10 superados con el programa anterior) no vuelve a contar
  passVehicles(world, 11, session, { seed: 3 });
  assert.equal(missions(session).traffics, '0/3');
  // el intento siguiente, ya con el programa nuevo, sí
  session.restart();
  world.progress = 0;
  passVehicles(world, 10, session, { seed: 3 });
  assert.equal(missions(session).traffics, '1/3');
});

test('Misión cumplida: sigue marcada después de cambiar el programa, también en otra sesión', () => {
  const completed = new Set();
  const session = createRulesSession({ completed });
  const world = fakeWorld();
  passVehicles(world, 3, session);
  assert.equal(missions(session).pass, '3/3 ✓');
  session.programChanged();
  session.restart();
  passVehicles(world, 0);
  session.step(world, { seed: 2 });
  assert.equal(missions(session).pass, '0/3 ✓');
  assert.equal(missions(createRulesSession({ completed })).pass, '0/3 ✓');
});

test('las misiones cuentan vehículos superados sin chocar: después del choque no suma', () => {
  const session = createRulesSession();
  const world = fakeWorld();
  passVehicles(world, 2, session);
  world.crashed = true;
  session.step(world, { seed: 2, autoRetry: false });
  passVehicles(world, 5);
  session.step(world, { seed: 2, autoRetry: false });
  assert.equal(session.passed, 2);
  assert.equal(missions(session).pass, '2/3');
});

test('Reintento encendido: a los 90 pasos de simulación desde el choque pide reiniciar, no antes', () => {
  const session = createRulesSession();
  const world = fakeWorld();
  world.progress = 40;
  session.step(world, { seed: 2 });
  world.crashed = true;
  const answers = [];
  for (let i = 0; i < RETRY_STEPS; i += 1) answers.push(session.step(world, { seed: 2, autoRetry: true }));
  assert.deepEqual(answers.slice(0, RETRY_STEPS - 1).filter(Boolean), []);
  assert.equal(answers[RETRY_STEPS - 1], 'retry');
  session.restart();
  assert.equal(session.sinceCrash, 0);
  assert.equal(session.distance, 0);
});

test('Reintento apagado: el choque espera a que se reinicie a mano', () => {
  const session = createRulesSession();
  const world = fakeWorld();
  world.crashed = true;
  for (let i = 0; i < RETRY_STEPS * 3; i += 1) assert.equal(session.step(world, { seed: 2, autoRetry: false }), null);
});

test('En pausa no se reintenta: los pasos en pausa no cuentan y al reanudar sigue la cuenta', () => {
  const session = createRulesSession();
  const world = fakeWorld();
  world.crashed = true;
  for (let i = 0; i < 30; i += 1) session.step(world, { seed: 2 });
  world.paused = true;
  for (let i = 0; i < RETRY_STEPS * 2; i += 1) assert.equal(session.step(world, { seed: 2 }), null);
  assert.equal(session.sinceCrash, 30);
  world.paused = false;
  let answer = null;
  let steps = 0;
  while (!answer) { answer = session.step(world, { seed: 2 }); steps += 1; }
  assert.equal(steps, RETRY_STEPS - 30);
});

test('Corregir entre intentos: el intento siguiente usa el programa corregido', () => {
  const controller = createRulesController({ program: parseProgram('avanzar, girar izquierda', { sensors: 5 }).program });
  const world = createWorld({ ...worldSpec(DEFAULT_SETTINGS, 2), controller });
  const session = createRulesSession();
  let retried = false;
  let corrected = false;
  for (let i = 0; i < 60 * 30 && !retried; i += 1) {
    world.step();
    if (world.crashed && !corrected) { // se corrige mientras espera el reintento
      controller.setProgram(parseProgram('avanzar', { sensors: 5 }).program);
      corrected = true;
    }
    retried = session.step(world, { seed: 2 }) === 'retry';
  }
  assert.equal(retried, true);
  world.reset();
  session.restart();
  for (let i = 0; i < 60; i += 1) world.step();
  assert.deepEqual(controller.controls, { forward: true, reverse: false, left: false, right: false });
  assert.ok(world.progress > 5);
});

test('Mejor distancia: un intento que termina con más distancia que la mejor pasa a ser la mejor', () => {
  const session = createRulesSession();
  const world = fakeWorld();
  world.progress = 120;
  world.crashed = true;
  session.step(world, { seed: 2, autoRetry: false });
  assert.equal(session.best, 120);
  session.restart();
  world.crashed = false;
  world.progress = 80;
  session.step(world, { seed: 2 });
  session.restart();
  assert.equal(session.best, 120);
  world.progress = 300;
  session.step(world, { seed: 2 });
  world.crashed = true;
  session.step(world, { seed: 2 });
  assert.equal(session.best, 300);
});

// Pista en los ajustes de las pestañas El problema y Reglas a mano (circuitos-y-paisaje, grupo 7).
import test from 'node:test';
import assert from 'node:assert/strict';
import {
  DEFAULT_SETTINGS, normalizeSettings, needsRestart, worldSpec, onCircuit, lapsShown, RESTART_KEYS, TRAFFIC_KEYS,
} from '../src/tabs/shared/street-settings.js';
import { createWorld } from '../src/core/world.js';
import { createDriveSession } from '../src/tabs/drive/session.js';
import { createRulesSession, viewOptions } from '../src/tabs/rules/session.js';
import { EXAMPLES, INITIAL_PROGRAM, settingsForProgram } from '../src/tabs/rules/examples.js';
import { createRulesController } from '../src/core/rules.js';
import { createProgramState } from '../src/tabs/rules/program.js';
import es from '../src/i18n/es.js';

test('la pista es la calle recta por defecto; una pista desconocida vuelve a la calle', () => {
  assert.equal(DEFAULT_SETTINGS.track, 'straight');
  assert.equal(normalizeSettings({}).track, 'straight');
  assert.equal(normalizeSettings({ track: 'oval' }).track, 'oval');
  assert.equal(normalizeSettings({ track: 'monza' }).track, 'straight');
  assert.equal(onCircuit({ track: 'grandPrix' }), true);
  assert.equal(onCircuit({}), false);
});

test('cambiar la pista obliga a reiniciar el intento', () => {
  assert.ok(RESTART_KEYS.includes('track'));
  assert.equal(needsRestart(DEFAULT_SETTINGS, { ...DEFAULT_SETTINGS, track: 'oval' }), true);
  assert.equal(needsRestart({ ...DEFAULT_SETTINGS, track: 'oval' }, { ...DEFAULT_SETTINGS, track: 'oval', maxSpeed: 30 }), false);
  assert.deepEqual([...TRAFFIC_KEYS], ['lanes', 'density', 'irregularity']);
});

test('el mundo de los ajustes corre en la pista elegida, con los mismos sensores', () => {
  const settings = { ...DEFAULT_SETTINGS, track: 'kidney', sensorCount: 7 };
  const w = createWorld(worldSpec(settings, 1));
  assert.equal(w.trackId, 'kidney');
  assert.equal(w.perception.sensors.length, 7);
  assert.deepEqual(w.car.position, w.track.pointAt(0).position);
});

test('restablecer vuelve a la calle recta y conserva fuera de los circuitos el tráfico elegido', () => {
  const circuit = normalizeSettings({ ...DEFAULT_SETTINGS, track: 'oval', density: 80 });
  assert.equal(needsRestart(circuit, DEFAULT_SETTINGS), true);
  assert.equal(normalizeSettings({ ...DEFAULT_SETTINGS }).track, 'straight');
  // Valores conservados: pasar a un circuito y volver no toca la densidad.
  const back = normalizeSettings({ ...circuit, track: 'straight' });
  assert.equal(back.density, 80);
  assert.equal(createWorld(worldSpec(back, 1)).traffic.density, 80);
  assert.equal(createWorld(worldSpec(circuit, 1)).vehiclesIn(-1e5, 1e5).length, 0);
});

test('Indicador de vueltas: una vuelta y media muestra 1,5; una y cuarto, 1,2 (un decimal, hacia abajo)', () => {
  assert.equal(lapsShown(900, 600), 1.5);
  assert.equal(lapsShown(750, 600), 1.2);
  assert.equal(lapsShown(600, 600), 1);
  assert.equal(lapsShown(-30, 600), 0);
  assert.equal(lapsShown(614.1 * 0.99, 614.1), 0.9);
});

test('en un circuito las misiones de El problema no avanzan', () => {
  const completed = new Set();
  const session = createDriveSession({ completed });
  const world = { progress: 0, crashed: false, vehiclesIn: () => [] };
  for (let d = 0; d <= 800; d += 10) session.observe({ ...world, progress: d }, { machineView: true, missions: false });
  assert.equal(completed.size, 0);
  assert.equal(session.machineDistance, 0);
  for (let d = 800; d <= 1600; d += 10) session.observe({ ...world, progress: d }, { machineView: false });
  assert.ok(completed.has('distance'));
});

test('Reglas a mano: cargar un ejemplo o restablecer vuelve a la calle recta con los sensores del programa', () => {
  const onOval = normalizeSettings({ ...DEFAULT_SETTINGS, track: 'oval', density: 70, maxSpeed: 25 });
  const seven = EXAMPLES.find((e) => e.id === 'seven');
  const loaded = normalizeSettings(settingsForProgram(onOval, seven));
  assert.equal(loaded.track, 'straight');
  assert.equal(loaded.sensorCount, 7);
  assert.equal(loaded.density, 70);
  assert.equal(loaded.maxSpeed, 25);
  assert.equal(normalizeSettings(settingsForProgram(onOval, INITIAL_PROGRAM)).track, 'straight');
  assert.ok(es['rules.confirm.example.circuit'].includes('{name}'));
});

test('Reglas a mano: ver como la máquina fuerza los rayos y se apaga al chocar', () => {
  assert.deepEqual(viewOptions({ showSensors: false, machineView: true }, { crashed: false }), { showSensors: true, machineView: true });
  assert.deepEqual(viewOptions({ showSensors: false, machineView: true }, { crashed: true }), { showSensors: true, machineView: false });
  assert.deepEqual(viewOptions({ showSensors: true, machineView: false }, { crashed: false }), { showSensors: true, machineView: false });
});

test('Reglas a mano: El programa sigue igual con ver como la máquina activo y apagado', () => {
  const run = (machineView) => {
    const program = createProgramState({ text: es[INITIAL_PROGRAM.textKey], sensors: 5 });
    const controller = createRulesController({ program: program.valid });
    const world = createWorld({ ...worldSpec({ ...DEFAULT_SETTINGS, track: 'oval' }, 2), controller });
    const session = createRulesSession();
    const state = { showSensors: false, machineView };
    const out = [];
    for (let i = 0; i < 900; i++) {
      world.step();
      if (session.step(world, { seed: 2, autoRetry: true }) === 'retry') { world.reset(); session.restart(); }
      viewOptions(state, world); // lo único que el modo cambia: qué se dibuja
      out.push(JSON.stringify(world.snapshot()));
    }
    return out;
  };
  assert.deepEqual(run(true), run(false));
});

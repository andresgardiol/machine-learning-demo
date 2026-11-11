import test from 'node:test';
import assert from 'node:assert/strict';
import { createDriveSession, relativePosition, MISSIONS } from '../src/tabs/drive/session.js';
import { createWorld } from '../src/core/world.js';
import { constantController } from '../src/core/controller.js';
import { CAR_LENGTH } from '../src/core/constants.js';

/** Mundo falso para controlar exactamente progreso, choque y vehículos cercanos. */
function fakeWorld() {
  const w = {
    progress: 0,
    crashed: false,
    vehicles: [],
    vehiclesIn(from, to) { return w.vehicles.filter((v) => v.distance >= from && v.distance <= to); },
  };
  return w;
}

/** Avanza el mundo falso hasta `to` en pasos de 1 m, observando en cada uno. */
function driveTo(session, w, to, opts) {
  while (w.progress < to) {
    w.progress = Math.min(to, w.progress + 1);
    session.observe(w, opts);
  }
}

const mission = (session, id) => session.missions.find((m) => m.id === id);

test('posición relativa: superado recién cuando la cola del auto pasó el frente del vehículo', () => {
  assert.equal(relativePosition(100, 100 - CAR_LENGTH - 0.01), 'behind');
  assert.equal(relativePosition(100, 100 - CAR_LENGTH), 'alongside');
  assert.equal(relativePosition(100, 100), 'alongside');
  assert.equal(relativePosition(100, 100 + CAR_LENGTH + 0.01), 'ahead');
});

test('valores iniciales: distancia 0, 0 superados, 1 intento, mejor distancia 0', () => {
  const s = createDriveSession();
  assert.equal(s.distance, 0);
  assert.equal(s.passed, 0);
  assert.equal(s.attempts, 1);
  assert.equal(s.best, 0);
  assert.deepEqual(s.missions.map((m) => [m.id, m.progress, m.goal, m.done]), [
    ['pass', 0, 5, false], ['distance', 0, 500, false], ['machine', 0, 200, false],
  ]);
});

test('avanzar (con el mundo real): la distancia crece de forma continua y los superados aumentan de a uno', () => {
  // Semilla cuyo primer grupo tiene un solo vehículo y deja libre el carril del auto (el del medio).
  const seed = Array.from({ length: 500 }, (_, i) => i + 1).find((sd) => {
    const w = createWorld({ seed: sd });
    const lanes = [0, 1, 2, 3].map((k) => w.traffic.groupAt(k).vehicles.map((v) => v.lane));
    return lanes[0].length === 1 && lanes.every((l) => !l.includes(1));
  });
  assert.ok(seed, 'hay una semilla adecuada');
  const world = createWorld({ seed, controller: constantController({ forward: true }) });
  const session = createDriveSession();
  let previous = 0;
  const jumps = [];
  for (let i = 0; i < 60 * 30 && session.passed < 2; i++) {
    world.step();
    session.observe(world);
    assert.equal(world.crashed, false);
    assert.ok(session.distance >= previous, 'la distancia nunca retrocede al avanzar');
    assert.ok(session.distance - previous < 1, 'la distancia crece de a poco, sin saltos');
    if (jumps.length === 0 || jumps.at(-1).passed !== session.passed) jumps.push({ step: i, passed: session.passed });
    previous = session.distance;
  }
  assert.equal(Math.floor(session.distance), Math.floor(world.progress));
  assert.deepEqual(jumps.map((j) => j.passed).slice(0, 2), [0, 1], 'el primer vehículo suma exactamente uno');
  assert.ok(session.passed >= 1);
});

test('un vehículo que vuelve a quedar por delante deja de contar como superado', () => {
  const s = createDriveSession();
  const w = fakeWorld();
  w.vehicles = [{ id: '0:0', distance: 20 }];
  driveTo(s, w, 30);
  assert.equal(s.passed, 1);
  w.progress = 10; // el auto quedó atrás (por ejemplo, retrocedió)
  s.observe(w);
  assert.equal(s.passed, 0);
});

test('reiniciar suma un intento y vuelve a cero distancia y superados', () => {
  const s = createDriveSession();
  const w = fakeWorld();
  w.vehicles = [{ id: '0:0', distance: 20 }];
  driveTo(s, w, 40);
  assert.equal(s.distance, 40);
  assert.equal(s.passed, 1);
  s.restart();
  assert.equal(s.attempts, 2);
  assert.equal(s.distance, 0);
  assert.equal(s.passed, 0);
});

test('reinicio sin sumar intento (arrastre de un deslizador): vuelve a cero lo del intento pero no los intentos', () => {
  const s = createDriveSession();
  const w = fakeWorld();
  driveTo(s, w, 40);
  s.restart({ countAttempt: false });
  assert.equal(s.attempts, 1);
  assert.equal(s.distance, 0);
  assert.equal(s.best, 40);
});

test('nueva mejor distancia: un intento que termina más lejos pasa a ser la mejor', () => {
  const s = createDriveSession();
  let w = fakeWorld();
  driveTo(s, w, 120);
  w.crashed = true;
  s.observe(w);
  assert.equal(s.best, 120, 'al chocar, el intento termina y se registra');
  s.restart();
  w = fakeWorld();
  driveTo(s, w, 80);
  s.restart();
  assert.equal(s.best, 120, 'un intento más corto no cambia la mejor');
  w = fakeWorld();
  driveTo(s, w, 300);
  w.crashed = true;
  s.observe(w);
  assert.equal(s.best, 300);
  assert.equal(s.attempts, 3);
});

test('la mejor distancia no cambia mientras el intento sigue en marcha', () => {
  const s = createDriveSession();
  const w = fakeWorld();
  driveTo(s, w, 50);
  assert.equal(s.best, 0);
});

test('tras chocar, los indicadores quedan congelados hasta reiniciar', () => {
  const s = createDriveSession();
  const w = fakeWorld();
  driveTo(s, w, 60);
  w.crashed = true;
  s.observe(w);
  w.progress = 90;
  w.vehicles = [{ id: '1:0', distance: 10 }];
  s.observe(w);
  assert.equal(s.ended, true);
  assert.equal(s.distance, 60);
  assert.equal(s.passed, 0);
});

test('progreso de una misión: tres vehículos superados sin chocar son tres de cinco', () => {
  const s = createDriveSession();
  const w = fakeWorld();
  w.vehicles = [10, 30, 50].map((d, i) => ({ id: `${i}:0`, distance: d }));
  driveTo(s, w, 60);
  const m = mission(s, 'pass');
  assert.equal(m.progress, 3);
  assert.equal(m.goal, 5);
  assert.equal(m.done, false);
});

test('misión cumplida: el quinto vehículo la marca y sigue marcada tras reiniciar', () => {
  const s = createDriveSession();
  const w = fakeWorld();
  w.vehicles = [10, 20, 30, 40, 50].map((d, i) => ({ id: `${i}:1`, distance: d }));
  driveTo(s, w, 54);
  assert.equal(mission(s, 'pass').done, false, 'con cuatro superados todavía no');
  assert.equal(mission(s, 'pass').progress, 4);
  driveTo(s, w, 55);
  assert.equal(mission(s, 'pass').done, true);
  s.restart();
  assert.equal(mission(s, 'pass').done, true);
  assert.equal(s.passed, 0);
});

test('una misión cumplida sigue marcada en otra sesión que comparte el registro (pestaña montada de nuevo)', () => {
  const completed = new Set();
  const a = createDriveSession({ completed });
  const w = fakeWorld();
  driveTo(a, w, 500);
  assert.equal(mission(a, 'distance').done, true);
  const b = createDriveSession({ completed });
  assert.equal(mission(b, 'distance').done, true);
});

test('chocar antes de cumplir: el progreso de la misión vuelve a cero en el siguiente intento', () => {
  const s = createDriveSession();
  const w = fakeWorld();
  w.vehicles = [10, 20].map((d, i) => ({ id: `${i}:0`, distance: d }));
  driveTo(s, w, 320);
  w.crashed = true;
  s.observe(w);
  assert.equal(mission(s, 'pass').progress, 2);
  assert.equal(mission(s, 'distance').progress, 320);
  s.restart();
  assert.equal(mission(s, 'pass').progress, 0);
  assert.equal(mission(s, 'distance').progress, 0);
  assert.equal(mission(s, 'distance').done, false);
});

test('recorrer 500 metros sin chocar cumple la segunda misión', () => {
  const s = createDriveSession();
  const w = fakeWorld();
  driveTo(s, w, 499);
  assert.equal(mission(s, 'distance').done, false);
  driveTo(s, w, 500);
  assert.equal(mission(s, 'distance').done, true);
});

test('la tercera misión solo cuenta los metros recorridos en el modo ver como la máquina', () => {
  const s = createDriveSession();
  const w = fakeWorld();
  driveTo(s, w, 150);
  assert.equal(mission(s, 'machine').progress, 0);
  driveTo(s, w, 300, { machineView: true });
  assert.equal(mission(s, 'machine').progress, 150);
  assert.equal(mission(s, 'machine').done, false);
  driveTo(s, w, 349);
  assert.equal(mission(s, 'machine').progress, 150, 'sin el modo no suma');
  driveTo(s, w, 400, { machineView: true });
  assert.equal(mission(s, 'machine').progress, 200);
  assert.equal(mission(s, 'machine').done, true);
});

test('las misiones son las de la spec, en orden', () => {
  assert.deepEqual(MISSIONS.map((m) => [m.id, m.goal]), [['pass', 5], ['distance', 500], ['machine', 200]]);
});

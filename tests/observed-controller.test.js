import test from 'node:test';
import assert from 'node:assert/strict';
import { createWorld } from '../src/core/world.js';
import { constantController, createObservedController } from '../src/core/controller.js';
import { createTraceController } from '../src/core/network-trace.js';

const FORWARD = constantController({ forward: true });
const SENSORS = { count: 5, range: 4, spread: 90 };

/** Red sin capas ocultas que, con cualquier percepción, decide solo doblar a la izquierda. Salidas: avanzar, izquierda, derecha, retroceder. */
const leftNet = () => ({
  sizes: [6, 4],
  activation: 'tanh',
  layers: [{ weights: Array.from({ length: 4 }, () => Array(6).fill(0)), biases: [-1, 1, -1, -1] }],
});

/** Controlador que maneja según lo que ve: avanza y dobla hacia el lado con menos obstáculo. */
const reactive = () => ({
  control({ sensors }) {
    const left = sensors[0] + sensors[1];
    const right = sensors[3] + sensors[4];
    return { forward: true, left: right > left + 0.05, right: left > right + 0.05 };
  },
});

test('maneja uno y observa otro: el auto recibe solo avanzar y la decisión del observador es izquierda', () => {
  const net = createTraceController(leftNet(), SENSORS.count);
  const c = createObservedController({ driver: FORWARD, observer: net });
  const w = createWorld({ seed: 1, density: 0, sensors: SENSORS, controller: c });
  for (let i = 0; i < 60; i++) w.step();
  assert.deepEqual(c.driven, { forward: true, reverse: false, left: false, right: false });
  assert.deepEqual(c.observed, { forward: false, reverse: false, left: true, right: false });
  assert.ok(net.lastTrace, 'la red guardó su cuenta');
  // El auto no dobló: siguió recto.
  assert.equal(w.car.angle, 0);
  assert.equal(w.car.position.y, 0);
  assert.ok(w.car.position.x > 5);
});

test('misma percepción: el observador recibe exactamente la del que maneja', () => {
  const seen = { driver: [], observer: [] };
  const driver = { control(p) { seen.driver.push(p); return { forward: true }; } };
  const observer = { control(p) { seen.observer.push(p); return { left: true }; } };
  const c = createObservedController({ driver, observer });
  const w = createWorld({ seed: 3, density: 30, sensors: SENSORS, controller: c });
  for (let i = 0; i < 120; i++) w.step();
  assert.equal(seen.driver.length, 120);
  assert.equal(seen.observer.length, 120);
  seen.driver.forEach((p, i) => assert.equal(seen.observer[i], p));
  assert.equal(c.perception, seen.driver.at(-1));
});

test('mismo recorrido con la misma semilla, solo o con una red observando', () => {
  const path = (controller) => {
    const w = createWorld({ seed: 7, density: 40, irregularity: 30, sensors: SENSORS, controller });
    const out = [];
    for (let i = 0; i < 600; i++) { w.step(); out.push([w.car.position.x, w.car.position.y, w.car.angle, w.car.speed, w.car.crashed]); }
    return out;
  };
  const alone = path(reactive());
  const watched = path(createObservedController({ driver: reactive(), observer: createTraceController(leftNet(), SENSORS.count) }));
  assert.deepEqual(watched, alone);
});

test('cambiar quién maneja a mitad del intento: desde el cuadro siguiente manda el que observaba, sin volver a empezar', () => {
  const net = createTraceController(leftNet(), SENSORS.count);
  const c = createObservedController({ driver: FORWARD, observer: net });
  const w = createWorld({ seed: 1, density: 0, sensors: SENSORS, controller: c });
  for (let i = 0; i < 90; i++) w.step();
  const x = w.car.position.x;
  const steps = w.steps;
  assert.equal(w.car.angle, 0);
  c.setDriver(net);
  assert.equal(c.observing, false);
  w.step();
  assert.equal(w.steps, steps + 1, 'el intento sigue');
  assert.ok(w.car.position.x >= x, 'el auto sigue desde donde estaba');
  assert.deepEqual(c.driven, { forward: false, reverse: false, left: true, right: false });
  assert.notEqual(w.car.angle, 0, 'ya dobla con la red');
  c.setDriver(FORWARD);
  assert.equal(c.observing, true);
});

test('con el mismo controlador en los dos lugares, una sola llamada por cuadro', () => {
  let calls = 0;
  const one = { control() { calls += 1; return { forward: true }; } };
  const c = createObservedController({ driver: one, observer: one });
  c.control({ sensors: [0], speed: 0 });
  assert.equal(calls, 1);
  assert.equal(c.driven, c.observed);
  assert.throws(() => createObservedController({ driver: null, observer: one }), TypeError);
});

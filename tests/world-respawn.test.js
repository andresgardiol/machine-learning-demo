// Volver a poner un auto en la pista y protegerlo del tráfico (pestana-competir D1c).
import test from 'node:test';
import assert from 'node:assert/strict';
import { createWorld } from '../src/core/world.js';
import { constantController } from '../src/core/controller.js';
import { STEP, CAR_LENGTH } from '../src/core/constants.js';

const forwardLeft = constantController({ forward: true, left: true });
const idle = constantController({});

const stepFor = (world, seconds) => { for (let i = 0; i < Math.round(seconds / STEP); i++) world.step(); };

test('respawn en la calle recta: carril de salida, a la distancia pedida, detenido y mirando hacia adelante', () => {
  const world = createWorld({ seed: 3, lanes: 3, density: 0, cars: [{ controller: forwardLeft }] });
  while (!world.crashed) world.step();
  assert.equal(world.crashCause, 'edge');
  world.respawn(0, { progress: 120 });
  const { car } = world;
  assert.equal(car.crashed, false);
  assert.equal(car.speed, 0);
  assert.equal(car.angle, 0);
  assert.ok(Math.abs(car.position.x - 120) < 1e-9);
  const center = world.track.laneCenter(1, 120).position;
  assert.ok(Math.abs(car.position.y - center.y) < 1e-9);
  assert.ok(Math.abs(world.progress - 120) < 1e-9);
  assert.equal(world.crashCause, null);
});

test('respawn en un circuito: en el centro, mirando hacia adelante, y conserva las vueltas', () => {
  const world = createWorld({ track: 'oval', cars: [{ controller: idle }] });
  const L = world.track.length;
  world.respawn(0, { progress: L + 30 });
  const a = world.agents[0];
  assert.equal(a.laps, 1);
  assert.ok(Math.abs(a.progress - (L + 30)) < 1e-6);
  const at = world.track.pointAt(30);
  assert.ok(Math.abs(a.car.position.x - at.position.x) < 1e-9 && Math.abs(a.car.position.y - at.position.y) < 1e-9);
  assert.ok(Math.abs(a.car.angle - at.angle) < 1e-12);
  assert.equal(a.car.speed, 0);
  world.step();
  assert.equal(a.laps, 1, 'después de un paso sigue con su vuelta');
});

test('protegido, el tráfico no lo choca; los bordes, sí', () => {
  const world = createWorld({ seed: 5, lanes: 3, density: 100, irregularity: 0, cars: [{ controller: idle }] });
  const v = world.vehiclesIn(0, 400).find((x) => x.lane === 1);
  assert.ok(v, 'hay un vehículo en el carril del centro');
  // Encima de un vehículo, sin protección: choca.
  const bare = createWorld({ seed: 5, lanes: 3, density: 100, irregularity: 0, cars: [{ controller: idle }] });
  bare.respawn(0, { progress: v.distance });
  bare.step();
  assert.equal(bare.crashCause, 'vehicle');
  // Con protección: no.
  world.respawn(0, { progress: v.distance, protect: 1 });
  world.step();
  assert.equal(world.crashed, false);

  assert.equal(world.isProtected(0), true);
  // Los bordes siguen chocándolo.
  const edge = createWorld({ seed: 5, lanes: 3, density: 0, cars: [{ controller: forwardLeft }] });
  edge.respawn(0, { progress: 10, protect: 5 });
  let n = 0;
  while (!edge.crashed && n++ < 600) edge.step();
  assert.equal(edge.crashCause, 'edge');
});

test('vehículo que viene de atrás: no choca durante la protección; pasada y sin encimarse, choca', () => {
  const world = createWorld({ seed: 5, lanes: 3, density: 100, irregularity: 0, cars: [{ controller: idle }] });
  // El segundo vehículo del carril del centro: el primero ya va adelante, y detrás viene otro.
  const lane1 = world.vehiclesIn(0, 600).filter((x) => x.lane === 1).sort((x, y) => x.distance - y.distance);
  const v = lane1[lane1.length - 1];
  // A 9 m por delante del vehículo, que va a 10 m/s: lo alcanza a los 0,5 s y lo atraviesa hasta 1,3 s.
  world.respawn(0, { progress: v.distance + CAR_LENGTH + 5, protect: 2 });
  stepFor(world, 0.9);
  assert.equal(world.crashed, false, 'a los 0,9 s el vehículo ya lo alcanzó y no choca');
  stepFor(world, 1.2);
  assert.equal(world.crashed, false);
  assert.equal(world.isProtected(0), false, 'pasados 2 s sin vehículos encima, terminó la protección');
  // Otro vehículo del carril lo alcanza más tarde: ahora sí choca.
  const other = createWorld({ seed: 5, lanes: 3, density: 100, irregularity: 0, cars: [{ controller: idle }] });
  const behind = lane1[lane1.length - 2];
  other.respawn(0, { progress: v.distance + CAR_LENGTH + 5, protect: 2 });
  let n = 0;
  while (!other.crashed && n++ < 60 * 60) other.step();
  assert.equal(other.crashCause, 'vehicle');
  assert.ok(other.time > 2, `choca a los ${other.time} s, con ${behind.id} o el que lo sigue`);
});

test('keepClock: con todos detenidos, el reloj y el tráfico siguen; sin la opción, el mundo se detiene', () => {
  const kept = createWorld({ seed: 2, keepClock: true, cars: [{ controller: forwardLeft }] });
  const plain = createWorld({ seed: 2, cars: [{ controller: forwardLeft }] });
  while (!kept.crashed) kept.step();
  while (!plain.crashed) plain.step();
  const t = kept.time;
  assert.equal(plain.time, t);
  stepFor(kept, 1);
  stepFor(plain, 1);
  assert.ok(Math.abs(kept.time - (t + 1)) < 1e-9);
  assert.equal(plain.time, t);
});

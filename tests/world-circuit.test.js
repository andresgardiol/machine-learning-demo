// Mundo sobre un circuito (circuitos-y-paisaje, grupo 3): pista elegible, sin tráfico en los
// circuitos, salida en la línea, progreso por vueltas sin saltos, choque con el borde, varios autos
// y reproducibilidad.
import test from 'node:test';
import assert from 'node:assert/strict';
import { createWorld } from '../src/core/world.js';
import { createStraightStreet } from '../src/core/track.js';
import { STEP } from '../src/core/constants.js';

const near = (a, b, eps = 1e-6) => assert.ok(Math.abs(a - b) < eps, `${a} no es ${b}`);

/**
 * Controlador que sigue la línea central del circuito mirando un punto `ahead` metros por delante
 * (o por detrás, si `reverse`). Lee el auto `index` del mundo que le pasen después.
 */
function follower(getWorld, index = 0, { reverse = false, ahead = 8 } = {}) {
  return {
    control() {
      const world = getWorld();
      const a = world.agents[index];
      const { car } = a;
      const target = world.track.pointAt(a.progress + (reverse ? -ahead : ahead)).position;
      let want = Math.atan2(target.y - car.position.y, target.x - car.position.x);
      if (reverse) want += Math.PI; // marcha atrás: la cola apunta al objetivo
      let diff = want - car.angle;
      diff = Math.atan2(Math.sin(diff), Math.cos(diff));
      // En marcha atrás el volante gira al revés.
      const left = reverse ? diff < -0.01 : diff > 0.01;
      const right = reverse ? diff > 0.01 : diff < -0.01;
      return { forward: !reverse, reverse, left, right };
    },
  };
}

test('Estado por defecto: sin indicar la pista, la calle recta con tráfico de siempre', () => {
  const w = createWorld({ seed: 1 });
  assert.equal(w.trackId, 'straight');
  assert.equal(w.track.closed, false);
  assert.equal(w.track.lanes, 3);
  assert.ok(w.vehiclesIn(0, 500).length > 0);
  const same = createWorld({ seed: 1, track: 'straight' });
  assert.deepEqual(same.vehiclesIn(0, 2000), w.vehiclesIn(0, 2000));
});

test('Circuito sin tráfico: sobre el óvalo con densidad 100 % no hay ningún vehículo', () => {
  const w = createWorld({ seed: 1, track: 'oval', density: 100, irregularity: 100 });
  assert.equal(w.trackId, 'oval');
  assert.equal(w.track.closed, true);
  assert.deepEqual(w.vehiclesIn(-1e6, 1e6), []);
  w.setTraffic({ density: 100 });
  assert.deepEqual(w.vehiclesIn(-1e6, 1e6), []);
  for (let i = 0; i < 120; i++) w.step();
  assert.deepEqual(w.vehicles, []);
});

test('en un circuito los autos salen de la línea de salida, en el centro y mirando hacia adelante', () => {
  for (const track of ['oval', 'kidney', 'grandPrix']) {
    const w = createWorld({ seed: 3, track, lanes: 4 });
    const start = w.track.pointAt(0);
    assert.deepEqual(w.car.position, start.position);
    assert.equal(w.car.angle, start.angle);
    assert.equal(w.car.speed, 0);
    assert.equal(w.progress, 0);
    assert.equal(w.agents[0].laps, 0);
    assert.equal(w.track.lanes, 1);
  }
});

test('Volver a la calle: después de un circuito, la calle recta con la misma semilla tiene el mismo tráfico', () => {
  const before = createWorld({ seed: 7, density: 80 }).vehiclesIn(0, 3000);
  const circuit = createWorld({ seed: 7, track: 'kidney', density: 80 });
  for (let i = 0; i < 60; i++) circuit.step();
  const after = createWorld({ seed: 7, density: 80, track: 'straight' }).vehiclesIn(0, 3000);
  assert.ok(before.length > 0);
  assert.deepEqual(after, before);
});

/** Corre `steps` pasos y devuelve el progreso de cada paso. */
function run(world, steps, until = () => false) {
  const out = [world.progress];
  for (let i = 0; i < steps && !until(world); i++) {
    world.step();
    out.push(world.progress);
  }
  return out;
}

/** Ningún paso cambia el progreso más de lo que el auto puede avanzar en un paso (con margen). */
function assertNoJumps(progress, maxSpeed) {
  for (let i = 1; i < progress.length; i++) {
    const delta = Math.abs(progress[i] - progress[i - 1]);
    assert.ok(delta <= maxSpeed * STEP * 1.5 + 1e-9, `salto de ${delta} m en el paso ${i}`);
  }
}

test('Cruce de la salida hacia adelante: una vuelta más 20 m da progreso de una vuelta más 20 m', () => {
  let world;
  world = createWorld({ seed: 1, track: 'oval', controller: follower(() => world) });
  const L = world.track.length;
  const progress = run(world, 120 / STEP, (w) => w.progress >= L + 20);
  assert.equal(world.crashed, false);
  near(world.progress, L + 20, 0.5);
  assert.equal(world.agents[0].laps, 1);
  // El auto está a unos 20 m de la salida, sobre la recta.
  near(world.car.position.x, 20, 0.6);
  assertNoJumps(progress, world.car.maxSpeed);
});

test('Sentido contrario: salir de la línea y retroceder 30 m da progreso de -30 m', () => {
  let world;
  world = createWorld({ seed: 1, track: 'oval', controller: follower(() => world, 0, { reverse: true }) });
  const progress = run(world, 60 / STEP, (w) => w.progress <= -30);
  near(world.progress, -30, 0.3);
  assert.equal(world.agents[0].laps, -1);
  near(world.car.position.x, -30, 0.3);
  assertNoJumps(progress, world.car.maxSpeed);
});

test('Progreso sin saltos: cruzar la salida hacia atrás y otra vez hacia adelante', () => {
  let world;
  let reverse = true;
  const back = follower(() => world, 0, { reverse: true });
  const ahead = follower(() => world, 0);
  world = createWorld({ seed: 1, track: 'grandPrix', controller: { control: (p) => (reverse ? back : ahead).control(p) } });
  const progress = run(world, 60 / STEP, (w) => w.progress <= -15);
  reverse = false;
  progress.push(...run(world, 60 / STEP, (w) => w.progress >= 25).slice(1));
  assert.equal(world.crashed, false);
  near(world.progress, 25, 0.5);
  assert.equal(world.agents[0].laps, 0);
  assertNoJumps(progress, world.car.maxSpeed);
});

test('Choque con el borde: un auto que sigue derecho en la primera curva del óvalo choca con motivo "borde"', () => {
  const world = createWorld({ seed: 1, track: 'oval', controller: { control: () => ({ forward: true }) } });
  run(world, 30 / STEP, (w) => w.crashed);
  assert.equal(world.crashed, true);
  assert.equal(world.crashCause, 'edge');
  // Chocó pasando el final de la recta, al entrar en la curva.
  assert.ok(world.progress > 75 - 6 && world.progress < 75 + 50, `chocó a ${world.progress} m`);
});

test('Varios autos en un circuito: con el mismo controlador recorren el mismo camino, superpuestos, sin chocarse', () => {
  let world;
  world = createWorld({
    seed: 1, track: 'oval',
    cars: [{ controller: follower(() => world, 0) }, { controller: follower(() => world, 1) }],
  });
  for (let i = 0; i < 40 / STEP; i++) {
    world.step();
    const [a, b] = world.agentsSnapshot();
    assert.deepEqual(a, b);
  }
  assert.equal(world.aliveCount, 2);
  assert.ok(world.agents[0].progress > world.track.length);
});

test('Circuito reproducible: la misma corrida da el mismo estado paso a paso', () => {
  let a;
  let b;
  a = createWorld({ seed: 4, track: 'kidney', controller: follower(() => a, 0, { ahead: 6 }) });
  b = createWorld({ seed: 4, track: 'kidney', controller: follower(() => b, 0, { ahead: 6 }) });
  for (let i = 0; i < 30 / STEP; i++) {
    a.step();
    b.step();
    assert.deepEqual(a.snapshot(), b.snapshot());
    assert.deepEqual(a.agentsSnapshot(), b.agentsSnapshot());
  }
});

test('en la calle recta las vueltas son siempre 0 y el progreso no cambia de forma', () => {
  const w = createWorld({ seed: 1, controller: { control: () => ({ forward: true }) } });
  for (let i = 0; i < 300; i++) w.step();
  assert.equal(w.agents[0].laps, 0);
  assert.equal(w.progress, createStraightStreet().progressOf(w.car.position).progress);
});

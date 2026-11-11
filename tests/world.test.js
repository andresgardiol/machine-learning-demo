import test from 'node:test';
import assert from 'node:assert/strict';
import { createWorld } from '../src/core/world.js';
import { constantController } from '../src/core/controller.js';
import { STEP, MAX_SPEED } from '../src/core/constants.js';

const FORWARD = constantController({ forward: true });
const run = (world, steps) => { for (let i = 0; i < steps; i++) world.step(); return world; };

test('un controlador que solo avanza acelera el auto en línea recta', () => {
  const w = run(createWorld({ seed: 1, density: 0, controller: FORWARD }), 120);
  assert.ok(w.car.speed > 0);
  assert.ok(w.car.position.x > 5);
  assert.equal(w.car.position.y, 0);
  assert.equal(w.car.angle, 0);
  assert.equal(w.steps, 120);
  assert.equal(w.time, 120 * STEP);
});

test('auto detenido en calle vacía: una lectura 0 por rayo y velocidad 0', () => {
  // alcance de 1 largo: con la calle de 3 carriles los rayos laterales no llegan a los bordes
  const w = createWorld({ seed: 1, density: 0, sensors: { count: 7, range: 1, spread: 90 } });
  assert.deepEqual(w.perception, { sensors: [0, 0, 0, 0, 0, 0, 0], speed: 0 });
});

test('auto a velocidad máxima: la velocidad de la percepción es 1', () => {
  const w = run(createWorld({ seed: 1, density: 0, controller: FORWARD }), 60);
  assert.equal(w.car.speed, MAX_SPEED);
  assert.equal(w.perception.speed, 1);
  assert.equal(w.perception.sensors.length, 5);
});

test('el controlador recibe la percepción en cada paso', () => {
  const seen = [];
  const w = createWorld({ seed: 1, density: 0, controller: { control: (p) => { seen.push(p); return { forward: true }; } } });
  run(w, 3);
  assert.equal(seen.length, 3);
  assert.equal(seen[0].speed, 0);
  assert.ok(seen[2].speed > seen[0].speed);
  assert.equal(seen[0].sensors.length, 5);
});

test('controladores intercambiables: al reemplazar uno y reiniciar, el nuevo maneja', () => {
  const w = createWorld({ seed: 1, density: 0, controller: FORWARD });
  run(w, 60);
  w.setController(constantController({ reverse: true }));
  w.reset();
  run(w, 60);
  assert.ok(w.car.speed < 0);
  assert.ok(w.car.position.x < 0);
});

test('avanzar y retroceder juntos desde un controlador: el auto no se mueve', () => {
  const w = run(createWorld({ seed: 1, density: 0, controller: constantController({ forward: true, reverse: true }) }), 60);
  assert.equal(w.car.speed, 0);
});

test('choque contra el borde: marcado como chocado y detenido', () => {
  const w = run(createWorld({ seed: 1, density: 0, controller: constantController({ forward: true, left: true }) }), 600);
  assert.equal(w.crashed, true);
  assert.equal(w.crashCause, 'edge');
  assert.equal(w.car.speed, 0);
  assert.equal(w.perception.speed, 0);
});

test('choque contra el tráfico: marcado como chocado y detenido', () => {
  let seed = 1;
  const probe = (s) => createWorld({ seed: s, density: 100, irregularity: 0 });
  // semilla cuyo primer grupo ocupa el carril del auto (el del medio), para chocar yendo derecho
  while (!probe(seed).traffic.groupAt(0).vehicles.some((v) => v.lane === 1)) seed += 1;
  const w = run(createWorld({ seed, density: 100, irregularity: 0, controller: FORWARD }), 60 * 30);
  assert.equal(w.crashed, true);
  assert.equal(w.crashCause, 'vehicle');
  assert.equal(w.car.speed, 0);
});

test('controles ignorados tras chocar: el auto no se mueve', () => {
  const w = run(createWorld({ seed: 1, density: 0, controller: constantController({ forward: true, left: true }) }), 600);
  assert.equal(w.crashed, true);
  const before = JSON.stringify(w.snapshot());
  w.setController(constantController({ reverse: true, right: true }));
  run(w, 120);
  assert.equal(JSON.stringify(w.snapshot()), before);
});

test('reinicio tras chocar: vuelve a la posición inicial, sin chocar, con el tráfico inicial', () => {
  const w = createWorld({ seed: 7, controller: constantController({ forward: true, left: true }) });
  const initial = createWorld({ seed: 7 }).snapshot();
  run(w, 600);
  assert.equal(w.crashed, true);
  w.reset();
  assert.equal(w.crashed, false);
  assert.deepEqual(w.car.position, initial.car.position);
  assert.deepEqual(w.snapshot().vehicles, initial.vehicles);
});

test('reinicio en marcha: idéntico a un mundo recién creado con la misma semilla', () => {
  const w = createWorld({ seed: 7, lanes: 4, controller: FORWARD });
  run(w, 200);
  assert.ok(w.car.speed > 0);
  w.reset();
  const fresh = createWorld({ seed: 7, lanes: 4, controller: FORWARD });
  assert.deepEqual(w.snapshot(), fresh.snapshot());
  run(w, 100); run(fresh, 100);
  assert.deepEqual(w.snapshot(), fresh.snapshot());
});

test('pausar y reanudar: el estado al reanudar es el de la pausa y la evolución es la misma que sin pausa', () => {
  const a = createWorld({ seed: 3, controller: FORWARD });
  const b = createWorld({ seed: 3, controller: FORWARD });
  run(a, 100); run(b, 100);
  a.pause();
  const atPause = JSON.stringify({ ...a.snapshot(), paused: undefined });
  run(a, 500); // pasa el tiempo en pausa
  assert.equal(JSON.stringify({ ...a.snapshot(), paused: undefined }), atPause);
  a.resume();
  run(a, 200); run(b, 200);
  assert.deepEqual(a.snapshot(), b.snapshot());
});

test('los sensores se reconfiguran y restablecen sin reiniciar', () => {
  const w = run(createWorld({ seed: 1, controller: FORWARD }), 30);
  const x = w.car.position.x;
  w.configureSensors({ count: 9 });
  assert.equal(w.perception.sensors.length, 9);
  assert.equal(w.car.position.x, x);
  w.resetSensors();
  assert.equal(w.perception.sensors.length, 5);
});

test('retroceder desde la salida no saca al auto de la calle: sigue habiendo bordes y choca contra ellos', () => {
  const back = createWorld({ seed: 1, density: 0, controller: constantController({ reverse: true }) });
  run(back, 60 * 4);
  assert.ok(back.car.position.x < -20, 'el auto retrocedió más allá de la salida');
  assert.equal(back.crashed, false, 'en línea recta no choca: la calle sigue');
  assert.ok(back.progress < -20, 'el progreso es negativo detrás de la salida');
  const turning = createWorld({ seed: 1, density: 0, controller: constantController({ reverse: true, left: true }) });
  for (let i = 0; i < 60 * 10 && !turning.crashed; i++) turning.step();
  assert.equal(turning.crashed, true);
  assert.equal(turning.crashCause, 'edge');
  assert.ok(turning.car.position.x < 0, 'choca contra un borde detrás de la salida');
});

test('mundo con velocidad máxima configurada: el auto llega a ella, la percepción da 1 y el reinicio la conserva', () => {
  const w = run(createWorld({ seed: 1, density: 0, maxSpeed: 25, controller: constantController({ forward: true }) }), 120);
  assert.equal(w.car.speed, 25);
  assert.equal(w.perception.speed, 1);
  w.reset();
  assert.equal(w.car.maxSpeed, 25);
});

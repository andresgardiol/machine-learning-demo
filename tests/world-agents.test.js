import test from 'node:test';
import assert from 'node:assert/strict';
import { createWorld } from '../src/core/world.js';
import { constantController } from '../src/core/controller.js';
import { createRandom } from '../src/core/random.js';

const forward = constantController({ forward: true });
const forwardLeft = constantController({ forward: true, left: true });
const idle = constantController({});

/**
 * Controlador de reglas con parámetros al azar (sin estado): misma percepción, mismos controles.
 * Sirve para cualquier cantidad de sensores.
 */
function ruleController(seed) {
  const r = createRandom(seed);
  const cruise = 0.3 + r() * 0.7;
  const brake = r() * 0.8;
  const bias = r() * 0.4 - 0.2;
  const reverseAt = 0.6 + r() * 0.4;
  return {
    control({ sensors, speed }) {
      const half = Math.floor(sensors.length / 2);
      let left = 0;
      let right = 0;
      for (let i = 0; i < sensors.length; i++) {
        if (i < half) left += sensors[i];
        else if (i >= sensors.length - half) right += sensors[i];
      }
      const ahead = sensors[half] ?? 0;
      return {
        forward: speed < cruise && ahead < reverseAt,
        reverse: ahead >= reverseAt && speed > -0.2,
        left: right - left > bias + brake * ahead,
        right: left - right > -bias + brake * ahead,
      };
    },
  };
}

function carsFor(n, seed = 1) {
  const r = createRandom(seed);
  return Array.from({ length: n }, (_, i) => ({
    controller: ruleController(1000 + i),
    sensors: { count: 3 + Math.floor(r() * 7), range: 2 + Math.floor(r() * 4), spread: 60 + Math.floor(r() * 120) },
    maxSpeed: 12 + Math.floor(r() * 14),
  }));
}

test('varios autos: cada uno evoluciona según su controlador y tiene su propio progreso', () => {
  const w = createWorld({ seed: 3, density: 0, cars: [{ controller: forward }, { controller: forwardLeft }, { controller: idle }] });
  assert.equal(w.agents.length, 3);
  for (let i = 0; i < 60; i++) w.step();
  const [a, b, c] = w.agents;
  // Solo avanza: recto, con velocidad y progreso.
  assert.equal(a.car.angle, 0);
  assert.ok(a.car.speed > 0);
  assert.ok(a.progress > 5);
  // Avanza y gira a la izquierda: su ángulo creció.
  assert.ok(b.car.angle > 0.5, String(b.car.angle));
  assert.ok(b.progress > 0 && b.progress < a.progress);
  // No acciona nada: sigue en la salida, detenido.
  assert.equal(c.car.speed, 0);
  assert.equal(c.progress, 0);
  assert.deepEqual(c.car.position, w.track.laneCenter(1, 0).position);
});

test('varios autos: uno choca contra un borde y queda detenido, los demás siguen avanzando', () => {
  const w = createWorld({ seed: 3, density: 0, cars: [{ controller: forward }, { controller: forwardLeft }] });
  let steps = 0;
  while (!w.agents[1].crashed && steps < 600) { w.step(); steps += 1; }
  const crashedOne = w.agents[1];
  assert.equal(crashedOne.crashed, true);
  assert.equal(crashedOne.crashCause, 'edge');
  assert.equal(crashedOne.car.speed, 0);
  assert.equal(w.agents[0].crashed, false);
  const where = { ...crashedOne.car.position };
  const before = w.agents[0].progress;
  for (let i = 0; i < 60; i++) w.step();
  assert.deepEqual(crashedOne.car.position, where);
  assert.equal(crashedOne.car.speed, 0);
  assert.equal(w.agents[0].crashed, false);
  assert.ok(w.agents[0].progress > before + 10);
  assert.equal(w.aliveCount, 1);
});

test('varios autos: con todos chocados el mundo no avanza', () => {
  const w = createWorld({ seed: 3, density: 0, cars: [{ controller: forwardLeft }, { controller: forwardLeft }] });
  for (let i = 0; i < 600 && w.aliveCount > 0; i++) w.step();
  assert.equal(w.aliveCount, 0);
  const t = w.time;
  w.step();
  assert.equal(w.time, t);
});

test('autos superpuestos: ninguno queda chocado y sus sensores leen lo mismo que solos', () => {
  const together = createWorld({ seed: 5, cars: [{ controller: forward }, { controller: forward }, { controller: idle }] });
  const alone = createWorld({ seed: 5, controller: forward });
  for (let i = 0; i < 90; i++) {
    together.step();
    alone.step();
    const [a, b, c] = together.agents;
    assert.deepEqual(a.car.position, b.car.position);
    assert.equal(a.crashed, false);
    assert.equal(b.crashed, false);
    assert.deepEqual(a.perception, alone.perception);
    assert.deepEqual(b.perception, alone.perception);
    assert.equal(c.crashed, false);
  }
  // En la salida, dos autos quietos en el mismo lugar no se ven entre sí: el rayo central, que
  // atravesaría al otro auto, no toca nada; solo los rayos de los costados ven los bordes, como solo.
  const still = createWorld({ seed: 5, density: 0, cars: [{ controller: idle }, { controller: idle }] });
  const single = createWorld({ seed: 5, density: 0, controller: idle });
  still.step();
  single.step();
  for (const a of still.agents) {
    assert.equal(a.crashed, false);
    assert.deepEqual(a.perception.sensors, single.perception.sensors);
    assert.equal(a.perception.sensors[2], 0);
  }
});

test('equivalencia: cincuenta autos juntos evolucionan igual, paso a paso, que cincuenta mundos de un auto', () => {
  const cars = carsFor(50);
  const spec = { seed: 11, lanes: 3, density: 70, irregularity: 60 };
  const together = createWorld({ ...spec, cars });
  const alone = cars.map((c) => createWorld({ ...spec, controller: c.controller, sensors: c.sensors, maxSpeed: c.maxSpeed }));
  let crashes = 0;
  for (let step = 0; step <= 900; step++) {
    if (step > 0) { together.step(); for (const w of alone) w.step(); }
    together.agents.forEach((a, i) => {
      const s = alone[i];
      assert.deepEqual(a.car.position, s.car.position, `auto ${i}, paso ${step}: posición`);
      assert.equal(a.car.angle, s.car.angle, `auto ${i}, paso ${step}: ángulo`);
      assert.equal(a.car.speed, s.car.speed, `auto ${i}, paso ${step}: velocidad`);
      assert.equal(a.crashed, s.crashed, `auto ${i}, paso ${step}: choque`);
      assert.equal(a.crashCause, s.crashCause);
      assert.deepEqual(a.perception, s.perception, `auto ${i}, paso ${step}: percepción`);
    });
  }
  crashes = together.agents.filter((a) => a.crashed).length;
  // La prueba ejercita choques y autos en carrera a la vez.
  assert.ok(crashes > 0 && crashes < 50, `chocados: ${crashes}`);
});

test('reproducibilidad: dos corridas de mil pasos con cien autos coinciden en todos los pasos', () => {
  const run = () => {
    const w = createWorld({ seed: 21, density: 60, cars: carsFor(100, 7) });
    const states = [];
    for (let i = 0; i < 1000; i++) {
      w.step();
      states.push(JSON.stringify({ agents: w.agentsSnapshot(), traffic: w.vehiclesIn(-200, 2000).map((v) => [v.id, v.position]) }));
    }
    return states;
  };
  const a = run();
  const b = run();
  assert.equal(a.length, 1000);
  for (let i = 0; i < a.length; i++) assert.equal(a[i], b[i], `paso ${i + 1}`);
});

test('reinicio de una población: todos vuelven a la salida, sin chocar, como en un mundo recién creado', () => {
  const spec = { seed: 13, density: 80, cars: carsFor(30, 3) };
  const w = createWorld(spec);
  for (let i = 0; i < 600; i++) w.step();
  const crashed = w.agents.filter((a) => a.crashed).length;
  assert.ok(crashed > 0 && crashed < 30, `chocados: ${crashed}`);
  assert.ok(w.agents.some((a) => !a.crashed && a.progress > 20));
  w.reset();
  const fresh = createWorld(spec);
  assert.deepEqual(w.agentsSnapshot(), fresh.agentsSnapshot());
  assert.deepEqual(w.snapshot(), fresh.snapshot());
  for (const a of w.agents) {
    assert.equal(a.crashed, false);
    assert.equal(a.car.speed, 0);
    assert.equal(a.progress, 0);
  }
  assert.deepEqual(w.vehiclesIn(-100, 500), fresh.vehiclesIn(-100, 500));
  // Y vuelve a evolucionar igual que el mundo nuevo.
  for (let i = 0; i < 200; i++) { w.step(); fresh.step(); }
  assert.deepEqual(w.agentsSnapshot(), fresh.agentsSnapshot());
});

test('sacar un auto de carrera por lento: queda detenido con ese motivo y los otros dos siguen igual', () => {
  const spec = { seed: 9, density: 60, cars: [{ controller: ruleController(1) }, { controller: forward }, { controller: ruleController(3) }] };
  const w = createWorld(spec);
  const control = createWorld(spec);
  for (let i = 0; i < 60; i++) { w.step(); control.step(); }
  assert.equal(w.agents[1].crashed, false);
  assert.equal(w.retire(1, 'tooSlow'), true);
  const retired = w.agents[1];
  assert.equal(retired.crashed, true);
  assert.equal(retired.crashCause, 'tooSlow');
  assert.equal(retired.car.speed, 0);
  assert.equal(retired.perception.speed, 0);
  const where = { ...retired.car.position };
  assert.equal(w.aliveCount, control.aliveCount - 1);
  for (let i = 0; i < 300; i++) {
    w.step();
    control.step();
    assert.deepEqual(w.agentsSnapshot()[0], control.agentsSnapshot()[0], `paso ${i}: auto 0`);
    assert.deepEqual(w.agentsSnapshot()[2], control.agentsSnapshot()[2], `paso ${i}: auto 2`);
    assert.deepEqual(retired.car.position, where);
  }
  assert.equal(w.retire(1, 'tooSlow'), false, 'ya estaba fuera de carrera');
  assert.equal(w.retire(7, 'tooSlow'), false, 'no existe');
});

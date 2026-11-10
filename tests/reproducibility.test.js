import test from 'node:test';
import assert from 'node:assert/strict';
import { createWorld } from '../src/core/world.js';

// Controles guionados: un patrón fijo que depende solo del número de paso.
const scripted = () => {
  let n = 0;
  return {
    control: () => {
      n += 1;
      return { forward: n % 200 < 170, reverse: n % 200 >= 190, left: n % 40 < 3, right: n % 40 >= 3 && n % 40 < 6 };
    },
  };
};

const trace = (seed, steps) => {
  const w = createWorld({ seed, density: 100, irregularity: 100, controller: scripted() });
  const out = [JSON.stringify(w.snapshot())];
  for (let i = 0; i < steps; i++) { w.step(); out.push(JSON.stringify(w.snapshot())); }
  return { out, world: w };
};

test('misma semilla, misma configuración y mismos controles: coinciden en todos los pasos', () => {
  const a = trace(2024, 1200);
  const b = trace(2024, 1200);
  assert.equal(a.out.length, 1201);
  assert.deepEqual(a.out, b.out);
  assert.ok(a.out.some((s) => JSON.parse(s).vehicles.length > 0), 'hubo tráfico cerca en algún paso');
});

test('con otra semilla el tráfico difiere', () => {
  const a = JSON.parse(trace(1, 0).out[0]);
  const b = JSON.parse(trace(2, 0).out[0]);
  const wa = createWorld({ seed: 1 }); const wb = createWorld({ seed: 2 });
  assert.notDeepEqual(wa.vehiclesIn(0, 2000).map((v) => v.position), wb.vehiclesIn(0, 2000).map((v) => v.position));
  assert.deepEqual(a.car, b.car); // el auto empieza igual
});

test('el estado de todo el tráfico cercano (posición, ángulo y velocidad) coincide en cada paso', () => {
  const run = (seed) => {
    const w = createWorld({ seed, density: 100 });
    const frames = [];
    for (let i = 0; i < 600; i++) { w.step(); frames.push(JSON.stringify(w.vehiclesIn(0, 800).map((v) => [v.id, v.position, v.angle, v.speed]))); }
    return frames;
  };
  assert.deepEqual(run(5), run(5));
  assert.notDeepEqual(run(5), run(6));
});

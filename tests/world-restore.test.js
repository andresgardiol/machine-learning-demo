// Volver el mundo a un cuadro guardado (red-al-centro D5, tarea 3.1): desde un estado restaurado, con el mismo
// controlador, la simulación da los mismos cuadros que la corrida original.
import test from 'node:test';
import assert from 'node:assert/strict';
import { createWorld } from '../src/core/world.js';
import { createTraceController } from '../src/core/network-trace.js';
import { createChanges } from '../src/core/network-changes.js';
import { EXAMPLE_BRAINS } from '../src/data/example-brains.js';
import { listBrains, workingCopy } from '../src/tabs/inspect/brains.js';

const brainOf = (key) => workingCopy(listBrains({ library: [], examples: EXAMPLE_BRAINS }).find((c) => c.key === key).brain);

function worldFor(key, settings) {
  const b = brainOf(key);
  const changes = createChanges(b.network, []);
  const controller = createTraceController(b.network, b.sensors.count, () => changes);
  return createWorld({ seed: 1, ...settings, cars: [{ controller, sensors: { ...b.sensors }, maxSpeed: 20 }] });
}
/** Cuadros (copias planas) de `n` pasos. */
function run(world, n) {
  const out = [];
  for (let k = 0; k < n; k++) { world.step(); out.push({ ...world.snapshot(), rays: world.rays.map((r) => r.reading) }); }
  return out;
}

for (const [where, key, settings] of [
  ['la calle con tráfico', 'example:street-new', { track: 'straight', lanes: 3, density: 50, irregularity: 100 }],
  ['un circuito', 'example:oval', { track: 'oval', lanes: 3, density: 50, irregularity: 0 }],
]) {
  test(`en ${where}: desde un estado restaurado, 300 pasos dan los mismos cuadros`, () => {
    const world = worldFor(key, settings);
    run(world, 240);
    const saved = world.capture();
    const original = run(world, 300);
    assert.ok(world.restore(saved));
    assert.equal(world.steps, 240);
    const again = run(world, 300);
    assert.deepEqual(again, original);
  });
}

test('volver a un cuadro anterior al choque: el auto vuelve a chocar en el mismo paso y el mismo lugar', () => {
  const world = worldFor('example:street-new', { track: 'straight', lanes: 3, density: 50, irregularity: 100 });
  const states = [];
  while (!world.crashed && world.steps < 60 * 30) { states.push(world.capture()); world.step(); }
  assert.ok(world.crashed, 'el caso de prueba choca');
  const crash = { steps: world.steps, progress: world.progress, cause: world.crashCause };
  assert.equal(crash.steps, 628); // 10,47 s, el caso de las capturas
  world.restore(states[states.length - 60]); // un segundo antes
  assert.equal(world.crashed, false);
  while (!world.crashed && world.steps < 60 * 30) world.step();
  assert.deepEqual({ steps: world.steps, progress: world.progress, cause: world.crashCause }, crash);
});

test('restaurar no comparte estado: avanzar después no cambia lo guardado', () => {
  const world = worldFor('example:street-new', { track: 'straight', lanes: 3, density: 50, irregularity: 0 });
  run(world, 30);
  const saved = world.capture();
  const before = JSON.stringify({ ...saved, traffic: null, agents: saved.agents.map((a) => ({ ...a, passThrough: null })) });
  run(world, 60);
  assert.equal(JSON.stringify({ ...saved, traffic: null, agents: saved.agents.map((a) => ({ ...a, passThrough: null })) }), before);
  world.restore(saved);
  run(world, 60);
  world.restore(saved);
  assert.equal(world.steps, 30);
});

test('un estado de otra cantidad de autos no se restaura', () => {
  const world = worldFor('example:street-new', { track: 'straight' });
  assert.equal(world.restore({ agents: [] }), false);
  assert.equal(world.restore(null), false);
});

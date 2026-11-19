// Valores por defecto del entrenamiento (fitness-que-premia-superar, grupo 3, design.md D3).
import test from 'node:test';
import assert from 'node:assert/strict';
import { createTraining, DEFAULT_TRAINING_CONFIG, TRAINING_IRREGULARITY } from '../src/core/training.js';
import { DEFAULT_TRAFFIC } from '../src/core/traffic.js';
import { createWorld } from '../src/core/world.js';
import { DEFAULT_SETTINGS as STREET_DEFAULTS, worldSpec } from '../src/tabs/shared/street-settings.js';

/**
 * ¿El tráfico del mundo va ordenado? Cada vehículo del tramo [0, 1000] m centrado y sin girar en el
 * instante en curso (y unos segundos después), y dentro de cada carril los huecos iguales.
 */
function isAligned(world) {
  const traffic = world.traffic;
  const centered = [world.time, world.time + 3.7].every((time) => traffic.vehicles(time, 0, 1000).every((v) => v.lateral === 0 && v.turn === 0));
  const even = traffic.laneSpeeds.every((_, lane) => {
    const list = traffic.laneBases(lane, 0, 1500);
    const gaps = list.slice(1).map((v, i) => (v.base - v.length / 2) - (list[i].base + list[i].length / 2));
    return gaps.every((g) => Math.abs(g - gaps[0]) < 1e-6);
  });
  return { aligned: centered, even, vehicles: traffic.vehicles(world.time, 0, 1000).length };
}

/** Disposición del tráfico (para ver que cambia de una generación a otra). */
const layoutOf = (world) => world.vehiclesIn(0, 1000).map((v) => `${v.lane}:${v.type}:${v.distance.toFixed(2)}`).join();

test('escenario por defecto: tres carriles, densidad 50 %, irregularidad 0 % y tráfico nuevo en cada generación', () => {
  assert.equal(TRAINING_IRREGULARITY, 0);
  assert.equal(DEFAULT_TRAINING_CONFIG.irregularity, 0);
  assert.equal(DEFAULT_TRAINING_CONFIG.lanes, 3);
  assert.equal(DEFAULT_TRAINING_CONFIG.density, 50);
  assert.equal(DEFAULT_TRAINING_CONFIG.trafficMode, 'new');
  assert.equal(DEFAULT_TRAINING_CONFIG.fitness, 'lead');
  assert.equal(DEFAULT_TRAINING_CONFIG.elite, 10);
});

test('Estado por defecto: cada vehículo va centrado en su carril, sin zigzaguear, y dentro de cada carril los huecos son iguales', () => {
  const t = createTraining({ seed: 1, config: { population: 4 } });
  const first = isAligned(t.world);
  assert.ok(first.vehicles >= 10, `${first.vehicles} vehículos`);
  assert.equal(first.aligned, true);
  assert.equal(first.even, true);
  const before = layoutOf(t.world);
  t.finishGeneration();
  const second = isAligned(t.world);
  assert.equal(second.aligned, true);
  assert.equal(second.even, true);
  assert.notEqual(layoutOf(t.world), before, 'el tráfico cambia en cada generación');
});

test('Subir la irregularidad: con 50 %, en la generación siguiente los vehículos zigzaguean y los huecos de cada carril son desparejos', () => {
  const t = createTraining({ seed: 1, config: { population: 4 } });
  t.configure({ irregularity: 50 });
  assert.equal(isAligned(t.world).aligned, true, 'la generación en curso no cambia');
  t.finishGeneration();
  const after = isAligned(t.world);
  assert.equal(after.aligned, false);
  assert.equal(after.even, false);
});

test('Volver al valor por defecto: tras entrenar con irregularidad 50 %, restablecer vuelve a centrar los vehículos y emparejar los huecos', () => {
  const t = createTraining({ seed: 1, config: { population: 4, irregularity: 50 } });
  assert.equal(isAligned(t.world).aligned, false);
  t.configure({ ...DEFAULT_TRAINING_CONFIG, population: 4 });
  t.finishGeneration();
  const after = isAligned(t.world);
  assert.equal(after.aligned, true);
  assert.equal(after.even, true);
});

test('Otras pestañas: El problema y Reglas a mano siguen con la irregularidad del 50 %', () => {
  assert.equal(DEFAULT_TRAFFIC.irregularity, 50);
  assert.equal(STREET_DEFAULTS.irregularity, 50);
  const world = createWorld(worldSpec(STREET_DEFAULTS, 1));
  assert.equal(isAligned(world).aligned, false);
  assert.equal(createWorld({ seed: 1 }).vehiclesIn(0, 1000).some((v) => v.lateral !== 0), true);
});

test('población por defecto: un entrenamiento sin configurar nada empieza con 400 individuos', () => {
  assert.equal(DEFAULT_TRAINING_CONFIG.population, 400);
  const t = createTraining({ seed: 1 });
  assert.equal(t.population, 400);
  assert.equal(t.world.agents.length, 400);
});

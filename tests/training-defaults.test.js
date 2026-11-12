// Valores por defecto del entrenamiento (fitness-que-premia-superar, grupo 3, design.md D3).
import test from 'node:test';
import assert from 'node:assert/strict';
import { createTraining, DEFAULT_TRAINING_CONFIG, TRAINING_IRREGULARITY } from '../src/core/training.js';
import { DEFAULT_TRAFFIC } from '../src/core/traffic.js';
import { createWorld } from '../src/core/world.js';
import { DEFAULT_SETTINGS as STREET_DEFAULTS, worldSpec } from '../src/tabs/shared/street-settings.js';

/** Grupos de vehículos del tramo [0, 1000] m de un mundo, en el instante en curso, por número de grupo. */
function groupsOf(world) {
  const byGroup = new Map();
  for (const v of world.vehiclesIn(0, 1000)) {
    if (!byGroup.has(v.group)) byGroup.set(v.group, []);
    byGroup.get(v.group).push(v);
  }
  return [...byGroup.entries()].sort((a, b) => a[0] - b[0]).map(([, vs]) => vs);
}

function isAligned(world) {
  const groups = groupsOf(world);
  const aligned = groups.every((vs) => vs.every((v) => v.offset === 0 && v.lateral === 0 && v.distance === vs[0].distance));
  const centers = groups.map((vs) => vs[0].distance);
  const gaps = centers.slice(1).map((c, i) => c - centers[i]);
  const even = gaps.every((g) => Math.abs(g - gaps[0]) < 1e-6);
  return { aligned, even, groups: groups.length };
}

test('escenario por defecto: tres carriles, densidad 50 %, irregularidad 0 % y tráfico nuevo en cada generación', () => {
  assert.equal(TRAINING_IRREGULARITY, 0);
  assert.equal(DEFAULT_TRAINING_CONFIG.irregularity, 0);
  assert.equal(DEFAULT_TRAINING_CONFIG.lanes, 3);
  assert.equal(DEFAULT_TRAINING_CONFIG.density, 50);
  assert.equal(DEFAULT_TRAINING_CONFIG.trafficMode, 'new');
  assert.equal(DEFAULT_TRAINING_CONFIG.fitness, 'lead');
  assert.equal(DEFAULT_TRAINING_CONFIG.elite, 10);
});

test('estado por defecto: los vehículos de cada grupo van alineados, centrados en su carril, y los grupos a la misma distancia', () => {
  const t = createTraining({ seed: 1, config: { population: 4 } });
  const first = isAligned(t.world);
  assert.ok(first.groups >= 10, `${first.groups} grupos`);
  assert.equal(first.aligned, true);
  assert.equal(first.even, true);
  const lanesBefore = groupsOf(t.world).map((vs) => vs.map((v) => v.lane).join());
  t.finishGeneration();
  const second = isAligned(t.world);
  assert.equal(second.aligned, true);
  assert.equal(second.even, true);
  assert.notDeepEqual(groupsOf(t.world).map((vs) => vs.map((v) => v.lane).join()), lanesBefore, 'el tráfico cambia en cada generación');
});

test('subir la irregularidad a 50 %: la generación siguiente tiene grupos a distancias distintas y vehículos desalineados', () => {
  const t = createTraining({ seed: 1, config: { population: 4 } });
  t.configure({ irregularity: 50 });
  assert.equal(isAligned(t.world).aligned, true, 'la generación en curso no cambia');
  t.finishGeneration();
  const after = isAligned(t.world);
  assert.equal(after.aligned, false);
  assert.equal(after.even, false);
});

test('volver al valor por defecto: tras entrenar con irregularidad 50 %, restablecer vuelve a alinear el tráfico desde la generación siguiente', () => {
  const t = createTraining({ seed: 1, config: { population: 4, irregularity: 50 } });
  assert.equal(isAligned(t.world).aligned, false);
  t.configure({ ...DEFAULT_TRAINING_CONFIG, population: 4 });
  t.finishGeneration();
  const after = isAligned(t.world);
  assert.equal(after.aligned, true);
  assert.equal(after.even, true);
});

test('otras pestañas: El problema y Reglas a mano siguen con la irregularidad del 50 %', () => {
  assert.equal(DEFAULT_TRAFFIC.irregularity, 50);
  assert.equal(STREET_DEFAULTS.irregularity, 50);
  const world = createWorld(worldSpec(STREET_DEFAULTS, 1));
  assert.equal(isAligned(world).aligned, false);
  assert.equal(createWorld({ seed: 1 }).vehiclesIn(0, 1000).some((v) => v.offset !== 0), true);
});

test('población por defecto: un entrenamiento sin configurar nada empieza con 400 individuos', () => {
  assert.equal(DEFAULT_TRAINING_CONFIG.population, 400);
  const t = createTraining({ seed: 1 });
  assert.equal(t.population, 400);
  assert.equal(t.world.agents.length, 400);
});

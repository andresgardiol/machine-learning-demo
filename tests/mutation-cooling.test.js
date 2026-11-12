// Enfriamiento de la mutación (fitness-que-premia-superar, grupo 4, design.md D9).
import test from 'node:test';
import assert from 'node:assert/strict';
import { MUTATION_COOLING, cooledStrength, nextGeneration, mutate, childrenOf } from '../src/core/evolution.js';
import { createTraining, DEFAULT_TRAINING_CONFIG } from '../src/core/training.js';
import { createBrain } from '../src/core/brain.js';
import { createNetwork, copyNetwork } from '../src/core/network.js';
import { createRandom, deriveSeed, randomFor } from '../src/core/random.js';

const round2 = (x) => Math.round(x * 100) / 100;
const breedingRandom = (seed, generation) => randomFor(deriveSeed(seed, 2), generation);

/** Lo que armaría nextGeneration a mano con la fuerza dada, a partir de la generación en curso. */
function expectedNext(t, strength) {
  return nextGeneration({
    networks: t.networks.slice(), fitnesses: t.fitnesses(), config: { ...t.config, mutationStrength: strength },
    random: breedingRandom(t.seed, t.generation),
  }).networks;
}

/** Cierra generaciones a pedido hasta que la generación en curso sea `target`. */
function skipTo(t, target) {
  while (t.generation < target) { for (let i = 0; i < 20; i++) t.step(); t.finishGeneration(); }
}

test('fuerza enfriada: 28,5 % tras la generación 1, 17,96 % tras la 10, 10,75 % tras la 20 y 3 % desde la 45', () => {
  assert.deepEqual({ ...MUTATION_COOLING }, { start: 30, factor: 0.95, floor: 3 });
  assert.equal(round2(cooledStrength(1)), 28.5);
  assert.equal(round2(cooledStrength(10)), 17.96);
  assert.equal(round2(cooledStrength(20)), 10.75);
  assert.equal(round2(cooledStrength(30)), 6.44);
  assert.ok(cooledStrength(44) > 3);
  for (const g of [45, 46, 60, 100, 1000]) assert.equal(cooledStrength(g), 3, `generación ${g}`);
});

test('enfriamiento: encendido por defecto', () => {
  assert.equal(DEFAULT_TRAINING_CONFIG.mutationCooling, true);
  assert.equal(createTraining({ seed: 1, config: { population: 2 } }).config.mutationCooling, true);
  assert.equal(createTraining({ seed: 1, config: { population: 2, mutationCooling: 0 } }).config.mutationCooling, false);
});

test('estado por defecto: la segunda generación se arma con una fuerza de 28,5 %', () => {
  const t = createTraining({ seed: 1, config: { population: 12 } });
  assert.equal(round2(t.nextMutationStrength), 28.5);
  for (let i = 0; i < 120; i++) t.step();
  const expected = expectedNext(t, cooledStrength(1));
  const withConfigured = expectedNext(t, t.config.mutationStrength);
  t.finishGeneration();
  assert.deepEqual(t.networks, expected);
  assert.notDeepEqual(t.networks, withConfigured);
});

test('la fuerza baja con las generaciones: tras la 10 y la 20, 17,96 % y 10,75 %', () => {
  const t = createTraining({ seed: 2, config: { population: 6, maxDuration: 10 } });
  skipTo(t, 10);
  assert.equal(round2(t.nextMutationStrength), 17.96);
  const after10 = expectedNext(t, cooledStrength(10));
  t.finishGeneration();
  assert.deepEqual(t.networks, after10);
  skipTo(t, 20);
  assert.equal(round2(t.nextMutationStrength), 10.75);
  const after20 = expectedNext(t, cooledStrength(20));
  t.finishGeneration();
  assert.deepEqual(t.networks, after20);
});

test('enfriamiento apagado: con la fuerza en 10 %, la siguiente se arma con 10 % sea cual sea su número', () => {
  const t = createTraining({ seed: 3, config: { population: 6, maxDuration: 10, mutationCooling: false, mutationStrength: 10 } });
  for (const g of [1, 2, 7]) {
    skipTo(t, g);
    assert.equal(t.nextMutationStrength, 10);
    const expected = expectedNext(t, 10);
    t.finishGeneration();
    assert.deepEqual(t.networks, expected, `tras la generación ${g}`);
  }
});

test('apagarlo durante una generación rige desde la siguiente y vuelve a la fuerza configurada', () => {
  const t = createTraining({ seed: 3, config: { population: 6, maxDuration: 10, mutationStrength: 12 } });
  skipTo(t, 4);
  t.configure({ mutationCooling: false });
  assert.equal(t.config.mutationCooling, true, 'la generación en curso no cambia');
  assert.equal(t.nextMutationStrength, 12);
  const expected = expectedNext(t, 12);
  t.finishGeneration();
  assert.deepEqual(t.networks, expected);
});

test('volver a encenderlo durante la generación 30: la 31 se arma con 6,44 %, como si nunca se hubiera apagado', () => {
  const t = createTraining({ seed: 4, config: { population: 6, maxDuration: 10, mutationCooling: false } });
  skipTo(t, 30);
  t.configure({ mutationCooling: true });
  assert.equal(round2(t.nextMutationStrength), 6.44);
  const expected = expectedNext(t, cooledStrength(30));
  t.finishGeneration();
  assert.equal(t.generation, 31);
  assert.deepEqual(t.networks, expected);
});

test('con selección manual no se usa: los hijos del padre elegido se arman con la fuerza configurada (10 %)', () => {
  const t = createTraining({ seed: 5, config: { population: 6, maxDuration: 10, selectionMode: 'manual', mutationStrength: 10 } });
  assert.equal(t.config.mutationCooling, true);
  for (let i = 0; i < 60; i++) t.step();
  const parent = t.chooseLeader();
  assert.equal(t.nextMutationStrength, 10);
  t.finishGeneration();
  assert.deepEqual(t.networks, childrenOf(parent.network, { ...t.config, mutationStrength: 10 }, breedingRandom(5, 1)));
});

function brainWith(generations, selectionMode) {
  return createBrain({
    id: 'b', name: 'B', now: '2026-11-12T10:00:00.000Z',
    network: createNetwork({ inputs: 6, hidden: [6], outputs: 4, random: createRandom(7) }),
    sensors: { count: 5, range: 3, spread: 90 },
    training: {
      generations, seed: 1, maxSpeed: 20, fitness: { kind: 'lead', best: 100 },
      evolution: { population: 10, elite: 10, selection: 10, mutationStrength: 10, mutationRate: 100, crossover: false, maxDuration: 60, selectionMode },
      scenarios: [{ track: 'straight', lanes: 3, density: 50, irregularity: 0, trafficMode: 'new', generations }],
    },
  });
}

test('continuar desde un cerebro de 60 generaciones con el enfriamiento encendido: la población inicial se arma con 3 %', () => {
  const brain = brainWith(60, 'auto');
  const t = createTraining({ seed: 9, config: { population: 8 }, brain });
  const stream = deriveSeed(9, 1);
  assert.deepEqual(t.networks[0], copyNetwork(brain.network));
  for (let i = 1; i < 8; i++) {
    assert.deepEqual(t.networks[i], mutate(brain.network, { strength: 3, rate: 100 }, randomFor(stream, i)), `hijo ${i}`);
  }
  assert.equal(t.nextMutationStrength, 3);
  // Con 2 generaciones, la inicial sale con la fuerza que le toca tras la generación 2.
  const young = createTraining({ seed: 9, config: { population: 3 }, brain: brainWith(2, 'auto') });
  assert.deepEqual(young.networks[1], mutate(brain.network, { strength: cooledStrength(2), rate: 100 }, randomFor(stream, 1)));
});

test('continuar desde un cerebro con selección manual o con el enfriamiento apagado: la población inicial usa la fuerza configurada', () => {
  const brain = brainWith(60, 'auto');
  const stream = deriveSeed(9, 1);
  const off = createTraining({ seed: 9, config: { population: 3, mutationCooling: false, mutationStrength: 20 }, brain });
  assert.deepEqual(off.networks[1], mutate(brain.network, { strength: 20, rate: 100 }, randomFor(stream, 1)));
  const manual = createTraining({ seed: 9, config: { population: 3, selectionMode: 'manual', mutationStrength: 20 }, brain });
  assert.deepEqual(manual.networks[1], mutate(brain.network, { strength: 20, rate: 100 }, randomFor(stream, 1)));
});

test('el cerebro registra si se entrenó con enfriamiento', () => {
  const t = createTraining({ seed: 1, config: { population: 4, maxDuration: 10 } });
  t.finishGeneration();
  assert.equal(t.brain({ id: 'x', name: 'x', now: '2026-11-12T10:00:00.000Z' }).training.evolution.mutationCooling, true);
  const u = createTraining({ seed: 1, config: { population: 4, maxDuration: 10, mutationCooling: false } });
  u.finishGeneration();
  assert.equal(u.brain({ id: 'x', name: 'x', now: '2026-11-12T10:00:00.000Z' }).training.evolution.mutationCooling, false);
});

test('enfriamiento reproducible: misma semilla y configuración, misma fuerza y misma población en cada generación', () => {
  const a = createTraining({ seed: 6, config: { population: 10, maxDuration: 10 } });
  const b = createTraining({ seed: 6, config: { population: 10, maxDuration: 10 } });
  for (let g = 0; g < 6; g++) {
    assert.equal(a.nextMutationStrength, b.nextMutationStrength);
    while (!a.step()) b.step();
    b.step();
    assert.equal(a.generation, b.generation);
    assert.deepEqual(a.networks, b.networks);
  }
});

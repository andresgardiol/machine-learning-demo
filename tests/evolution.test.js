import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createStats, recordStep, fitnessOf, rankPopulation, parentCount, eliteCount, mutate, crossover,
  nextGeneration, normalizeEvolution, DEFAULT_EVOLUTION, EvolutionError,
} from '../src/core/evolution.js';
import { createNetwork, flatValues, copyNetwork } from '../src/core/network.js';
import { createRandom } from '../src/core/random.js';

const net = (seed, hidden = [6]) => createNetwork({ inputs: 6, hidden, outputs: 4, random: createRandom(seed) });

/** Recorre una secuencia de progresos; `crashAt` es el paso (1, 2, …) en el que el agente choca. */
function statsFor(progresses, crashAt = null) {
  const stats = createStats();
  progresses.forEach((progress, i) => recordStep(stats, { progress, crashed: crashAt !== null && i + 1 >= crashAt }));
  return stats;
}

// --- 5.1 Estadísticas y funciones de fitness ---------------------------------------------

test('fitness por distancia: llega a 120 m, retrocede hasta 100 y su fitness es 120', () => {
  const progresses = [];
  for (let i = 1; i <= 120; i++) progresses.push(i);
  for (let i = 119; i >= 100; i--) progresses.push(i);
  const stats = statsFor(progresses);
  assert.equal(stats.best, 120);
  assert.equal(fitnessOf('distance', stats), 120);
});

test('fitness por distancia: nunca es menor que 0 aunque el auto solo retroceda', () => {
  assert.equal(fitnessOf('distance', statsFor([-1, -2, -3])), 0);
});

test('fitness por tiempo sin chocar: chocar a los 3 s da 3 y no moverse en una generación de 5 s da 5', () => {
  const crashed = statsFor(Array.from({ length: 300 }, (_, i) => i * 0.1), 180);
  assert.equal(crashed.steps, 180);
  assert.equal(crashed.crashed, true);
  assert.equal(fitnessOf('survival', crashed), 3);
  const still = statsFor(Array.from({ length: 300 }, () => 0));
  assert.equal(still.crashed, false);
  assert.equal(fitnessOf('survival', still), 5);
});

test('fitness por velocidad media: recorrer 60 m y chocar a los 4 s da 15', () => {
  const stats = statsFor(Array.from({ length: 240 }, (_, i) => ((i + 1) * 60) / 240), 240);
  assert.equal(stats.best, 60);
  assert.equal(fitnessOf('speed', stats), 15);
  assert.equal(fitnessOf('speed', createStats()), 0); // sin tiempo en carrera
});

test('fitness: una función desconocida se rechaza', () => {
  assert.throws(() => fitnessOf('overtakes', createStats()), (e) => e instanceof EvolutionError && e.code === 'unknownFitness');
  assert.equal(DEFAULT_EVOLUTION.fitness, 'distance');
});

// --- 5.2 Orden, selección y élite ----------------------------------------------------------

test('selección del diez por ciento: de 100 individuos, los padres son los 10 de mayor fitness', () => {
  const fitnesses = Array.from({ length: 100 }, (_, i) => (i * 37) % 100); // permutación de 0..99
  const parents = rankPopulation(fitnesses).slice(0, parentCount(100, 10));
  assert.equal(parents.length, 10);
  assert.deepEqual(parents.map((i) => fitnesses[i]), [99, 98, 97, 96, 95, 94, 93, 92, 91, 90]);
  const { parents: fromNext } = nextGeneration({
    networks: Array.from({ length: 100 }, (_, i) => net(i, [])), fitnesses,
    config: { population: 100, selection: 10 }, random: createRandom(1),
  });
  assert.deepEqual(fromNext, parents);
});

test('empate: queda primero el que estaba antes en la población', () => {
  assert.deepEqual(rankPopulation([5, 7, 7, 5, 9]), [4, 1, 2, 0, 3]);
});

test('población mínima: 2 individuos con selección del 1 % dejan un padre', () => {
  assert.equal(parentCount(2, 1), 1);
  const { parents } = nextGeneration({ networks: [net(1), net(2)], fitnesses: [1, 3], config: { population: 2, selection: 1 }, random: createRandom(1) });
  assert.deepEqual(parents, [1]);
});

test('élite de uno: la generación siguiente contiene una red idéntica a la del mejor de la anterior', () => {
  const networks = [net(1), net(2), net(3), net(4)];
  const { networks: next, elite } = nextGeneration({ networks, fitnesses: [3, 9, 1, 2], config: { population: 4, elite: 1, mutationStrength: 50 }, random: createRandom(5) });
  assert.deepEqual(elite, [0]);
  assert.deepEqual(next[0], networks[1]);
  assert.notEqual(next[0], networks[1]); // es una copia
  for (const child of next.slice(1)) assert.notDeepEqual(child, networks[1]);
});

test('sin élite: con mutación mayor que cero, ningún individuo repite una red de la anterior', () => {
  const networks = Array.from({ length: 10 }, (_, i) => net(i));
  const { networks: next, elite } = nextGeneration({ networks, fitnesses: networks.map((_, i) => i), config: { population: 10, elite: 0, mutationStrength: 10 }, random: createRandom(9) });
  assert.deepEqual(elite, []);
  for (const child of next) for (const old of networks) assert.notDeepEqual(child, old);
});

test('élite: de 0 a 10 y nunca más que la población menos uno', () => {
  assert.equal(eliteCount(100, 1), 1);
  assert.equal(eliteCount(3, 10), 2);
  assert.equal(eliteCount(2, 1), 1);
  assert.equal(normalizeEvolution({ elite: 25 }).elite, 10);
  assert.equal(normalizeEvolution({ elite: -3 }).elite, 0);
  assert.equal(normalizeEvolution({ population: 2, elite: 5 }).elite, 1);
});

// --- 5.3 Mutación ----------------------------------------------------------------------------

test('fuerza cero: el hijo es idéntico al padre', () => {
  const parent = net(3);
  const child = mutate(parent, { strength: 0, rate: 100 }, createRandom(1));
  assert.deepEqual(child, parent);
  assert.notEqual(child, parent);
});

test('fuerza del diez por ciento con probabilidad total: ningún valor difiere en más de 0,2', () => {
  const parent = net(3);
  const before = JSON.stringify(parent);
  const child = mutate(parent, { strength: 10, rate: 100 }, createRandom(2));
  const a = flatValues(parent);
  const b = flatValues(child);
  let changed = 0;
  for (let i = 0; i < a.length; i++) {
    assert.ok(Math.abs(a[i] - b[i]) <= 0.2, `${a[i]} → ${b[i]}`);
    if (a[i] !== b[i]) changed += 1;
  }
  assert.equal(changed, a.length);
  assert.equal(JSON.stringify(parent), before, 'el padre no cambió');
});

test('fuerza total con probabilidad total: todos los valores entre -1 y 1 y el padre no cambió', () => {
  const parent = net(4);
  const before = JSON.stringify(parent);
  const child = mutate(parent, { strength: 100, rate: 100 }, createRandom(3));
  for (const v of flatValues(child)) assert.ok(v >= -1 && v <= 1);
  assert.notDeepEqual(flatValues(child), flatValues(parent));
  assert.equal(JSON.stringify(parent), before);
});

test('probabilidad del 1 %: cambia solo una fracción pequeña de los valores', () => {
  const parent = createNetwork({ inputs: 101, hidden: [16, 16], outputs: 4, random: createRandom(8) });
  const a = flatValues(parent);
  const b = flatValues(mutate(parent, { strength: 50, rate: 1 }, createRandom(4)));
  const changed = a.filter((v, i) => v !== b[i]).length;
  assert.equal(a.length, 101 * 16 + 16 + 16 * 16 + 16 + 16 * 4 + 4); // 1972
  assert.ok(changed > 0 && changed < a.length * 0.03, `cambiaron ${changed} de ${a.length}`);
});

// --- 5.4 Cruce ---------------------------------------------------------------------------------

test('cruce sin mutación: cada valor del hijo es el de uno de sus dos padres en esa posición', () => {
  const networks = [net(1), net(2), net(3), net(4)];
  const { networks: next } = nextGeneration({
    networks, fitnesses: [4, 3, 2, 1],
    config: { population: 4, elite: 0, selection: 50, crossover: true, mutationStrength: 0 },
    random: createRandom(6),
  });
  const p = [flatValues(networks[0]), flatValues(networks[1])]; // los dos padres (50 % de 4)
  for (const child of next) {
    const c = flatValues(child);
    let fromA = 0;
    let fromB = 0;
    c.forEach((v, i) => {
      assert.ok(v === p[0][i] || v === p[1][i], `posición ${i}`);
      if (v === p[0][i]) fromA += 1;
      if (v === p[1][i]) fromB += 1;
    });
    assert.ok(fromA > 0 && fromB > 0, 'toma valores de los dos padres');
  }
  // La función de cruce también, directamente.
  const direct = flatValues(crossover(networks[2], networks[3], createRandom(7)));
  const p2 = flatValues(networks[2]);
  const p3 = flatValues(networks[3]);
  direct.forEach((v, i) => assert.ok(v === p2[i] || v === p3[i]));
});

test('cruce con un solo padre: cada hijo se forma a partir de ese padre', () => {
  const networks = [net(1), net(2), net(3)];
  const { networks: next, parents } = nextGeneration({
    networks, fitnesses: [1, 5, 2],
    config: { population: 3, elite: 0, selection: 1, crossover: true, mutationStrength: 0 },
    random: createRandom(3),
  });
  assert.deepEqual(parents, [1]);
  for (const child of next) assert.deepEqual(child, networks[1]);
});

// --- 5.5 Generación siguiente ------------------------------------------------------------------

test('tamaño constante: una generación de 100 da una siguiente de 100', () => {
  const networks = Array.from({ length: 100 }, (_, i) => net(i, []));
  const { networks: next } = nextGeneration({ networks, fitnesses: networks.map((_, i) => i % 7), config: DEFAULT_EVOLUTION, random: createRandom(1) });
  assert.equal(next.length, 100);
});

test('tamaño fuera de rango: una población de 1 queda en 2, y una de 900 en 500', () => {
  assert.equal(normalizeEvolution({ population: 1 }).population, 2);
  assert.equal(normalizeEvolution({ population: 900 }).population, 500);
  const { networks: next } = nextGeneration({ networks: [net(1), net(2)], fitnesses: [1, 2], config: { population: 1 }, random: createRandom(1) });
  assert.equal(next.length, 2);
});

test('valores fuera de rango ajustados al límite más cercano y valores por defecto', () => {
  assert.deepEqual(normalizeEvolution({}), {
    population: 100, elite: 1, selection: 10, mutationStrength: 10, mutationRate: 100, crossover: false, fitness: 'distance', maxDuration: 60,
  });
  assert.deepEqual(normalizeEvolution({ selection: 0, mutationStrength: 140, mutationRate: 0, maxDuration: 5, fitness: 'x' }), {
    population: 100, elite: 1, selection: 1, mutationStrength: 100, mutationRate: 1, crossover: false, fitness: 'distance', maxDuration: 10,
  });
  assert.equal(normalizeEvolution({ selection: 80, maxDuration: 1000 }).selection, 50);
  assert.equal(normalizeEvolution({ maxDuration: 1000 }).maxDuration, 300);
});

test('dos armados con el mismo generador dan poblaciones idénticas', () => {
  const networks = Array.from({ length: 20 }, (_, i) => net(i));
  const fitnesses = networks.map((_, i) => (i * 13) % 20);
  const config = { population: 20, elite: 2, selection: 25, crossover: true, mutationStrength: 30, mutationRate: 50 };
  const a = nextGeneration({ networks, fitnesses, config, random: createRandom(42) });
  const b = nextGeneration({ networks: networks.map(copyNetwork), fitnesses, config, random: createRandom(42) });
  assert.deepEqual(a, b);
  const c = nextGeneration({ networks, fitnesses, config, random: createRandom(43) });
  assert.notDeepEqual(a.networks, c.networks);
});

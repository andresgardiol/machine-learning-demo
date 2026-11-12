import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createStats, recordStep, fitnessOf, rankPopulation, parentCount, eliteCount, mutate, crossover,
  nextGeneration, normalizeEvolution, DEFAULT_EVOLUTION, EvolutionError, FITNESS_KINDS, FITNESS_UNITS,
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
  assert.equal(DEFAULT_EVOLUTION.fitness, 'lead');
});

// --- Ventaja sobre el tráfico (fitness-que-premia-superar, grupo 1) -----------------------------

/** Recorre pasos de (progreso, avance del tráfico); `crashAt` es el paso (1, 2, …) en el que choca. */
function leadStatsFor(samples, crashAt = null) {
  const stats = createStats();
  samples.forEach(([progress, traffic], i) => recordStep(stats, { progress, crashed: crashAt !== null && i + 1 >= crashAt }, traffic));
  return stats;
}

test('ventaja: las estadísticas empiezan en 0 y la llamada sin avance del tráfico mide contra un tráfico quieto', () => {
  assert.equal(createStats().lead, 0);
  const stats = createStats();
  recordStep(stats, { progress: 12, crashed: false });
  assert.equal(stats.lead, 12);
});

test('ventaja: es la mayor alcanzada y no baja si el auto frena', () => {
  // Va a 20 m/s 10 s (ventaja 100) y después se queda quieto 5 s mientras el tráfico sigue a 10 m/s.
  const samples = [];
  for (let s = 1; s <= 10; s++) samples.push([20 * s, 10 * s]);
  for (let s = 11; s <= 15; s++) samples.push([200, 10 * s]);
  const stats = leadStatsFor(samples);
  assert.equal(stats.lead, 100);
  assert.equal(fitnessOf('lead', stats), 100);
});

test('ventaja: no cambia después de un choque', () => {
  const stats = leadStatsFor([[30, 10], [60, 20], [90, 30], [200, 40]], 3);
  assert.equal(stats.crashed, true);
  assert.equal(stats.lead, 60);
});

test('ventaja sobre el tráfico: a los 20 s lleva recorridos 300 m con el tráfico a 10 m/s y su fitness es 100', () => {
  const samples = [];
  for (let s = 1; s <= 20; s++) samples.push([15 * s, 10 * s]);
  assert.equal(fitnessOf('lead', leadStatsFor(samples)), 100);
});

test('ventaja: seguir al tráfico no suma (ventaja 30 y 20 s detrás de un vehículo a su velocidad)', () => {
  const samples = [[30, 0]];
  for (let s = 1; s <= 20; s++) samples.push([30 + 10 * s, 10 * s]);
  assert.equal(fitnessOf('lead', leadStatsFor(samples)), 30);
});

test('ventaja: la alcanzada se conserva si después choca o frena hasta que el tráfico lo pasa', () => {
  const crash = leadStatsFor([[40, 0], [80, 0], [80, 10]], 3);
  assert.equal(fitnessOf('lead', crash), 80);
  const brake = leadStatsFor([[40, 0], [80, 0], [80, 50], [80, 100], [80, 150]]);
  assert.equal(fitnessOf('lead', brake), 80);
});

test('ventaja: un auto que no avanza o retrocede tiene fitness 0', () => {
  assert.equal(fitnessOf('lead', leadStatsFor([[0, 10], [0, 20], [0, 30]])), 0);
  assert.equal(fitnessOf('lead', leadStatsFor([[-1, 10], [-2, 20], [-3, 30]])), 0);
});

test('ventaja: es la primera función del selector y su unidad son los metros de ventaja', () => {
  assert.deepEqual([...FITNESS_KINDS], ['lead', 'distance', 'survival', 'speed']);
  assert.equal(FITNESS_UNITS.lead, 'metersAhead');
  assert.equal(FITNESS_UNITS.distance, 'meters');
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

test('élite: de 0 a 20 y nunca más que la mitad de la población', () => {
  assert.equal(eliteCount(100, 1), 1);
  assert.equal(eliteCount(3, 10), 1);
  assert.equal(eliteCount(2, 1), 1);
  assert.equal(normalizeEvolution({ elite: 25 }).elite, 20);
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

test('élite por defecto: de una generación de 100 pasan sin cambios los diez mejores, en orden', () => {
  assert.equal(DEFAULT_EVOLUTION.elite, 10);
  const networks = Array.from({ length: 100 }, (_, i) => net(i, []));
  const fitnesses = networks.map((_, i) => (i * 37) % 100);
  const { networks: next, elite } = nextGeneration({ networks, fitnesses, config: { population: 100 }, random: createRandom(3) });
  const ranked = rankPopulation(fitnesses);
  assert.deepEqual(elite, [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
  for (let e = 0; e < 10; e++) assert.deepEqual(next[e], networks[ranked[e]], `élite ${e}`);
  assert.notDeepEqual(next[10], networks[ranked[10]]);
});

test('élite fuera de rango: pedir 35 la deja en 20', () => {
  assert.equal(normalizeEvolution({ elite: 35 }).elite, 20);
  assert.equal(eliteCount(100, 35), 35); // eliteCount solo acota por la población
  assert.equal(eliteCount(100, normalizeEvolution({ elite: 35 }).elite), 20);
});

test('élite con población chica: de 10 individuos pasan cinco sin cambios y los otros cinco son hijos nuevos', () => {
  assert.equal(normalizeEvolution({ population: 10 }).elite, 5);
  assert.equal(eliteCount(10, 10), 5);
  const networks = Array.from({ length: 10 }, (_, i) => net(i, []));
  const fitnesses = networks.map((_, i) => i);
  const { networks: next, elite } = nextGeneration({ networks, fitnesses, config: { population: 10, mutationStrength: 10 }, random: createRandom(4) });
  assert.equal(elite.length, 5);
  const ranked = rankPopulation(fitnesses);
  for (let e = 0; e < 5; e++) assert.deepEqual(next[e], networks[ranked[e]]);
  for (let c = 5; c < 10; c++) assert.ok(networks.every((n) => JSON.stringify(n) !== JSON.stringify(next[c])), `hijo ${c}`);
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
    population: 100, elite: 10, selection: 10, mutationStrength: 10, mutationRate: 100, crossover: false, fitness: 'lead', maxDuration: 60,
  });
  assert.deepEqual(normalizeEvolution({ selection: 0, mutationStrength: 140, mutationRate: 0, maxDuration: 5, fitness: 'x' }), {
    population: 100, elite: 10, selection: 1, mutationStrength: 100, mutationRate: 1, crossover: false, fitness: 'lead', maxDuration: 10,
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

// --- Hijos de un solo padre (selección manual, design.md D3) ----------------------------------

import { childrenOf } from '../src/core/evolution.js';

test('hijos de un padre: la posición 0 es una copia idéntica e independiente del padre', () => {
  const parent = net(7);
  const before = copyNetwork(parent);
  const kids = childrenOf(parent, { population: 10, mutationStrength: 10, mutationRate: 100 }, createRandom(1));
  assert.deepEqual(kids[0], parent);
  assert.notEqual(kids[0], parent);
  kids[0].layers[0].weights[0][0] = 99;
  kids[0].layers[0].biases[0] = 99;
  assert.deepEqual(parent, before); // ni la copia ni la cría tocaron al padre
});

test('hijos de un padre: población de 100 con fuerza 10 % y probabilidad 100 % da 100 redes, las 99 últimas distintas del padre', () => {
  const parent = net(3);
  const kids = childrenOf(parent, { population: 100, mutationStrength: 10, mutationRate: 100 }, createRandom(5));
  assert.equal(kids.length, 100);
  for (let i = 1; i < kids.length; i++) assert.notDeepEqual(flatValues(kids[i]), flatValues(parent), `hijo ${i}`);
  const p = flatValues(parent);
  for (const kid of kids.slice(1)) flatValues(kid).forEach((v, j) => assert.ok(Math.abs(v - p[j]) <= 0.2 + 1e-12));
});

test('hijos de un padre: con fuerza 0 % todos son idénticos al padre', () => {
  const parent = net(11);
  const kids = childrenOf(parent, { population: 30, mutationStrength: 0, mutationRate: 100 }, createRandom(2));
  assert.equal(kids.length, 30);
  for (const kid of kids) assert.deepEqual(kid, parent);
});

test('hijos de un padre: dos llamadas con el mismo azar dan los mismos hijos, y con otro azar, otros', () => {
  const parent = net(4);
  const config = { population: 20, mutationStrength: 30, mutationRate: 50 };
  const a = childrenOf(parent, config, createRandom(42));
  const b = childrenOf(copyNetwork(parent), config, createRandom(42));
  assert.deepEqual(a, b);
  const c = childrenOf(parent, config, createRandom(43));
  assert.notDeepEqual(a.slice(1), c.slice(1));
});

test('hijos de un padre: consume el azar hijo por hijo, como mutate en orden', () => {
  const parent = net(9);
  const random = createRandom(8);
  const kids = childrenOf(parent, { population: 4, mutationStrength: 20, mutationRate: 60 }, createRandom(8));
  const expected = [copyNetwork(parent)];
  for (let i = 1; i < 4; i++) expected.push(mutate(parent, { strength: 20, rate: 60 }, random));
  assert.deepEqual(kids, expected);
});

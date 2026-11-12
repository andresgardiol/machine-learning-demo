import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createTraining, normalizeTrainingConfig, DEFAULT_TRAINING_CONFIG, TrainingError, SCENARIO_TRAFFIC_SEED,
} from '../src/core/training.js';
import { createBrain, validateBrain } from '../src/core/brain.js';
import { createNetwork, flatValues } from '../src/core/network.js';
import { nextGeneration } from '../src/core/evolution.js';
import { createRandom, deriveSeed, randomFor } from '../src/core/random.js';

/** Red sin capas ocultas con salidas fijas (avanzar, izquierda, derecha, retroceder). */
const fixedNetwork = (bits, inputs = 6) => ({
  sizes: [inputs, 4], activation: 'step',
  layers: [{ weights: bits.map(() => new Array(inputs).fill(0)), biases: bits.map((b) => (b ? 1 : -1)) }],
});

function brainOf(network, { generations = 0, sensors = { count: 5, range: 3, spread: 90 }, scenarios } = {}) {
  return createBrain({
    id: 'b', name: 'B', now: '2026-11-12T10:00:00.000Z', network, sensors,
    training: {
      generations, seed: 1, maxSpeed: 15, fitness: { kind: 'distance', best: 1 },
      evolution: { population: 10, elite: 1, selection: 10, mutationStrength: 10, mutationRate: 100, crossover: false, maxDuration: 60 },
      scenarios: scenarios ?? (generations > 0 ? [{ track: 'straight', lanes: 3, density: 50, irregularity: 50, trafficMode: 'same', generations }] : []),
    },
  });
}

/** Población de copias idénticas de una red fija (fuerza de mutación 0). */
const clones = (bits, config = {}) => createTraining({ seed: 1, config: { population: 6, mutationStrength: 0, mutationCooling: false, ...config }, brain: brainOf(fixedNetwork(bits)) });

function runUntilGeneration(training, target, limit = 200000) {
  let n = 0;
  while (training.generation < target && n < limit) { training.step(); n += 1; }
  assert.equal(training.generation, target, 'no llegó a la generación pedida');
}

// --- 7.1 Población, mundo, paso y líder ------------------------------------------------------

test('inicio de una generación: 100 autos detenidos en la misma posición, cada uno con una red distinta', () => {
  const t = createTraining({ seed: 1 });
  assert.equal(t.generation, 1);
  assert.equal(t.world.agents.length, 100);
  assert.equal(t.population, 100);
  const start = t.world.agents[0].car.position;
  for (const a of t.world.agents) {
    assert.deepEqual(a.car.position, start);
    assert.equal(a.car.speed, 0);
    assert.equal(a.car.angle, 0);
    assert.equal(a.crashed, false);
  }
  const keys = new Set(t.networks.map((n) => JSON.stringify(n)));
  assert.equal(keys.size, 100);
  assert.deepEqual(t.networks[0].sizes, [6, 6, 4]);
  assert.equal(t.world.agents[0].controller.network, t.networks[0]);
});

test('configuración por defecto del entrenamiento', () => {
  assert.deepEqual(normalizeTrainingConfig({}), {
    population: 100, elite: 10, selection: 10, mutationStrength: 10, mutationRate: 100, crossover: false,
    fitness: 'lead', maxDuration: 60, selectionMode: 'auto', slowRule: true, mutationCooling: true, trafficMode: 'new', lanes: 3, density: 50, irregularity: 0,
    maxSpeed: 20, hidden: [6], activation: 'step', sensors: { count: 5, range: 3, spread: 90 },
  });
  assert.deepEqual(normalizeTrainingConfig({ hidden: [20, 0, 4, 4, 4], population: 1 }).hidden, [16, 1, 4]);
  assert.equal(DEFAULT_TRAINING_CONFIG.population, 100);
});

test('cambio de líder: un auto en carrera que supera en distancia al líder pasa a ser el líder', () => {
  // Individuo 0 quieto (copia del cerebro), los demás mutados con fuerza total: alguno avanza.
  const t = createTraining({ seed: 3, config: { population: 8, mutationStrength: 100, mutationCooling: false, density: 0 }, brain: brainOf(fixedNetwork([0, 0, 0, 0])) });
  assert.equal(t.leaderIndex, 0);
  let changed = false;
  for (let i = 0; i < 120; i++) {
    t.step();
    const agents = t.world.agents;
    const leader = agents[t.leaderIndex];
    for (const a of agents) if (!a.crashed) assert.ok(a.progress <= leader.progress, 'nadie en carrera supera al líder');
    if (t.leaderIndex !== 0) changed = true;
  }
  assert.ok(changed, 'el líder cambió del primer auto a uno que avanzó');
  assert.ok(t.world.agents[t.leaderIndex].progress > t.world.agents[0].progress);
});

test('líder chocado: pasa a ser el auto en carrera que más avanzó', () => {
  // Hijos de un cerebro que avanza y gira, mutados con fuerza total: unos chocan pronto y otros no.
  const t = createTraining({ seed: 11, config: { population: 30, mutationStrength: 100, mutationCooling: false, density: 0 }, brain: brainOf(fixedNetwork([1, 1, 0, 0])) });
  let checked = 0;
  let previous = t.leaderIndex;
  for (let i = 0; i < 1200 && t.generation === 1; i++) {
    t.step();
    const agents = t.world.agents;
    if (t.generation === 1 && agents[previous].crashed && t.aliveCount > 0) {
      const best = Math.max(...agents.filter((a) => !a.crashed).map((a) => a.progress));
      assert.equal(agents[t.leaderIndex].crashed, false);
      assert.equal(agents[t.leaderIndex].progress, best);
      checked += 1;
    }
    previous = t.leaderIndex;
  }
  assert.ok(checked > 0, 'hubo al menos un líder que chocó con otros en carrera');
});

// --- 7.2 Fin de la generación, historial y campeón ----------------------------------------------

test('todos chocaron: al chocar el último auto, la generación termina con ese motivo', () => {
  const t = clones([1, 1, 0, 0], { density: 0 });
  let record = null;
  let steps = 0;
  while (!record && steps < 5000) { record = t.step(); steps += 1; }
  assert.equal(record.reason, 'allCrashed');
  assert.equal(record.generation, 1);
  assert.equal(t.generation, 2);
  assert.ok(steps < 600, `tardó ${steps} pasos`);
});

test('duración máxima: con autos que siguen avanzando, a los 60 s simulados termina por tiempo', () => {
  const t = clones([1, 0, 0, 0], { density: 0 });
  let record = null;
  let steps = 0;
  while (!record && steps < 10000) { record = t.step(); steps += 1; }
  assert.equal(record.reason, 'timeLimit');
  assert.equal(steps, 3600);
});

test('nadie avanza: tras 5 s simulados sin superar su mayor distancia, termina con ese motivo', () => {
  // Con la regla de los lentos apagada (encendida, los autos quietos salen por lentos en el mismo paso).
  const t = clones([0, 0, 0, 0], { density: 0, slowRule: false });
  let record = null;
  let steps = 0;
  while (!record && steps < 10000) { record = t.step(); steps += 1; }
  assert.equal(record.reason, 'stalled');
  assert.equal(steps, 300);
  assert.equal(t.world.aliveCount, 6); // nadie fue eliminado
});

test('a pedido: con autos en carrera, la generación termina con el motivo "a pedido" y empieza la siguiente', () => {
  const t = clones([1, 0, 0, 0], { density: 0 });
  for (let i = 0; i < 100; i++) t.step();
  assert.equal(t.aliveCount, 6);
  const record = t.finishGeneration();
  assert.equal(record.reason, 'requested');
  assert.equal(t.history[0].reason, 'requested');
  assert.equal(t.generation, 2);
  assert.equal(t.world.steps, 0);
  assert.ok(t.history[0].best > 0, 'se evaluó con lo logrado hasta ese instante');
});

test('historial: al terminar la tercera generación hay tres registros y el último es el 3 con sus datos', () => {
  const t = createTraining({ seed: 2, config: { population: 10, maxDuration: 10, fitness: 'distance' } });
  const seen = [];
  t.onGeneration((r) => seen.push(r.generation));
  runUntilGeneration(t, 4);
  assert.equal(t.history.length, 3);
  const last = t.history[2];
  assert.equal(last.generation, 3);
  assert.equal(typeof last.best, 'number');
  assert.equal(typeof last.average, 'number');
  assert.ok(last.average <= last.best);
  assert.equal(last.fitness, 'distance');
  assert.ok(['allCrashed', 'timeLimit', 'stalled'].includes(last.reason));
  assert.deepEqual(seen, [1, 2, 3]);
});

test('campeón: no hay antes de la primera generación', () => {
  const t = createTraining({ seed: 1, config: { population: 5 } });
  assert.equal(t.champion, null);
  assert.equal(t.brain({ id: 'x', name: 'x', now: '2026-01-01T00:00:00.000Z' }), null);
});

test('campeón: tras una generación es el individuo de mayor fitness de esa generación', () => {
  const t = createTraining({ seed: 4, config: { population: 12, maxDuration: 10, elite: 1 } });
  for (let i = 0; i < 400; i++) t.step();
  const networks = t.networks.slice();
  const fitnesses = t.fitnesses();
  const generation = t.generation;
  t.finishGeneration();
  const bestIndex = fitnesses.indexOf(Math.max(...fitnesses));
  assert.equal(t.champion.fitness, Math.max(...fitnesses));
  assert.deepEqual(t.champion.network, networks[bestIndex]);
  assert.equal(t.champion.generation, generation);
  assert.equal(t.history[t.history.length - 1].best, t.champion.fitness);
  // El primero de la generación siguiente es la élite: idéntico al campeón.
  assert.deepEqual(t.networks[0], t.champion.network);
  assert.equal(t.eliteCount, 1);
});

// --- 7.3 Cambios de configuración y modos de tráfico ---------------------------------------------

test('cambio de mutación durante la generación 4: la 4 sigue igual y la 5 se forma con la fuerza nueva', () => {
  const t = createTraining({ seed: 6, config: { population: 10, maxDuration: 10, mutationCooling: false } });
  const u = createTraining({ seed: 6, config: { population: 10, maxDuration: 10, mutationCooling: false } });
  runUntilGeneration(t, 4);
  runUntilGeneration(u, 4);
  for (let i = 0; i < 50; i++) { t.step(); u.step(); }
  t.configure({ mutationStrength: 60 });
  assert.deepEqual(t.pending, { mutationStrength: 60 });
  assert.equal(t.config.mutationStrength, 10);
  // La generación 4 sigue sin alteraciones: igual que la del entrenamiento sin el cambio.
  let ended = null;
  while (!ended) {
    ended = t.step();
    const other = u.step();
    assert.deepEqual(t.world.agentsSnapshot(), u.world.agentsSnapshot());
    if (ended) assert.deepEqual(ended, other);
  }
  assert.equal(t.generation, 5);
  assert.equal(t.pending, null);
  assert.equal(t.config.mutationStrength, 60);
  assert.notDeepEqual(t.networks, u.networks);
});

test('cambio de mutación: la generación 5 es la que arma la fuerza nueva con el generador de la 4', () => {
  const t = createTraining({ seed: 8, config: { population: 10, maxDuration: 10, mutationCooling: false } });
  runUntilGeneration(t, 4);
  for (let i = 0; i < 30; i++) t.step();
  t.configure({ mutationStrength: 60 });
  const networks = t.networks.slice();
  const fitnesses = t.fitnesses();
  t.finishGeneration();
  const expected = nextGeneration({ networks, fitnesses, config: { ...t.config }, random: randomFor(deriveSeed(8, 2), 4) });
  assert.equal(t.config.mutationStrength, 60);
  assert.deepEqual(t.networks, expected.networks);
});

test('cambio de población de 100 a 200: la siguiente tiene 200 y se conservan generación e historial', () => {
  const t = createTraining({ seed: 1, config: { maxDuration: 10 } });
  for (let i = 0; i < 30; i++) t.step();
  t.configure({ population: 200 });
  assert.equal(t.world.agents.length, 100);
  t.finishGeneration();
  assert.equal(t.population, 200);
  assert.equal(t.world.agents.length, 200);
  assert.equal(t.generation, 2);
  assert.equal(t.history.length, 1);
  assert.equal(t.history[0].generation, 1);
});

test('cambios de red o de sensores durante el entrenamiento se rechazan: piden un entrenamiento nuevo', () => {
  const t = createTraining({ seed: 1, config: { population: 4 } });
  for (const change of [{ hidden: [6, 6] }, { activation: 'relu' }, { sensors: { count: 7, range: 3, spread: 90 } }]) {
    assert.throws(() => t.configure(change), (e) => e instanceof TrainingError && e.code === 'requiresNewTraining');
  }
  assert.equal(t.pending, null);
  // Los mismos valores que ya tiene no son un cambio.
  t.configure({ hidden: [6], density: 70 });
  assert.deepEqual(t.pending, { density: 70 });
  // Volver al valor actual quita el cambio pendiente.
  t.configure({ density: 50 });
  assert.equal(t.pending, null);
});

test('cambio de escenario: la generación en curso termina en tres carriles y la siguiente corre en cuatro', () => {
  const t = createTraining({ seed: 1, config: { population: 4, maxDuration: 10, fitness: 'distance' } });
  t.configure({ lanes: 4, maxSpeed: 20, fitness: 'survival', trafficMode: 'new' });
  assert.equal(t.world.track.lanes, 3);
  const record = t.finishGeneration();
  assert.equal(record.fitness, 'distance');
  assert.equal(t.world.track.lanes, 4);
  assert.equal(t.world.agents[0].car.maxSpeed, 20);
  assert.equal(t.config.fitness, 'survival');
  assert.equal(t.config.trafficMode, 'new');
});

test('mismo tráfico: los vehículos aparecen en las mismas posiciones al empezar cada generación', () => {
  const t = createTraining({ seed: 1, config: { population: 4, maxDuration: 10, trafficMode: 'same' } });
  const layout = () => t.world.vehiclesIn(0, 600).map((v) => [v.id, v.position.x, v.position.y]);
  const first = layout();
  assert.ok(first.length > 5);
  assert.equal(t.world.seed, SCENARIO_TRAFFIC_SEED);
  for (let g = 0; g < 3; g++) {
    for (let i = 0; i < 20; i++) t.step();
    t.finishGeneration();
    assert.deepEqual(layout(), first);
  }
});

test('tráfico nuevo: la disposición de los vehículos cambia de una generación a la siguiente', () => {
  const t = createTraining({ seed: 1, config: { population: 4, maxDuration: 10, trafficMode: 'new' } });
  const layout = () => JSON.stringify(t.world.vehiclesIn(0, 600).map((v) => [v.position.x, v.position.y]));
  const seen = [layout()];
  for (let g = 0; g < 3; g++) {
    t.finishGeneration();
    const now = layout();
    assert.notEqual(now, seen[seen.length - 1]);
    seen.push(now);
  }
  assert.equal(t.world.seed, deriveSeed(deriveSeed(1, 3), 4));
});

// --- 7.4 Continuar desde un cerebro y cerebro del campeón ------------------------------------------

test('población inicial desde un cerebro de 40 generaciones: el primero es idéntico, los demás hijos mutados, generación 41', () => {
  const network = createNetwork({ inputs: 6, hidden: [6], outputs: 4, random: createRandom(5) });
  const brain = brainOf(network, { generations: 40 });
  const before = JSON.stringify(brain);
  const t = createTraining({ seed: 9, config: { population: 20 }, brain });
  assert.equal(t.generation, 41);
  assert.deepEqual(t.networks[0], brain.network);
  const parent = flatValues(brain.network);
  for (const child of t.networks.slice(1)) {
    const values = flatValues(child);
    assert.notDeepEqual(values, parent);
    values.forEach((v, i) => assert.ok(Math.abs(v - parent[i]) <= 0.2)); // fuerza 10 %
  }
  assert.equal(JSON.stringify(brain), before, 'el cerebro no cambió');
  t.finishGeneration();
  assert.equal(t.history[0].generation, 41);
  assert.equal(t.generationsDone, 41);
});

test('forma heredada: desde un cerebro de 9 sensores y dos capas ocultas, todos tienen 9 sensores y esa forma', () => {
  const network = createNetwork({ inputs: 10, hidden: [8, 5], outputs: 4, activation: 'tanh', random: createRandom(5) });
  const brain = brainOf(network, { sensors: { count: 9, range: 4, spread: 120 } });
  const t = createTraining({ seed: 1, config: { population: 15, hidden: [6], sensors: { count: 5 } }, brain });
  assert.deepEqual(t.config.sensors, { count: 9, range: 4, spread: 120 });
  assert.deepEqual(t.config.hidden, [8, 5]);
  assert.equal(t.config.activation, 'tanh');
  for (const n of t.networks) { assert.deepEqual(n.sizes, [10, 8, 5, 4]); assert.equal(n.activation, 'tanh'); }
  for (const a of t.world.agents) { assert.deepEqual(a.car.sensors, { count: 9, range: 4, spread: 120 }); assert.equal(a.perception.sensors.length, 9); }
  t.finishGeneration();
  for (const n of t.networks) assert.deepEqual(n.sizes, [10, 8, 5, 4]);
});

test('cerebro del campeón: pasa la validación y acumula generaciones y escenarios', () => {
  const brain = brainOf(createNetwork({ inputs: 6, hidden: [6], outputs: 4, random: createRandom(5) }), { generations: 10 });
  const t = createTraining({ seed: 2, config: { population: 6, maxDuration: 10, trafficMode: 'same', elite: 1, fitness: 'distance', irregularity: 50 }, brain });
  for (let g = 0; g < 5; g++) { for (let i = 0; i < 30; i++) t.step(); t.finishGeneration(); }
  const b = t.brain({ id: 'id-1', name: 'Campeón', now: '2026-11-12T11:00:00.000Z' });
  assert.equal(validateBrain(b), null);
  assert.equal(b.training.generations, 15);
  assert.deepEqual(b.training.scenarios, [{ track: 'straight', lanes: 3, density: 50, irregularity: 50, trafficMode: 'same', generations: 15 }]);
  assert.equal(b.training.seed, 2);
  assert.equal(b.training.maxSpeed, 20);
  assert.deepEqual(b.training.fitness, { kind: 'distance', best: t.champion.fitness });
  assert.deepEqual(b.training.evolution, { population: 6, elite: 1, selection: 10, mutationStrength: 10, mutationRate: 100, crossover: false, maxDuration: 10, slowRule: true, selectionMode: 'auto', mutationCooling: true });
  assert.deepEqual(b.network, t.champion.network);
  assert.deepEqual(b.sensors, { count: 5, range: 3, spread: 90 });
});

// --- 7.5 Reproducibilidad y el mejor nunca empeora ------------------------------------------------

function trainFor(seed, generations, config = {}) {
  const t = createTraining({ seed, config: { population: 20, maxDuration: 15, ...config } });
  runUntilGeneration(t, generations + 1);
  return t;
}

test('repetición idéntica: diez generaciones con la misma semilla dan el mismo historial y el mismo campeón', () => {
  const a = trainFor(5, 10);
  const b = trainFor(5, 10);
  assert.equal(a.history.length, 10);
  assert.deepEqual(a.history, b.history);
  assert.deepEqual(a.history.map((h) => [h.best, h.average]), b.history.map((h) => [h.best, h.average]));
  assert.deepEqual(a.champion.network, b.champion.network);
  assert.ok(a.history[9].best > 0);
});

test('semilla distinta: las redes de la población inicial son distintas', () => {
  const a = createTraining({ seed: 5, config: { population: 20 } });
  const b = createTraining({ seed: 6, config: { population: 20 } });
  for (let i = 0; i < 20; i++) assert.notDeepEqual(a.networks[i], b.networks[i]);
});

test('el mejor nunca empeora: diez generaciones con élite 1 y mismo tráfico', () => {
  for (const seed of [1, 2, 3]) {
    const t = trainFor(seed, 10, { elite: 1, trafficMode: 'same' });
    const bests = t.history.map((h) => h.best);
    for (let g = 1; g < bests.length; g++) assert.ok(bests[g] >= bests[g - 1], `semilla ${seed}: ${bests.join(', ')}`);
  }
});

// --- 10.3 Eliminar a los lentos ------------------------------------------------------------------

/** Red que acelera solo mientras la velocidad (relativa a la máxima) es menor que `cap`. */
const speedCap = (cap) => ({
  sizes: [6, 4], activation: 'step',
  layers: [{ weights: [[0, 0, 0, 0, 0, -1], [0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0]], biases: [cap, -1, -1, -1] }],
});
const capped = (cap, config = {}) => createTraining({
  seed: 1, config: { population: 4, mutationStrength: 0, mutationCooling: false, density: 0, maxSpeed: 20, ...config }, brain: brainOf(speedCap(cap)),
});
const runToEnd = (t) => { for (let i = 0; i < 50000; i++) { const r = t.step(); if (r) return { record: r, steps: i + 1 }; } return null; };

test('lentos: la regla está encendida por defecto', () => {
  assert.equal(DEFAULT_TRAINING_CONFIG.slowRule, true);
  assert.equal(createTraining({ seed: 1, config: { population: 2 } }).config.slowRule, true);
});

test('lentos: un auto que avanza a 10 m/s o menos durante 5 s queda fuera de carrera por lento', () => {
  // El individuo 0 es una copia exacta del cerebro que se queda en 10 m/s; los demás, hijos mutados (algunos más rápidos).
  const t = createTraining({ seed: 2, config: { population: 12, mutationStrength: 10, density: 0, maxSpeed: 20 }, brain: brainOf(speedCap(0.5)) });
  for (let i = 0; i < 299; i++) t.step();
  assert.equal(t.world.agents[0].crashed, false, 'antes de los 5 s sigue en carrera');
  const startProgress = t.world.agents.map((a) => a.progress);
  t.step(); // paso 300: 5 s simulados
  const slow = t.world.agents[0];
  assert.equal(slow.crashed, true);
  assert.equal(slow.crashCause, 'tooSlow');
  assert.equal(slow.car.speed, 0);
  assert.ok(slow.progress <= 50, `avanzó ${slow.progress} m`);
  const out = t.world.agents.filter((a) => a.crashCause === 'tooSlow').length;
  assert.ok(out >= 1 && out < 12, `salieron ${out}`);
  assert.equal(t.aliveCount, 12 - out, 'los que salen dejan de contarse en carrera');
  assert.equal(t.generation, 1);
  assert.ok(startProgress.length === 12);
});

test('lentos: un auto más rápido que el tráfico sigue en carrera', () => {
  const t = clones([1, 0, 0, 0], { density: 0, maxSpeed: 20, maxDuration: 10 });
  const { record, steps } = runToEnd(t);
  assert.equal(record.reason, 'timeLimit');
  assert.equal(steps, 600);
});

test('lentos: ninguno sale antes de los 5 s; si salen todos, la generación termina con "todos fuera de carrera"', () => {
  const t = clones([0, 0, 0, 0], { density: 0 });
  for (let i = 0; i < 299; i++) {
    t.step();
    assert.equal(t.aliveCount, 6, `paso ${i + 1}`);
  }
  const record = t.step();
  assert.equal(record.reason, 'allCrashed');
  assert.equal(record.generation, 1);
});

test('lentos: el fitness es el logrado hasta salir (unos 40 m en 5 s, y 5 s sin chocar)', () => {
  const distance = runToEnd(capped(0.4, { fitness: 'distance' }));
  assert.equal(distance.steps, 300);
  assert.equal(distance.record.reason, 'allCrashed');
  assert.ok(Math.abs(distance.record.best - 40) < 0.5, String(distance.record.best));
  const survival = runToEnd(capped(0.4, { fitness: 'survival' }));
  assert.equal(survival.steps, 300);
  assert.equal(survival.record.best, 5);
});

test('ventaja: un auto que sale por lento conserva la ventaja que llevaba', () => {
  // Acelera mientras no tiene un vehículo cerca adelante: le saca unos metros al tráfico, lo alcanza,
  // va detrás a su velocidad y la regla de los lentos lo saca de carrera.
  const follower = {
    sizes: [6, 4], activation: 'step',
    layers: [{ weights: [[0, 0, -10, 0, 0, 0], [0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0]], biases: [1, -1, -1, -1] }],
  };
  const t = createTraining({
    seed: 2, config: { population: 2, mutationStrength: 0, fitness: 'lead', irregularity: 0, maxSpeed: 20 }, brain: brainOf(follower),
  });
  let peak = 0;
  let record = null;
  const agent = t.world.agents[0];
  for (let i = 0; i < 5000 && !record; i++) {
    peak = Math.max(peak, t.fitnessOf(0));
    record = t.step();
  }
  assert.ok(record, 'la generación terminó');
  assert.equal(agent.crashCause, 'tooSlow');
  assert.ok(peak > 10, `llevaba ${peak} m de ventaja`);
  assert.equal(record.best, peak);
});

test('lentos: con la regla apagada, el auto que va detrás del tráfico sigue hasta el final de la generación', () => {
  const t = capped(0.5, { slowRule: false, maxDuration: 10 });
  const { record, steps } = runToEnd(t);
  assert.equal(record.reason, 'timeLimit');
  assert.equal(steps, 600);
});

test('lentos: apagar la regla durante una generación rige desde la siguiente', () => {
  const t = capped(0.5, { maxDuration: 10 });
  for (let i = 0; i < 100; i++) t.step();
  t.configure({ slowRule: false });
  assert.deepEqual(t.pending, { slowRule: false });
  const first = runToEnd(t);
  assert.equal(first.record.reason, 'allCrashed', 'la generación en curso sigue con la regla');
  assert.equal(first.steps, 200);
  const second = runToEnd(t);
  assert.equal(second.record.reason, 'timeLimit');
  assert.equal(second.steps, 600);
});

// --- Tráfico por generación: tráfico nuevo por defecto (design.md D15) ------------------------------

test('estado por defecto: sin indicar el modo, tráfico nuevo y la generación 2 con otra disposición', () => {
  const t = createTraining({ seed: 1, config: { population: 4, maxDuration: 10 } });
  assert.equal(DEFAULT_TRAINING_CONFIG.trafficMode, 'new');
  assert.equal(t.config.trafficMode, 'new');
  const layout = () => JSON.stringify(t.world.vehiclesIn(0, 600).map((v) => [v.position.x, v.position.y]));
  const seed1 = t.world.seed;
  const first = layout();
  assert.equal(seed1, deriveSeed(deriveSeed(1, 3), 1));
  t.finishGeneration();
  assert.equal(t.generation, 2);
  assert.notEqual(t.world.seed, seed1);
  assert.equal(t.world.seed, deriveSeed(deriveSeed(1, 3), 2));
  assert.notEqual(layout(), first);
});

test('tráfico nuevo reproducible: dos entrenamientos de diez generaciones con la misma semilla enfrentan el mismo tráfico', () => {
  const run = () => {
    const t = createTraining({ seed: 7, config: { population: 6, maxDuration: 5, trafficMode: 'new' } });
    const seeds = [];
    for (let g = 0; g < 10; g++) {
      seeds.push(t.world.seed);
      runUntilGeneration(t, t.generation + 1);
    }
    return { seeds, history: t.history.map((h) => ({ generation: h.generation, best: h.best, average: h.average })) };
  };
  const a = run();
  const b = run();
  assert.equal(a.seeds.length, 10);
  assert.equal(new Set(a.seeds).size, 10, 'cada generación enfrenta un tráfico distinto');
  assert.deepEqual(a.seeds, b.seeds);
  assert.equal(a.history.length, 10);
  assert.deepEqual(a.history, b.history);
});

test('volver al mismo tráfico: desde la generación siguiente todas usan el tráfico del escenario', () => {
  const t = createTraining({ seed: 3, config: { population: 4, maxDuration: 10 } });
  t.finishGeneration();
  assert.notEqual(t.world.seed, SCENARIO_TRAFFIC_SEED);
  t.configure({ trafficMode: 'same' });
  const during = t.world.seed;
  assert.notEqual(during, SCENARIO_TRAFFIC_SEED, 'la generación en curso no cambia');
  for (let g = 0; g < 3; g++) {
    t.finishGeneration();
    assert.equal(t.config.trafficMode, 'same');
    assert.equal(t.world.seed, SCENARIO_TRAFFIC_SEED);
  }
});

// --- Selección manual (cambio seleccion-manual) -------------------------------------------------

import { childrenOf, rankPopulation } from '../src/core/evolution.js';
import { MAX_CHOICES } from '../src/core/training.js';

/** Elige al líder en cuanto su red difiere de la del padre actual, sin salir de la generación en curso. */
function chooseSoon(t, limit = 5000) {
  const g = t.generation;
  for (let i = 0; i < limit; i++) {
    const choice = t.chooseLeader();
    if (choice) return choice;
    t.step();
    assert.equal(t.generation, g, 'la generación terminó antes de poder elegir');
  }
  assert.fail('no hubo un líder distinto del padre');
}

const manual = (seed, config = {}) => createTraining({ seed, config: { population: 10, maxDuration: 10, selectionMode: 'manual', ...config } });

// 2.1 Modo de selección como configuración

test('modo de selección: sin indicarlo es automática, y un valor inválido vuelve a automática', () => {
  assert.equal(DEFAULT_TRAINING_CONFIG.selectionMode, 'auto');
  assert.equal(normalizeTrainingConfig({}).selectionMode, 'auto');
  assert.equal(normalizeTrainingConfig({ selectionMode: 'persona' }).selectionMode, 'auto');
  assert.equal(normalizeTrainingConfig({ selectionMode: 7 }).selectionMode, 'auto');
  assert.equal(normalizeTrainingConfig({ selectionMode: 'manual' }).selectionMode, 'manual');
  const t = createTraining({ seed: 1, config: { population: 10 } });
  assert.equal(t.config.selectionMode, 'auto');
  assert.deepEqual(t.selection, { applied: 'auto', desired: 'auto' });
  assert.equal(t.parent, null);
  assert.equal(t.choiceCount, 0);
});

test('cambio de modo de selección durante la generación 6: la 6 sigue igual y la 7 se forma con selección manual', () => {
  const t = createTraining({ seed: 6, config: { population: 10, maxDuration: 10, fitness: 'distance' } });
  const u = createTraining({ seed: 6, config: { population: 10, maxDuration: 10, fitness: 'distance' } });
  runUntilGeneration(t, 6);
  runUntilGeneration(u, 6);
  for (let i = 0; i < 50; i++) { t.step(); u.step(); }
  assert.deepEqual(t.configure({ selectionMode: 'manual' }), { selectionMode: 'manual' });
  assert.deepEqual(t.pending, { selectionMode: 'manual' });
  assert.equal(t.config.selectionMode, 'auto');
  assert.deepEqual(t.selection, { applied: 'auto', desired: 'manual' });
  let ended = null;
  while (!ended) {
    ended = t.step();
    const other = u.step();
    assert.deepEqual(t.world.agentsSnapshot(), u.world.agentsSnapshot());
    if (ended) assert.deepEqual(ended, other);
  }
  assert.equal(t.generation, 7);
  assert.equal(t.pending, null);
  assert.deepEqual(t.selection, { applied: 'manual', desired: 'manual' });
  // La 7 sale del campeón de la 6 (selección manual) y no del orden de fitness.
  assert.deepEqual(t.parent, { source: 'champion', generation: 6, fitness: t.champion.fitness, fitnessKind: 'distance' });
  assert.equal(t.eliteCount, 1);
  assert.deepEqual(t.networks, childrenOf(t.champion.network, t.config, randomFor(deriveSeed(6, 2), 6)));
  assert.notDeepEqual(t.networks, u.networks);
});

// 2.2 Elegir al líder y deshacer

test('elegir durante la generación 4: el padre tiene la red del líder y registra la generación 4 y el fitness que llevaba', () => {
  const t = clones([1, 0, 0, 0], { density: 0, selectionMode: 'manual', fitness: 'distance' });
  runUntilGeneration(t, 4);
  t.undoChoice(); // el cerebro inicial deja de ser el padre
  while (t.fitnessOf() < 310) t.step();
  const meters = t.fitnessOf();
  assert.ok(meters >= 310 && meters < 311, `llevaba ${meters} m`);
  const choice = t.chooseLeader();
  assert.deepEqual(choice.network, t.networks[t.leaderIndex]);
  assert.notEqual(choice.network, t.networks[t.leaderIndex]); // es una copia
  assert.deepEqual(t.parent, { source: 'leader', generation: 4, fitness: meters, fitnessKind: 'distance' });
  assert.equal(t.choiceCount, 1);
});

test('elegir dos veces en la misma generación: el padre elegido es el segundo líder', () => {
  // Individuo 0 quieto (copia del cerebro), los demás mutados con fuerza total: alguno lo supera.
  const t = createTraining({ seed: 3, config: { population: 8, mutationStrength: 100, density: 0, selectionMode: 'manual' }, brain: brainOf(fixedNetwork([0, 0, 0, 0])) });
  t.undoChoice();
  const first = t.chooseLeader();
  assert.equal(t.leaderIndex, 0);
  assert.deepEqual(first.network, fixedNetwork([0, 0, 0, 0]));
  while (t.leaderIndex === 0) t.step();
  const second = t.chooseLeader();
  assert.deepEqual(second.network, t.networks[t.leaderIndex]);
  assert.notDeepEqual(second.network, first.network);
  assert.equal(t.choiceCount, 2);
  t.finishGeneration();
  assert.deepEqual(t.networks[0], second.network);
});

test('elegir al que ya es el padre: el padre y el historial de elecciones no cambian', () => {
  const t = clones([1, 0, 0, 0], { density: 0, selectionMode: 'manual' });
  assert.deepEqual(t.parent, { source: 'brain', generation: 0, fitness: 1, fitnessKind: 'distance', name: 'B' });
  assert.equal(t.choiceCount, 1);
  for (let i = 0; i < 100; i++) t.step();
  assert.equal(t.chooseLeader(), null); // el líder es una copia sin cambios del cerebro
  assert.equal(t.choiceCount, 1);
  assert.equal(t.parent.source, 'brain');
  t.finishGeneration();
  assert.equal(t.chooseLeader(), null); // la copia del padre en la generación 2
  assert.equal(t.choiceCount, 1);
});

test('elegir a mitad de una generación: los autos de esa generación siguen manejando igual', () => {
  const t = manual(4);
  const u = manual(4);
  for (let i = 0; i < 80; i++) { t.step(); u.step(); }
  const networks = t.networks.slice();
  assert.ok(t.chooseLeader());
  assert.deepEqual(t.networks, networks);
  networks.forEach((n, i) => assert.equal(t.networks[i], n));
  let ended = null;
  while (!ended) {
    ended = t.step();
    const other = u.step();
    assert.deepEqual(t.world.agentsSnapshot(), u.world.agentsSnapshot());
    if (ended) assert.deepEqual(ended, other);
  }
});

test('deshacer con dos elecciones: el padre vuelve a ser el de la generación 3', () => {
  const t = manual(5);
  runUntilGeneration(t, 3);
  chooseSoon(t);
  runUntilGeneration(t, 5);
  chooseSoon(t);
  assert.equal(t.parent.generation, 5);
  assert.equal(t.choiceCount, 2);
  const networks = t.networks.slice();
  const steps = t.world.steps;
  assert.equal(t.undoChoice(), true);
  assert.equal(t.parent.generation, 3);
  assert.equal(t.parent.source, 'leader');
  assert.equal(t.choiceCount, 1);
  assert.equal(t.generation, 5);
  assert.equal(t.world.steps, steps);
  networks.forEach((n, i) => assert.equal(t.networks[i], n));
});

test('deshacer la única elección: no queda padre y la generación siguiente es al azar', () => {
  const t = manual(5);
  for (let i = 0; i < 40; i++) t.step();
  const chosen = t.chooseLeader();
  assert.equal(t.undoChoice(), true);
  assert.equal(t.parent, null);
  assert.equal(t.choiceCount, 0);
  t.finishGeneration();
  assert.equal(t.eliteCount, 0);
  for (const n of t.networks) assert.notDeepEqual(n, chosen.network);
});

test('deshacer sin elecciones: nada cambia', () => {
  const t = manual(5);
  for (let i = 0; i < 40; i++) t.step();
  const snapshot = t.world.agentsSnapshot();
  assert.equal(t.undoChoice(), false);
  assert.equal(t.parent, null);
  assert.equal(t.choiceCount, 0);
  assert.deepEqual(t.world.agentsSnapshot(), snapshot);
});

test('más de veinte elecciones: tras 21 elecciones y 20 deshacer no queda padre', () => {
  assert.equal(MAX_CHOICES, 20);
  const t = manual(2, { population: 20, mutationStrength: 100 });
  // Una elección por generación, en cuanto el líder no es la copia del padre.
  let made = 0;
  for (let guard = 0; made < 21 && guard < 200000; guard++) {
    if (t.chooseLeader()) {
      made += 1;
      assert.equal(t.choiceCount, Math.min(made, 20));
      t.finishGeneration();
    } else {
      t.step();
    }
  }
  assert.equal(made, 21);
  assert.equal(t.choiceCount, 20);
  for (let n = 0; n < 19; n++) assert.equal(t.undoChoice(), true);
  assert.notEqual(t.parent, null);
  assert.equal(t.undoChoice(), true);
  assert.equal(t.parent, null);
  assert.equal(t.choiceCount, 0);
  assert.equal(t.undoChoice(), false);
});

// 2.3 Cría al terminar la generación

test('generación desde el padre: 100 individuos, el primero idéntico al padre y los otros 99 distintos', () => {
  const t = createTraining({ seed: 9, config: { population: 100, maxDuration: 10, mutationStrength: 10, selectionMode: 'manual' } });
  for (let i = 0; i < 60; i++) t.step();
  const parent = t.chooseLeader();
  t.finishGeneration();
  assert.equal(t.networks.length, 100);
  assert.equal(t.world.agents.length, 100);
  assert.deepEqual(t.networks[0], parent.network);
  for (let i = 1; i < 100; i++) assert.notDeepEqual(t.networks[i], parent.network);
  assert.equal(t.eliteCount, 1);
  assert.deepEqual(t.networks, childrenOf(parent.network, t.config, randomFor(deriveSeed(9, 2), 1)));
});

test('generación desde el padre con mutación en cero: todos idénticos al padre', () => {
  const t = manual(9, { mutationStrength: 0 });
  for (let i = 0; i < 60; i++) t.step();
  const parent = t.chooseLeader();
  t.finishGeneration();
  assert.equal(t.networks.length, 10);
  for (const n of t.networks) assert.deepEqual(n, parent.network);
});

test('dos generaciones sin elección: las dos siguientes salen del mismo padre', () => {
  const t = manual(11, { fitness: 'distance' });
  for (let i = 0; i < 60; i++) t.step();
  const parent = t.chooseLeader();
  t.finishGeneration(); // generación 2
  assert.deepEqual(t.networks[0], parent.network);
  for (let i = 0; i < 60; i++) t.step();
  t.finishGeneration(); // generación 3
  assert.deepEqual(t.networks[0], parent.network);
  assert.deepEqual(t.networks, childrenOf(parent.network, t.config, randomFor(deriveSeed(11, 2), 2)));
  assert.deepEqual(t.parent, { source: 'leader', generation: 1, fitness: parent.fitness, fitnessKind: 'distance' });
  assert.equal(t.choiceCount, 1);
  assert.equal(t.eliteCount, 1);
});

test('generaciones al azar: sin elegir a nadie, las redes de las generaciones 1, 2 y 3 son distintas entre sí y repetibles', () => {
  const run = () => {
    const t = manual(13);
    const gens = [t.networks];
    for (let g = 0; g < 2; g++) {
      for (let i = 0; i < 30; i++) t.step();
      t.finishGeneration();
      assert.equal(t.eliteCount, 0);
      gens.push(t.networks);
    }
    return gens;
  };
  const a = run();
  const keys = new Set(a.flat().map((n) => JSON.stringify(n)));
  assert.equal(keys.size, 30); // ninguna red se repite entre las tres generaciones
  // La generación 2 sale del flujo de poblaciones nuevas (4), con la generación que empieza.
  const fresh = deriveSeed(deriveSeed(13, 4), 2);
  assert.deepEqual(a[1][3], createNetwork({ inputs: 6, hidden: [6], outputs: 4, activation: 'step', random: randomFor(fresh, 3) }));
  assert.deepEqual(run(), a);
});

test('fin de generación con selección manual: todos fuera de carrera termina la generación sin esperar ninguna elección', () => {
  const t = clones([1, 1, 0, 0], { density: 0, selectionMode: 'manual' });
  t.undoChoice();
  let record = null;
  let steps = 0;
  while (!record && steps < 5000) { record = t.step(); steps += 1; }
  assert.equal(record.reason, 'allCrashed');
  assert.equal(t.generation, 2);
  assert.ok(steps < 600, `tardó ${steps} pasos`);
  assert.equal(t.eliteCount, 0); // sin padre: población al azar
});

// 2.4 Padre al cambiar de modo y al continuar desde un cerebro

test('de automática a manual en la generación 12 sin elegir: la 13 sale del campeón de la 12', () => {
  const t = createTraining({ seed: 3, config: { population: 6, maxDuration: 10, fitness: 'distance' } });
  runUntilGeneration(t, 12);
  for (let i = 0; i < 20; i++) t.step();
  t.configure({ selectionMode: 'manual' });
  assert.equal(t.parent, null);
  runUntilGeneration(t, 13);
  assert.equal(t.champion.generation, 12);
  assert.deepEqual(t.parent, { source: 'champion', generation: 12, fitness: t.history[11].best, fitnessKind: 'distance' });
  assert.deepEqual(t.networks[0], t.champion.network);
  assert.equal(t.history.length, 12);
});

test('elegir antes de que rija el cambio: la 13 sale del líder elegido y no del campeón', () => {
  const t = createTraining({ seed: 3, config: { population: 6, maxDuration: 10 } });
  runUntilGeneration(t, 12);
  t.configure({ selectionMode: 'manual' });
  while (t.leaderIndex === 0) t.step(); // un líder que no es la copia del campeón anterior
  const chosen = t.chooseLeader();
  assert.equal(chosen.generation, 12);
  runUntilGeneration(t, 13);
  assert.notDeepEqual(t.champion.network, chosen.network);
  assert.deepEqual(t.networks[0], chosen.network);
  assert.equal(t.parent.source, 'leader');
  assert.equal(t.choiceCount, 1);
});

test('de manual a automática: la generación siguiente se forma por fitness de la población en curso y no queda padre', () => {
  const t = manual(7, { elite: 1, mutationCooling: false });
  for (let i = 0; i < 60; i++) t.step();
  t.chooseLeader();
  t.finishGeneration();
  for (let i = 0; i < 60; i++) t.step();
  t.configure({ selectionMode: 'auto' });
  assert.notEqual(t.parent, null); // hasta que rija, la elección sigue
  const networks = t.networks.slice();
  const fitnesses = t.fitnesses();
  t.finishGeneration();
  assert.equal(t.parent, null);
  assert.equal(t.choiceCount, 0);
  const expected = nextGeneration({ networks, fitnesses, config: { ...t.config }, random: randomFor(deriveSeed(7, 2), 2) });
  assert.deepEqual(t.networks, expected.networks);
  assert.equal(t.eliteCount, 1);
});

test('volver a manual más tarde: el padre es el campeón de la generación que termina, no el elegido antes', () => {
  const t = createTraining({ seed: 8, config: { population: 6, maxDuration: 10, fitness: 'distance' } });
  t.configure({ selectionMode: 'manual' });
  runUntilGeneration(t, 2);
  for (let i = 0; i < 40; i++) t.step();
  chooseSoon(t);
  assert.equal(t.parent.generation, 2);
  t.configure({ selectionMode: 'auto' });
  runUntilGeneration(t, 5); // generaciones 3 y 4 automáticas
  assert.equal(t.parent, null);
  t.configure({ selectionMode: 'manual' });
  runUntilGeneration(t, 6);
  assert.deepEqual(t.parent, { source: 'champion', generation: 5, fitness: t.history[4].best, fitnessKind: 'distance' });
  assert.deepEqual(t.networks[0], t.champion.network);
});

test('continuar un cerebro con selección manual: es el padre inicial y la segunda generación sale de él', () => {
  const network = createNetwork({ inputs: 6, hidden: [6], outputs: 4, random: createRandom(21) });
  const brain = brainOf(network, { generations: 7 });
  const t = createTraining({ seed: 4, config: { population: 10, maxDuration: 10, selectionMode: 'manual' }, brain });
  assert.deepEqual(t.parent, { source: 'brain', generation: 7, fitness: 1, fitnessKind: 'distance', name: 'B' });
  assert.equal(t.choiceCount, 1);
  runUntilGeneration(t, 9); // termina la 8 sin elegir a nadie
  assert.deepEqual(t.networks[0], network);
  assert.deepEqual(t.networks, childrenOf(network, t.config, randomFor(deriveSeed(4, 2), 8)));
  assert.equal(t.eliteCount, 1);
  // Con selección automática el cerebro no queda como padre.
  assert.equal(createTraining({ seed: 4, config: { population: 10 }, brain }).parent, null);
});

// 2.6 Reproducibilidad con elecciones, selección y élite en manual, y automática sin cambios

test('mismas elecciones: dos entrenamientos manuales con las mismas elecciones y deshechas en los mismos pasos son idénticos', () => {
  const run = () => {
    const t = manual(17, { population: 12, mutationStrength: 40 });
    const populations = [t.networks];
    t.onGeneration(() => populations.push(t.networks));
    // Guion: en cada paso indicado, elegir (E) o deshacer (Z).
    const script = new Map([[30, 'E'], [700, 'E'], [710, 'Z'], [1300, 'E'], [1900, 'Z'], [1950, 'Z'], [2600, 'E'], [3100, 'E']]);
    for (let n = 0; n < 4000; n++) {
      const action = script.get(n);
      if (action === 'E') t.chooseLeader();
      if (action === 'Z') t.undoChoice();
      t.step();
    }
    return { t, populations };
  };
  const a = run();
  const b = run();
  assert.ok(a.t.history.length >= 5, `terminaron ${a.t.history.length} generaciones`);
  assert.deepEqual(a.t.history, b.t.history);
  assert.equal(a.populations.length, b.populations.length);
  a.populations.forEach((p, g) => assert.deepEqual(p, b.populations[g], `generación ${g + 1}`));
  assert.deepEqual(a.t.parent, b.t.parent);
  assert.equal(a.t.choiceCount, b.t.choiceCount);
});

test('con selección manual la selección no se usa: los de mayor fitness no pasan a ser padres por serlo', () => {
  const config = { population: 20, selection: 10, elite: 0, mutationStrength: 0 };
  // Un gemelo dice quién va a ser el campeón de la generación 1.
  const twin = manual(19, config);
  runUntilGeneration(twin, 2);
  const championIndex = twin.champion.index;
  const t = manual(19, config);
  assert.equal(t.leaderIndex, 0); // al empezar, el líder es el primero, que no será el campeón
  assert.notEqual(championIndex, 0);
  const chosen = t.chooseLeader();
  runUntilGeneration(t, 2);
  assert.equal(t.champion.index, championIndex);
  assert.notDeepEqual(chosen.network, t.champion.network);
  // Con mutación 0, toda la generación es copia del elegido; ninguna, del campeón ni de los otros del 10 % mejor.
  for (const n of t.networks) {
    assert.deepEqual(n, chosen.network);
    assert.notDeepEqual(n, t.champion.network);
  }
});

test('con selección manual la élite no se usa: con élite 3 hay una sola copia sin cambios, la del padre', () => {
  const t = manual(23, { population: 20, elite: 3, mutationStrength: 10 });
  for (let i = 0; i < 30; i++) t.step();
  const chosen = t.chooseLeader();
  const before = t.networks.slice();
  t.finishGeneration();
  assert.equal(t.eliteCount, 1);
  const unchanged = t.networks.filter((n) => before.some((b) => JSON.stringify(b) === JSON.stringify(n)));
  assert.equal(unchanged.length, 1);
  assert.deepEqual(unchanged[0], chosen.network);
  assert.deepEqual(t.networks[0], chosen.network);
});

test('selección automática sin cambios: diez generaciones dan el mismo historial que antes de existir el modo manual', () => {
  // Valores tomados con el código anterior a este cambio (commit 6666eea).
  const reference = {
    7: {
      config: { population: 20, fitness: 'distance', elite: 1, irregularity: 50, mutationCooling: false },
      history: [[173.09611111111008, 12.323868334683358, 'allCrashed'], [177.02611111111764, 56.59658782841579, 'allCrashed'], [215.45611111111066, 45.57227185857482, 'allCrashed'], [230.4333333333343, 97.66567684199762, 'allCrashed'], [654.7100000000501, 187.71093141383827, 'timeLimit'], [623.1050000000541, 189.2358953869945, 'timeLimit'], [622.7300000000541, 189.33111692576713, 'timeLimit'], [576.488333333371, 196.5945833333404, 'allCrashed'], [623.1500000000524, 213.01127777778456, 'timeLimit'], [603.9411111111549, 177.04788888889453, 'allCrashed']],
      champion: [0.7200939933564513, -0.20062512566754592, -0.39658241034718233, -0.311009442126844, -0.6131282534566708, -0.2090255785142071, 0.3704336073459126, -0.17201321303797884],
      network5: [0.7295786444472148, -0.22580245024249887, -0.3229296427567024, -0.22090159799293607, -0.6430286154069472, -0.15366096351561132, 0.3554913577160332, -0.17638623934010975],
    },
    3: {
      config: { population: 30, crossover: true, elite: 2, fitness: 'speed', maxDuration: 20, irregularity: 50, mutationCooling: false },
      history: [[8.616268620560946, 0.48746722943157494, 'allCrashed'], [18.619047619049006, 4.2924902346862615, 'allCrashed'], [18.62559241706161, 7.870541346565223, 'allCrashed'], [19.320843091334897, 10.1866169026929, 'allCrashed'], [18.599033816426527, 13.744880632604765, 'timeLimit'], [19.599999999999596, 11.503707517202429, 'timeLimit'], [18.84633799206913, 18.601855370207463, 'allCrashed'], [19.359823399559144, 18.87872351578132, 'allCrashed'], [18.84633799206913, 18.597254088575543, 'allCrashed'], [19.51260504201681, 17.247306881782233, 'allCrashed']],
      champion: [0.547849652684154, 0.5372338201839011, 0.08799074937007391, 0.5655069567912258, -0.6659191250396846, -0.5379186205567932, -0.4824922658099234, 0.3178409683696227],
      network5: [0.49328364287248777, 0.43262509838573165, 0.017533420586376455, 0.39066568043404903, -0.6954464549300592, -0.5794628636168255, -0.4206782795032262, 0.2548412419457105],
    },
  };
  for (const [seed, ref] of Object.entries(reference)) {
    const t = createTraining({ seed: Number(seed), config: ref.config });
    while (t.completed < 10) t.step();
    assert.deepEqual(t.history.map((h) => [h.best, h.average, h.reason]), ref.history, `semilla ${seed}`);
    assert.deepEqual(flatValues(t.champion.network).slice(0, 8), ref.champion);
    assert.deepEqual(flatValues(t.networks[5]).slice(0, 8), ref.network5);
    assert.equal(t.parent, null);
  }
});

// 2.5 Cerebro del entrenamiento según el modo vigente

const NOW = '2026-11-12T11:00:00.000Z';

test('cerebro del entrenamiento con selección automática tras la generación 8: la red del campeón de la 8 y modo automático', () => {
  const t = createTraining({ seed: 5, config: { population: 8, maxDuration: 10, fitness: 'distance' } });
  runUntilGeneration(t, 9);
  const b = t.brain({ id: 'x', name: 'Auto', now: NOW });
  assert.equal(validateBrain(b), null);
  assert.equal(t.champion.generation, 8);
  assert.deepEqual(b.network, t.champion.network);
  assert.deepEqual(b.training.fitness, { kind: 'distance', best: t.history[7].best });
  assert.equal(b.training.evolution.selectionMode, 'auto');
  assert.equal(b.training.generations, 8);
});

test('cerebro del entrenamiento con selección manual: la red del padre elegido en la 5, su fitness como mejor y modo manual', () => {
  const t = clones([1, 0, 0, 0], { density: 0, maxDuration: 30, selectionMode: 'manual', fitness: 'distance' });
  runUntilGeneration(t, 5);
  while (t.fitnessOf() < 310) t.step();
  t.undoChoice(); // el cerebro inicial deja de ser el padre: el líder es su copia
  const chosen = t.chooseLeader();
  const meters = chosen.fitness;
  assert.ok(meters >= 310 && meters < 311);
  runUntilGeneration(t, 7); // el padre persiste y siguen terminando generaciones
  const b = t.brain({ id: 'x', name: 'Manual', now: NOW });
  assert.equal(validateBrain(b), null);
  assert.deepEqual(b.network, chosen.network);
  assert.deepEqual(b.training.fitness, { kind: 'distance', best: meters });
  assert.equal(b.training.evolution.selectionMode, 'manual');
  assert.equal(b.training.generations, 6);
});

test('cerebro del entrenamiento con selección manual sin padre: no se entrega ningún cerebro', () => {
  const t = manual(3);
  runUntilGeneration(t, 3);
  assert.equal(t.parent, null);
  assert.ok(t.champion);
  assert.equal(t.brain({ id: 'x', name: 'Nada', now: NOW }), null);
});

test('cerebro del entrenamiento: mientras el cambio a manual no rige sigue siendo el campeón, y un padre de un cerebro conserva su fitness', () => {
  const t = createTraining({ seed: 5, config: { population: 8, maxDuration: 10 } });
  runUntilGeneration(t, 2);
  t.configure({ selectionMode: 'manual' });
  t.chooseLeader();
  const b = t.brain({ id: 'x', name: 'x', now: NOW });
  assert.deepEqual(b.network, t.champion.network);
  assert.equal(b.training.evolution.selectionMode, 'auto');
  const brain = brainOf(createNetwork({ inputs: 6, hidden: [6], outputs: 4, random: createRandom(9) }), { generations: 4 });
  const u = createTraining({ seed: 2, config: { population: 6, selectionMode: 'manual' }, brain });
  const fromBrain = u.brain({ id: 'y', name: 'y', now: NOW });
  assert.deepEqual(fromBrain.network, brain.network);
  assert.deepEqual(fromBrain.training.fitness, { kind: 'distance', best: 1 });
  assert.equal(fromBrain.training.generations, 4);
});

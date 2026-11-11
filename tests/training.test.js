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
const clones = (bits, config = {}) => createTraining({ seed: 1, config: { population: 6, mutationStrength: 0, ...config }, brain: brainOf(fixedNetwork(bits)) });

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
    population: 100, elite: 1, selection: 10, mutationStrength: 10, mutationRate: 100, crossover: false,
    fitness: 'distance', maxDuration: 60, slowRule: true, trafficMode: 'same', lanes: 3, density: 50, irregularity: 50,
    maxSpeed: 20, hidden: [6], activation: 'step', sensors: { count: 5, range: 3, spread: 90 },
  });
  assert.deepEqual(normalizeTrainingConfig({ hidden: [20, 0, 4, 4, 4], population: 1 }).hidden, [16, 1, 4]);
  assert.equal(DEFAULT_TRAINING_CONFIG.population, 100);
});

test('cambio de líder: un auto en carrera que supera en distancia al líder pasa a ser el líder', () => {
  // Individuo 0 quieto (copia del cerebro), los demás mutados con fuerza total: alguno avanza.
  const t = createTraining({ seed: 3, config: { population: 8, mutationStrength: 100, density: 0 }, brain: brainOf(fixedNetwork([0, 0, 0, 0])) });
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
  const t = createTraining({ seed: 11, config: { population: 30, mutationStrength: 100, density: 0 }, brain: brainOf(fixedNetwork([1, 1, 0, 0])) });
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
  const t = createTraining({ seed: 2, config: { population: 10, maxDuration: 10 } });
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
  const t = createTraining({ seed: 4, config: { population: 12, maxDuration: 10 } });
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
  const t = createTraining({ seed: 6, config: { population: 10, maxDuration: 10 } });
  const u = createTraining({ seed: 6, config: { population: 10, maxDuration: 10 } });
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
  const t = createTraining({ seed: 8, config: { population: 10, maxDuration: 10 } });
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
  const t = createTraining({ seed: 1, config: { population: 4, maxDuration: 10 } });
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
  const t = createTraining({ seed: 1, config: { population: 4, maxDuration: 10 } });
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
  const t = createTraining({ seed: 2, config: { population: 6, maxDuration: 10 }, brain });
  for (let g = 0; g < 5; g++) { for (let i = 0; i < 30; i++) t.step(); t.finishGeneration(); }
  const b = t.brain({ id: 'id-1', name: 'Campeón', now: '2026-11-12T11:00:00.000Z' });
  assert.equal(validateBrain(b), null);
  assert.equal(b.training.generations, 15);
  assert.deepEqual(b.training.scenarios, [{ track: 'straight', lanes: 3, density: 50, irregularity: 50, trafficMode: 'same', generations: 15 }]);
  assert.equal(b.training.seed, 2);
  assert.equal(b.training.maxSpeed, 20);
  assert.deepEqual(b.training.fitness, { kind: 'distance', best: t.champion.fitness });
  assert.deepEqual(b.training.evolution, { population: 6, elite: 1, selection: 10, mutationStrength: 10, mutationRate: 100, crossover: false, maxDuration: 10, slowRule: true });
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
  seed: 1, config: { population: 4, mutationStrength: 0, density: 0, maxSpeed: 20, ...config }, brain: brainOf(speedCap(cap)),
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
  const distance = runToEnd(capped(0.4));
  assert.equal(distance.steps, 300);
  assert.equal(distance.record.reason, 'allCrashed');
  assert.ok(Math.abs(distance.record.best - 40) < 0.5, String(distance.record.best));
  const survival = runToEnd(capped(0.4, { fitness: 'survival' }));
  assert.equal(survival.steps, 300);
  assert.equal(survival.record.best, 5);
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

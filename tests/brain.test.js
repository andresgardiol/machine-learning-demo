import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createBrain, validateBrain, createNetworkController, carForBrain, addScenarioGenerations, totalGenerations,
  copyBrain, BrainError, BRAIN_FORMAT, BRAIN_VERSION,
} from '../src/core/brain.js';
import { createNetwork, computeNetwork, flatValues } from '../src/core/network.js';
import { createRandom } from '../src/core/random.js';
import { createWorld } from '../src/core/world.js';

const scenario = (lanes = 3) => ({ track: 'straight', lanes, density: 50, irregularity: 50, trafficMode: 'same' });

function training(extra = {}) {
  return {
    generations: 12, seed: 1, maxSpeed: 15,
    fitness: { kind: 'distance', best: 412.5 },
    evolution: { population: 100, elite: 1, selection: 10, mutationStrength: 10, mutationRate: 100, crossover: false, maxDuration: 60 },
    scenarios: [{ ...scenario(), generations: 12 }],
    ...extra,
  };
}

function brainFor(count = 5, hidden = [6], seed = 1) {
  return createBrain({
    id: 'b-1', name: 'Prudente', now: '2026-11-12T10:00:00.000Z',
    network: createNetwork({ inputs: count + 1, hidden, outputs: 4, random: createRandom(seed) }),
    sensors: { count, range: 3, spread: 90 },
    training: training(),
  });
}

// --- 6.1 Formato, creación y validación ---------------------------------------------------------

test('cerebro recién guardado con 7 sensores: red completa, sensores, entrenamiento, nombre, identificador y fecha', () => {
  const network = createNetwork({ inputs: 8, hidden: [6], outputs: 4, random: createRandom(2) });
  const b = createBrain({ id: 'abc', name: 'Rayo', now: '2026-11-12T10:00:00.000Z', network, sensors: { count: 7, range: 4, spread: 120 }, training: training() });
  assert.equal(b.format, BRAIN_FORMAT);
  assert.equal(b.version, BRAIN_VERSION);
  assert.equal(b.id, 'abc');
  assert.equal(b.name, 'Rayo');
  assert.equal(b.createdAt, '2026-11-12T10:00:00.000Z');
  assert.equal(b.updatedAt, '2026-11-12T10:00:00.000Z');
  assert.deepEqual(flatValues(b.network), flatValues(network));
  assert.equal(flatValues(b.network).length, 8 * 6 + 6 + 6 * 4 + 4);
  assert.deepEqual(b.sensors, { count: 7, range: 4, spread: 120 });
  assert.deepEqual(b.training, training());
  assert.deepEqual(b.inputs, ['sensors', 'speed']);
  assert.deepEqual(b.outputs, ['forward', 'left', 'right', 'reverse']);
  assert.equal(validateBrain(b), null);
  // Es independiente de la red original.
  network.layers[0].biases[0] = 42;
  assert.notEqual(b.network.layers[0].biases[0], 42);
});

test('entradas y salidas: un cerebro de 5 sensores tiene una red de 6 entradas y 4 salidas', () => {
  const b = brainFor(5);
  assert.equal(b.network.sizes[0], 6);
  assert.equal(b.network.sizes[b.network.sizes.length - 1], 4);
  assert.equal(validateBrain(b), null);
});

test('validación: un cerebro al que le falta un peso se rechaza porque los pesos no corresponden a la forma', () => {
  const b = copyBrain(brainFor());
  b.network.layers[1].weights[3].pop();
  assert.deepEqual(validateBrain(b).code, 'shapeMismatch');
});

test('validación: un sesgo que no es un número finito se rechaza como valores que no son números', () => {
  const b = JSON.parse(JSON.stringify(brainFor()));
  b.network.layers[0].biases[2] = null;
  assert.equal(validateBrain(b).code, 'notFinite');
  const c = JSON.parse(JSON.stringify(brainFor()));
  c.network.layers[0].biases[2] = 'uno';
  assert.equal(validateBrain(c).code, 'notFinite');
});

test('validación: un cerebro de una versión más nueva se rechaza indicando que es más nuevo', () => {
  const b = { ...brainFor(), version: 2 };
  const problem = validateBrain(b);
  assert.equal(problem.code, 'unsupportedVersion');
  assert.equal(problem.details.newer, true);
  assert.equal(problem.details.supported, 1);
});

test('validación: lo que no es un cerebro del laboratorio se rechaza como tal', () => {
  assert.equal(validateBrain(null).code, 'notABrain');
  assert.equal(validateBrain([1, 2]).code, 'notABrain');
  assert.equal(validateBrain({ hello: 'world' }).code, 'notABrain');
  assert.equal(validateBrain({ ...brainFor(), format: 'other' }).code, 'notABrain');
});

test('validación: un cerebro al que le faltan partes se rechaza como incompleto', () => {
  for (const key of ['network', 'sensors', 'training', 'name', 'id']) {
    const b = { ...brainFor() };
    delete b[key];
    assert.equal(validateBrain(b).code, 'shapeMismatch', key);
  }
});

test('compatibilidad: un cerebro de 9 sensores hace que el auto tenga 9 sensores con su alcance y apertura', () => {
  const b = createBrain({
    id: 'n', name: 'Nueve', now: '2026-11-12T10:00:00.000Z',
    network: createNetwork({ inputs: 10, hidden: [8, 8], outputs: 4, random: createRandom(3) }),
    sensors: { count: 9, range: 5, spread: 150 }, training: training(),
  });
  const world = createWorld({ seed: 1, cars: [carForBrain(b)] });
  assert.deepEqual(world.agents[0].car.sensors, { count: 9, range: 5, spread: 150 });
  assert.equal(world.agents[0].perception.sensors.length, 9);
  world.step(); // maneja sin problemas
});

test('compatibilidad: un cerebro que declara 5 sensores y tiene una red de 8 entradas se rechaza', () => {
  const b = brainFor(5);
  b.network = createNetwork({ inputs: 8, hidden: [6], outputs: 4, random: createRandom(1) });
  const problem = validateBrain(b);
  assert.equal(problem.code, 'sensorMismatch');
  assert.deepEqual({ inputs: problem.details.inputs, sensors: problem.details.sensors }, { inputs: 8, sensors: 5 });
  assert.throws(() => carForBrain(b), (e) => e instanceof BrainError && e.code === 'sensorMismatch');
});

test('compatibilidad: un cerebro cuya red no tiene cuatro salidas se rechaza', () => {
  const b = brainFor(5);
  b.network = createNetwork({ inputs: 6, hidden: [6], outputs: 3, random: createRandom(1) });
  assert.equal(validateBrain(b).code, 'sensorMismatch');
});

// --- 6.2 Controlador de red neuronal -------------------------------------------------------------

/** Red sin capas ocultas cuyas salidas son fijas: sesgo positivo da 1, negativo da 0. */
function fixedOutputs(bits, inputs = 6) {
  return { sizes: [inputs, 4], activation: 'step', layers: [{ weights: bits.map(() => new Array(inputs).fill(0)), biases: bits.map((b) => (b ? 1 : -1)) }] };
}

test('controlador de red: las salidas 1, 0, 1 y 0 accionan avanzar y derecha', () => {
  const c = createNetworkController(fixedOutputs([1, 0, 1, 0]), 5);
  assert.deepEqual(c.control({ sensors: [0, 0, 0, 0, 0], speed: 0 }), { forward: true, left: false, right: true, reverse: false });
  const d = createNetworkController(fixedOutputs([0, 1, 0, 1]), 5);
  assert.deepEqual(d.control({ sensors: [0, 0, 0, 0, 0], speed: 0 }), { forward: false, left: true, right: false, reverse: true });
});

test('controlador de red: entrega los sensores en su orden y la velocidad como última entrada', () => {
  const net = createNetwork({ inputs: 4, hidden: [5], outputs: 4, random: createRandom(12) });
  const c = createNetworkController(net, 3);
  const rnd = createRandom(4);
  for (let i = 0; i < 200; i++) {
    const p = { sensors: [rnd(), rnd(), rnd()], speed: rnd() * 2 - 1 };
    const out = computeNetwork(net, [...p.sensors, p.speed]);
    assert.deepEqual(c.control(p), { forward: out[0] === 1, left: out[1] === 1, right: out[2] === 1, reverse: out[3] === 1 });
  }
});

test('controlador de red: misma percepción, mismos controles', () => {
  const c = createNetworkController(brainFor(5, [6], 77).network, 5);
  const p = { sensors: [0.1, 0.5, 0.9, 0.2, 0], speed: 0.4 };
  const first = c.control(p);
  c.control({ sensors: [1, 1, 1, 1, 1], speed: -1 });
  assert.deepEqual(c.control(p), first);
  assert.deepEqual(c.control({ ...p, sensors: [...p.sensors] }), first);
});

test('controlador de red: el mundo lo maneja igual que a cualquier otro controlador', () => {
  const b = brainFor(5, [6], 31);
  const net = b.network;
  // El mismo cálculo escrito como un controlador cualquiera.
  const plain = { control: ({ sensors, speed }) => { const o = computeNetwork(net, [...sensors, speed]); return { forward: o[0] === 1, left: o[1] === 1, right: o[2] === 1, reverse: o[3] === 1 }; } };
  const a = createWorld({ seed: 4, controller: createNetworkController(net, 5) });
  const p = createWorld({ seed: 4, controller: plain });
  for (let i = 0; i < 600; i++) {
    a.step();
    p.step();
    assert.deepEqual(a.snapshot(), p.snapshot());
  }
});

test('red que no corresponde: una red de 10 entradas para un auto de 5 sensores no se crea; espera 9 y el auto tiene 5', () => {
  const net = createNetwork({ inputs: 10, hidden: [6], outputs: 4, random: createRandom(1) });
  assert.throws(
    () => createNetworkController(net, 5),
    (e) => e instanceof BrainError && e.code === 'sensorMismatch' && e.details.expected === 9 && e.details.actual === 5,
  );
});

// --- 6.3 Datos de entrenamiento --------------------------------------------------------------------

test('dos escenarios: 30 generaciones con 3 carriles y 20 con 4 dan 50 en total y dos escenarios', () => {
  let scenarios = [];
  for (let i = 0; i < 30; i++) scenarios = addScenarioGenerations(scenarios, scenario(3));
  for (let i = 0; i < 20; i++) scenarios = addScenarioGenerations(scenarios, scenario(4));
  assert.equal(totalGenerations(scenarios), 50);
  assert.deepEqual(scenarios, [
    { track: 'straight', lanes: 3, density: 50, irregularity: 50, trafficMode: 'same', generations: 30 },
    { track: 'straight', lanes: 4, density: 50, irregularity: 50, trafficMode: 'same', generations: 20 },
  ]);
});

test('mismo escenario seguido: 10 generaciones, guardar, cargar y 5 más dan 15 y un solo escenario', () => {
  let scenarios = [];
  for (let i = 0; i < 10; i++) scenarios = addScenarioGenerations(scenarios, scenario(3));
  const saved = createBrain({ ...brainFor(), id: 'x', name: 'X', now: '2026-11-12T10:00:00.000Z', network: brainFor().network, sensors: brainFor().sensors, training: training({ generations: 10, scenarios }) });
  const loaded = JSON.parse(JSON.stringify(saved));
  let next = loaded.training.scenarios;
  for (let i = 0; i < 5; i++) next = addScenarioGenerations(next, scenario(3));
  assert.equal(totalGenerations(next), 15);
  assert.equal(next.length, 1);
  assert.equal(next[0].generations, 15);
  assert.equal(saved.training.scenarios[0].generations, 10, 'el cerebro guardado no cambió');
});

test('datos de entrenamiento: cambiar el modo de tráfico cuenta como otro escenario', () => {
  let scenarios = addScenarioGenerations([], scenario(3), 4);
  scenarios = addScenarioGenerations(scenarios, { ...scenario(3), trafficMode: 'new' }, 2);
  assert.deepEqual(scenarios.map((s) => [s.trafficMode, s.generations]), [['same', 4], ['new', 2]]);
});

// --- Modo de selección en los datos de entrenamiento (cambio seleccion-manual) ----------------

test('modo de selección: un cerebro con selectionMode y uno sin él son válidos y conservan el dato al copiarse', () => {
  const withMode = createBrain({
    id: 'b-2', name: 'A mano', now: '2026-11-12T10:00:00.000Z',
    network: createNetwork({ inputs: 6, hidden: [6], outputs: 4, random: createRandom(2) }),
    sensors: { count: 5, range: 3, spread: 90 },
    training: training({ evolution: { ...training().evolution, selectionMode: 'manual' } }),
  });
  const without = brainFor();
  assert.equal(validateBrain(withMode), null);
  assert.equal(validateBrain(without), null);
  assert.equal(withMode.training.evolution.selectionMode, 'manual');
  assert.equal('selectionMode' in without.training.evolution, false);
  const copy = copyBrain(withMode);
  assert.equal(copy.training.evolution.selectionMode, 'manual');
  assert.notEqual(copy.training.evolution, withMode.training.evolution);
  assert.equal('selectionMode' in copyBrain(without).training.evolution, false);
  const parsed = JSON.parse(JSON.stringify(withMode));
  assert.equal(validateBrain(parsed), null);
  assert.equal(parsed.training.evolution.selectionMode, 'manual');
});

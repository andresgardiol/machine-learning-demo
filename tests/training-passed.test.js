// Vehículos superados del entrenamiento (fitness-que-premia-superar, grupo 2, design.md D2).
import test from 'node:test';
import assert from 'node:assert/strict';
import { createTraining } from '../src/core/training.js';
import { createBrain } from '../src/core/brain.js';
import { CAR_LENGTH, TRAFFIC_SPEED } from '../src/core/constants.js';

/** Red sin capas ocultas con salidas fijas (avanzar, izquierda, derecha, retroceder). */
const fixedNetwork = (bits) => ({
  sizes: [6, 4], activation: 'step',
  layers: [{ weights: bits.map(() => new Array(6).fill(0)), biases: bits.map((b) => (b ? 1 : -1)) }],
});

/** Acelera mientras no tiene un vehículo cerca adelante: alcanza al primero y va detrás. */
const follower = {
  sizes: [6, 4], activation: 'step',
  layers: [{ weights: [[0, 0, -10, 0, 0, 0], [0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0]], biases: [1, -1, -1, -1] }],
};

const brainOf = (network) => createBrain({
  id: 'b', name: 'B', now: '2026-11-12T10:00:00.000Z', network, sensors: { count: 5, range: 3, spread: 90 },
  training: {
    generations: 0, seed: 1, maxSpeed: 20, fitness: { kind: 'distance', best: 1 },
    evolution: { population: 10, elite: 1, selection: 10, mutationStrength: 10, mutationRate: 100, crossover: false, maxDuration: 60 },
    scenarios: [],
  },
});

/**
 * El individuo 0 va siempre derecho a fondo; los otros 29 son redes al azar (fuerza 100), así la
 * generación sigue cuando el 0 choca. Con la semilla 1 el 0 supera seis vehículos y choca.
 */
const straightRunner = (config = {}) => createTraining({
  seed: 1,
  config: { population: 30, mutationStrength: 100, mutationCooling: false, irregularity: 0, slowRule: false, maxSpeed: 20, ...config },
  brain: brainOf(fixedNetwork([1, 0, 0, 0])),
});

/** Cuenta directa: vehículos del tráfico (de los que empezaron por delante de la largada) enteros detrás del auto. */
const directCount = (t, i) => t.world.vehiclesIn(TRAFFIC_SPEED * t.world.time, t.world.agents[i].progress - CAR_LENGTH).length;

/**
 * Avanza la generación en curso paso a paso y, para cada auto, guarda la cuenta directa en el
 * momento de su mayor ventaja. Llama a `check` después de cada paso que no cierra la generación.
 */
function followGeneration(t, { steps = 4000, check = () => {} } = {}) {
  const n = t.population;
  const peak = new Array(n).fill(0);
  const atPeak = new Array(n).fill(0);
  for (let s = 0; s < steps; s++) {
    const wasRunning = t.world.agents.map((a) => !a.crashed);
    const record = t.step();
    if (record) return { record, steps: s + 1 };
    const time = t.world.time;
    t.world.agents.forEach((a, i) => {
      if (!wasRunning[i]) return;
      const lead = a.progress - TRAFFIC_SPEED * time;
      if (lead > peak[i]) { peak[i] = lead; atPeak[i] = directCount(t, i); }
    });
    check({ peak, atPeak, step: s + 1 });
  }
  return { record: null, steps };
}

test('superados: un auto que va toda la generación detrás del primer vehículo no superó a nadie', () => {
  const t = createTraining({ seed: 2, config: { population: 2, mutationStrength: 0, irregularity: 0, maxSpeed: 20 }, brain: brainOf(follower) });
  const { record } = followGeneration(t, { check: () => assert.equal(t.passedOf(0), 0) });
  assert.ok(record, 'la generación terminó');
  assert.equal(t.world.agents[0].progress, 0, 'ya empezó la siguiente');
});

test('superados: cada vehículo que queda entero detrás del auto suma uno, igual que la cuenta directa en el momento de mayor ventaja', () => {
  const t = straightRunner();
  let changes = 0;
  let last = 0;
  followGeneration(t, {
    steps: 1266, // hasta justo antes del choque del individuo 0
    check: ({ atPeak }) => {
      for (let i = 0; i < t.population; i++) assert.equal(t.passedOf(i), atPeak[i], `individuo ${i}`);
      const now = t.passedOf(0);
      if (now !== last) { changes += 1; assert.ok(now > last); last = now; }
    },
  });
  assert.equal(t.passedOf(0), 6);
  assert.ok(changes >= 3, `cambió ${changes} veces`);
});

test('superados: chocar no descuenta aunque el tráfico lo vuelva a pasar', () => {
  const t = straightRunner();
  const agent = t.world.agents[0];
  while (!agent.crashed) assert.equal(t.step(), null);
  const atCrash = t.passedOf(0);
  assert.equal(atCrash, 6);
  for (let s = 0; s < 240; s++) {
    assert.equal(t.step(), null, 'la generación sigue con otros autos');
    assert.equal(t.passedOf(0), atCrash);
  }
  assert.ok(directCount(t, 0) < atCrash, `el tráfico lo volvió a pasar: ${directCount(t, 0)} detrás`);
});

test('superados: no depende de la función de fitness', () => {
  const lead = straightRunner({ fitness: 'lead' });
  const distance = straightRunner({ fitness: 'distance' });
  for (let s = 0; s < 1266; s++) {
    lead.step();
    distance.step();
    for (let i = 0; i < 30; i++) assert.equal(distance.passedOf(i), lead.passedOf(i));
  }
  assert.ok(distance.passedOf(0) >= 2, `superó ${distance.passedOf(0)}`);
});

test('superados: el líder es el valor por defecto de passedOf', () => {
  const t = straightRunner();
  for (let s = 0; s < 600; s++) t.step();
  assert.equal(t.passedOf(), t.passedOf(t.leaderIndex));
});

test('superados: dos entrenamientos con la misma semilla dan las mismas cuentas paso a paso', () => {
  const a = createTraining({ seed: 5, config: { population: 30 } });
  const b = createTraining({ seed: 5, config: { population: 30 } });
  let generationsSeen = 0;
  a.onGeneration(() => { generationsSeen += 1; });
  for (let s = 0; s < 3000; s++) {
    a.step();
    b.step();
    for (let i = 0; i < 30; i++) assert.equal(a.passedOf(i), b.passedOf(i));
  }
  assert.ok(generationsSeen >= 1, 'cruzó al menos un cambio de generación');
});

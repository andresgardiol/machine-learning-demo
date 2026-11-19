// Vehículos superados del entrenamiento (fitness-que-premia-superar, grupo 2, design.md D2).
import test from 'node:test';
import assert from 'node:assert/strict';
import { createTraining, passedBehind } from '../src/core/training.js';
import { createBrain } from '../src/core/brain.js';
import { CAR_LENGTH } from '../src/core/constants.js';

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
 * generación sigue cuando el 0 choca. Con la semilla 4 supera los primeros de los otros dos carriles
 * y choca con el primero del suyo.
 */
const straightRunner = ({ seed = 4, ...config } = {}) => createTraining({
  seed,
  config: { population: 30, mutationStrength: 100, mutationCooling: false, irregularity: 0, slowRule: false, maxSpeed: 20, ...config },
  brain: brainOf(fixedNetwork([1, 0, 0, 0])),
});

/**
 * Cuenta directa: vehículos del tráfico (todos empiezan por delante de la largada) que están enteros
 * detrás del auto en este instante, cada uno con su largo y la velocidad de su carril.
 */
const directCount = (t, i) => {
  const p = t.world.agents[i].progress;
  return t.world.vehiclesIn(-1e6, p).filter((v) => v.distance + v.length / 2 < p - CAR_LENGTH / 2).length;
};

/**
 * Avanza la generación en curso paso a paso y, para cada auto en carrera, lleva el máximo de la cuenta
 * directa. Llama a `check` después de cada paso que no cierra la generación.
 */
function followGeneration(t, { steps = 4000, check = () => {} } = {}) {
  const n = t.population;
  const best = new Array(n).fill(0);
  const now = new Array(n).fill(0);
  const drops = new Array(n).fill(0);
  for (let s = 0; s < steps; s++) {
    const wasRunning = t.world.agents.map((a) => !a.crashed);
    const record = t.step();
    if (record) return { record, steps: s + 1, drops };
    t.world.agents.forEach((a, i) => {
      if (!wasRunning[i]) return;
      const c = directCount(t, i);
      if (c < now[i]) drops[i] += 1;
      now[i] = c;
      if (c > best[i]) best[i] = c;
    });
    check({ best, now, step: s + 1 });
  }
  return { record: null, steps, drops };
}

/** Paso en que choca el individuo 0 de un entrenamiento nuevo (sin tocar el que se mide). */
function crashStep(make) {
  const t = make();
  for (let s = 1; s < 4000; s++) { t.step(); if (t.world.agents[0].crashed) return s; }
  return 4000;
}

test('Sin superar a nadie: un auto que va toda la generación detrás del primer vehículo de su carril no superó a nadie', () => {
  const t = createTraining({ seed: 2, config: { population: 2, mutationStrength: 0, irregularity: 0, maxSpeed: 20 }, brain: brainOf(follower) });
  const { record } = followGeneration(t, { check: () => assert.equal(t.passedOf(0), 0) });
  assert.ok(record, 'la generación terminó');
  assert.equal(t.world.agents[0].progress, 0, 'ya empezó la siguiente');
});

test('Vehículo que queda atrás: la cuenta sube de a uno, es el máximo de los vehículos enteros detrás del auto y nunca baja', () => {
  const t = straightRunner();
  const until = crashStep(straightRunner) - 1;
  let changes = 0;
  let last = 0;
  followGeneration(t, {
    steps: until, // hasta justo antes del choque del individuo 0
    check: ({ best }) => {
      for (let i = 0; i < t.population; i++) assert.equal(t.passedOf(i), best[i], `individuo ${i}`);
      const now = t.passedOf(0);
      if (now !== last) { changes += 1; assert.equal(now, last + 1); last = now; }
    },
  });
  assert.ok(t.passedOf(0) >= 2, `superó ${t.passedOf(0)}`);
  assert.ok(changes >= 2, `cambió ${changes} veces`);
});

test('Un camión se supera entero: con la cola entre el centro y el frente de un camión, la cuenta no cambia', () => {
  // Un camión de 10 m con centro en 100 (frente en 105), quieto en el instante 0, en un carril a 6 m/s.
  const fronts = [[105]];
  const speeds = [6];
  assert.equal(passedBehind(fronts, speeds, 100 + CAR_LENGTH / 2 + 1, 0), 0, 'cola pasó el centro, no el frente');
  assert.equal(passedBehind(fronts, speeds, 105 + CAR_LENGTH / 2 - 0.01, 0), 0);
  assert.equal(passedBehind(fronts, speeds, 105 + CAR_LENGTH / 2 + 0.01, 0), 1, 'cola pasó el frente');
  // Diez segundos después el camión avanzó 60 m: hace falta 60 m más.
  assert.equal(passedBehind(fronts, speeds, 105 + CAR_LENGTH / 2 + 0.01, 10), 0);
  assert.equal(passedBehind(fronts, speeds, 165 + CAR_LENGTH / 2 + 0.01, 10), 1);
});

test('Chocar no descuenta aunque el tráfico lo vuelva a pasar', () => {
  const t = straightRunner();
  const agent = t.world.agents[0];
  while (!agent.crashed) assert.equal(t.step(), null);
  const atCrash = t.passedOf(0);
  assert.ok(atCrash >= 2, `superó ${atCrash}`);
  for (let s = 0; s < 360; s++) {
    assert.equal(t.step(), null, 'la generación sigue con otros autos');
    assert.equal(t.passedOf(0), atCrash);
  }
  assert.ok(directCount(t, 0) < atCrash, `el tráfico lo volvió a pasar: ${directCount(t, 0)} detrás`);
});

test('Un carril rápido que lo vuelve a pasar: supera cuatro, frena, uno del carril rápido lo vuelve a pasar y supera dos más: 5', () => {
  // Carril lento a 6 m/s y rápido a 10 m/s; frentes en el instante 0.
  const speeds = [6, 10];
  const fronts = [[10, 20, 30, 45, 50], [40]];
  const at = (progress, time) => passedBehind(fronts, speeds, progress, time);
  // t=0, cola en 44: tres del lento y el del rápido detrás: 4.
  // t=1, frenado en el mismo lugar: el del rápido (frente en 50) lo vuelve a pasar: 3.
  // t=3, cola en 69: los cinco del lento detrás; el del rápido (frente en 70) sigue delante: 5.
  const direct = [at(46, 0), at(46, 1), at(71, 3)];
  assert.deepEqual(direct, [4, 3, 5]);
  // La cuenta del entrenamiento es el máximo a lo largo de la generación.
  let best = 0;
  assert.deepEqual(direct.map((c) => (best = Math.max(best, c))), [4, 4, 5]);
});

test('Con otra función de fitness: la cuenta no depende de la función elegida', () => {
  const lead = straightRunner({ fitness: 'lead' });
  const distance = straightRunner({ fitness: 'distance' });
  const until = crashStep(straightRunner) - 1;
  for (let s = 0; s < until; s++) {
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

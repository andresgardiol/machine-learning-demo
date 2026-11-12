// Entrenamiento en circuitos (circuitos-y-paisaje, grupo 4): pistas del entrenamiento alternadas por
// generación, ventaja y vueltas en un circuito, regla de los lentos y pistas en los datos del cerebro.
import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createTraining, normalizeTrainingConfig, normalizeTracks, trackFor, DEFAULT_TRAINING_CONFIG, SLOW_CAUSE, SLOW_SECONDS,
} from '../src/core/training.js';
import { recordStep, createStats, fitnessOf } from '../src/core/evolution.js';
import { validateBrain, createBrain } from '../src/core/brain.js';
import { createLibrary } from '../src/ui/library.js';
import { STEP, TRAFFIC_SPEED } from '../src/core/constants.js';

const small = (config = {}) => ({ population: 6, elite: 1, maxDuration: 10, ...config });

/** Avanza `n` generaciones cerrándolas a pedido; devuelve la pista de cada una, en orden. */
function tracksOfGenerations(training, n) {
  const out = [];
  for (let i = 0; i < n; i++) {
    out.push(training.trackId);
    training.finishGeneration();
  }
  return out;
}

// --- 4.1 Pistas del entrenamiento --------------------------------------------------------------

test('lista de pistas: sin repetidos, en el orden del catálogo; lo desconocido se descarta y vacía vale la calle', () => {
  assert.deepEqual(DEFAULT_TRAINING_CONFIG.tracks, ['straight']);
  assert.deepEqual(normalizeTracks(['grandPrix', 'oval', 'oval', 'monza']), ['oval', 'grandPrix']);
  assert.deepEqual(normalizeTracks([]), ['straight']);
  assert.deepEqual(normalizeTracks(['monza']), ['straight']);
  assert.deepEqual(normalizeTracks('oval'), ['straight']);
  assert.deepEqual(normalizeTrainingConfig({ tracks: ['kidney', 'straight'] }).tracks, ['straight', 'kidney']);
  assert.equal(trackFor({ tracks: ['straight', 'oval'] }, 1), 'straight');
  assert.equal(trackFor({ tracks: ['straight', 'oval'] }, 2), 'oval');
  assert.equal(trackFor({ tracks: ['straight', 'oval', 'kidney'] }, 7), 'straight');
});

test('Estado por defecto: todas las generaciones corren en la calle recta', () => {
  const t = createTraining({ seed: 1, config: small() });
  assert.deepEqual(tracksOfGenerations(t, 4), ['straight', 'straight', 'straight', 'straight']);
});

test('Dos pistas alternadas: las generaciones 1, 3 y 5 en la calle y 2, 4 y 6 en el óvalo', () => {
  const t = createTraining({ seed: 1, config: small({ tracks: ['straight', 'oval'] }) });
  assert.deepEqual(tracksOfGenerations(t, 6), ['straight', 'oval', 'straight', 'oval', 'straight', 'oval']);
});

test('Una generación, una pista: todos los individuos manejan en la misma pista', () => {
  const t = createTraining({ seed: 1, config: small({ tracks: ['straight', 'kidney'] }) });
  t.finishGeneration();
  assert.equal(t.trackId, 'kidney');
  assert.equal(t.world.trackId, 'kidney');
  const start = t.world.track.pointAt(0).position;
  for (const a of t.world.agents) assert.deepEqual(a.car.position, start);
  for (let i = 0; i < 60; i++) t.step();
  assert.equal(t.trackId, 'kidney');
});

test('Cambio durante una generación: la generación en curso termina en su pista y el riñón entra desde la siguiente', () => {
  const t = createTraining({ seed: 1, config: small() });
  for (let i = 0; i < 30; i++) t.step();
  const pending = t.configure({ tracks: ['straight', 'kidney'] });
  assert.deepEqual(pending, { tracks: ['straight', 'kidney'] });
  for (let i = 0; i < 30; i++) t.step();
  assert.equal(t.trackId, 'straight');
  assert.deepEqual(t.config.tracks, ['straight']);
  t.finishGeneration();
  // La generación 2 es la segunda del turno: el riñón.
  assert.equal(t.generation, 2);
  assert.equal(t.trackId, 'kidney');
});

test('Volver a una sola pista: restablecer después de entrenar en varias deja la calle desde la generación siguiente', () => {
  const t = createTraining({ seed: 1, config: small({ tracks: ['straight', 'oval', 'kidney'] }) });
  t.finishGeneration();
  assert.equal(t.trackId, 'oval');
  t.configure({ tracks: DEFAULT_TRAINING_CONFIG.tracks });
  assert.equal(t.trackId, 'oval');
  assert.deepEqual(tracksOfGenerations(t, 4).slice(1), ['straight', 'straight', 'straight']);
});

test('Alternancia reproducible: misma semilla y misma lista, misma pista por generación y misma población', () => {
  const run = () => {
    const t = createTraining({ seed: 9, config: small({ tracks: ['straight', 'oval', 'grandPrix'], maxDuration: 10 }) });
    const tracks = [];
    while (t.generation <= 4) {
      if (t.world.steps === 0) tracks.push(t.trackId);
      t.step();
    }
    return { tracks, history: t.history.map((h) => h.best), networks: JSON.stringify(t.networks) };
  };
  const a = run();
  const b = run();
  assert.deepEqual(a.tracks, ['straight', 'oval', 'grandPrix', 'straight']);
  assert.deepEqual(a, b);
});

// --- 4.2 Ventaja y vueltas en un circuito ----------------------------------------------------

/** Estadísticas de un auto que avanza a velocidad constante `speed` durante `seconds` (progreso acumulado). */
function constantRun(speed, seconds) {
  const st = createStats();
  for (let s = 1; s <= Math.round(seconds / STEP); s++) recordStep(st, { progress: speed * s * STEP, crashed: false }, TRAFFIC_SPEED * s * STEP);
  return st;
}

test('Dos vueltas en un minuto: dos vueltas a un circuito de 600 m en 60 s dan 600 de ventaja', () => {
  const st = constantRun(1200 / 60, 60);
  assert.ok(Math.abs(fitnessOf('lead', st) - 600) < 1e-6);
});

test('Sentido contrario: recorrer el circuito al revés toda la generación da ventaja 0', () => {
  const st = constantRun(-8, 60);
  assert.equal(fitnessOf('lead', st), 0);
});

test('Más rápido vale más: una vuelta en 40 s vale más que una vuelta en 55 s', () => {
  const fast = fitnessOf('lead', constantRun(600 / 40, 40));
  const slow = fitnessOf('lead', constantRun(600 / 55, 55));
  assert.ok(fast > slow, `${fast} no es mayor que ${slow}`);
});

test('Vueltas de un individuo: mayor progreso sobre el largo de la vuelta, nunca menos que 0, y chocar no descuenta', () => {
  const t = createTraining({ seed: 2, config: small({ tracks: ['oval'], population: 30, mutationCooling: false, mutationStrength: 100 }) });
  const L = t.world.track.length;
  const best = new Array(t.population).fill(0);
  for (let s = 0; s < 8 / STEP && t.generation === 1; s++) {
    t.step();
    if (t.generation !== 1) break;
    t.world.agents.forEach((a, i) => {
      if (!a.crashed || a.progress > best[i]) best[i] = Math.max(best[i], a.progress);
      assert.ok(Math.abs(t.lapsOf(i) - best[i] / L) < 1e-9);
      assert.ok(t.lapsOf(i) >= 0);
    });
  }
  // El líder por defecto.
  assert.equal(t.lapsOf(), t.lapsOf(t.leaderIndex));
});

test('Vuelta y media / chocar no descuenta: lapsOf es el mayor progreso sobre el largo', () => {
  // Cuenta directa con las estadísticas: 900 m sobre 600 m son 1,5 vueltas; un choque no las baja.
  const st = createStats();
  recordStep(st, { progress: 900, crashed: false });
  recordStep(st, { progress: 750, crashed: true });
  assert.equal(Math.max(0, st.best) / 600, 1.5);
});

test('en la calle recta lapsOf es 0', () => {
  const t = createTraining({ seed: 1, config: small() });
  for (let i = 0; i < 120; i++) t.step();
  for (let i = 0; i < t.population; i++) assert.equal(t.lapsOf(i), 0);
});

test('Sin tráfico que superar: en un circuito la cuenta de vehículos superados es 0', () => {
  const t = createTraining({ seed: 3, config: small({ tracks: ['oval'], population: 20 }) });
  for (let i = 0; i < 6 / STEP && t.generation === 1; i++) t.step();
  for (let i = 0; i < t.population; i++) assert.equal(t.passedOf(i), 0);
  assert.deepEqual(t.world.vehicles, []);
});

test('regla de los lentos en un circuito: saca de carrera a un auto que va a menos de 10 m/s', () => {
  const t = createTraining({ seed: 5, config: small({ tracks: ['grandPrix'], population: 30, maxDuration: 30 }) });
  const history = [];
  let retired = 0;
  for (let s = 0; s < 20 / STEP && t.generation === 1; s++) {
    t.step();
    if (t.generation !== 1) break;
    history.push(t.world.agents.map((a) => a.progress));
    t.world.agents.forEach((a, i) => {
      if (a.crashCause !== SLOW_CAUSE) return;
      const now = history.length - 1;
      const back = now - Math.round(SLOW_SECONDS / STEP);
      // Al momento de salir, avanzó lo mismo o menos que el tráfico en esos 5 s.
      if (back >= 0 && history[now - 1]?.[i] !== undefined) assert.ok(history[now][i] - history[back][i] <= TRAFFIC_SPEED * SLOW_SECONDS + 1e-9);
    });
  }
  retired = t.world.agents.filter((a) => a.crashCause === SLOW_CAUSE).length;
  assert.ok(retired > 0, 'ningún auto salió por lento');
});

// --- 4.3 Pistas en los datos de entrenamiento ---------------------------------------------------

const brainAfter = (t) => t.brain({ id: 'x', name: 'X', now: '2026-11-12T10:00:00.000Z' });

test('Entrenado en un circuito: 30 generaciones en el óvalo', () => {
  const t = createTraining({ seed: 1, config: small({ tracks: ['oval'] }) });
  for (let i = 0; i < 30; i++) t.finishGeneration();
  const brain = brainAfter(t);
  assert.equal(validateBrain(brain), null);
  assert.deepEqual(brain.training.scenarios.map((s) => [s.track, s.generations]), [['oval', 30]]);
});

test('Entrenado en varias pistas: 40 generaciones alternando la calle recta y el riñón', () => {
  const t = createTraining({ seed: 1, config: small({ tracks: ['straight', 'kidney'] }) });
  for (let i = 0; i < 40; i++) t.finishGeneration();
  const brain = brainAfter(t);
  assert.equal(validateBrain(brain), null);
  assert.deepEqual(brain.training.scenarios.map((s) => [s.track, s.generations]), [['straight+kidney', 40]]);
});

test('Cambio de pistas a mitad de camino: 20 en la calle y 10 en el óvalo dan dos escenarios, en orden', () => {
  const t = createTraining({ seed: 1, config: small() });
  for (let i = 0; i < 19; i++) t.finishGeneration();
  t.configure({ tracks: ['oval'] });
  for (let i = 0; i < 11; i++) t.finishGeneration();
  const brain = brainAfter(t);
  assert.deepEqual(brain.training.scenarios.map((s) => [s.track, s.generations]), [['straight', 20], ['oval', 10]]);
});

test('Cerebro anterior: un cerebro con track "straight" sigue siendo válido; pistas desconocidas no', () => {
  const t = createTraining({ seed: 1, config: small() });
  t.finishGeneration();
  const brain = brainAfter(t);
  assert.equal(brain.training.scenarios[0].track, 'straight');
  assert.equal(validateBrain(brain), null);
  const make = (track) => createBrain({ ...brain, now: brain.updatedAt, training: { ...brain.training, scenarios: [{ ...brain.training.scenarios[0], track }] } });
  for (const ok of ['straight', 'oval', 'kidney', 'grandPrix', 'straight+oval', 'oval+kidney+grandPrix']) assert.equal(validateBrain(make(ok)), null, ok);
  for (const bad of ['monza', '', 'oval+oval', 'straight+', 42]) assert.equal(validateBrain(make(bad))?.code, 'shapeMismatch', String(bad));
});

test('Exportar e importar: un cerebro entrenado en el gran premio conserva la pista', () => {
  const t = createTraining({ seed: 1, config: small({ tracks: ['grandPrix'] }) });
  t.finishGeneration();
  const brain = brainAfter(t);
  let n = 0;
  const library = createLibrary({ clock: () => 0, newId: () => `id${n++}` });
  const result = library.importText(JSON.stringify(brain));
  assert.equal(result.ok, true);
  assert.equal(result.brain.training.scenarios[0].track, 'grandPrix');
});

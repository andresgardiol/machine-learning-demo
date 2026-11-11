// Entrenamiento por neuroevolución como máquina de estados del núcleo (design.md D6): reúne el
// mundo con varios autos, la población de redes y los operadores de evolution.js.
//
//        +------------+  todos chocaron | tiempo | nadie avanza | a pedido
//  ----> | EN CARRERA | -------------------------------------------+
//        +------------+                                            v
//              ^                                            +------------+
//              |   aplica cambios pendientes, arma el       |  EVALUAR   |
//              +---  mundo y la población siguientes  <-----+------------+
//                                                     registra historial,
//                                                     campeón y escenario
//
//   createTraining({ seed, config, brain? })
//   training.step()              un paso; si la generación termina, la cierra y arma la siguiente
//   training.finishGeneration()  la cierra ahora, con el motivo "a pedido"
//   training.configure(partial)  queda pendiente hasta la próxima generación; rechaza cambios de red o de sensores
//   training.generation | history | champion | leaderIndex | aliveCount
//   training.config | pending | world | eliteCount
//   training.brain({ id, name, now })   cerebro del campeón con sus datos
//   training.onGeneration(fn)    avisa al cerrar cada generación
//
// Todo el azar sale de la semilla del entrenamiento (design.md D5).
import { createWorld } from './world.js';
import { createNetwork, copyNetwork, ACTIVATIONS, DEFAULT_ACTIVATION, NETWORK_LIMITS } from './network.js';
import {
  normalizeEvolution, DEFAULT_EVOLUTION, createStats, recordStep, fitnessOf, rankPopulation, nextGeneration, mutate,
} from './evolution.js';
import {
  createNetworkController, createBrain, assertBrain, addScenarioGenerations, BRAIN_OUTPUTS, TRAFFIC_MODES,
} from './brain.js';
import { sensorConfig, DEFAULT_SENSORS } from './sensors.js';
import { maxSpeedOf } from './car.js';
import { DEFAULT_TRAFFIC } from './traffic.js';
import { deriveSeed, randomFor } from './random.js';
import { ALLOWED_LANES, DEFAULT_LANES, MAX_SPEED, STEP, TRAFFIC_SPEED } from './constants.js';

/** Semilla del tráfico del escenario, la que se usa en el modo "mismo tráfico". */
export const SCENARIO_TRAFFIC_SEED = 1;

/** Segundos simulados sin que ningún auto en carrera supere su mayor distancia para dar la generación por terminada. */
export const STALL_SECONDS = 5;

/**
 * Regla "eliminar a los lentos" (design.md D18): un auto en carrera que en los últimos SLOW_SECONDS
 * avanzó lo mismo o menos que el tráfico en ese tiempo queda fuera de carrera con este motivo.
 */
export const SLOW_SECONDS = 5;
export const SLOW_CAUSE = 'tooSlow';

export const END_REASONS = Object.freeze(['allCrashed', 'timeLimit', 'stalled', 'requested']);

// Flujos de azar derivados de la semilla del entrenamiento (design.md D5).
const STREAM_INITIAL = 1;
const STREAM_BREEDING = 2;
const STREAM_TRAFFIC = 3;

/** Ajustes que solo pueden cambiar con un entrenamiento nuevo: la forma de la red y los sensores. */
export const NEW_TRAINING_KEYS = Object.freeze(['hidden', 'activation', 'sensors']);

export const DEFAULT_TRAINING_CONFIG = Object.freeze({
  ...DEFAULT_EVOLUTION,
  slowRule: true,
  trafficMode: 'same',
  lanes: DEFAULT_LANES,
  density: DEFAULT_TRAFFIC.density,
  irregularity: DEFAULT_TRAFFIC.irregularity,
  maxSpeed: MAX_SPEED,
  hidden: Object.freeze([6]),
  activation: DEFAULT_ACTIVATION,
  sensors: Object.freeze({ ...DEFAULT_SENSORS }),
});

/** Error del entrenamiento con un código y datos para que la interfaz lo explique en su idioma. */
export class TrainingError extends Error {
  constructor(code, details = {}) {
    super(`${code}: ${JSON.stringify(details)}`);
    this.name = 'TrainingError';
    this.code = code;
    this.details = details;
  }
}

const percent = (value, fallback) => {
  const n = Number(value ?? fallback);
  return Number.isFinite(n) ? Math.min(Math.max(n, 0), 100) : fallback;
};

function normalizeHidden(value) {
  if (!Array.isArray(value)) return [...DEFAULT_TRAINING_CONFIG.hidden];
  const { min, max } = NETWORK_LIMITS.neurons;
  return value.slice(0, NETWORK_LIMITS.hiddenLayers.max).map((n) => {
    const v = Math.round(Number(n));
    return Number.isFinite(v) ? Math.min(Math.max(v, min), max) : DEFAULT_TRAINING_CONFIG.hidden[0];
  });
}

/** Configuración válida del entrenamiento: lo que falta usa el valor por defecto y lo que se sale de rango se ajusta. */
export function normalizeTrainingConfig(partial = {}) {
  const p = { ...DEFAULT_TRAINING_CONFIG, ...(partial ?? {}) };
  return {
    ...normalizeEvolution(p),
    slowRule: p.slowRule === undefined ? DEFAULT_TRAINING_CONFIG.slowRule : Boolean(p.slowRule),
    trafficMode: TRAFFIC_MODES.includes(p.trafficMode) ? p.trafficMode : DEFAULT_TRAINING_CONFIG.trafficMode,
    lanes: ALLOWED_LANES.includes(Number(p.lanes)) ? Number(p.lanes) : DEFAULT_LANES,
    density: percent(p.density, DEFAULT_TRAFFIC.density),
    irregularity: percent(p.irregularity, DEFAULT_TRAFFIC.irregularity),
    maxSpeed: maxSpeedOf(p.maxSpeed),
    hidden: normalizeHidden(p.hidden),
    activation: ACTIVATIONS.includes(p.activation) ? p.activation : DEFAULT_ACTIVATION,
    sensors: sensorConfig(p.sensors),
  };
}

const sameValue = (a, b) => JSON.stringify(a) === JSON.stringify(b);

/** Claves cuyos valores difieren entre dos configuraciones normalizadas. */
export function changedKeys(before, after) {
  return Object.keys(after).filter((k) => !sameValue(before[k], after[k]));
}

/** Escenario de una configuración, tal como lo registra un cerebro (sin las generaciones). */
export const scenarioOf = (config) => ({
  track: 'straight', lanes: config.lanes, density: config.density, irregularity: config.irregularity, trafficMode: config.trafficMode,
});

/** Semilla del tráfico de la generación `generation`. */
export function trafficSeedFor(seed, config, generation) {
  return config.trafficMode === 'new' ? deriveSeed(deriveSeed(seed, STREAM_TRAFFIC), generation) : SCENARIO_TRAFFIC_SEED;
}

/**
 * @param {{seed:number, config?:object, brain?:object}} spec
 *   brain: cerebro desde el que se continúa. Su red y sus sensores mandan sobre la configuración:
 *   el individuo 0 es una copia exacta y los demás, hijos mutados de él.
 */
export function createTraining({ seed = 1, config: partial = {}, brain = null } = {}) {
  let config = normalizeTrainingConfig(partial);
  if (brain) {
    assertBrain(brain);
    config = normalizeTrainingConfig({
      ...config,
      sensors: brain.sensors,
      hidden: brain.network.sizes.slice(1, -1),
      activation: brain.network.activation,
    });
  }
  let pending = null; // cambios de configuración que esperan a la próxima generación
  const listeners = new Set();

  const startGenerations = brain ? brain.training.generations : 0;
  let generation = startGenerations + 1;
  let completed = 0;
  let scenarios = brain ? brain.training.scenarios.map((s) => ({ ...s })) : [];
  const history = [];
  let champion = null;

  // --- Población inicial ---------------------------------------------------------------------
  const initialStream = deriveSeed(seed, STREAM_INITIAL);
  let networks;
  let eliteN;
  if (brain) {
    networks = Array.from({ length: config.population }, (_, i) => (i === 0
      ? copyNetwork(brain.network)
      : mutate(brain.network, { strength: config.mutationStrength, rate: config.mutationRate }, randomFor(initialStream, i))));
    eliteN = 1;
  } else {
    networks = Array.from({ length: config.population }, (_, i) => createNetwork({
      inputs: config.sensors.count + 1, hidden: config.hidden, outputs: BRAIN_OUTPUTS.length,
      activation: config.activation, random: randomFor(initialStream, i),
    }));
    eliteN = 0;
  }

  // --- Generación en curso ----------------------------------------------------------------------
  let world;
  let stats;
  let running;
  let lastImprovement;
  let leaderIndex;
  let maxSteps;
  let recent; // progreso de cada agente en los últimos SLOW_STEPS pasos (anillo por agente)
  const SLOW_STEPS = Math.round(SLOW_SECONDS / STEP);
  const SLOW_LIMIT = TRAFFIC_SPEED * SLOW_SECONDS;

  function startGeneration() {
    const sensors = { ...config.sensors };
    world = createWorld({
      seed: trafficSeedFor(seed, config, generation),
      lanes: config.lanes, density: config.density, irregularity: config.irregularity,
      cars: networks.map((net) => ({ controller: createNetworkController(net, sensors.count), sensors, maxSpeed: config.maxSpeed })),
    });
    stats = networks.map(() => createStats());
    running = networks.map(() => true);
    lastImprovement = 0;
    leaderIndex = 0;
    maxSteps = Math.round(config.maxDuration / STEP);
    recent = new Float64Array(networks.length * SLOW_STEPS);
    world.agents.forEach((a, i) => recent.fill(a.progress, i * SLOW_STEPS, (i + 1) * SLOW_STEPS));
  }

  /** Líder: el auto en carrera que más avanzó (se conserva el actual en caso de empate); si no queda ninguno, el que llegó más lejos. */
  function findLeader() {
    const agents = world.agents;
    let best = -1;
    let bestValue = -Infinity;
    if (!agents[leaderIndex].crashed) {
      best = leaderIndex;
      bestValue = agents[leaderIndex].progress;
    }
    for (let i = 0; i < agents.length; i++) {
      if (agents[i].crashed) continue;
      if (agents[i].progress > bestValue) { best = i; bestValue = agents[i].progress; }
    }
    if (best >= 0) return best;
    for (let i = 0; i < stats.length; i++) {
      if (stats[i].best > bestValue) { best = i; bestValue = stats[i].best; }
    }
    return best;
  }

  function fitnesses() {
    return stats.map((s) => fitnessOf(config.fitness, s));
  }

  /** Cierra la generación en curso: registra historial, campeón y escenario, y arma la siguiente. */
  function finishGeneration(reason = 'requested') {
    const values = fitnesses();
    const ranked = rankPopulation(values);
    const best = values[ranked[0]];
    const average = values.reduce((a, b) => a + b, 0) / values.length;
    const record = { generation, best, average, fitness: config.fitness, reason };
    history.push(record);
    champion = { network: copyNetwork(networks[ranked[0]]), fitness: best, fitnessKind: config.fitness, generation, index: ranked[0] };
    scenarios = addScenarioGenerations(scenarios, scenarioOf(config));
    completed += 1;

    // Cambios pendientes: rigen desde la generación siguiente.
    if (pending) {
      config = normalizeTrainingConfig({ ...config, ...pending });
      pending = null;
    }
    const next = nextGeneration({
      networks, fitnesses: values, config,
      random: randomFor(deriveSeed(seed, STREAM_BREEDING), generation),
    });
    networks = next.networks;
    eliteN = next.elite.length;
    generation += 1;
    startGeneration();
    for (const fn of [...listeners]) fn(record);
    return record;
  }

  /** Un paso de simulación; si la generación termina, la cierra y arma la siguiente. Devuelve el registro si terminó. */
  function step() {
    world.step();
    const agents = world.agents;
    const now = world.steps;
    for (let i = 0; i < agents.length; i++) {
      if (!running[i]) continue;
      const a = agents[i];
      if (a.progress > stats[i].best) lastImprovement = now;
      recordStep(stats[i], a);
      if (a.crashed) { running[i] = false; continue; }
      // Eliminar a los lentos: compara con el progreso de hace SLOW_STEPS pasos.
      const slot = i * SLOW_STEPS + (now % SLOW_STEPS);
      const before = recent[slot];
      recent[slot] = a.progress;
      if (config.slowRule && now >= SLOW_STEPS && a.progress - before <= SLOW_LIMIT) {
        world.retire(i, SLOW_CAUSE);
        stats[i].crashed = true;
        running[i] = false;
      }
    }
    leaderIndex = findLeader();
    if (world.aliveCount === 0) return finishGeneration('allCrashed');
    if (now >= maxSteps) return finishGeneration('timeLimit');
    if (now - lastImprovement >= Math.round(STALL_SECONDS / STEP)) return finishGeneration('stalled');
    return null;
  }

  /** Deja pendiente un cambio de configuración hasta la próxima generación. Rechaza cambios de red o de sensores. */
  function configure(partial = {}) {
    const base = normalizeTrainingConfig({ ...config, ...(pending ?? {}) });
    const target = normalizeTrainingConfig({ ...base, ...partial });
    const forbidden = NEW_TRAINING_KEYS.filter((k) => !sameValue(base[k], target[k]));
    if (forbidden.length > 0) throw new TrainingError('requiresNewTraining', { keys: forbidden });
    const diff = changedKeys(config, target);
    pending = diff.length > 0 ? Object.fromEntries(diff.map((k) => [k, target[k]])) : null;
    return pending;
  }

  /** Cerebro del campeón con sus datos de entrenamiento, o null si todavía no terminó ninguna generación. */
  function brainOfChampion({ id, name, now, createdAt } = {}) {
    if (!champion) return null;
    return createBrain({
      id, name, now, createdAt,
      network: champion.network,
      sensors: config.sensors,
      training: {
        generations: startGenerations + completed,
        seed,
        maxSpeed: config.maxSpeed,
        fitness: { kind: champion.fitnessKind, best: champion.fitness },
        evolution: {
          population: config.population, elite: config.elite, selection: config.selection,
          mutationStrength: config.mutationStrength, mutationRate: config.mutationRate,
          crossover: config.crossover, maxDuration: config.maxDuration, slowRule: config.slowRule,
        },
        scenarios,
      },
    });
  }

  startGeneration();

  return {
    step,
    finishGeneration: () => finishGeneration('requested'),
    configure,
    brain: brainOfChampion,
    /** Avisa al cerrar cada generación con su registro; devuelve la función para dejar de escuchar. */
    onGeneration(fn) { listeners.add(fn); return () => listeners.delete(fn); },
    /** Fitness actual de cada individuo de la generación en curso, con la función vigente. */
    fitnesses,
    /** Fitness actual del individuo `i` (por defecto, el líder). */
    fitnessOf: (i = leaderIndex) => fitnessOf(config.fitness, stats[i]),
    get seed() { return seed; },
    get generation() { return generation; },
    /** Generaciones terminadas en total, contando las del cerebro desde el que se continuó. */
    get generationsDone() { return startGenerations + completed; },
    /** Generaciones terminadas en este entrenamiento. */
    get completed() { return completed; },
    get history() { return history; },
    get champion() { return champion; },
    get leaderIndex() { return leaderIndex; },
    get leader() { return world.agents[leaderIndex]; },
    get aliveCount() { return world.aliveCount; },
    get population() { return networks.length; },
    get networks() { return networks; },
    get config() { return config; },
    get pending() { return pending; },
    get world() { return world; },
    /** Cantidad de individuos de élite de la generación en curso: son los primeros de la población. */
    get eliteCount() { return eliteN; },
    get scenarios() { return scenarios; },
    get fromBrain() { return brain; },
  };
}

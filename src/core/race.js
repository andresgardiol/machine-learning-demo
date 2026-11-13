// Carrera (pestana-competir, design.md D1 a D1d): de uno a seis competidores, cada uno con su
// controlador y sus sensores, corren a la vez en la misma pista hasta una meta. Son fantasmas: un
// solo mundo de varios autos, que no se perciben ni se chocan entre sí.
//
//   createRace({ track, seed, lanes, density, irregularity, maxSpeed, crashPenalty, competitors })
//   race.step()        un paso; no hace nada si la carrera terminó
//   race.time | goal | finished | waitLeft | results | standings | world
//
// Chocar no saca de la carrera (D1c): el auto queda detenido `crashPenalty` segundos donde chocó y
// reaparece RESPAWN_BACK metros más atrás, en el carril de salida (el centro, en un circuito),
// detenido y mirando hacia adelante; durante RESPAWN_GRACE segundos, y mientras siga encimado con un
// vehículo, el tráfico no lo choca: es un fantasma también para el tráfico. Queda fuera como "no terminó"
// quien pasa RACE_STALL_SECONDS sin superar su mayor progreso, quien sigue corriendo
// RACE_WAIT_SECONDS después de que llegó el primero y quien sigue corriendo a los RACE_MAX_SECONDS
// (D1d). Quien llega deja de correr y su resultado no cambia más.
//
// Sin DOM y determinista: con la misma pista, semilla, penalización, competidores y controles, los
// mismos resultados.
import { createWorld } from './world.js';
import { createTrackById, DEFAULT_TRACK } from './circuits.js';
import { CAR_LENGTH, STEP } from './constants.js';

/** Máximo de competidores en una carrera. */
export const MAX_COMPETITORS = 6;

/** Meta de cada pista (D1b): metros en la calle recta, vueltas en los circuitos. */
export const RACE_GOALS = Object.freeze({
  straight: Object.freeze({ kind: 'meters', value: 1000 }),
  oval: Object.freeze({ kind: 'laps', value: 2 }),
  kidney: Object.freeze({ kind: 'laps', value: 1 }),
  grandPrix: Object.freeze({ kind: 'laps', value: 1 }),
});

/** Penalización por choque por defecto (s), y sus límites (D1c y D10). */
export const RACE_CRASH_PENALTY = 0.1;
export const CRASH_PENALTY_LIMITS = Object.freeze({ min: 0, max: 3, step: 0.1 });

/** Cuánto más atrás reaparece un auto que chocó: dos largos de auto (m). */
export const RESPAWN_BACK = 2 * CAR_LENGTH;
/**
 * Segundos en que el tráfico no choca a un auto recién reaparecido: pasa a través de los vehículos.
 * La protección no termina mientras esté encimado con uno (D1c).
 */
export const RESPAWN_GRACE = 2;

/** Segundos sin superar el mayor progreso para quedar fuera (D1d). */
export const RACE_STALL_SECONDS = 5;
/** Segundos que tienen los demás desde que llega el primero. */
export const RACE_WAIT_SECONDS = 20;
/** Duración máxima de una carrera (s). */
export const RACE_MAX_SECONDS = 180;

/** Estados de un competidor. */
export const RACE_STATES = Object.freeze(['racing', 'arrived', 'unfinished']);

/** Error de la carrera con un código y datos para que la interfaz lo explique en su idioma. */
export class RaceError extends Error {
  constructor(code, details = {}) {
    super(`${code}: ${JSON.stringify(details)}`);
    this.name = 'RaceError';
    this.code = code;
    this.details = details;
  }
}

/** Penalización válida (s): sin valor, la de por defecto; fuera de rango, al límite; de a 0,1 s. */
export function crashPenaltyOf(value) {
  const n = Number(value ?? RACE_CRASH_PENALTY);
  if (!Number.isFinite(n)) return RACE_CRASH_PENALTY;
  const { min, max } = CRASH_PENALTY_LIMITS;
  return Math.round(Math.min(Math.max(n, min), max) * 10) / 10;
}

/**
 * Meta de una pista: { kind, value, meters }. `meters` es el recorrido (en un circuito, vueltas × largo).
 * @param {string} trackId
 * @param {object} [track] la pista ya armada (para no volver a armarla)
 */
export function raceGoal(trackId, track = createTrackById(trackId)) {
  const g = RACE_GOALS[trackId];
  if (!g) throw new RaceError('unknownTrack', { track: trackId });
  return { kind: g.kind, value: g.value, meters: g.kind === 'laps' ? g.value * track.length : g.value };
}

/** Dónde reaparece quien chocó a `crashAt` metros (D1c): RESPAWN_BACK más atrás, sin pasar de la salida. Nunca más atrás. */
export function respawnProgress(crashAt) {
  return Math.max(0, crashAt - RESPAWN_BACK);
}

// Margen para comparar tiempos hechos de sumas de pasos.
const EPS = 1e-9;
const STALL_STEPS = Math.round(RACE_STALL_SECONDS / STEP);
const WAIT_STEPS = Math.round(RACE_WAIT_SECONDS / STEP);
const MAX_STEPS = Math.round(RACE_MAX_SECONDS / STEP);

/**
 * @param {object} spec
 * @param {string} [spec.track] pista del catálogo
 * @param {number} [spec.seed] semilla del tráfico
 * @param {number} [spec.lanes]
 * @param {number} [spec.density]
 * @param {number} [spec.irregularity]
 * @param {number} [spec.maxSpeed] la misma para todos
 * @param {number} [spec.crashPenalty] segundos (0,1 por defecto)
 * @param {{id:string, controller:object, sensors?:object}[]} spec.competitors de 1 a MAX_COMPETITORS
 */
export function createRace({
  track: trackId = DEFAULT_TRACK, seed = 1, lanes, density, irregularity, maxSpeed,
  crashPenalty = RACE_CRASH_PENALTY, competitors = [],
} = {}) {
  if (!Array.isArray(competitors) || competitors.length === 0) throw new RaceError('noCompetitors', { min: 1 });
  if (competitors.length > MAX_COMPETITORS) throw new RaceError('tooManyCompetitors', { max: MAX_COMPETITORS, count: competitors.length });
  const penalty = crashPenaltyOf(crashPenalty);
  const penaltySteps = Math.round(penalty / STEP);

  const world = createWorld({
    seed, track: trackId, lanes, density, irregularity, keepClock: true,
    cars: competitors.map((c) => ({ controller: c.controller, sensors: c.sensors, maxSpeed })),
  });
  const { track } = world;
  const goal = raceGoal(trackId, track);

  const results = competitors.map((c) => ({
    id: c.id,
    state: 'racing',
    time: null,
    progress: 0,
    share: 0,
    crashes: 0,
    penalized: false,
    laps: 0,
    lapTimes: [],
    bestLap: null,
  }));
  // Estado interno de cada competidor.
  const inner = competitors.map(() => ({
    bestStep: 0, // último paso en que superó su mayor progreso
    respawnAt: null, // paso en que reaparece (cumpliendo la penalización)
    crashProgress: 0, // progreso donde chocó
    lastLapStep: 0, // paso de la última vuelta completa (o de la largada)
  }));

  let steps = 0;
  let firstArrivalStep = null;
  let finished = false;

  function leave(i, state) {
    const r = results[i];
    r.state = state;
    r.penalized = false;
    inner[i].respawnAt = null;
    world.retire(i, state === 'arrived' ? 'arrived' : 'unfinished');
  }

  function refreshShare(r) {
    r.share = Math.min(1, Math.max(0, r.progress / goal.meters));
  }

  function step() {
    if (finished) return;
    // Los que cumplieron la penalización vuelven a la pista antes del paso.
    for (let i = 0; i < results.length; i++) {
      const s = inner[i];
      if (results[i].state === 'racing' && s.respawnAt !== null && steps >= s.respawnAt) {
        world.respawn(i, { progress: respawnProgress(s.crashProgress), protect: RESPAWN_GRACE });
        s.respawnAt = null;
        results[i].penalized = false;
      }
    }
    world.step();
    steps = world.steps;
    const agents = world.agents;
    for (let i = 0; i < results.length; i++) {
      const r = results[i];
      if (r.state !== 'racing') continue;
      const a = agents[i];
      const s = inner[i];
      if (!r.penalized) {
        if (a.progress > r.progress + EPS) {
          r.progress = Math.min(a.progress, goal.meters);
          s.bestStep = steps;
          refreshShare(r);
        }
        // Vueltas: una nueva cuando el contador del mundo supera el mayor que tuvo.
        if (track.closed && a.laps > r.laps) {
          while (r.laps < a.laps) {
            r.laps += 1;
            r.lapTimes.push((steps - s.lastLapStep) * STEP);
            s.lastLapStep = steps;
          }
          r.bestLap = Math.min(...r.lapTimes);
        }
        if (a.progress >= goal.meters - EPS) {
          r.time = steps * STEP;
          r.progress = goal.meters;
          r.share = 1;
          leave(i, 'arrived');
          if (firstArrivalStep === null) firstArrivalStep = steps;
          continue;
        }
        if (a.crashed) {
          r.crashes += 1;
          r.penalized = true;
          s.crashProgress = a.progress;
          s.respawnAt = steps + penaltySteps;
        }
      }
      if (steps - s.bestStep >= STALL_STEPS) leave(i, 'unfinished');
    }
    const waitOver = firstArrivalStep !== null && steps - firstArrivalStep >= WAIT_STEPS;
    if (waitOver || steps >= MAX_STEPS) {
      for (let i = 0; i < results.length; i++) if (results[i].state === 'racing') leave(i, 'unfinished');
    }
    finished = results.every((r) => r.state !== 'racing');
  }

  /** Orden (D1): los que llegaron, por tiempo; después los demás, por mayor progreso; empates por inscripción. */
  function standings() {
    return results.map((r, i) => i).sort((a, b) => {
      const ra = results[a];
      const rb = results[b];
      const arrivedA = ra.state === 'arrived';
      const arrivedB = rb.state === 'arrived';
      if (arrivedA !== arrivedB) return arrivedA ? -1 : 1;
      if (arrivedA && ra.time !== rb.time) return ra.time - rb.time;
      if (!arrivedA && ra.progress !== rb.progress) return rb.progress - ra.progress;
      return a - b;
    });
  }

  return {
    step,
    world,
    goal,
    crashPenalty: penalty,
    trackId,
    seed,
    /** Tiempo de carrera (s). */
    get time() { return steps * STEP; },
    get steps() { return steps; },
    get finished() { return finished; },
    /** Segundos que quedan de espera desde que llegó el primero, o null si no llegó nadie. */
    get waitLeft() {
      if (firstArrivalStep === null) return null;
      return Math.max(0, (WAIT_STEPS - (steps - firstArrivalStep)) * STEP);
    },
    /** Resultado de cada competidor, en el orden de inscripción. */
    get results() { return results; },
    /** Índices de los competidores en orden de carrera. */
    get standings() { return standings(); },
    /** ¿El tráfico todavía no puede chocar al competidor `i`? (recién reaparecido) */
    isProtected: (i) => world.isProtected(i),
    get competitors() { return competitors; },
  };
}

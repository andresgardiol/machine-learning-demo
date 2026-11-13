// Semillas del tráfico de las carreras (pestana-competir, design.md D2), sin DOM.
//
//   primera carrera   RACE_FIRST_SEED, fija: todas las personas ven la misma carrera al abrir
//   otra carrera      la siguiente de una serie derivada de un contador que vive hasta cerrar la
//                     aplicación: nunca repite una semilla usada ni usa SCENARIO_TRAFFIC_SEED
//   tráfico de práctica  SCENARIO_TRAFFIC_SEED
//   reiniciar         la misma semilla
import { SCENARIO_TRAFFIC_SEED } from '../../core/training.js';
import { deriveSeed } from '../../core/random.js';

/** Semilla del tráfico de la primera carrera. */
export const RACE_FIRST_SEED = 1001;
/** Base de la serie de "otra carrera". */
export const RACE_SEED_BASE = 4242;

/** Serie de semillas de "otra carrera" con tráfico nuevo. */
export function createSeedSeries({ first = RACE_FIRST_SEED, base = RACE_SEED_BASE } = {}) {
  const used = new Set([first]);
  let counter = 0;
  return {
    /** La semilla siguiente, que todavía no se usó. */
    next() {
      let s;
      do { s = deriveSeed(base, counter++); } while (used.has(s) || s === SCENARIO_TRAFFIC_SEED);
      used.add(s);
      return s;
    },
    get first() { return first; },
    get used() { return [...used]; },
  };
}

/** Semilla de una carrera según el tráfico elegido: el de práctica, o la nueva que corresponda. */
export const seedFor = (traffic, newSeed) => (traffic === 'practice' ? SCENARIO_TRAFFIC_SEED : newSeed);

export { SCENARIO_TRAFFIC_SEED };

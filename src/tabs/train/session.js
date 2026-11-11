// Lógica de la pestaña 3 sin DOM: indicadores del entrenamiento y misiones. Se prueba con node --test.
//
// Los indicadores se calculan a partir del entrenamiento del núcleo; los textos (con su clave y sus
// parámetros) los escribe la pestaña en el idioma activo.
import { FITNESS_UNITS } from '../../core/evolution.js';

/** Misiones de la pestaña, en orden. */
export const MISSIONS = Object.freeze([
  Object.freeze({ id: 'generations', goal: 5, unit: 'count' }),
  Object.freeze({ id: 'distance', goal: 300, unit: 'meters' }),
  Object.freeze({ id: 'save', goal: 1, unit: 'none' }),
  Object.freeze({ id: 'fitness', goal: 1, unit: 'none' }),
]);

/**
 * Valor de fitness listo para mostrar: clave del texto con su unidad y valor redondeado
 * (metros sin decimales; segundos y metros por segundo con uno).
 */
export function fitnessText(value, kind) {
  const unit = FITNESS_UNITS[kind] ?? 'meters';
  const rounded = unit === 'meters' ? Math.floor(Math.max(0, value)) : Math.round(Math.max(0, value) * 10) / 10;
  return { key: `train.value.${unit}`, params: { value: rounded } };
}

/**
 * Indicadores del entrenamiento: generación en curso, autos en carrera sobre el total, fitness del
 * líder ahora, mejor fitness de la última generación terminada (null si todavía no terminó
 * ninguna) y el motivo por el que terminó.
 */
export function indicators(training) {
  const last = training.history[training.history.length - 1] ?? null;
  return {
    generation: training.generation,
    alive: training.aliveCount,
    total: training.world.agents.length,
    leader: fitnessText(training.fitnessOf(training.leaderIndex), training.config.fitness),
    lastBest: last ? fitnessText(last.best, last.fitness) : null,
    lastReason: last ? last.reason : null,
  };
}

/**
 * @param {{completed?: Set<string>}} [spec] `completed`: misiones cumplidas; se comparte entre
 *   montajes para que una misión cumplida siga marcada hasta cerrar la aplicación, aunque se
 *   reinicie el entrenamiento.
 */
export function createTrainSession({ completed = new Set() } = {}) {
  let generation = 1;
  let distance = 0;
  let saved = 0;
  let otherFitness = 0;

  function check() {
    for (const m of MISSIONS) if (!completed.has(m.id) && progressOf(m) >= m.goal) completed.add(m.id);
  }

  function progressOf(m) {
    switch (m.id) {
      case 'generations': return generation;
      case 'distance': return distance;
      case 'save': return saved;
      default: return otherFitness;
    }
  }

  return {
    /** Observa el entrenamiento después de cada paso: generación en curso y distancia del líder. */
    observe(training) {
      generation = training.generation;
      const leader = training.world.agents[training.leaderIndex];
      if (leader && leader.progress > distance) distance = leader.progress;
      check();
    },
    /** Una generación terminó: cuenta para la misión de la función de fitness si no fue la distancia. */
    generationEnded(record) {
      if (record.fitness !== 'distance') otherFitness += 1;
      check();
    },
    /** La persona guardó un cerebro. */
    brainSaved() { saved += 1; check(); },
    /** Empieza un entrenamiento nuevo: el progreso vuelve a cero; las misiones cumplidas siguen cumplidas. */
    restart() { generation = 1; distance = 0; otherFitness = 0; },
    /** Misiones con su progreso (acotado a la meta) y si están cumplidas. */
    get missions() {
      return MISSIONS.map((m) => ({ ...m, progress: Math.min(progressOf(m), m.goal), done: completed.has(m.id) }));
    },
  };
}

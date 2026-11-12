// Lógica de la pestaña 3 sin DOM: indicadores del entrenamiento y misiones. Se prueba con node --test.
//
// Los indicadores se calculan a partir del entrenamiento del núcleo; los textos (con su clave y sus
// parámetros) los escribe la pestaña en el idioma activo.
import { FITNESS_UNITS } from '../../core/evolution.js';
import { DEFAULT_TRAINING_CONFIG } from '../../core/training.js';

/** Misiones de la pestaña, en orden. */
export const MISSIONS = Object.freeze([
  Object.freeze({ id: 'generations', goal: 5, unit: 'count' }),
  Object.freeze({ id: 'passed', goal: 5, unit: 'count' }),
  Object.freeze({ id: 'save', goal: 1, unit: 'none' }),
  Object.freeze({ id: 'fitness', goal: 1, unit: 'none' }),
]);

/**
 * Valor de fitness listo para mostrar: clave del texto con su unidad y valor redondeado
 * (metros y metros de ventaja sin decimales; segundos y metros por segundo con uno).
 */
export function fitnessText(value, kind) {
  const unit = FITNESS_UNITS[kind] ?? 'meters';
  const whole = unit === 'meters' || unit === 'metersAhead';
  const rounded = whole ? Math.floor(Math.max(0, value)) : Math.round(Math.max(0, value) * 10) / 10;
  return { key: `train.value.${unit}`, params: { value: rounded } };
}

/**
 * Valor corto del fitness, para el indicador del tablero: la ventaja se muestra en metros, sin la
 * palabra "ventaja" (la dice el nombre del indicador). El resto, igual que fitnessText.
 */
export function shortFitnessText(value, kind) {
  const text = fitnessText(value, kind);
  return text.key === 'train.value.metersAhead' ? { key: 'train.value.meters', params: text.params } : text;
}

/** Nombre del indicador del fitness del líder según la función vigente ("Ventaja del líder", …). */
export const leaderLabelKey = (kind) => `train.stats.leader.${FITNESS_UNITS[kind] ? kind : 'distance'}`;

/**
 * Indicadores del entrenamiento: generación en curso, autos en carrera sobre el total, fitness del
 * líder ahora (valor corto y nombre según la función vigente), vehículos que lleva superados el líder, mejor fitness de la última generación
 * terminada (null si todavía no terminó ninguna) y el motivo por el que terminó.
 */
export function indicators(training) {
  const last = training.history[training.history.length - 1] ?? null;
  const circuit = training.world.track.closed;
  return {
    // Pista de la generación en curso y, en un circuito, vueltas del líder con un decimal hacia abajo
    // (en lugar de los vehículos superados; circuitos-y-paisaje D10).
    trackId: training.trackId,
    laps: circuit ? Math.floor(10 * training.lapsOf(training.leaderIndex) + 1e-9) / 10 : null,
    generation: training.generation,
    alive: training.aliveCount,
    total: training.world.agents.length,
    leader: shortFitnessText(training.fitnessOf(training.leaderIndex), training.config.fitness),
    leaderLabel: leaderLabelKey(training.config.fitness),
    passed: training.passedOf(training.leaderIndex),
    lastBest: last ? fitnessText(last.best, last.fitness) : null,
    lastReason: last ? last.reason : null,
  };
}

/**
 * Última generación terminada, para la línea del tablero (design.md D8): su número y su mejor
 * fitness con la clave de su unidad, y la clave de la oración con el motivo por el que terminó.
 * null si todavía no terminó ninguna.
 * @returns {null | {best:{key:string, params:{generation:number, value:number}}, reason:string}}
 */
export function lastGeneration(training) {
  const last = training.history[training.history.length - 1] ?? null;
  if (!last) return null;
  const { key, params } = fitnessText(last.best, last.fitness);
  const unit = key.slice('train.value.'.length);
  return {
    best: { key: `train.last.best.${unit}`, params: { generation: last.generation, value: params.value } },
    reason: `train.last.reason.${last.reason}`,
  };
}

/**
 * Línea de estado del padre elegido (design.md D5): de dónde va a salir la generación siguiente.
 *   padre elegido, el líder      train.parent.leader.<unidad>    { generation, value }
 *   padre elegido, el campeón    train.parent.champion.<unidad>  { generation, value }
 *   padre elegido, un cerebro    train.parent.brain              { name }
 *   sin padre, todavía automática  train.parent.pending
 *   sin padre, manual              train.parent.none
 * @returns {{key:string, params:object}}
 */
export function parentStatus(training) {
  const parent = training.parent;
  if (!parent) {
    return { key: training.selection.applied === 'manual' ? 'train.parent.none' : 'train.parent.pending', params: {} };
  }
  if (parent.source === 'brain') return { key: 'train.parent.brain', params: { name: parent.name } };
  const { key, params } = fitnessText(parent.fitness ?? 0, parent.fitnessKind);
  const unit = key.slice('train.value.'.length);
  const kind = parent.source === 'champion' ? 'champion' : 'leader';
  return { key: `train.parent.${kind}.${unit}`, params: { generation: parent.generation, value: params.value } };
}

/**
 * @param {{completed?: Set<string>}} [spec] `completed`: misiones cumplidas; se comparte entre
 *   montajes para que una misión cumplida siga marcada hasta cerrar la aplicación, aunque se
 *   reinicie el entrenamiento.
 */
export function createTrainSession({ completed = new Set() } = {}) {
  let generation = 1;
  let passed = 0; // mayor cantidad de vehículos superados por un líder
  let saved = 0;
  let otherFitness = 0;

  function check() {
    for (const m of MISSIONS) if (!completed.has(m.id) && progressOf(m) >= m.goal) completed.add(m.id);
  }

  function progressOf(m) {
    switch (m.id) {
      case 'generations': return generation;
      case 'passed': return passed;
      case 'save': return saved;
      default: return otherFitness;
    }
  }

  return {
    /** Observa el entrenamiento después de cada paso: generación en curso y vehículos superados por el líder. */
    observe(training) {
      generation = training.generation;
      const now = training.passedOf(training.leaderIndex);
      if (now > passed) passed = now;
      check();
    },
    /** Una generación terminó: cuenta para la misión de la función de fitness si no fue la de por defecto. */
    generationEnded(record) {
      if (record.fitness !== DEFAULT_TRAINING_CONFIG.fitness) otherFitness += 1;
      check();
    },
    /** La persona guardó un cerebro. */
    brainSaved() { saved += 1; check(); },
    /** Empieza un entrenamiento nuevo: el progreso vuelve a cero; las misiones cumplidas siguen cumplidas. */
    restart() { generation = 1; passed = 0; otherFitness = 0; },
    /** Misiones con su progreso (acotado a la meta) y si están cumplidas. */
    get missions() {
      return MISSIONS.map((m) => ({ ...m, progress: Math.min(progressOf(m), m.goal), done: completed.has(m.id) }));
    },
  };
}

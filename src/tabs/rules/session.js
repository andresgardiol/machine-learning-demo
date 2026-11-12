// Lógica de la pestaña Reglas a mano sin DOM (design.md D9): indicadores del intento, reintento
// automático y misiones. Se prueba con node --test.
//
// La sesión observa el mundo después de cada paso de simulación (`step`). El reintento cuenta
// pasos de simulación desde el choque, no tiempo: en pausa o con la página oculta no avanza.
import { createAttempt } from '../shared/attempt.js';

/** Pasos de simulación (1/60 s) entre el choque y el reintento automático: un segundo y medio. */
export const RETRY_STEPS = 90;

/** Misiones de la pestaña, en orden. Las tres miden vehículos superados, no distancia. */
export const MISSIONS = Object.freeze([
  Object.freeze({ id: 'pass', goal: 3 }),
  Object.freeze({ id: 'passMany', goal: 10 }),
  Object.freeze({ id: 'traffics', goal: 3 }),
]);

/** Vehículos superados en un intento para que un tráfico cuente en la misión de tráficos. */
export const TRAFFIC_PASSED = 10;

/**
 * @param {{completed?: Set<string>, traffics?: Set<number>}} [spec]
 *   completed: misiones cumplidas (compartidas entre montajes, hasta cerrar la aplicación);
 *   traffics: semillas en las que el programa en marcha superó 10 vehículos (también compartidas).
 */
export function createRulesSession({ completed = new Set(), traffics = new Set() } = {}) {
  const attempt = createAttempt();
  let sinceCrash = 0;
  // El programa cambió durante este intento: lo superado hasta acá fue con otro programa, así que
  // el intento ya no cuenta para la misión de tráficos (el próximo sí).
  let mixedProgram = false;

  function progressOf(m) {
    if (m.id === 'traffics') return traffics.size;
    return attempt.passed;
  }

  function checkMissions() {
    for (const m of MISSIONS) if (!completed.has(m.id) && progressOf(m) >= m.goal) completed.add(m.id);
  }

  /**
   * Observa el mundo después de un paso de simulación.
   * @param {{progress:number, crashed:boolean, paused:boolean, vehiclesIn:Function}} world
   * @param {{seed:number, autoRetry?:boolean}} options
   * @returns {'retry'|null} 'retry' cuando pasaron 90 pasos desde el choque con el reintento encendido
   */
  function step(world, { seed, autoRetry = true }) {
    if (world.paused) return null;
    attempt.observe(world);
    if (!mixedProgram && attempt.passed >= TRAFFIC_PASSED) traffics.add(seed);
    checkMissions();
    if (!world.crashed || !autoRetry) {
      sinceCrash = 0;
      return null;
    }
    sinceCrash += 1;
    return sinceCrash >= RETRY_STEPS ? 'retry' : null;
  }

  /** Empieza un intento nuevo (con el mismo u otro tráfico). */
  function restart({ countAttempt = true } = {}) {
    attempt.restart({ countAttempt });
    sinceCrash = 0;
    mixedProgram = false;
  }

  /** El programa que maneja cambió: los tráficos recorridos ya no valen para la misión de tráficos. */
  function programChanged() {
    traffics.clear();
    mixedProgram = true;
  }

  return {
    step,
    restart,
    programChanged,
    get distance() { return attempt.distance; },
    get passed() { return attempt.passed; },
    /** Mejor distancia de los intentos terminados desde que se abrió la pestaña. */
    get best() { return attempt.best; },
    get attempts() { return attempt.attempts; },
    get ended() { return attempt.ended; },
    /** Pasos de simulación desde el choque (con el reintento encendido). */
    get sinceCrash() { return sinceCrash; },
    /** Misiones con su progreso (acotado a la meta) y si están cumplidas. */
    get missions() {
      return MISSIONS.map((m) => ({ ...m, progress: Math.min(progressOf(m), m.goal), done: completed.has(m.id) }));
    },
  };
}

/**
 * Opciones de dibujo del escenario (circuitos-y-paisaje D13). Ver como la máquina fuerza los rayos a
 * la vista y oculta pista, tráfico y paisaje; al chocar se vuelve a ver todo hasta el intento
 * siguiente. Es solo dibujo: el núcleo no recibe el modo.
 * @param {{showSensors:boolean, machineView:boolean}} state
 * @param {{crashed:boolean}} world
 */
export const viewOptions = (state, world) => ({
  showSensors: state.showSensors || state.machineView,
  machineView: state.machineView && !world.crashed,
});

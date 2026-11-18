// Lógica de la pestaña Reglas a mano sin DOM (design.md D9): indicadores del intento, reintento
// automático y misiones. Se prueba con node --test.
//
// La sesión observa el mundo después de cada paso de simulación (`step`). El reintento cuenta
// pasos de simulación desde el choque, no tiempo: en pausa o con la página oculta no avanza.
import { createAttempt } from '../shared/attempt.js';

/**
 * Pasos de simulación (1/60 s) entre el choque y el reintento automático: cinco segundos, para que el
 * caso del choque se vea (reglas-el-choque-ensena D2). En tiempo de simulación: es determinista y la
 * pausa lo detiene.
 */
export const RETRY_STEPS = 300;

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
  // Retenido (D2): la persona tocó un control del caso del choque; el intento no se reinicia solo hasta
  // reiniciar a mano o probar otro programa (los dos pasan por `restart`).
  let held = false;
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
   * @returns {'retry'|null} 'retry' cuando pasaron RETRY_STEPS pasos desde el choque con el reintento
   *   encendido y la sesión no está retenida
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
    if (held) return null;
    sinceCrash += 1;
    return sinceCrash >= RETRY_STEPS ? 'retry' : null;
  }

  /** Empieza un intento nuevo (con el mismo u otro tráfico). */
  function restart({ countAttempt = true } = {}) {
    attempt.restart({ countAttempt });
    sinceCrash = 0;
    mixedProgram = false;
    held = false;
  }

  /** La persona tocó un control del caso del choque: la cuenta se detiene hasta el próximo intento (D2). */
  function hold() { held = true; }

  /** El programa que maneja cambió: los tráficos recorridos ya no valen para la misión de tráficos. */
  function programChanged() {
    traffics.clear();
    mixedProgram = true;
  }

  return {
    step,
    restart,
    hold,
    programChanged,
    get distance() { return attempt.distance; },
    get passed() { return attempt.passed; },
    /** Mejor distancia de los intentos terminados desde que se abrió la pestaña. */
    get best() { return attempt.best; },
    get attempts() { return attempt.attempts; },
    get ended() { return attempt.ended; },
    /** Pasos de simulación desde el choque (con el reintento encendido). */
    get sinceCrash() { return sinceCrash; },
    /** Pasos que faltan para el reintento automático (con el reintento encendido y sin retener). */
    get retryIn() { return Math.max(0, RETRY_STEPS - sinceCrash); },
    /** ¿La persona retuvo el caso del choque? */
    get held() { return held; },
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

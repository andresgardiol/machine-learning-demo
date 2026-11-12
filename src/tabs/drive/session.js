// Lógica de la pestaña 1 sin DOM: indicadores del intento (distancia, vehículos superados,
// intentos, mejor distancia) y misiones. Se prueba con node --test.
//
// La sesión observa el mundo después de cada paso (`observe`) y se reinicia con el intento
// (`restart`). No conoce el teclado ni la vista. El seguimiento del intento y las lecturas de las
// barras son piezas compartidas con la pestaña Reglas a mano (tabs/shared/, design.md D5).
import { createAttempt, PASS_WINDOW, relativePosition } from '../shared/attempt.js';
import { readings, READINGS_MAX } from '../shared/driving-cards.js';

export { PASS_WINDOW, relativePosition, readings, READINGS_MAX };

/** Misiones de la pestaña, en orden. `goal` en vehículos o metros. */
export const MISSIONS = Object.freeze([
  Object.freeze({ id: 'pass', goal: 5, unit: 'vehicles' }),
  Object.freeze({ id: 'distance', goal: 500, unit: 'meters' }),
  Object.freeze({ id: 'machine', goal: 200, unit: 'meters' }),
]);

/**
 * @param {{completed?: Set<string>}} [spec] `completed`: misiones cumplidas; se comparte entre
 *   sesiones para que una misión cumplida siga marcada hasta cerrar la aplicación.
 */
export function createDriveSession({ completed = new Set() } = {}) {
  const attempt = createAttempt();
  let machineDistance = 0;
  let lastProgress = 0;

  function checkMissions() {
    for (const m of MISSIONS) if (!completed.has(m.id) && progressOf(m) >= m.goal) completed.add(m.id);
  }

  function progressOf(m) {
    if (m.id === 'pass') return attempt.passed;
    if (m.id === 'distance') return attempt.distance;
    return machineDistance;
  }

  /**
   * Actualiza los indicadores con el estado actual del mundo.
   * @param {{progress:number, crashed:boolean, vehiclesIn:(from:number,to:number)=>{id:string,distance:number}[]}} world
   * @param {{machineView?: boolean, missions?: boolean}} [options] machineView: el modo ver como la
   *   máquina está activo; missions: las misiones cuentan (son de la calle recta: en un circuito, no).
   */
  function observe(world, { machineView = false, missions = true } = {}) {
    if (attempt.ended) return;
    const progress = world.progress;
    if (machineView && missions) machineDistance = Math.max(0, machineDistance + (progress - lastProgress));
    lastProgress = progress;
    attempt.observe(world);
    if (missions) checkMissions();
  }

  /**
   * Empieza un intento nuevo: registra la mejor distancia y vuelve a cero lo que es del intento.
   * @param {{countAttempt?: boolean}} [options] countAttempt=false reinicia sin sumar un intento
   *   (por ejemplo mientras se arrastra un deslizador: todo el arrastre cuenta como un solo reinicio).
   */
  function restart({ countAttempt = true } = {}) {
    attempt.restart({ countAttempt });
    machineDistance = 0;
    lastProgress = 0;
  }

  return {
    observe,
    restart,
    get attempts() { return attempt.attempts; },
    get best() { return attempt.best; },
    get distance() { return attempt.distance; },
    get passed() { return attempt.passed; },
    get machineDistance() { return machineDistance; },
    get ended() { return attempt.ended; },
    /** Misiones con su progreso en el intento actual (acotado a la meta) y si están cumplidas. */
    get missions() {
      return MISSIONS.map((m) => ({ ...m, progress: Math.min(progressOf(m), m.goal), done: completed.has(m.id) }));
    },
  };
}

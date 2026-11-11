// Lógica de la pestaña 1 sin DOM: indicadores del intento (distancia, vehículos superados,
// intentos, mejor distancia) y misiones. Se prueba con node --test.
//
// La sesión observa el mundo después de cada paso (`observe`) y se reinicia con el intento
// (`restart`). No conoce el teclado ni la vista.
import { CAR_LENGTH } from '../../core/constants.js';

/** Radio (m) alrededor del auto en el que se buscan vehículos para contarlos como superados. */
export const PASS_WINDOW = 80;

/** Misiones de la pestaña, en orden. `goal` en vehículos o metros. */
export const MISSIONS = Object.freeze([
  Object.freeze({ id: 'pass', goal: 5, unit: 'vehicles' }),
  Object.freeze({ id: 'distance', goal: 500, unit: 'meters' }),
  Object.freeze({ id: 'machine', goal: 200, unit: 'meters' }),
]);

/**
 * Un vehículo cuenta como superado cuando todo el auto quedó por delante de él (la cola del auto
 * pasó el frente del vehículo) y deja de contar si vuelve a quedar por completo delante del auto.
 * Entre ambos límites (van a la par) conserva su estado anterior.
 * @returns {'behind'|'ahead'|'alongside'}
 */
export function relativePosition(carProgress, vehicleDistance, carLength = CAR_LENGTH) {
  if (vehicleDistance < carProgress - carLength) return 'behind';
  if (vehicleDistance > carProgress + carLength) return 'ahead';
  return 'alongside';
}

/**
 * @param {{completed?: Set<string>}} [spec] `completed`: misiones cumplidas; se comparte entre
 *   sesiones para que una misión cumplida siga marcada hasta cerrar la aplicación.
 */
export function createDriveSession({ completed = new Set() } = {}) {
  let attempts = 1;
  let best = 0;
  let distance = 0;
  let machineDistance = 0;
  let lastProgress = 0;
  let passed = new Set();
  let ended = false; // el intento terminó por choque

  function endAttempt() {
    best = Math.max(best, distance);
  }

  function checkMissions() {
    for (const m of MISSIONS) if (!completed.has(m.id) && progressOf(m) >= m.goal) completed.add(m.id);
  }

  function progressOf(m) {
    if (m.id === 'pass') return passed.size;
    if (m.id === 'distance') return distance;
    return machineDistance;
  }

  /**
   * Actualiza los indicadores con el estado actual del mundo.
   * @param {{progress:number, crashed:boolean, vehiclesIn:(from:number,to:number)=>{id:string,distance:number}[]}} world
   * @param {{machineView?: boolean}} [options] machineView: el modo ver como la máquina está activo
   */
  function observe(world, { machineView = false } = {}) {
    if (ended) return;
    const progress = world.progress;
    if (machineView) machineDistance = Math.max(0, machineDistance + (progress - lastProgress));
    lastProgress = progress;
    distance = Math.max(0, progress);
    for (const v of world.vehiclesIn(progress - PASS_WINDOW, progress + PASS_WINDOW)) {
      const where = relativePosition(progress, v.distance);
      if (where === 'behind') passed.add(v.id);
      else if (where === 'ahead') passed.delete(v.id);
    }
    checkMissions();
    if (world.crashed) {
      ended = true;
      endAttempt();
    }
  }

  /**
   * Empieza un intento nuevo: registra la mejor distancia y vuelve a cero lo que es del intento.
   * @param {{countAttempt?: boolean}} [options] countAttempt=false reinicia sin sumar un intento
   *   (por ejemplo mientras se arrastra un deslizador: todo el arrastre cuenta como un solo reinicio).
   */
  function restart({ countAttempt = true } = {}) {
    endAttempt();
    if (countAttempt) attempts += 1;
    distance = 0;
    machineDistance = 0;
    lastProgress = 0;
    passed = new Set();
    ended = false;
  }

  return {
    observe,
    restart,
    get attempts() { return attempts; },
    get best() { return best; },
    get distance() { return distance; },
    get passed() { return passed.size; },
    get machineDistance() { return machineDistance; },
    get ended() { return ended; },
    /** Misiones con su progreso en el intento actual (acotado a la meta) y si están cumplidas. */
    get missions() {
      return MISSIONS.map((m) => ({ ...m, progress: Math.min(progressOf(m), m.goal), done: completed.has(m.id) }));
    },
  };
}

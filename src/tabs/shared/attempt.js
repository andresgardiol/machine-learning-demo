// Seguimiento de un intento, compartido por las pestañas 1 y 2 (design.md D5), sin DOM: distancia,
// vehículos superados, cantidad de intentos y mejor distancia.
//
// El intento observa el mundo después de cada paso (`observe`) y se reinicia con `restart`. Un
// choque termina el intento: desde ahí no cuenta nada hasta reiniciar.
import { CAR_LENGTH } from '../../core/constants.js';

/** Radio (m) alrededor del auto en el que se buscan vehículos para contarlos como superados. */
export const PASS_WINDOW = 80;

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

export function createAttempt() {
  let attempts = 1;
  let best = 0;
  let distance = 0;
  let passed = new Set();
  let ended = false; // el intento terminó por choque

  const endAttempt = () => { best = Math.max(best, distance); };

  return {
    /**
     * Actualiza distancia y vehículos superados con el estado actual del mundo.
     * @param {{progress:number, crashed:boolean, vehiclesIn:(from:number,to:number)=>{id:string,distance:number}[]}} world
     */
    observe(world) {
      if (ended) return;
      const progress = world.progress;
      distance = Math.max(0, progress);
      for (const v of world.vehiclesIn(progress - PASS_WINDOW, progress + PASS_WINDOW)) {
        const where = relativePosition(progress, v.distance);
        if (where === 'behind') passed.add(v.id);
        else if (where === 'ahead') passed.delete(v.id);
      }
      if (world.crashed) {
        ended = true;
        endAttempt();
      }
    },
    /**
     * Empieza un intento nuevo: registra la mejor distancia y vuelve a cero lo que es del intento.
     * @param {{countAttempt?: boolean}} [options] countAttempt=false reinicia sin sumar un intento
     */
    restart({ countAttempt = true } = {}) {
      endAttempt();
      if (countAttempt) attempts += 1;
      distance = 0;
      passed = new Set();
      ended = false;
    },
    get attempts() { return attempts; },
    /** Mejor distancia de los intentos terminados (por choque o por reinicio). */
    get best() { return best; },
    get distance() { return distance; },
    get passed() { return passed.size; },
    get ended() { return ended; },
  };
}

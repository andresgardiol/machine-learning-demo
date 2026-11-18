// Corte de generación (entrenar-la-generacion-ensena D3): al terminar una generación, con la guía activa y a 1× o
// 2×, la pestaña espera unos 2 s de reloj antes de seguir llamando a step(). Es solo de la interfaz: no toca el
// entrenamiento. Sin DOM, para probarlo en Node.
//
//   running --(fin de generación, guía y 1×/2×)--> cut --(2000 ms sin pausa | Siguiente | 4× o más)--> running
//   En el corte, la pausa congela el tiempo: el corte sigue a la vista hasta reanudar.

/** Duración del corte, en milisegundos de reloj. */
export const CUT_MS = 2000;

/** Velocidades con corte: las lentas, donde se puede leer lo que pasó. */
export const CUT_SPEEDS = Object.freeze([1, 2]);

/** ¿Hay corte con esta guía y esta velocidad? */
export const cutApplies = ({ guide, speed }) => Boolean(guide) && CUT_SPEEDS.includes(speed);

/**
 * @param {{duration?: number}} [spec]
 * @returns {{readonly active: boolean, readonly remaining: number,
 *   enter(now: number, ctx: {guide: boolean, speed: number|string, paused?: boolean}): boolean,
 *   tick(now: number): boolean, pause(now: number): void, resume(now: number): void,
 *   next(): boolean, speedChanged(speed: number|string): boolean, end(): boolean}}
 *   tick devuelve true cuando el corte acaba de terminar; next, speedChanged y end, si terminaron uno.
 */
export function createCut({ duration = CUT_MS } = {}) {
  let active = false;
  let elapsed = 0; // tiempo corrido antes de la última pausa
  let since = null; // desde cuándo corre el tiempo (null: en pausa)

  const finish = () => { if (!active) return false; active = false; elapsed = 0; since = null; return true; };
  const spent = (now) => elapsed + (since === null ? 0 : now - since);

  return {
    get active() { return active; },
    /** Lo que falta, en ms, a la hora `now` (o, sin hora, al congelarse). */
    remainingAt(now) { return active ? Math.max(0, duration - spent(now)) : 0; },
    get remaining() { return active ? Math.max(0, duration - elapsed) : 0; },
    /** Al terminar una generación: entra en el corte si corresponde. */
    enter(now, { guide, speed, paused = false }) {
      if (!cutApplies({ guide, speed })) { finish(); return false; }
      active = true;
      elapsed = 0;
      since = paused ? null : now;
      return true;
    },
    /** En cada cuadro: termina el corte si se cumplió el tiempo. */
    tick(now) {
      if (!active || since === null) return false;
      if (spent(now) >= duration) return finish();
      return false;
    },
    pause(now) { if (active && since !== null) { elapsed += now - since; since = null; } },
    resume(now) { if (active && since === null) since = now; },
    /** Siguiente generación durante el corte: termina el corte (y no la generación nueva). */
    next() { return finish(); },
    /** Cambiar la velocidad a una sin corte lo termina. */
    speedChanged(speed) { return CUT_SPEEDS.includes(speed) ? false : finish(); },
    /** Termina el corte por otra razón (guía apagada, reinicio, la pestaña se oculta). */
    end() { return finish(); },
  };
}

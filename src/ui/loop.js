// Bucle de paso fijo (design.md D2). Acumula el tiempo real transcurrido, ejecuta los
// pasos de simulación que correspondan (como máximo 5 por cuadro, descartando el resto)
// y dibuja una vez. Se detiene mientras la página está oculta y, al volver, no salta.
//
// Velocidades (design.md D10): con un factor fijo (1, 2, 4 u 8) el acumulador recibe el tiempo
// transcurrido multiplicado por el factor y el tope de pasos por cuadro se multiplica igual; con
// 'max' se ejecutan pasos hasta agotar un presupuesto de tiempo por cuadro (al menos uno). El mismo
// presupuesto limita los factores fijos: en un equipo lento la velocidad 8 se degrada en vez de
// trabar la página. Los pasos son los mismos a cualquier velocidad; solo cambia cuántos por cuadro.
import { STEP } from '../core/constants.js';

export const MAX_STEPS_PER_FRAME = 5;
export const SPEEDS = Object.freeze([1, 2, 4, 8, 'max']);
export const FRAME_BUDGET_MS = 12;
const FACTOR_SMOOTHING = 0.2; // peso del cuadro nuevo en el promedio del factor logrado
const EPSILON = 1e-9;

/** Velocidad válida: 1, 2, 4, 8 o 'max'; cualquier otra cosa es 1. */
export const speedOf = (value) => (SPEEDS.includes(value) ? value : 1);

/** Acumulador puro: convierte tiempo real en una cantidad entera de pasos fijos. */
export function createStepper({ stepSeconds = STEP, maxSteps = MAX_STEPS_PER_FRAME } = {}) {
  let accumulator = 0;
  return {
    /** Suma `elapsed` segundos y devuelve cuántos pasos ejecutar ahora. */
    advance(elapsed) {
      accumulator += Math.max(0, Number(elapsed) || 0);
      let steps = Math.floor(accumulator / stepSeconds + EPSILON);
      if (steps > maxSteps) {
        steps = maxSteps;
        accumulator = 0; // se descarta el atraso para no entrar en la espiral de retraso
      } else {
        accumulator = Math.max(0, accumulator - steps * stepSeconds);
      }
      return steps;
    },
    reset() { accumulator = 0; },
    get accumulator() { return accumulator; },
  };
}

/**
 * Bucle de animación.
 * @param {object} spec
 * @param {() => void} spec.step un paso de simulación
 * @param {() => void} spec.render dibuja una vez por cuadro
 * @param {(err) => void} [spec.onError] protección del bucle: ante una falla se detiene y avisa
 * @param {(cb) => number} [spec.requestFrame]
 * @param {(id) => void} [spec.cancelFrame]
 * @param {Document|EventTarget} [spec.doc] fuente de `hidden` y `visibilitychange`
 * @param {() => number} [spec.now] reloj en milisegundos para el presupuesto por cuadro
 * @param {number} [spec.budgetMs] presupuesto de tiempo de simulación por cuadro (ms)
 * @param {1|2|4|8|'max'} [spec.speed] velocidad inicial
 */
export function createLoop({
  step, render, onError = (err) => { throw err; },
  stepSeconds = STEP, maxSteps = MAX_STEPS_PER_FRAME,
  requestFrame = (cb) => globalThis.requestAnimationFrame(cb),
  cancelFrame = (id) => globalThis.cancelAnimationFrame(id),
  doc = globalThis.document,
  now = () => globalThis.performance.now(),
  budgetMs = FRAME_BUDGET_MS,
  speed: initialSpeed = 1,
}) {
  let speed = speedOf(initialSpeed);
  const stepperFor = (s) => createStepper({ stepSeconds, maxSteps: maxSteps * (s === 'max' ? 1 : s) });
  let stepper = stepperFor(speed);
  let running = false;
  let frameId = null;
  let last = null; // marca de tiempo del cuadro anterior (ms)
  let totalSteps = 0;
  let achieved = null; // factor logrado: tiempo simulado sobre tiempo real, suavizado

  /** Ejecuta hasta `n` pasos sin pasar del presupuesto (siempre al menos uno si n > 0). */
  function runSteps(n) {
    const start = now();
    let done = 0;
    while (done < n) {
      step();
      done += 1;
      if (now() - start >= budgetMs) break;
    }
    return done;
  }

  function frame(timestamp) {
    frameId = null;
    if (!running) return;
    try {
      const elapsed = last === null ? 0 : (timestamp - last) / 1000;
      last = timestamp;
      const n = speed === 'max' ? Infinity : stepper.advance(elapsed * speed);
      const done = runSteps(n);
      totalSteps += done;
      if (elapsed > 0) {
        const factor = (done * stepSeconds) / elapsed;
        achieved = achieved === null ? factor : achieved + (factor - achieved) * FACTOR_SMOOTHING;
      }
      render();
    } catch (err) {
      stop();
      onError(err);
      return;
    }
    schedule();
  }

  function schedule() {
    if (running && frameId === null && !doc?.hidden) frameId = requestFrame(frame);
  }

  function start() {
    if (running) return;
    running = true;
    last = null;
    stepper.reset();
    achieved = null;
    schedule();
  }

  /** Cambia la velocidad: 1, 2, 4, 8 o 'max'. El estado de la simulación no cambia. */
  function setSpeed(value) {
    const next = speedOf(value);
    if (next === speed) return;
    speed = next;
    stepper = stepperFor(speed);
    achieved = null;
  }

  function stop() {
    running = false;
    if (frameId !== null) cancelFrame(frameId);
    frameId = null;
  }

  // Página oculta: no se piden cuadros. Al volver, el tiempo oculto no cuenta.
  function onVisibility() {
    if (doc.hidden) {
      if (frameId !== null) cancelFrame(frameId);
      frameId = null;
    } else {
      last = null;
      stepper.reset();
      achieved = null;
      schedule();
    }
  }
  doc?.addEventListener?.('visibilitychange', onVisibility);

  return {
    start,
    stop,
    setSpeed,
    get speed() { return speed; },
    /** Veces la velocidad real que se está logrando (suavizado); null hasta medir un cuadro. */
    get achievedFactor() { return achieved; },
    dispose() {
      stop();
      doc?.removeEventListener?.('visibilitychange', onVisibility);
    },
    get running() { return running; },
    get totalSteps() { return totalSteps; },
  };
}

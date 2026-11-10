// Bucle de paso fijo (design.md D2). Acumula el tiempo real transcurrido, ejecuta los
// pasos de simulación que correspondan (como máximo 5 por cuadro, descartando el resto)
// y dibuja una vez. Se detiene mientras la página está oculta y, al volver, no salta.
import { STEP } from '../core/constants.js';

export const MAX_STEPS_PER_FRAME = 5;
const EPSILON = 1e-9;

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
 */
export function createLoop({
  step, render, onError = (err) => { throw err; },
  stepSeconds = STEP, maxSteps = MAX_STEPS_PER_FRAME,
  requestFrame = (cb) => globalThis.requestAnimationFrame(cb),
  cancelFrame = (id) => globalThis.cancelAnimationFrame(id),
  doc = globalThis.document,
}) {
  const stepper = createStepper({ stepSeconds, maxSteps });
  let running = false;
  let frameId = null;
  let last = null; // marca de tiempo del cuadro anterior (ms)
  let totalSteps = 0;

  function frame(timestamp) {
    frameId = null;
    if (!running) return;
    try {
      const elapsed = last === null ? 0 : (timestamp - last) / 1000;
      last = timestamp;
      const n = stepper.advance(elapsed);
      for (let i = 0; i < n; i++) step();
      totalSteps += n;
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
    schedule();
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
      schedule();
    }
  }
  doc?.addEventListener?.('visibilitychange', onVisibility);

  return {
    start,
    stop,
    dispose() {
      stop();
      doc?.removeEventListener?.('visibilitychange', onVisibility);
    },
    get running() { return running; },
    get totalSteps() { return totalSteps; },
  };
}

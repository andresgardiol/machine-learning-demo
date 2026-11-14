// Reproducción del Laboratorio (pestana-laboratorio, design.md D11), sin DOM: la barra de
// Inspeccionar con otros tamaños (Época | Ejemplo | Fase | Capa | Neurona) y otros ritmos. Un solo
// estado: reproduciendo o en pausa. El bucle llama a `tick()` en cada paso fijo de 1/60 s.
import { LEARNING_STEP_SIZES } from '../../core/learning-cursor.js';
import { STEP } from '../../core/constants.js';
import { DEFAULT_EPOCH_RATE } from './defaults.js';

/** Ritmos posibles (pasos por segundo) de cada clase de tamaño. */
export const PACES = Object.freeze({
  epoch: Object.freeze([1, 2, 5, 10, 20, 30, 60]),
  example: Object.freeze([1, 2, 5, 10, 20, 50, 100, 200]),
  step: Object.freeze([1, 2, 5, 10, 20]),
});
/** Clase de ritmo de un tamaño: las épocas y los ejemplos tienen el suyo; fases, capas y neuronas, uno común. */
export const paceKind = (size) => (size === 'epoch' || size === 'example' ? size : 'step');
export const DEFAULT_PACES = Object.freeze({ epoch: PACES.epoch.indexOf(DEFAULT_EPOCH_RATE), example: PACES.example.indexOf(20), step: PACES.step.indexOf(2) });

/** ¿El tamaño es de corrido (de a épocas o ejemplos: sin operación en curso ni animación de paso)? */
export const isRunning = (size) => size === 'epoch' || size === 'example';

export function createLabPlayback(initial = {}) {
  let size = LEARNING_STEP_SIZES.includes(initial.size) ? initial.size : 'epoch';
  const pace = { ...DEFAULT_PACES, ...(initial.pace ?? {}) };
  let playing = initial.playing ?? true;
  let acc = 0;
  const list = () => PACES[paceKind(size)];

  const playback = {
    get size() { return size; },
    get playing() { return playing; },
    get pace() { return { ...pace }; },
    get paceIndex() { return pace[paceKind(size)]; },
    get paceCount() { return list().length; },
    get kind() { return paceKind(size); },
    /** Pasos del tamaño actual por segundo. */
    get rate() { return list()[pace[paceKind(size)]]; },
    get intervalMs() { return 1000 / playback.rate; },
    setSize(next) {
      if (!LEARNING_STEP_SIZES.includes(next) || next === size) return false;
      size = next;
      acc = 0;
      return true;
    },
    setPace(index) {
      const kind = paceKind(size);
      const i = Math.max(0, Math.min(PACES[kind].length - 1, Math.round(index)));
      if (i === pace[kind]) return false;
      pace[kind] = i;
      acc = 0;
      return true;
    },
    play() { if (playing) return false; playing = true; acc = 0; return true; },
    pause() { if (!playing) return false; playing = false; acc = 0; return true; },
    /** Cuántos pasos del tamaño actual dar en este paso fijo (0 en pausa). */
    tick() {
      if (!playing) return 0;
      acc += playback.rate * STEP;
      const n = Math.floor(acc + 1e-9);
      acc -= n;
      return n;
    },
  };
  return playback;
}

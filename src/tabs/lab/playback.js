// Reproducción del Laboratorio (pestana-laboratorio, design.md D11), sin DOM: la barra de
// Inspeccionar con otros tamaños (Época | Ejemplo | Fase | Capa | Neurona) y otros ritmos. Un solo
// estado: reproduciendo o en pausa. El bucle llama a `tick()` en cada paso fijo de 1/60 s.
//
// Arranca en pausa (laboratorio-empieza-por-compuertas D4): nada aprende hasta que la persona
// reproduce o da un paso. Cada clase de datos tiene su paso y su ritmo por defecto (KIND_DEFAULTS):
// con compuertas, de a neurona a 1 por segundo; con puntos y tu manejo, de a épocas a 10 por segundo.
import { LEARNING_STEP_SIZES } from '../../core/learning-cursor.js';
import { STEP } from '../../core/constants.js';
import { DEFAULT_EPOCH_RATE, KIND_DEFAULTS } from './defaults.js';

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

/** Paso y ritmos con que arranca la barra para una clase de datos: { size, pace }. */
export function kindPlayback(kind) {
  const d = KIND_DEFAULTS[kind] ?? KIND_DEFAULTS.points;
  const pace = { ...DEFAULT_PACES };
  const i = PACES[paceKind(d.size)].indexOf(d.pace);
  if (i >= 0) pace[paceKind(d.size)] = i;
  return { size: d.size, pace };
}

export function createLabPlayback(initial = {}) {
  let size = LEARNING_STEP_SIZES.includes(initial.size) ? initial.size : 'epoch';
  const pace = { ...DEFAULT_PACES, ...(initial.pace ?? {}) };
  let playing = initial.playing ?? false;
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
    /** El paso y los ritmos de ahora (para guardarlos con la clase de datos). */
    get config() { return { size, pace: { ...pace } }; },
    /** Otro paso y otros ritmos (los de otra clase de datos); reproducir o pausar no cambia. */
    apply(config) {
      if (LEARNING_STEP_SIZES.includes(config?.size)) size = config.size;
      Object.assign(pace, config?.pace ?? {});
      acc = 0;
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

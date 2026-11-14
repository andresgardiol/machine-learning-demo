// Reproducción de Inspeccionar (pestana-inspeccionar, design.md D7), sin DOM: un solo estado
// (reproduciendo o en pausa), de a cuánto avanza cada paso y a qué ritmo.
//
// El bucle de la app (ui/loop.js) llama a `tick()` en cada paso fijo de 1/60 s. De a cuadros a tiempo
// real, cada llamada es un cuadro del mundo: idéntico a como corren las otras pestañas. Con un ritmo
// menor, el tiempo se acumula sin cambiar el paso fijo de la simulación.
import { STEP_SIZES } from '../../core/pass-cursor.js';
import { STEP } from '../../core/constants.js';

/** Ritmos de a cuadros, de más lento a más rápido: fracción del tiempo real. El último es tiempo real. */
export const FRAME_PACES = Object.freeze([
  Object.freeze({ id: 'perSecond1', factor: 1 / 60 }),
  Object.freeze({ id: 'perSecond2', factor: 2 / 60 }),
  Object.freeze({ id: 'tenth', factor: 1 / 10 }),
  Object.freeze({ id: 'quarter', factor: 1 / 4 }),
  Object.freeze({ id: 'half', factor: 1 / 2 }),
  Object.freeze({ id: 'realTime', factor: 1 }),
]);

/** Ritmos de a capas, neuronas u operaciones: pasos por segundo. */
export const STEP_PACES = Object.freeze([1, 2, 5, 10, 20]);

export const DEFAULT_PACE = Object.freeze({ frame: FRAME_PACES.length - 1, other: STEP_PACES.indexOf(5) });

/** ¿El tamaño es de a cuadros? (el ritmo se recuerda aparte para "cuadro" y para los demás) */
const paceKind = (size) => (size === 'frame' ? 'frame' : 'other');

/**
 * @param {{size?:string, pace?:{frame:number, other:number}, playing?:boolean}} [initial]
 */
export function createPlayback(initial = {}) {
  let size = STEP_SIZES.includes(initial.size) ? initial.size : 'frame';
  const pace = { ...DEFAULT_PACE, ...(initial.pace ?? {}) };
  let playing = initial.playing ?? true;
  let acc = 0;

  const clampIndex = (kind, i) => Math.max(0, Math.min((kind === 'frame' ? FRAME_PACES : STEP_PACES).length - 1, Math.round(i)));

  const playback = {
    get size() { return size; },
    get playing() { return playing; },
    get pace() { return { ...pace }; },
    /** Índice del ritmo para el tamaño actual. */
    get paceIndex() { return pace[paceKind(size)]; },
    /** Cantidad de ritmos posibles para el tamaño actual. */
    get paceCount() { return (size === 'frame' ? FRAME_PACES : STEP_PACES).length; },
    /** ¿Corre de a cuadros a tiempo real? (sin animaciones de paso ni operación en curso) */
    get realTime() { return size === 'frame' && pace.frame === FRAME_PACES.length - 1; },
    /** Pasos (del tamaño actual) por segundo al reproducir. */
    get rate() { return size === 'frame' ? FRAME_PACES[pace.frame].factor / STEP : STEP_PACES[pace.other]; },
    /** Intervalo entre dos pasos al reproducir (ms). */
    get intervalMs() { return 1000 / playback.rate; },
    setSize(next) {
      if (!STEP_SIZES.includes(next) || next === size) return false;
      size = next;
      acc = 0;
      return true;
    },
    setPace(index) {
      const kind = paceKind(size);
      const i = clampIndex(kind, index);
      if (i === pace[kind]) return false;
      pace[kind] = i;
      acc = 0;
      return true;
    },
    play() { if (playing) return false; playing = true; acc = 0; return true; },
    pause() { if (!playing) return false; playing = false; acc = 0; return true; },
    /** Un paso fijo de 1/60 s: cuántos pasos del tamaño actual hay que dar ahora (0 en pausa). */
    tick() {
      if (!playing) return 0;
      if (playback.realTime) return 1;
      acc += playback.rate * STEP;
      const n = Math.floor(acc + 1e-9);
      acc -= n;
      return n;
    },
  };
  return playback;
}

// Cuenta regresiva al largar con "Vos" (pestana-competir D5), sin DOM: 3, 2, 1 de un segundo de reloj
// cada uno; después arranca la carrera y un "¡Ya!" queda medio segundo a la vista sin frenar nada.
// Es de la pestaña, no del núcleo: mientras cuenta, la carrera no avanza pasos.

/** Números de la cuenta y cuánto dura cada uno (s). */
export const COUNTDOWN_FROM = 3;
export const COUNTDOWN_STEP = 1;
/** Cuánto queda a la vista el "¡Ya!" después de largar (s). */
export const GO_SECONDS = 0.5;

/**
 * @returns {{start:(now:number)=>void, cancel:()=>void, at:(now:number)=>{state:'idle'|'counting'|'go'|'done', number:number|null}, running:boolean}}
 *   `now` en segundos de reloj. `at` dice qué mostrar: el número que corre, el "¡Ya!" o nada.
 */
export function createCountdown({ from = COUNTDOWN_FROM, step = COUNTDOWN_STEP, go = GO_SECONDS } = {}) {
  let startedAt = null;
  return {
    start(now) { startedAt = now; },
    cancel() { startedAt = null; },
    at(now) {
      if (startedAt === null) return { state: 'idle', number: null };
      const t = now - startedAt;
      const total = from * step;
      if (t < total) return { state: 'counting', number: from - Math.floor(t / step) };
      if (t < total + go) return { state: 'go', number: null };
      return { state: 'done', number: null };
    },
    get running() { return startedAt !== null; },
  };
}

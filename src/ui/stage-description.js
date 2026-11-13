// Descripción en texto del escenario (panel-de-entrenar-por-vistas D9, WCAG 1.1.1): un texto oculto a
// la vista al que apunta el escenario con aria-describedby. Dice qué pista se ve, en qué estado está lo
// que pasa y el dato principal de la pestaña. No es una región viva: se lee al llegar al escenario y
// no interrumpe. Se reescribe como mucho una vez por segundo, y solo cuando cambia.
//
// La regla de cuándo escribir (createThrottledText) no usa el DOM y se prueba en Node.
import { el } from './dom.js';

export const DESCRIPTION_INTERVAL_MS = 1000;

/**
 * Texto que se escribe como mucho una vez cada `interval` ms y solo si cambió. Un texto nuevo que
 * llega antes de tiempo queda pendiente: se escribe en la primera llamada después del intervalo o,
 * si hay `schedule`, cuando se cumple.
 * @param {{write:(text:string)=>void, clock:()=>number, interval?:number, schedule?:(fn:Function, ms:number)=>any, cancel?:(id:any)=>void}} spec
 */
export function createThrottledText({ write, clock, interval = DESCRIPTION_INTERVAL_MS, schedule = null, cancel = null }) {
  let written = null;
  let lastWrite = -Infinity;
  let pending = null;
  let timer = null;

  function flush() {
    timer = null;
    if (pending === null || pending === written) { pending = null; return false; }
    written = pending;
    pending = null;
    lastWrite = clock();
    write(written);
    return true;
  }

  return {
    /** Propone un texto; devuelve true si lo escribió ahora. */
    push(text) {
      if (text === written) { pending = null; return false; }
      pending = text;
      const wait = lastWrite + interval - clock();
      if (wait <= 0) {
        if (timer !== null) { cancel?.(timer); timer = null; }
        return flush();
      }
      if (schedule && timer === null) timer = schedule(flush, wait);
      return false;
    },
    get text() { return written; },
    dispose() { if (timer !== null) cancel?.(timer); timer = null; pending = null; },
  };
}

/**
 * Descripción oculta dentro del escenario, con aria-describedby desde el escenario.
 * @param {{stage:HTMLElement, id?:string}} spec
 * @returns {{set:(text:string)=>void, node:HTMLElement, dispose:()=>void}}
 */
export function stageDescription({ stage, id = 'stage-description' }) {
  const node = el('p', { class: 'sr-only', attrs: { id } });
  stage.append(node);
  stage.setAttribute('aria-describedby', id);
  const text = createThrottledText({
    write: (t) => { node.textContent = t; },
    clock: () => performance.now(),
    schedule: (fn, ms) => setTimeout(fn, ms),
    cancel: (timer) => clearTimeout(timer),
  });
  return {
    node,
    set: (t) => text.push(t),
    dispose() {
      text.dispose();
      node.remove();
      if (stage.getAttribute('aria-describedby') === id) stage.removeAttribute('aria-describedby');
    },
  };
}

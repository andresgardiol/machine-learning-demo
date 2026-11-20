// Espera del intento en El problema (bienvenida-y-primer-manejo D2), sin DOM: el auto, el tráfico y el
// reloj quedan quietos hasta la primera tecla de manejo del intento. La espera vive en la pestaña, no en
// el núcleo: mientras el intento no arrancó, no se llama a world.step().
import { KEY_BINDINGS, keyAllowed, isTypingTarget, ownsArrowKeys, insideDialog } from '../../input/keyboard.js';

/**
 * ¿Esta tecla arranca el intento? Sí, si es de manejo (flechas o W A S D), sin modificadores, con los
 * atajos que la permiten, y no se está escribiendo, ajustando un deslizador ni dentro de un diálogo.
 * Es el mismo criterio con que el teclado maneja el auto y con que se apaga el cartel de primer manejo.
 * @param {{code:string, target?:any, ctrlKey?:boolean, metaKey?:boolean, altKey?:boolean}} e
 */
export function startsAttempt(e) {
  if (!KEY_BINDINGS[e.code] || e.ctrlKey || e.metaKey || e.altKey) return false;
  if (!keyAllowed(e.code)) return false;
  return !isTypingTarget(e.target) && !ownsArrowKeys(e.target) && !insideDialog(e.target);
}

/**
 * Compuerta del intento: `advance(world)` avanza el mundo un paso solo si el intento arrancó.
 * `start()` lo arranca (con la primera tecla de manejo) y `reset()` vuelve a la espera (al reiniciar,
 * con tráfico nuevo o al rearmar el escenario).
 */
export function createAttemptGate() {
  let started = false;
  return {
    get started() { return started; },
    start() { started = true; },
    reset() { started = false; },
    /** @returns {boolean} si el mundo avanzó un paso (en pausa, el mundo no avanza aunque el intento haya arrancado) */
    advance(world) {
      if (!started) return false;
      const before = world.steps;
      world.step();
      return world.steps !== before;
    },
  };
}

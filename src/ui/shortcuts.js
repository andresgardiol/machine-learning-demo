// Protección común de los atajos de teclado de las pestañas.
//
// Riesgo de design.md: la barra espaciadora también activa el botón que tiene el foco. Por eso
// los atajos se ignoran cuando el foco está en un control alcanzado con el teclado (:focus-visible),
// cuando se escribe en un campo y dentro de diálogos y confirmaciones; las pestañas devuelven el
// foco al escenario después de cada clic con el mouse.
import { isTypingTarget } from '../input/keyboard.js';

const CONTROL_SELECTOR = 'button, a[href], input, select, textarea, summary, [role="button"], [role="switch"], [role="tab"], [role="separator"]';

/**
 * ¿El objetivo es un control enfocado con el teclado? Los controles marcados con
 * data-shortcuts="pass" (los títulos de las tarjetas del tablero) dejan pasar los atajos: con el
 * foco en ellos, la barra espaciadora pausa en lugar de plegar la tarjeta.
 */
export function isKeyboardFocusedControl(target) {
  if (!target || typeof target.matches !== 'function') return false;
  try {
    if (typeof target.getAttribute === 'function' && target.getAttribute('data-shortcuts') === 'pass') return false;
    return target.matches(CONTROL_SELECTOR) && target.matches(':focus-visible');
  } catch {
    return false;
  }
}

/**
 * Acción del atajo que corresponde a un evento de teclado según `map` (código de tecla → acción),
 * o null si no hay que atenderlo.
 */
export function shortcutFrom(map, e) {
  const action = map[e.code];
  if (!action || e.ctrlKey || e.metaKey || e.altKey) return null;
  if (isTypingTarget(e.target)) return null;
  if (isKeyboardFocusedControl(e.target)) return null;
  if (typeof e.target?.closest === 'function' && e.target.closest('dialog, [role="alertdialog"]')) return null;
  return action;
}

/**
 * ¿Un clic con el mouse en `target` devuelve el foco al escenario? Sí en los controles (botones,
 * interruptores, deslizadores, títulos plegables y enlaces), para que los atajos sigan funcionando;
 * no en un campo donde se escribe ni en el rótulo de uno, que se quedan con el foco hasta que la
 * persona sale de ellos; tampoco en un control marcado con data-focus="keep".
 */
export function returnsFocusToStage(target) {
  const control = typeof target?.closest === 'function' ? target.closest('button, input, summary, a, label') : null;
  if (!control) return false;
  // Un control que lleva el foco a otro lugar a propósito (por ejemplo, "Renombrar" en el mensaje de
  // guardado, que pasa al campo del nombre) se marca con data-focus="keep".
  if (typeof control.getAttribute === 'function' && control.getAttribute('data-focus') === 'keep') return false;
  const tag = String(control.tagName ?? '').toUpperCase();
  const field = tag === 'LABEL' ? (control.control ?? control.querySelector?.('input, textarea, select') ?? null) : control;
  return !(field && isTypingTarget(field));
}

// Atajos de la pestaña 1 (R reinicia, barra espaciadora pausa), sin DOM propio.
//
// Riesgo de design.md: la barra espaciadora también activa el botón que tiene el foco. Por eso
// los atajos se ignoran cuando el foco está en un control alcanzado con el teclado (:focus-visible),
// y la pestaña devuelve el foco al escenario después de cada clic con el mouse.
import { isTypingTarget } from '../../input/keyboard.js';

export const SHORTCUTS = Object.freeze({ KeyR: 'restart', Space: 'pause' });

const CONTROL_SELECTOR = 'button, a[href], input, select, textarea, summary, [role="button"], [role="switch"], [role="tab"], [role="separator"]';

/** ¿El objetivo es un control enfocado con el teclado? */
export function isKeyboardFocusedControl(target) {
  if (!target || typeof target.matches !== 'function') return false;
  try {
    return target.matches(CONTROL_SELECTOR) && target.matches(':focus-visible');
  } catch {
    return false;
  }
}

/**
 * Acción del atajo que corresponde a un evento de teclado, o null si no hay que atenderlo.
 * @param {{code:string, target?:any, ctrlKey?:boolean, metaKey?:boolean, altKey?:boolean}} e
 * @returns {'restart'|'pause'|null}
 */
export function shortcutFor(e) {
  const action = SHORTCUTS[e.code];
  if (!action || e.ctrlKey || e.metaKey || e.altKey) return null;
  if (isTypingTarget(e.target)) return null;
  if (isKeyboardFocusedControl(e.target)) return null;
  if (typeof e.target?.closest === 'function' && e.target.closest('dialog, [role="alertdialog"]')) return null;
  return action;
}

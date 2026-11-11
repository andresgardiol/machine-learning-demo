// Protección común de los atajos de teclado de las pestañas.
//
// Riesgo de design.md: la barra espaciadora también activa el botón que tiene el foco. Por eso
// los atajos se ignoran cuando el foco está en un control alcanzado con el teclado (:focus-visible),
// cuando se escribe en un campo y dentro de diálogos y confirmaciones; las pestañas devuelven el
// foco al escenario después de cada clic con el mouse.
import { isTypingTarget } from '../input/keyboard.js';

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

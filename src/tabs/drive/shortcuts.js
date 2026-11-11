// Atajos de la pestaña 1 (R reinicia, barra espaciadora pausa), sin DOM propio. La protección
// común (campos de texto, controles enfocados con el teclado, diálogos) vive en ui/shortcuts.js.
import { isKeyboardFocusedControl, shortcutFrom } from '../../ui/shortcuts.js';

export { isKeyboardFocusedControl };

export const SHORTCUTS = Object.freeze({ KeyR: 'restart', Space: 'pause' });

/**
 * Acción del atajo que corresponde a un evento de teclado, o null si no hay que atenderlo.
 * @param {{code:string, target?:any, ctrlKey?:boolean, metaKey?:boolean, altKey?:boolean}} e
 * @returns {'restart'|'pause'|null}
 */
export function shortcutFor(e) {
  return shortcutFrom(SHORTCUTS, e);
}

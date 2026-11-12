// Atajos de la pestaña Reglas a mano (R reinicia, barra espaciadora pausa), los mismos que en la
// pestaña 1. La protección común vive en ui/shortcuts.js: con el foco en el editor (un campo de
// texto) los atajos no se accionan y la tecla escribe.
import { shortcutFrom } from '../../ui/shortcuts.js';

export const SHORTCUTS = Object.freeze({ KeyR: 'restart', Space: 'pause' });

/**
 * Acción del atajo que corresponde a un evento de teclado, o null si no hay que atenderlo.
 * @param {{code:string, target?:any, ctrlKey?:boolean, metaKey?:boolean, altKey?:boolean}} e
 * @returns {'restart'|'pause'|null}
 */
export function shortcutFor(e) {
  return shortcutFrom(SHORTCUTS, e);
}

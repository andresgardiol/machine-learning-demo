// Atajos de la pestaña 3, sin DOM propio: barra espaciadora pausa, T alterna entre la velocidad
// normal y la máxima, N pasa a la siguiente generación. Con selección manual, E elige al líder como
// padre y Z deshace la última elección (la pestaña los atiende solo en ese modo).
import { shortcutFrom } from '../../ui/shortcuts.js';

export const SHORTCUTS = Object.freeze({ Space: 'pause', KeyT: 'turbo', KeyN: 'next', KeyE: 'choose', KeyZ: 'undo' });

/**
 * Acción del atajo que corresponde a un evento de teclado, o null si no hay que atenderlo.
 * @returns {'pause'|'turbo'|'next'|'choose'|'undo'|null}
 */
export function shortcutFor(e) {
  return shortcutFrom(SHORTCUTS, e);
}

/** Velocidad después de presionar T: de la máxima a la normal; de cualquier otra, a la máxima. */
export const toggleTurbo = (speed) => (speed === 'max' ? 1 : 'max');

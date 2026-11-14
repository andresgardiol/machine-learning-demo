// Atajos del Laboratorio (pestana-laboratorio, design.md D12): los de siempre, con el mismo
// significado. Espacio reproduce o pausa, N da un paso, R reinicia (acá, los pesos) y V restablece la
// vista de la red. Grabando, las flechas manejan y espacio no reproduce (lo decide la pestaña). La
// protección común (campos de texto, interruptor de atajos) vive en ui/shortcuts.js.
import { shortcutFrom } from '../../ui/shortcuts.js';

export const SHORTCUTS = Object.freeze({ Space: 'play', KeyN: 'step', KeyR: 'restart', KeyV: 'view' });

/**
 * @param {KeyboardEvent} e
 * @param {{recording?: boolean}} [state]
 * @returns {'play'|'step'|'restart'|'view'|null}
 */
export function shortcutFor(e, { recording = false } = {}) {
  if (recording) return null; // grabando, las teclas son del auto
  return shortcutFrom(SHORTCUTS, e);
}

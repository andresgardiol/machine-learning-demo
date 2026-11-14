// Atajos de Inspeccionar (pestana-inspeccionar, design.md D13), sin DOM propio: los mismos que en las
// demás pestañas, con el mismo significado. Espacio reproduce o pausa, N da un paso, R reinicia el
// intento y V restablece la vista, acá la de la red. La protección común (campos de texto, controles
// enfocados con el teclado, diálogos, interruptor de atajos) vive en ui/shortcuts.js.
import { shortcutFrom } from '../../ui/shortcuts.js';

export const SHORTCUTS = Object.freeze({ Space: 'play', KeyN: 'step', KeyR: 'restart', KeyV: 'view' });

/** @returns {'play'|'step'|'restart'|'view'|null} */
export const shortcutFor = (e) => shortcutFrom(SHORTCUTS, e);

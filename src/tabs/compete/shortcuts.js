// Atajos de Competir (pestana-competir D14), sin DOM propio: barra espaciadora (largar, pausar o
// reanudar; con la carrera terminada, otra carrera), R reinicia y N otra carrera (D14).
// Los interruptores de sensores y de ver como la máquina no llevan atajo: la E ya es "elegir" en
// Entrenar y la V restablece la cámara en todas las pestañas. Respetan
// el interruptor "Atajos" y no actúan al escribir en un campo (ui/shortcuts.js). Las flechas manejan
// el auto de la persona y no son atajos: siguen andando con los atajos apagados.
import { shortcutFrom } from '../../ui/shortcuts.js';

export const SHORTCUTS = Object.freeze({ Space: 'main', KeyR: 'restart', KeyN: 'another' });

/** @returns {'main'|'restart'|'another'|null} */
export function shortcutFor(e) {
  return shortcutFrom(SHORTCUTS, e);
}

/**
 * Qué hace la acción principal (el botón principal y la barra espaciadora) según la fase:
 * esperando en la salida, larga; corriendo, pausa; en pausa, reanuda; terminada, otra carrera.
 * @param {'waiting'|'running'|'paused'|'finished'} phase
 */
export function mainAction(phase) {
  return { waiting: 'start', running: 'pause', paused: 'resume', finished: 'another' }[phase] ?? 'start';
}

// Quién maneja en Inspeccionar (manejar-vos-en-inspeccionar, design.md D2 y D3), sin DOM propio.
//
// Las flechas (y W A S D con los atajos encendidos) toman el volante solo con el foco en la escena,
// en ningún control (el cuerpo de la página, una zona) o en un botón común. Nunca con el foco en un
// control que usa las flechas por su cuenta: el diagrama y la tabla de la red (neuronas, pastilla,
// celdas), un deslizador o separador, un grupo de opciones, una lista o un diálogo, ni mientras se
// escribe en un campo.
import { KEY_BINDINGS, keyAllowed, isTypingTarget, ownsArrowKeys } from '../../input/keyboard.js';

export const DRIVERS = Object.freeze(['network', 'you']);

/** Zonas donde las flechas tienen otro uso. */
export const OWNS_ARROWS_SELECTOR = [
  '.inspect-area', // diagrama y tabla de la red: neuronas, pastilla, perillas, celdas
  'dialog', '[role="dialog"]', '[role="alertdialog"]',
  '[role="radiogroup"]', '[role="radio"]', '[role="listbox"]', '[role="option"]', '[role="grid"]',
  '[role="menu"]', '[role="menuitem"]', '[role="tablist"]', '[role="tab"]', '[role="tree"]',
  '[data-arrows="own"]',
].join(', ');

/** ¿La tecla es de manejar? Flechas siempre; W A S D solo con los atajos de una tecla encendidos. */
export function isDrivingKey(e) {
  if (!e || !KEY_BINDINGS[e.code] || e.ctrlKey || e.metaKey || e.altKey) return false;
  return keyAllowed(e.code);
}

/**
 * ¿Una tecla de manejar con el foco en `target` toma el volante (o, manejando, mueve el auto)?
 * @param {EventTarget|null} target el elemento con el foco (o el objetivo del evento)
 */
export function takesWheel(target) {
  if (!target || typeof target !== 'object') return true;
  const tag = String(target.tagName ?? '').toUpperCase();
  if (tag === 'BODY' || tag === 'HTML') return true;
  if (isTypingTarget(target) || ownsArrowKeys(target)) return false;
  if (typeof target.closest === 'function' && target.closest(OWNS_ARROWS_SELECTOR)) return false;
  return true;
}

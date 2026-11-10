// Contrato único de controlador.
//
//   controller.control(perception) -> { forward, reverse, left, right }
//
//   perception = { sensors: number[], speed: number }
//     sensors: lecturas de 0 a 1, de izquierda a derecha, una por rayo
//     speed:   velocidad entre -1 y 1 respecto de la máxima de avance
//
// Los cuatro controles son sí/no. Cualquier objeto que cumpla el contrato maneja un auto:
// una persona con el teclado, un programa o una red neuronal.
import { NO_CONTROLS } from './car.js';

export { NO_CONTROLS };

/** Controles como cuatro booleanos, completando lo que falte con "no accionado". */
export function normalizeControls(raw) {
  const c = raw ?? NO_CONTROLS;
  return { forward: Boolean(c.forward), reverse: Boolean(c.reverse), left: Boolean(c.left), right: Boolean(c.right) };
}

export const isController = (c) => c !== null && typeof c === 'object' && typeof c.control === 'function';

/** Controlador que devuelve siempre los mismos controles (por ejemplo, solo avanzar). */
export const constantController = (controls) => ({ control: () => normalizeControls(controls) });

/** Controlador inactivo: nunca acciona nada. */
export const idleController = constantController(NO_CONTROLS);

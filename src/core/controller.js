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

/**
 * Controlador con observador (controladores, "Controlador con observador"): maneja `driver` y
 * `observer` calcula su decisión con la misma percepción, sin mover el auto. Primero se llama al que
 * observa (por ejemplo la red, que guarda su cuenta) y después al que maneja; el auto recibe solo lo
 * del que maneja. Si los dos son el mismo, una sola llamada. `setDriver` cambia quién maneja desde el
 * cuadro siguiente, sin rearmar el mundo.
 *
 *   createObservedController({ driver, observer })
 *     .control(perception) → controles del que maneja
 *     .driven / .observed  → los controles del último cuadro, de cada uno (null antes del primero)
 *     .perception          → la última percepción recibida
 *     .driver / .observer / .setDriver(c)
 * @param {{driver: object, observer: object}} spec
 */
export function createObservedController({ driver, observer }) {
  if (!isController(driver) || !isController(observer)) throw new TypeError('createObservedController: driver y observer deben ser controladores');
  let current = driver;
  const observed = {
    driven: null,
    observed: null,
    perception: null,
    get driver() { return current; },
    get observer() { return observer; },
    /** ¿Maneja el mismo que observa? */
    get observing() { return current !== observer; },
    setDriver(next) {
      if (!isController(next)) throw new TypeError('setDriver: no es un controlador');
      current = next;
    },
    control(perception) {
      observed.perception = perception;
      const seen = normalizeControls(observer.control(perception));
      observed.observed = seen;
      observed.driven = current === observer ? seen : normalizeControls(current.control(perception));
      return observed.driven;
    },
  };
  return observed;
}

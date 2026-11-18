// Rótulo de rol (sistema-de-diseno-base D1, B, y spec "Rótulos de rol"): una marca con la forma del rol y
// su nombre, en cada zona que muestra un rol del contrato de controlador. Lleva una ayuda que define el
// rol en lenguaje llano, se alcanza con el teclado para leerla, y tiene la clase `guide`: con la guía
// apagada no se ve ni ocupa lugar.
import { el } from './dom.js';

/**
 * @param {'in'|'decide'|'out'} role
 * @param {{which?: 'program'|'network'}} [spec] para "decide": si decide el programa o la red
 * @returns {HTMLElement}
 */
export function roleTag(role, { which } = {}) {
  return el('span', {
    class: 'role-tag guide', dataset: { role }, help: `role.${role}`,
    i18n: role === 'decide' ? `role.decide.${which ?? 'program'}` : `role.${role}`,
    attrs: { tabindex: '0' },
  });
}

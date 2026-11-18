// Texto largo de la guía plegado (tarjeta-de-consigna D10): un `details` con "Más sobre esta pestaña".
// `details` y `summary` dan el estado desplegado al lector de pantalla y el manejo con el teclado sin
// código propio. Arranca plegado; mientras dura la sesión queda como la persona lo dejó, porque el nodo
// sigue en el DOM. Lleva `guide`: con la guía apagada no se ve. Adentro va solo texto: los controles,
// la leyenda y las misiones quedan afuera.
import { el } from '../../ui/dom.js';

/**
 * @param {...HTMLElement} content el texto largo de la pestaña
 * @returns {HTMLDetailsElement}
 */
export function createGuideMore(...content) {
  return el('details', { class: 'guide guide-more' },
    el('summary', { class: 'guide-more-summary tertiary', i18n: 'guide.more', help: 'guide.more' }),
    el('div', { class: 'guide-more-body' }, ...content));
}

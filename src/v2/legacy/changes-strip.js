// Copia para la V2 de src/tabs/shared/changes-strip.js (interfaz-v2, grupo 14): la V2 no importa la pantalla de la V1 (design.md D5).
// Cambian las importaciones y las clases de los botones; la conducta es la misma.
// La franja de los cambios de prueba (Inspeccionar) o a mano (Laboratorio), arriba de la red (red-al-centro D3):
// cuántos cambios hay y sus botones. Sin cambios no se ve. Para no correr la red de golpe:
//   - si el primer cambio llega en medio de un arrastre sobre la red, la franja aparece al soltar;
//   - una vez que apareció, reserva su alto (invisible, fuera del recorrido del teclado) mientras la pestaña diga
//     que hay cambios en algún cerebro de la sesión (`reserve`).
// Sin DOM propio más allá de su nodo: la lógica de cuándo se ve está en `stripState`, que se prueba en Node.
import { el } from '../dom.js';

/**
 * Qué muestra la franja: 'shown' (a la vista), 'reserved' (su alto, invisible) o 'none'.
 * @param {{count:number, dragging:boolean, wasShown:boolean, reserve:boolean}} s
 * @returns {'shown'|'reserved'|'none'}
 */
export function stripState({ count, dragging, wasShown, reserve }) {
  if (count > 0 && (wasShown || !dragging)) return 'shown';
  if (wasShown && (reserve || count > 0)) return 'reserved';
  return 'none';
}

/**
 * @param {{text: HTMLElement, buttons: HTMLElement[], label: string}} spec label: clave i18n del nombre del grupo
 */
export function createChangesStrip({ text, buttons, label }) {
  const node = el('div', { class: 'net-changes', attrs: { role: 'group' }, i18nAttr: `aria-label:${label}` }, text, el('div', { class: 'net-changes-buttons' }, ...buttons));
  node.hidden = true;
  let shown = false; // la franja ya apareció alguna vez (desde ahí reserva su alto)
  let current = 'none';
  return {
    node,
    get state() { return current; },
    /**
     * @param {{count:number, dragging:boolean, reserve:boolean}} s
     * @returns {boolean} si cambió lo que se ve (la red puede haber cambiado de alto)
     */
    sync({ count, dragging, reserve }) {
      const next = stripState({ count, dragging, wasShown: shown, reserve });
      if (next === 'shown') shown = true;
      if (next === 'none' && !reserve) shown = false;
      if (next === current) return false;
      current = next;
      node.hidden = next === 'none';
      node.dataset.state = next;
      if (next === 'reserved') node.setAttribute('aria-hidden', 'true'); else node.removeAttribute('aria-hidden');
      return true;
    },
  };
}

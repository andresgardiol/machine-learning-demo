// Componentes del tablero (design.md D4): el renglón de indicadores y las tarjetas plegables que
// se reparten el alto. El tablero solo muestra; los controles viven en el panel.
//
// Todos los textos se declaran con claves de los diccionarios (data-i18n / data-help).
import { el } from './dom.js';

/**
 * Renglón de indicadores, cada uno con su rótulo y su valor.
 * @param {{id:string, labelKey:string}[]} items
 * @returns {{node: HTMLElement, values: Record<string, HTMLElement>}}
 */
export function statStrip(items) {
  const values = {};
  const node = el('dl', { class: 'board-strip', attrs: { 'aria-live': 'off' } },
    items.map(({ id, labelKey }) => {
      values[id] = el('dd', { class: 'board-stat-value' });
      return el('div', { class: 'board-stat', dataset: { stat: id } }, el('dt', { i18n: labelKey }), values[id]);
    }));
  node.style.setProperty('--stats', String(items.length));
  return { node, values };
}

/**
 * Tarjeta del tablero con título que la pliega y despliega (un botón, no <details>, para que el
 * cuerpo se estire con flex). Con `hintKey`, agrega al final un renglón de ayuda que se oculta con
 * el interruptor de guía.
 * @param {{id:string, titleKey:string, help:string, hintKey?:string, open?:boolean, grow?:number,
 *          onToggle?:(open:boolean)=>void}} spec
 * @returns {{node: HTMLElement, body: HTMLElement, hint: HTMLElement|null, title: HTMLButtonElement,
 *           setOpen:(open:boolean)=>void, open:boolean}}
 */
export function boardCard({ id, titleKey, help, hintKey, open = true, grow = 1, onToggle }) {
  const bodyId = `card-${id}-body`;
  const title = el('button', {
    class: 'card-title', i18n: titleKey, help,
    // Los atajos de la pestaña (la barra espaciadora pausa) siguen funcionando con el foco acá.
    attrs: { type: 'button', 'aria-controls': bodyId, 'aria-expanded': 'true', 'data-shortcuts': 'pass' },
  });
  const hint = hintKey ? el('p', { class: 'guide card-hint', i18n: hintKey }) : null;
  const body = el('div', { class: 'card-body', attrs: { id: bodyId } }, hint);
  const node = el('section', { class: 'card', dataset: { card: id, open: 'true' } }, el('h2', { class: 'card-heading' }, title), body);
  node.style.setProperty('--grow', String(grow));

  let isOpen = true;
  function setOpen(next) {
    isOpen = Boolean(next);
    node.dataset.open = String(isOpen);
    title.setAttribute('aria-expanded', String(isOpen));
    body.hidden = !isOpen;
  }
  title.addEventListener('click', () => {
    setOpen(!isOpen);
    onToggle?.(isOpen);
  });
  setOpen(open);

  /** Agrega contenido al cuerpo, antes del renglón de ayuda. */
  const append = (...children) => { for (const c of children.flat()) if (c) body.insertBefore(c, hint); };

  return {
    node, body, hint, title, setOpen, append,
    get open() { return isOpen; },
  };
}

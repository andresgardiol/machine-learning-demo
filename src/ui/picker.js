// Selector en un diálogo no modal pegado a su botón (pestana-competir D10b), común a Competir y a
// Inspeccionar (pestana-inspeccionar D11). Muestra opciones en grupos con título; cada opción es un
// botón con nombre y detalle, deshabilitado con su motivo si no se puede elegir. Las flechas, Inicio
// y Fin se mueven entre las opciones; Escape y "Listo" lo cierran y devuelven el foco al botón; un
// clic afuera lo cierra sin llevarse el foco. No cambia el alto del panel: cuelga del documento y se
// desplaza por dentro si son muchas.
//
// Conserva las clases con que nació en Competir (compete-picker, compete-option, …): es el mismo
// selector, con el mismo aspecto, en las dos pestañas.
import { el } from './dom.js';

/**
 * @param {object} spec
 * @param {string} spec.id id del diálogo (el botón lo apunta con aria-controls)
 * @param {HTMLElement} spec.anchor el botón que lo abre
 * @param {(key:string, params?:object) => string} spec.t textos del idioma activo
 * @param {string} spec.titleKey nombre del diálogo
 * @param {string} spec.doneKey texto del botón para cerrar
 * @param {string} spec.doneHelp ayuda del botón para cerrar
 * @param {string} spec.emptyKey texto cuando no hay opciones
 * @param {() => {id:string, title:string, items:{key:string, name:string, meta:string, help:string, disabled?:boolean, current?:boolean}[]}[]} spec.groups
 * @param {(key:string) => void} spec.onPick
 * @param {() => boolean} [spec.canOpen]
 * @param {Document} [spec.doc]
 */
export function createPicker({ id, anchor, t, titleKey, doneKey, doneHelp, emptyKey, groups, onPick, canOpen = () => true, doc = document }) {
  const win = doc.defaultView;
  const body = el('div', { class: 'compete-picker-body' });
  const done = el('button', { class: 'tool small compete-picker-done', i18n: doneKey, help: doneHelp, attrs: { type: 'button' }, on: { click: () => close() } });
  const node = el('div', {
    class: 'compete-picker',
    attrs: { id, role: 'dialog', 'aria-modal': 'false' },
    on: { keydown: (e) => onKey(e) },
  }, body, el('div', { class: 'compete-picker-foot' }, done));
  node.hidden = true;
  let isOpen = false;

  const options = () => [...body.querySelectorAll('.compete-option')];

  function render() {
    const focusedKey = doc.activeElement?.closest?.('.compete-option')?.dataset.key ?? null;
    const before = options().map((o) => o.dataset.key);
    const list = groups();
    body.replaceChildren();
    if (list.length === 0) body.append(el('p', { class: 'compete-picker-empty caption' }, t(emptyKey)));
    for (const g of list) {
      const titleId = `${id}-${g.id}`;
      body.append(el('div', { class: 'compete-picker-group', attrs: { role: 'group', 'aria-labelledby': titleId } },
        el('h3', { class: 'compete-picker-title', attrs: { id: titleId } }, g.title),
        ...g.items.map((item) => el('button', {
          class: 'compete-option', help: item.help,
          attrs: {
            type: 'button', 'aria-disabled': String(Boolean(item.disabled)), 'aria-label': `${item.name}. ${item.meta}`,
            'aria-current': item.current ? 'true' : null,
          },
          dataset: { key: item.key, focus: 'keep' },
          on: { click: () => { if (!item.disabled) onPick(item.key); } },
        }, el('span', { class: 'compete-name' }, item.name), el('span', { class: 'compete-meta' }, item.meta)))));
    }
    // El foco sigue en el selector: en la misma opción o, si se eligió, en la que ocupa su lugar.
    if (focusedKey !== null || node.contains(doc.activeElement)) {
      const opts = options();
      const same = opts.find((o) => o.dataset.key === focusedKey);
      const index = Math.min(Math.max(0, before.indexOf(focusedKey)), opts.length - 1);
      (same ?? opts[index] ?? done).focus({ preventScroll: false });
    }
    place();
  }

  function place() {
    // Pegado al botón, sin salirse de la ventana: se desplaza por dentro si son muchos.
    const r = anchor.getBoundingClientRect();
    const margin = 8;
    const width = Math.min(320, win.innerWidth - 2 * margin);
    const left = Math.max(margin, Math.min(r.right - width, win.innerWidth - width - margin));
    const below = win.innerHeight - r.bottom - 2 * margin;
    const above = r.top - 2 * margin;
    const up = below < 240 && above > below;
    node.style.left = `${left}px`;
    node.style.width = `${width}px`;
    node.style.maxHeight = `${Math.max(160, up ? above : below)}px`;
    node.style.top = up ? '' : `${r.bottom + 4}px`;
    node.style.bottom = up ? `${win.innerHeight - r.top + 4}px` : '';
  }

  function open({ focus = 'first' } = {}) {
    if (!canOpen()) return;
    isOpen = true;
    node.hidden = false;
    node.setAttribute('aria-label', t(titleKey));
    done.textContent = t(doneKey);
    anchor.setAttribute('aria-expanded', 'true');
    render();
    const opts = options().filter((o) => o.getAttribute('aria-disabled') !== 'true');
    const current = focus === 'current' ? opts.find((o) => o.getAttribute('aria-current') === 'true') : null;
    (current ?? opts[0] ?? done).focus();
  }

  function close({ focus = true } = {}) {
    if (!isOpen) return;
    isOpen = false;
    node.hidden = true;
    anchor.setAttribute('aria-expanded', 'false');
    if (focus) anchor.focus();
  }

  const toggle = (opts) => (isOpen ? close() : open(opts));

  function onKey(e) {
    if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); close(); return; }
    if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp' && e.key !== 'Home' && e.key !== 'End') return;
    // Las flechas se mueven entre las opciones y no manejan el auto.
    e.preventDefault();
    e.stopPropagation();
    const opts = [...options(), done];
    const at = opts.indexOf(doc.activeElement);
    const to = e.key === 'Home' ? 0 : e.key === 'End' ? opts.length - 1
      : (at + (e.key === 'ArrowDown' ? 1 : -1) + opts.length) % opts.length;
    opts[to].focus();
  }

  // Clic afuera: se cierra sin llevarse el foco.
  const onOutside = (e) => {
    if (!isOpen) return;
    if (node.contains(e.target) || anchor.contains(e.target)) return;
    close({ focus: false });
  };
  doc.addEventListener('pointerdown', onOutside);
  const onResize = () => { if (isOpen) place(); };
  win.addEventListener('resize', onResize);
  // Cuelga del documento: dentro del panel, que contiene su disposición, `fixed` quedaría relativo al
  // panel y podría salirse de la ventana.
  doc.body.append(node);

  return {
    node,
    open,
    close,
    toggle,
    render,
    get isOpen() { return isOpen; },
    dispose() {
      doc.removeEventListener('pointerdown', onOutside);
      win.removeEventListener('resize', onResize);
      node.remove();
    },
  };
}

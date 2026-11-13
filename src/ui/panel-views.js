// Vistas del panel con pestañas (panel-de-entrenar-por-vistas D1): una barra fija arriba del panel y
// un contenedor con una vista por pestaña. Un panel con más contenido del que entra se reparte en
// vistas en lugar de anidar secciones plegables.
//
// Patrón de pestañas accesible: role tablist / tab / tabpanel, una sola pestaña en el orden de Tab,
// flechas izquierda y derecha con activación automática, Inicio y Fin. Las vistas que no están a la
// vista quedan con `hidden`, sin desmontarse: conservan sus valores y sus grupos desplegados.
//
// La lógica que no usa el DOM (a qué pestaña lleva una tecla y el nombre accesible) se prueba en Node.
import { el } from './dom.js';

/**
 * Índice de la pestaña a la que lleva una tecla, o null si la tecla no mueve el foco.
 * Las flechas dan la vuelta; Inicio y Fin van a la primera y a la última.
 */
export function viewIndexForKey(key, current, count) {
  if (count <= 0) return null;
  if (key === 'ArrowRight') return (current + 1) % count;
  if (key === 'ArrowLeft') return (current - 1 + count) % count;
  if (key === 'Home') return 0;
  if (key === 'End') return count - 1;
  return null;
}

/** Vista elegida: la recordada si existe entre las vistas, y si no, la primera. */
export function initialView(ids, remembered) {
  return ids.includes(remembered) ? remembered : ids[0];
}

/**
 * Nombre accesible de una pestaña de vista: su nombre, la cantidad si la tiene ("Cerebros, 3") y,
 * con cambios pendientes, el aviso ("Ajustes, cambios esperando a la próxima generación").
 * @param {{t:(key:string, params?:object)=>string, labelKey:string, count?:number|null, pending?:boolean}} spec
 */
export function viewTabName({ t, labelKey, count = null, pending = false }) {
  let name = t(labelKey);
  if (count !== null && count !== undefined) name = t('views.name.count', { name, value: count });
  if (pending) name = t('views.name.pending', { name });
  return name;
}

/**
 * @param {object} spec
 * @param {{id:string, labelKey:string, help:string, node:HTMLElement, counted?:boolean}[]} spec.views
 *   counted: la pestaña muestra una cantidad (por ejemplo, cuántos cerebros hay)
 * @param {string} [spec.selected] vista elegida al armar la barra
 * @param {object} spec.i18n
 * @param {(id:string, previous:string)=>void} [spec.onChange] la vista cambió (por clic o por teclado)
 * @param {string} [spec.idPrefix]
 * @returns {{bar:HTMLElement, container:HTMLElement, select:(id:string, opts?:{focus?:boolean})=>void,
 *            selected:string, setCount:(id:string, n:number)=>void, setPending:(id:string, on:boolean)=>void,
 *            refresh:()=>void}}
 */
export function panelViews({ views, selected, i18n, onChange, idPrefix = 'view', ariaLabelKey = 'views.label' }) {
  const ids = views.map((v) => v.id);
  let current = initialView(ids, selected);
  const state = new Map(views.map((v) => [v.id, { count: v.counted ? 0 : null, pending: false }]));

  const tabs = views.map((v) => {
    const label = el('span', { class: 'view-tab-label' });
    const mark = el('span', { class: 'view-tab-pending', attrs: { 'aria-hidden': 'true' } });
    mark.hidden = true;
    const tab = el('button', {
      class: 'view-tab', help: v.help,
      attrs: {
        type: 'button', role: 'tab', id: `${idPrefix}-tab-${v.id}`, 'aria-controls': `${idPrefix}-${v.id}`,
        'aria-selected': 'false', tabindex: '-1',
      },
      dataset: { view: v.id },
      on: { click: () => select(v.id) },
    }, label, mark);
    return { id: v.id, labelKey: v.labelKey, tab, label, mark };
  });
  const panes = views.map((v) => el('div', {
    class: 'view-pane',
    attrs: { role: 'tabpanel', id: `${idPrefix}-${v.id}`, 'aria-labelledby': `${idPrefix}-tab-${v.id}` },
    dataset: { view: v.id },
  }, v.node));

  const bar = el('div', { class: 'view-tabs', attrs: { role: 'tablist' }, i18nAttr: `aria-label:${ariaLabelKey}` },
    tabs.map((x) => x.tab));
  const container = el('div', { class: 'view-panes' }, panes);

  function onKeyDown(e) {
    const index = ids.indexOf(current);
    const next = viewIndexForKey(e.key, index, ids.length);
    if (next === null) return;
    e.preventDefault();
    select(ids[next], { focus: true });
  }
  bar.addEventListener('keydown', onKeyDown);

  /** Escribe nombre visible, nombre accesible y marca de cada pestaña. */
  function refresh() {
    for (const x of tabs) {
      const s = state.get(x.id);
      // Texto escrito directo (sin data-i18n): el nombre va dentro de otro texto y se rehace al
      // cambiar de idioma con refresh().
      const text = s.count === null ? i18n.t(x.labelKey) : i18n.t('views.label.count', { name: i18n.t(x.labelKey), value: s.count });
      if (x.label.textContent !== text) x.label.textContent = text;
      x.mark.hidden = !s.pending;
      const name = viewTabName({ t: i18n.t, labelKey: x.labelKey, count: s.count, pending: s.pending });
      if (x.tab.getAttribute('aria-label') !== name) x.tab.setAttribute('aria-label', name);
      const on = x.id === current;
      if (x.tab.getAttribute('aria-selected') !== String(on)) x.tab.setAttribute('aria-selected', String(on));
      x.tab.tabIndex = on ? 0 : -1;
    }
    for (const p of panes) p.hidden = p.dataset.view !== current;
  }

  function select(id, { focus = false } = {}) {
    if (!ids.includes(id)) return;
    const previous = current;
    current = id;
    refresh();
    if (focus) tabs.find((x) => x.id === id).tab.focus();
    if (previous !== id) {
      container.scrollTop = 0;
      onChange?.(id, previous);
    }
  }

  const offLanguage = i18n.onChange(() => refresh());
  refresh();

  return {
    bar,
    container,
    select,
    refresh,
    get selected() { return current; },
    pane: (id) => panes.find((p) => p.dataset.view === id),
    tab: (id) => tabs.find((x) => x.id === id)?.tab,
    setCount(id, n) {
      const s = state.get(id);
      if (!s || s.count === n) return;
      s.count = n;
      refresh();
    },
    setPending(id, on) {
      const s = state.get(id);
      if (!s || s.pending === on) return;
      s.pending = on;
      refresh();
    },
    dispose() { bar.removeEventListener('keydown', onKeyDown); offLanguage(); },
  };
}

// Selector de pista sobre el escenario (panel-de-entrenar-por-vistas D5): un botón con el nombre de
// la pista a la vista que abre un menú con las cuatro pistas del catálogo, cada una con una miniatura
// de su trazado. Es el mismo componente en todas las pestañas, en el mismo lugar:
//
//   mode 'single' (El problema, Reglas a mano): elegir una pista la aplica y cierra el menú.
//   mode 'multi'  (Entrenar): cada pista se marca o desmarca, el menú sigue abierto y la última
//                 marcada no se puede desmarcar.
//
// Accesibilidad: botón con aria-haspopup="menu" y aria-expanded; menú con role="menu" y opciones
// menuitemradio o menuitemcheckbox con aria-checked; las miniaturas van con aria-hidden. Escape
// cierra y devuelve el foco al botón. Las teclas que atiende el menú no llegan a los atajos de la
// pestaña ni al manejo con las flechas.
//
// La lógica sin DOM (qué queda elegido, el texto del botón y las miniaturas) se prueba en Node. Las
// miniaturas se calculan una sola vez con la línea central de cada pista de src/core/circuits.js, con
// la misma orientación que en el escenario (camera.orientationFor).
import { TRACK_IDS, CIRCUITS, buildCenterline } from '../core/circuits.js';

export const THUMB_SIZE = Object.freeze({ width: 40, height: 28 });
const THUMB_PAD = 3;

/** Tipo de opción del menú según el modo. */
export const itemRole = (mode) => (mode === 'multi' ? 'menuitemcheckbox' : 'menuitemradio');

/**
 * Pistas elegidas después de activar `id`. En modo simple, solo esa. En modo múltiple, se marca o se
 * desmarca, en el orden del catálogo, sin quedar nunca ninguna marcada.
 */
export function nextSelection(mode, selected, id) {
  if (!TRACK_IDS.includes(id)) return [...selected];
  if (mode !== 'multi') return [id];
  const has = selected.includes(id);
  if (has && selected.length === 1) return [...selected];
  const set = new Set(has ? selected.filter((x) => x !== id) : [...selected, id]);
  return TRACK_IDS.filter((x) => set.has(x));
}

/**
 * Texto del botón cerrado: la pista a la vista y, en modo múltiple con más de una marcada, cuántas se
 * alternan ("Óvalo · se alternan 3").
 * @param {{mode:string, selected:string[], current:string, t:(key:string, params?:object)=>string}} spec
 */
export function buttonText({ mode, selected, current, t }) {
  const track = t(`track.${current}`);
  if (mode === 'multi' && selected.length > 1) return t('track.picker.alternating', { track, value: selected.length });
  return track;
}

/**
 * Nombre accesible del botón: "Pista: …" y, con un cambio de pistas esperando, el aviso.
 */
export function buttonName({ mode, selected, current, pending = false, t }) {
  const name = t('track.picker.name', { value: buttonText({ mode, selected, current, t }) });
  return pending ? t('track.picker.pending', { name }) : name;
}

/** Puntos de la línea central de una pista en coordenadas del mundo (la calle recta: un tramo). */
function centerline(id) {
  if (id === 'straight') return [{ x: 0, y: 0 }, { x: 100, y: 0 }];
  return buildCenterline(CIRCUITS[id]).points;
}

const thumbCache = new Map();

/**
 * Miniatura de una pista: los puntos, en píxeles de un recuadro de 40×28, de su línea central girada
 * como en el escenario (la recta de salida vertical, hacia arriba) y centrada. Una pista cerrada
 * repite el primer punto al final.
 * @returns {{points:{x:number,y:number}[], closed:boolean}}
 */
export function thumbnail(id) {
  if (thumbCache.has(id)) return thumbCache.get(id);
  const pts = centerline(id);
  // Misma orientación que el escenario: la dirección del primer tramo queda hacia arriba (y de
  // pantalla invertida), como en camera.orientationFor y en el dibujo de view.js.
  const d = { x: pts[1].x - pts[0].x, y: pts[1].y - pts[0].y };
  const rotation = Math.PI / 2 - Math.atan2(d.y, d.x);
  const cos = Math.cos(rotation);
  const sin = Math.sin(rotation);
  const screen = pts.map((p) => ({ x: cos * p.x - sin * p.y, y: -(sin * p.x + cos * p.y) }));
  const xs = screen.map((p) => p.x);
  const ys = screen.map((p) => p.y);
  const minX = Math.min(...xs);
  const minY = Math.min(...ys);
  const w = Math.max(...xs) - minX;
  const h = Math.max(...ys) - minY;
  const { width, height } = THUMB_SIZE;
  const scale = Math.min((width - 2 * THUMB_PAD) / (w || 1), (height - 2 * THUMB_PAD) / (h || 1));
  const offX = (width - w * scale) / 2;
  const offY = (height - h * scale) / 2;
  const round = (v) => Math.round(v * 10) / 10;
  const points = screen.map((p) => ({ x: round(offX + (p.x - minX) * scale), y: round(offY + (p.y - minY) * scale) }));
  const closed = id !== 'straight';
  if (closed) points.push({ ...points[0] });
  const result = Object.freeze({ points: Object.freeze(points), closed });
  thumbCache.set(id, result);
  return result;
}

const SVG = 'http://www.w3.org/2000/svg';

/**
 * Componente del selector.
 * @param {object} spec
 * @param {Document} spec.doc
 * @param {(key:string, params?:object)=>string} spec.t textos en el idioma activo
 * @param {'single'|'multi'} spec.mode
 * @param {(selected:string[], id:string)=>void} spec.onSelect la persona activó la pista `id`:
 *   recibe las pistas que quedan elegidas (nextSelection) y la activada
 * @param {string} [spec.help] clave de la ayuda del botón
 * @returns {{node:HTMLElement, button:HTMLButtonElement, menu:HTMLElement,
 *   update:(state:{selected:string[], current:string, pending?:boolean})=>void,
 *   open:(opts?:{focus?:'selected'|'first'|'last'})=>void, close:(opts?:{focusButton?:boolean})=>void,
 *   isOpen:boolean, dispose:()=>void}}
 */
export function createTrackPicker({ doc, t, mode, onSelect, help = mode === 'multi' ? 'train.tracks' : 'track', idPrefix = 'track-picker' }) {
  let state = { selected: [TRACK_IDS[0]], current: TRACK_IDS[0], pending: false };
  let isOpen = false;

  const node = doc.createElement('div');
  node.className = 'track-picker';
  node.dataset.mode = mode;

  const button = doc.createElement('button');
  button.type = 'button';
  button.className = 'track-picker-button';
  button.id = `${idPrefix}-button`;
  button.setAttribute('aria-haspopup', 'menu');
  button.setAttribute('aria-expanded', 'false');
  button.setAttribute('aria-controls', `${idPrefix}-menu`);
  button.setAttribute('data-help', help);
  const label = doc.createElement('span');
  label.className = 'track-picker-label';
  const mark = doc.createElement('span');
  mark.className = 'view-tab-pending track-picker-pending';
  mark.setAttribute('aria-hidden', 'true');
  mark.hidden = true;
  const caret = doc.createElement('span');
  caret.className = 'track-picker-caret';
  caret.setAttribute('aria-hidden', 'true');
  caret.textContent = '▾';
  button.append(label, mark, caret);

  const menu = doc.createElement('div');
  menu.className = 'track-picker-menu';
  menu.id = `${idPrefix}-menu`;
  menu.setAttribute('role', 'menu');
  menu.setAttribute('aria-labelledby', button.id);
  menu.hidden = true;

  const items = TRACK_IDS.map((id) => {
    const item = doc.createElement('button');
    item.type = 'button';
    item.className = 'track-picker-item';
    item.setAttribute('role', itemRole(mode));
    item.setAttribute('aria-checked', 'false');
    item.tabIndex = -1;
    item.dataset.track = id;
    item.setAttribute('data-help', `track.option.${id}`);
    const svg = doc.createElementNS(SVG, 'svg');
    svg.setAttribute('class', 'track-thumb');
    svg.setAttribute('width', String(THUMB_SIZE.width));
    svg.setAttribute('height', String(THUMB_SIZE.height));
    svg.setAttribute('viewBox', `0 0 ${THUMB_SIZE.width} ${THUMB_SIZE.height}`);
    svg.setAttribute('aria-hidden', 'true');
    svg.setAttribute('focusable', 'false');
    const line = doc.createElementNS(SVG, 'polyline');
    line.setAttribute('points', thumbnail(id).points.map((p) => `${p.x},${p.y}`).join(' '));
    svg.append(line);
    const check = doc.createElement('span');
    check.className = 'track-picker-check';
    check.setAttribute('aria-hidden', 'true');
    const name = doc.createElement('span');
    name.className = 'track-picker-name';
    item.append(check, svg, name);
    item.addEventListener('click', (e) => activate(id, e));
    return { id, item, name, check };
  });
  menu.append(...items.map((x) => x.item));
  node.append(button, menu);

  function render() {
    const text = buttonText({ mode, ...state, t });
    if (label.textContent !== text) label.textContent = text;
    const name = buttonName({ mode, ...state, t });
    if (button.getAttribute('aria-label') !== name) button.setAttribute('aria-label', name);
    mark.hidden = !state.pending;
    for (const x of items) {
      const on = state.selected.includes(x.id);
      if (x.item.getAttribute('aria-checked') !== String(on)) x.item.setAttribute('aria-checked', String(on));
      const n = t(`track.${x.id}`);
      if (x.name.textContent !== n) x.name.textContent = n;
      x.check.textContent = on ? (mode === 'multi' ? '☑' : '●') : (mode === 'multi' ? '☐' : '○');
      // La única pista marcada explica que hace falta al menos una.
      const helpKey = mode === 'multi' && on && state.selected.length === 1 ? 'train.tracks.last' : `track.option.${x.id}`;
      if (x.item.getAttribute('data-help') !== helpKey) x.item.setAttribute('data-help', helpKey);
    }
  }

  function focusItem(index) {
    const i = (index + items.length) % items.length;
    items[i].item.focus();
  }
  const focusedIndex = () => items.findIndex((x) => x.item === doc.activeElement);

  function open({ focus = null } = {}) {
    if (!isOpen) {
      isOpen = true;
      menu.hidden = false;
      button.setAttribute('aria-expanded', 'true');
      node.classList.add('open');
      doc.addEventListener('pointerdown', onOutside, true);
    }
    if (focus === 'first') focusItem(0);
    else if (focus === 'last') focusItem(items.length - 1);
    else if (focus === 'selected') {
      const i = items.findIndex((x) => state.selected.includes(x.id));
      focusItem(i < 0 ? 0 : i);
    }
  }

  function close({ focusButton = false } = {}) {
    if (!isOpen) return;
    isOpen = false;
    menu.hidden = true;
    button.setAttribute('aria-expanded', 'false');
    node.classList.remove('open');
    doc.removeEventListener('pointerdown', onOutside, true);
    if (focusButton) button.focus();
  }

  function activate(id, e) {
    const keyboard = !e || e.detail === 0;
    onSelect?.(nextSelection(mode, state.selected, id), id);
    if (mode !== 'multi') close({ focusButton: keyboard });
  }

  function onOutside(e) {
    if (!node.contains(e.target)) close();
  }

  button.addEventListener('click', (e) => {
    if (isOpen) close({ focusButton: e.detail === 0 });
    else open({ focus: e.detail === 0 ? 'selected' : null });
  });

  // Teclas del botón y del menú: no siguen hasta los atajos de la pestaña ni al manejo con flechas.
  function onButtonKey(e) {
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      e.stopPropagation();
      open({ focus: e.key === 'ArrowDown' ? 'selected' : 'last' });
    } else if (e.key === 'Escape' && isOpen) {
      e.preventDefault();
      e.stopPropagation();
      close({ focusButton: true });
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.stopPropagation(); // el clic del botón lo atiende; la barra no pausa
    }
  }
  function onMenuKey(e) {
    const i = focusedIndex();
    const keys = {
      ArrowDown: () => focusItem(i + 1),
      ArrowUp: () => focusItem(i - 1),
      Home: () => focusItem(0),
      End: () => focusItem(items.length - 1),
      Escape: () => close({ focusButton: true }),
      Enter: () => { if (i >= 0) activate(items[i].id); },
      ' ': () => { if (i >= 0) activate(items[i].id); },
    };
    if (e.key === 'Tab') { close(); return; }
    const fn = keys[e.key];
    if (!fn) {
      // Una letra no dispara atajos mientras el menú tiene el foco.
      if (e.key.length === 1) e.stopPropagation();
      return;
    }
    e.preventDefault();
    e.stopPropagation();
    fn();
  }
  button.addEventListener('keydown', onButtonKey);
  menu.addEventListener('keydown', onMenuKey);

  render();

  return {
    node,
    button,
    menu,
    update(next) {
      const s = { ...state, ...next, selected: [...(next.selected ?? state.selected)] };
      const same = s.current === state.current && s.pending === state.pending
        && s.selected.length === state.selected.length && s.selected.every((x, i) => x === state.selected[i]);
      state = s;
      if (!same) render();
    },
    /** Rehace los textos en el idioma activo. */
    refresh: render,
    open,
    close,
    get isOpen() { return isOpen; },
    dispose() {
      close();
      button.removeEventListener('keydown', onButtonKey);
      menu.removeEventListener('keydown', onMenuKey);
      node.remove();
    },
  };
}

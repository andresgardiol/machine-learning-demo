// Auditoría de tooltips: lista los controles interactivos sin ayuda declarada o cuya
// ayuda no existe en los dos idiomas. Se usa en la verificación manual de cada cambio:
// en la consola del navegador, `mlLab.auditTooltips()`.
import { helpKeys } from './tooltips.js';

export const INTERACTIVE_SELECTOR = [
  'button', 'a[href]', 'input', 'select', 'textarea', 'summary',
  '[role="button"]', '[role="tab"]', '[role="switch"]', '[role="slider"]', '[role="checkbox"]', '[role="link"]',
  '[tabindex]:not([tabindex="-1"])',
].join(', ');

/** Un elemento cuenta si se ve: está en la página y ningún ancestro lo oculta. */
const isRendered = (el) => el.getClientRects().length > 0;

/**
 * @param {{root?: ParentNode, dictionaries: Record<string, Record<string,string>>, includeHidden?: boolean}} spec
 * @returns {{element: Element, reason: 'missing-help'|'missing-text', detail?: string}[]}
 */
export function auditTooltips({ root = document, dictionaries, includeHidden = true }) {
  const problems = [];
  for (const el of root.querySelectorAll(INTERACTIVE_SELECTOR)) {
    if (el.closest('.tooltip')) continue;
    if (!includeHidden && !isRendered(el)) continue;
    const id = el.getAttribute('data-help');
    if (!id) {
      problems.push({ element: el, reason: 'missing-help' });
      continue;
    }
    const keys = helpKeys(id);
    for (const [lang, dict] of Object.entries(dictionaries)) {
      for (const key of [keys.what, keys.why]) {
        if (typeof dict[key] !== 'string' || dict[key].trim() === '') {
          problems.push({ element: el, reason: 'missing-text', detail: `${lang}:${key}` });
        }
      }
    }
  }
  return problems;
}

/** Selector de lo que cuenta como diálogo: tiene su propia acción principal (jerarquia-de-botones D4). */
export const DIALOG_SELECTOR = 'dialog[open], [role="dialog"], [role="alertdialog"]';

/**
 * Auditoría de la jerarquía (jerarquia-de-botones D4): lista los controles visibles rellenos con el color
 * de acción y avisa si alguno no es `.tool.primary`, o si hay más de uno fuera de los diálogos o dentro
 * de un mismo diálogo. Lo que no es un control y tiene ese mismo azul (las barras de los sensores, del
 * color de los sensores, y las de las misiones) se lista aparte en `marks`, sin contarlo como problema.
 * En la consola: `mlLab.auditHierarchy()`. No corre sola.
 * @param {{root?: ParentNode}} [spec]
 * @returns {{filled: Element[], marks: Element[], problems: {element: Element, reason: 'not-primary'|'more-than-one', detail?: string}[]}}
 */
export function auditHierarchy({ root = document } = {}) {
  const doc = root.ownerDocument ?? root;
  // El color de acción como lo calcula el navegador, con un elemento de prueba.
  const probe = doc.createElement('span');
  probe.style.cssText = 'position:absolute;visibility:hidden;background:var(--color-action)';
  doc.body.append(probe);
  const action = getComputedStyle(probe).backgroundColor;
  probe.remove();

  const all = [...root.querySelectorAll('*')].filter((el) => isRendered(el)
    && getComputedStyle(el).visibility !== 'hidden' && getComputedStyle(el).backgroundColor === action);
  const filled = all.filter((el) => el.matches(INTERACTIVE_SELECTOR));
  const marks = all.filter((el) => !el.matches(INTERACTIVE_SELECTOR));
  const problems = [];
  const groups = new Map();
  for (const el of filled) {
    if (!el.matches('.tool.primary')) problems.push({ element: el, reason: 'not-primary' });
    const scope = el.closest(DIALOG_SELECTOR) ?? null;
    if (!groups.has(scope)) groups.set(scope, []);
    groups.get(scope).push(el);
  }
  for (const [scope, els] of groups) {
    if (els.length <= 1) continue;
    const where = scope ? 'dialog' : 'tab';
    for (const el of els) problems.push({ element: el, reason: 'more-than-one', detail: `${where}: ${els.length}` });
  }
  return { filled, marks, problems };
}

/** Barras densas de jerarquia-visual (con las tres que sumó el dueño el 18 de noviembre de 2026: cabecera de capas,
    filas de la tarjeta de la neurona y tabla de verdad): las únicas donde un control puede tener la altura compacta. */
export const DENSE_SELECTOR = [
  '.topbar', '.inspect-controls', '.inspect-playbar', '.inspect-layer-head', '.compete-list', '.inspect-card-head',
  '.inspect-scene', '.library-item', '.inspect-rows', '.lab-tt', '.inspect-brain-head',
  // Reglas a mano (reglas-mesa-de-trabajo, escenario "Dos alturas" de jerarquia-visual): las filas de percepción
  // (los sensores y la velocidad) y el renglón de interruptores de su barra de marcha (con las cifras del intento).
  '.sensor-rows', '.speed-row', '.rules-runbar-second',
  // Los controles de las fichas del programa (reglas-como-fichas D8): compactos, para que una regla entre en un renglón.
  '.rules-cards-view',
].join(', ');

/** Controles que se miden: los que se accionan con el cursor y tienen forma de control. */
export const CONTROL_SELECTOR = [
  'button', '[role="button"]', '[role="tab"]', '[role="switch"]', 'select',
  'input:not([type="range"]):not([type="hidden"]):not([type="checkbox"]):not([type="radio"]):not([type="file"])',
].join(', ');

/** Controles que son un dibujo o un dato y no un botón (su tamaño lo da lo que muestran): no se miden. */
export const NOT_A_CONTROL_SELECTOR = [
  '.inspect-neuron', '.plane-probe', '.bar-track', '.editor-input', 'textarea', '.splitter', '.wt-cell', '.wt-strip-cell',
  '.wt-name', '.curve-handle', '.link-end', '.inspector-pill', '.lab-dt-scroll', '.inspect-scene', '.history-title',
  '.compete-mark', '.fitness-chart', '.sr-only', '.inspector-knob', '.inspector-knob-switch',
].join(', ');

/** Tokens que nombran un color del dibujo (escena y diagramas de la red). */
export const DRAWING_TOKENS = ['--color-car', '--color-car-crashed', '--color-elite', '--color-traffic', '--color-sensor',
  '--color-sensor-hit', '--color-weight-positive', '--color-weight-negative', '--color-neuron-active', '--color-network-input',
  '--color-network-current', '--color-class-a', '--color-class-b', '--color-network-blame',
  '--color-competitor-1', '--color-competitor-2', '--color-competitor-3', '--color-competitor-4', '--color-competitor-5',
  '--color-competitor-6'];

/**
 * Lugares de la interfaz que muestran algo del dibujo con su mismo significado (una leyenda, la marca de un
 * competidor, las barras de los sensores, el estado "choque", que es el color del auto chocado): ahí
 * coincidir con el dibujo es lo correcto y no se informa.
 */
export const SAME_MEANING_SELECTOR = [
  '[class*="legend"]', '[class*="-badge"]', '.compete-num', '.compete-dot', '.sensor-fill', '.sensor-name', '.speed-name',
  '.tok-data', '[data-state="crash"]', '.crash-badge', '.inspect-legend', '.wt-cell', '.weight-table', '.inspect-rows',
  '.lg-swatch', '.role-tag[data-role="in"]', '.countdown-number', '.lab-point', '.lab-tt', '.compete-row',
  '.sensor-value', '.inspect-row-off', '.lab-record', '.lab-live-error', '.network-legend',
  // Las pastillas y perillas sobre la red son pesos (su borde es el signo); el cartel de largada es de "Vos", el auto verde.
  '.inspector-pill', '.inspector-knob', '.start-card',
].join(', ');

/** Colores que la interfaz comparte con el dibujo a propósito: el texto, los cuatro roles (D1, B) y el rojo de
    "salió mal", que es del error, del choque y del auto chocado; la forma dice cuál es (D6). */
const SHARED_TOKENS = ['--color-text', '--color-role-you', '--color-role-in', '--color-role-decide', '--color-role-out', '--color-state-error'];

/** Excepción anotada: la cuenta regresiva de Competir es un número decorativo de 96 px (sistema-de-diseno-base 3.1). */
const SIZE_EXCEPTION_SELECTOR = '.countdown-number';

const toRgb = (hex) => {
  const h = hex.trim();
  if (!/^#[0-9a-fA-F]{6}$/.test(h)) return h;
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
  return `rgb(${r}, ${g}, ${b})`;
};

/**
 * Lee la escala del sistema desde las variables de tokens.css.
 * @param {(el: Element) => CSSStyleDeclaration} style
 * @param {Element} rootEl
 */
export function readScale(style, rootEl) {
  const s = style(rootEl);
  const v = (n) => s.getPropertyValue(n).trim();
  const num = (n) => parseFloat(v(n));
  return {
    sizes: ['--text-label', '--text-body', '--text-heading', '--text-figure', '--text-figure-lg'].map(num),
    code: num('--text-code'),
    weights: [num('--weight-regular'), num('--weight-bold')],
    heights: [num('--control-h-lg'), num('--control-h'), num('--control-h-sm')],
    compact: num('--control-h-sm'),
    action: toRgb(v('--color-action')),
    // Un color del dibujo igual al del texto o al de un rol no cuenta: el texto no es una señal (el competidor 5
    // es blanco), y en B la interfaz y el dibujo comparten a propósito el color de cada rol.
    drawing: new Map(DRAWING_TOKENS.map((t) => [toRgb(v(t)), t])
      .filter(([c]) => c.startsWith('rgb(') && ![...SHARED_TOKENS].map((n) => toRgb(v(n))).includes(c))),
  };
}

/** Un elemento cuenta si se ve y no está dentro de un dibujo (canvas o svg) ni es solo para lectores de pantalla. */
const isInterface = (el) => el.getClientRects().length > 0 && !el.closest('svg, canvas, .sr-only');
const hasOwnText = (el) => [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim() !== '');

/**
 * Auditoría del sistema de diseño (sistema-de-diseno-base D4). Recorre lo visible e informa:
 * - `font-size` / `font-weight`: textos con un tamaño o un peso fuera de la escala;
 * - `height` / `compact`: controles con una altura que no es una de las tres, o compactos fuera de las barras densas;
 * - `action-fill`: rellenos con el color de acción que no son la acción principal;
 * - `drawing-color`: colores de la interfaz (fondo, texto o borde) iguales a un color del dibujo con otro significado.
 * En la consola: `mlLab.auditSistema()`. No corre sola. `style` y `rect` se pueden reemplazar para probarla sin navegador.
 * @param {{root?: ParentNode, style?: (el: Element) => any, rect?: (el: Element) => {height: number}}} [spec]
 */
export function auditSistema({ root = document, style = (el) => getComputedStyle(el), rect = (el) => el.getBoundingClientRect() } = {}) {
  const doc = root.ownerDocument ?? root;
  const scale = readScale(style, doc.documentElement);
  const problems = [];
  const seen = { sizes: new Set(), weights: new Set(), heights: new Set() };
  const near = (a, list) => list.some((b) => Math.abs(a - b) < 0.5);
  for (const el of root.querySelectorAll('*')) {
    if (!isInterface(el)) continue;
    const st = style(el);
    if (hasOwnText(el) && st.visibility !== 'hidden') {
      const size = parseFloat(st.fontSize);
      const weight = parseFloat(st.fontWeight);
      const code = /monospace/.test(st.fontFamily ?? '');
      seen.sizes.add(size); seen.weights.add(weight);
      if (!near(size, code ? [...scale.sizes, scale.code] : scale.sizes) && !el.matches(SIZE_EXCEPTION_SELECTOR)) {
        problems.push({ element: el, reason: 'font-size', detail: `${size}px` });
      }
      if (!near(weight, scale.weights)) problems.push({ element: el, reason: 'font-weight', detail: String(weight) });
    }
    if (el.matches(CONTROL_SELECTOR) && !el.closest(NOT_A_CONTROL_SELECTOR)) {
      const h = Math.round(rect(el).height * 10) / 10;
      seen.heights.add(h);
      if (!near(h, scale.heights)) problems.push({ element: el, reason: 'height', detail: `${h}px` });
      else if (Math.abs(h - scale.compact) < 0.5 && !el.closest(DENSE_SELECTOR)) problems.push({ element: el, reason: 'compact', detail: `${h}px` });
    }
    if (st.backgroundColor === scale.action && !el.matches('.tool.primary')) {
      problems.push({ element: el, reason: 'action-fill' });
    }
    if (!el.closest(SAME_MEANING_SELECTOR)) {
      for (const [prop, value] of [['background', st.backgroundColor], ['color', hasOwnText(el) ? st.color : null],
        ['border', st.borderTopStyle !== 'none' && parseFloat(st.borderTopWidth) > 0 ? st.borderTopColor : null]]) {
        if (value && scale.drawing.has(value)) problems.push({ element: el, reason: 'drawing-color', detail: `${prop} ${scale.drawing.get(value)}` });
      }
    }
  }
  return {
    problems,
    sizes: [...seen.sizes].sort((a, b) => a - b),
    weights: [...seen.weights].sort((a, b) => a - b),
    heights: [...seen.heights].sort((a, b) => a - b),
  };
}

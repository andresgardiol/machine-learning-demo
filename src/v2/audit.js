// Auditorías de la V2 (design.md D10), en la consola como mlLab.v2.audit*(). Cada una devuelve la lista
// de problemas (vacía si no hay). Las reglas son funciones puras con pruebas (tests/v2/audit.test.js);
// las que recorren el documento las aplican a lo que está a la vista.

export const MIN_TARGET = 24;
export const CONTROLS = 'button, a[href], input:not([type=hidden]), select, textarea, [role=switch], [role=tab], [role=slider]';

/** Objetivo de menos de 24×24 px (WCAG 2.5.8). Los deslizadores cuentan por su ancho. */
export const isSmallTarget = ({ width, height }, { range = false } = {}) => (range ? width < MIN_TARGET : width < MIN_TARGET || height < MIN_TARGET);
/** Texto con letras (lo que tiene que salir de un diccionario). */
export const hasLetters = (text) => /[A-Za-zÁÉÍÓÚáéíóúÑñ]{2,}/.test(text);
/** Una zona que pide desplazar o corta su contenido. */
export const overflows = ({ scrollHeight, clientHeight, scrollWidth = 0, clientWidth = 0 }, tolerance = 1) =>
  scrollHeight > clientHeight + tolerance || scrollWidth > clientWidth + tolerance;
/** Más de una acción principal a la vista. */
export const tooManyPrimary = (count) => count > 1;

const describe = (e) => (e.getAttribute('aria-label') || e.textContent || e.dataset.help || e.tagName).trim().replace(/\s+/g, ' ').slice(0, 50);

function visible(e) {
  if (!e.isConnected) return false;
  const r = e.getBoundingClientRect();
  if (r.width === 0 || r.height === 0) return false;
  const s = getComputedStyle(e);
  return s.visibility !== 'hidden' && s.display !== 'none';
}
const controls = (root) => [...root.querySelectorAll(CONTROLS)].filter(visible);

export function auditTooltips(root = document) {
  return controls(root).filter((c) => !c.closest('[data-help]')).map((c) => ({ reason: 'sin tooltip', element: c, detail: describe(c) }));
}
export function auditPrimary(root = document) {
  const p = [...root.querySelectorAll('.v2-primary')].filter(visible);
  return tooManyPrimary(p.length) ? [{ reason: 'más de una acción principal', detail: p.map(describe).join(' · ') }] : [];
}
export function auditTargets(root = document) {
  return controls(root).filter((c) => isSmallTarget(c.getBoundingClientRect(), { range: c.type === 'range' }))
    .map((c) => ({ reason: 'objetivo chico', element: c, detail: `${describe(c)} ${Math.round(c.getBoundingClientRect().width)}×${Math.round(c.getBoundingClientRect().height)}` }));
}
export function auditOverflow(root = document) {
  const problems = [];
  for (const e of root.querySelectorAll('.v2-plate, .v2-band, .v2-notebook-head, .v2-sheets, .v2-bar')) {
    if (visible(e) && overflows(e)) problems.push({ reason: 'zona que desborda', element: e, detail: e.className });
  }
  // El riel solo cuenta por el alto: la pregunta que aparece a su lado al posar el cursor sale a propósito.
  for (const e of root.querySelectorAll('.v2-rail')) {
    if (visible(e) && overflows({ scrollHeight: e.scrollHeight, clientHeight: e.clientHeight })) problems.push({ reason: 'zona que desborda', element: e, detail: e.className });
  }
  for (const e of root.querySelectorAll('body *')) {
    if (!visible(e) || !e.childNodes.length) continue;
    const s = getComputedStyle(e);
    if (s.overflowX === 'visible' && s.textOverflow !== 'ellipsis') continue;
    if (![...e.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim())) continue;
    if (e.scrollWidth > e.clientWidth + 1) problems.push({ reason: 'texto cortado', element: e, detail: describe(e) });
  }
  return problems;
}
/** Ninguna hoja del cuaderno desplaza (spec *Hojas sin desplazar*). */
export function auditSheets(root = document) {
  return [...root.querySelectorAll('.v2-sheet')].filter(visible).filter((s) => overflows({ scrollHeight: s.scrollHeight, clientHeight: s.clientHeight }))
    .map((s) => ({ reason: 'hoja que desplaza', element: s, detail: `${s.dataset.sheet} ${s.clientHeight}/${s.scrollHeight}` }));
}
/** Textos fijos: texto con letras que no sale de un diccionario (data-i18n) ni es un dato (data-free-text). */
export function auditTexts(root = document) {
  const problems = [];
  const walker = root.ownerDocument ? root.ownerDocument.createTreeWalker(root, NodeFilter.SHOW_TEXT) : document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  for (let n = walker.nextNode(); n; n = walker.nextNode()) {
    const text = n.textContent.trim();
    if (!hasLetters(text)) continue;
    const e = n.parentElement;
    if (!e || !visible(e) || e.closest('[data-i18n], [data-free-text], script, style, kbd, .v2-tip')) continue;
    problems.push({ reason: 'texto fijo', element: e, detail: text.slice(0, 50) });
  }
  return problems;
}
/** Todas juntas, con la cantidad por auditoría. */
export function auditAll(root = document) {
  const r = { tooltips: auditTooltips(root), primary: auditPrimary(root), targets: auditTargets(root), overflow: auditOverflow(root), sheets: auditSheets(root), texts: auditTexts(root) };
  return { ...r, total: Object.values(r).reduce((a, l) => a + l.length, 0) };
}

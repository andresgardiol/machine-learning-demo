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

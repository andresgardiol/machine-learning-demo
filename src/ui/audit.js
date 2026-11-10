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

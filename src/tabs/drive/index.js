// Pestaña 1, "El problema". Composición de mundo, controlador de teclado y vista.
// (Se completa en el grupo 10 de tasks.md.)
import { el } from '../../ui/dom.js';

export function mount({ panel }) {
  panel.append(el('h1', { class: 'panel-title', i18n: 'drive.title' }));
  return { unmount() {} };
}

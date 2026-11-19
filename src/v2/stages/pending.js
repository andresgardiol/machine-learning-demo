// Etapa que todavía no está en la V2 (design.md D9): muestra su pregunta y "Por ahora, en la V1",
// con un enlace a la V1 y el nombre de la pestaña equivalente.
import { el } from '../dom.js';

export function mount({ info, zones, notebook }) {
  zones.scene.append(el('div', { class: 'v2-pending' },
    el('h2', { i18n: 'pending.title' }),
    el('p', {}, el('span', { i18n: 'pending.body' }), ' ', el('b', { i18n: `v1tab.${info.v1Tab}` })),
    el('a', { class: 'v2-btn', i18n: 'pending.link', help: 'pending.link', attrs: { href: '../' } })));
  const sheet = notebook.sheet('etapa', 'pending.sheet');
  sheet.append(el('p', { class: 'v2-muted', i18n: `summary.${info.group}` }), el('p', { class: 'v2-muted', i18n: `next.${info.group}` }));
  return { show() {}, hide() {} };
}

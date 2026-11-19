// Copia para la V2 de src/tabs/shared/net-bar.js (interfaz-v2, grupo 14): la V2 no importa la pantalla de la V1 (design.md D5).
// Cambian las importaciones y las clases de los botones; la conducta es la misma.
// La barra de arriba de la red de Inspeccionar y del Laboratorio (red-al-centro D3): el nombre de la red y un
// renglón de controles en tres grupos rotulados, Vista, Conexiones y Acercar, con el rótulo arriba de cada grupo
// como en la barra de escenario. Si no entran en un renglón, el último grupo baja entero.
import { el } from '../dom.js';

/**
 * @param {{title: HTMLElement, groups: {id: string, labelKey: string, help?: string, children: HTMLElement[]}[], idPrefix: string}} spec
 * @returns {{node: HTMLElement, groups: Record<string, HTMLElement>}}
 */
export function netBar({ title, groups, idPrefix }) {
  const nodes = {};
  const row = el('div', { class: 'net-bar-groups' }, groups.map((g) => {
    const labelId = `${idPrefix}-bar-${g.id}`;
    const node = el('div', { class: `net-bar-group net-bar-group-${g.id}`, attrs: { role: 'group', 'aria-labelledby': labelId } },
      el('span', { class: 'net-bar-group-label', i18n: g.labelKey, ...(g.help ? { help: g.help } : {}), attrs: { id: labelId } }),
      el('div', { class: 'net-bar-group-body' }, ...g.children));
    nodes[g.id] = node;
    return node;
  }));
  const node = el('div', { class: 'inspect-controls net-bar' }, el('div', { class: 'net-bar-head' }, title), row);
  return { node, groups: nodes };
}

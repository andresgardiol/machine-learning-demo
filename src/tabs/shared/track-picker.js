// Selector de pista compartido por las pestañas El problema y Reglas a mano (circuitos-y-paisaje D6):
// las cuatro pistas del catálogo en dos renglones de dos, como las funciones de fitness. Elegir otra
// pista llama a `onSelect(id)`; la pestaña reinicia el intento en la pista nueva.
import { optionGroup } from '../../ui/controls.js';
import { TRACK_IDS } from '../../core/circuits.js';

/**
 * @param {{selected: string, onSelect: (id: string) => void}} spec
 * @returns {{node: HTMLElement, select: (id: string) => void}}
 */
export function trackPicker({ selected, onSelect }) {
  const group = optionGroup({
    labelKey: 'track.label',
    labelHelp: 'track',
    selected,
    options: TRACK_IDS.map((id) => ({ value: id, i18n: `track.${id}`, help: 'track', dataset: { track: id } })),
    onSelect: (id) => { if (id !== current) onSelect(id); },
  });
  let current = selected;
  group.row.classList.add('track-choice');
  return {
    node: group.row,
    select(id) { current = id; group.select(id); },
  };
}

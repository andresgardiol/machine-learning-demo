// Tarjeta de consigna (tarjeta-de-consigna D1): abre el panel de cada pestaña con una frase que dice
// qué hacer ahora, los controles de marcha (en las pestañas que los tienen en el panel) y la misión en
// curso, que sale del mismo texto que su fila de la lista (D2).
//
// La consigna y la misión llevan la clase `guide`: con la guía apagada las oculta la regla que ya
// existe (`.app[data-guide="off"] .guide`), y la marcha queda en el mismo lugar.
import { el } from '../../ui/dom.js';
import { createTextSetter } from '../../ui/controls.js';

let nextId = 0;

/**
 * Vista de una misión para la tarjeta y su fila (D2).
 * @typedef {{nameKey: string, nameParams?: object, statusKey: string, statusParams?: object,
 *   fraction?: number|null}} MissionView
 */

/**
 * @param {{i18n: object, run?: HTMLElement|null}} spec
 * @returns {{node: HTMLElement, setConsigna: (key: string, params?: object) => void,
 *   setMission: (view: null | {allDone: true} | MissionView) => void}}
 */
export function createConsignaCard({ i18n, run = null }) {
  const setText = createTextSetter(i18n);
  const titleId = `consigna-title-${++nextId}`;
  const text = el('p', { class: 'guide consigna-text' });
  const missionName = el('span', { class: 'consigna-mission-name' });
  const missionStatus = el('span', { class: 'consigna-mission-status' });
  const missionFill = el('span', { class: 'mission-fill' });
  const missionBar = el('span', { class: 'mission-bar', attrs: { 'aria-hidden': 'true' } }, missionFill);
  const mission = el('div', { class: 'guide consigna-mission' }, missionName, missionStatus, missionBar);
  mission.hidden = true;
  const node = el('section', { class: 'consigna-card', attrs: { 'aria-labelledby': titleId } },
    el('h2', { class: 'sr-only', i18n: 'consigna.title', attrs: { id: titleId } }),
    text,
    run,
    mission);

  function setConsigna(key, params) {
    setText(text, key, params);
  }

  function setMission(view) {
    const state = missionState(view);
    if (mission.hidden !== state.hidden) mission.hidden = state.hidden;
    if (state.hidden) return;
    if (mission.dataset.done !== String(state.allDone)) mission.dataset.done = String(state.allDone);
    if (state.allDone) {
      setText(missionName, 'consigna.missions.allDone');
      if (missionStatus.textContent !== '') { missionStatus.textContent = ''; missionStatus.removeAttribute('data-i18n'); }
    } else {
      setText(missionName, view.nameKey, view.nameParams);
      setText(missionStatus, view.statusKey, view.statusParams);
    }
    const barHidden = state.width === null;
    if (missionBar.hidden !== barHidden) missionBar.hidden = barHidden;
    if (!barHidden && missionFill.style.width !== state.width) missionFill.style.width = state.width;
  }

  return { node, setConsigna, setMission };
}

/**
 * Lo que muestra la tarjeta para una vista de misión, sin DOM.
 * @returns {{hidden: boolean, allDone: boolean, width: string|null}}
 */
export function missionState(view) {
  if (!view) return { hidden: true, allDone: false, width: null };
  if (view.allDone) return { hidden: false, allDone: true, width: null };
  const f = view.fraction;
  if (typeof f !== 'number' || !Number.isFinite(f)) return { hidden: false, allDone: false, width: null };
  return { hidden: false, allDone: false, width: `${Math.round(Math.min(1, Math.max(0, f)) * 100)}%` };
}

/**
 * Escribe una fila de la lista de misiones desde su vista (la misma que usa la tarjeta) y marca si es
 * la misión en curso (`data-current`, que el CSS muestra con "▸" y negrita).
 * @param {{row: HTMLElement, status: HTMLElement, fill?: HTMLElement|null}} r
 * @param {MissionView & {done: boolean}} view
 * @param {boolean} current
 * @param {(node: HTMLElement, key: string, params?: object) => void} setText
 */
export function writeMissionRow(r, view, current, setText) {
  if (r.row.dataset.done !== String(view.done)) r.row.dataset.done = String(view.done);
  if (r.row.dataset.current !== String(current)) r.row.dataset.current = String(current);
  setText(r.status, view.statusKey, view.statusParams);
  if (r.fill && typeof view.fraction === 'number') {
    const width = `${Math.round(view.fraction * 100)}%`;
    if (r.fill.style.width !== width) r.fill.style.width = width;
  }
}

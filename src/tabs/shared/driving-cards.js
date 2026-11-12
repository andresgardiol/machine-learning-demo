// Bloques del tablero compartidos por las pestañas 1 y 2 (design.md D5): las barras de lo que
// perciben los sensores, con su lectura y, si se pide, el nombre de cada dato; y los cuatro controles
// resaltados mientras se accionan. `readings` decide qué números se escriben y no usa el DOM.
import { el } from '../../ui/dom.js';
import { formatFixed } from '../../ui/i18n.js';
import { createTextSetter } from '../../ui/controls.js';

/** Con más sensores que este, las barras se muestran sin su número (ni su nombre) debajo. */
export const READINGS_MAX = 12;

export const ACTIONS = Object.freeze(['forward', 'reverse', 'left', 'right']);

const round2 = (v) => Math.round((Number(v) || 0) * 100) / 100 || 0;

/**
 * Lecturas que se escriben como número debajo de las barras: la de cada sensor (solo con hasta
 * `max` sensores; si no, null) y la de la velocidad (siempre, de −1 a 1), redondeadas a dos decimales.
 * @param {{sensors:number[], speed:number}} perception
 * @returns {{sensors:number[]|null, speed:number}}
 */
export function readings(perception, { max = READINGS_MAX } = {}) {
  const sensors = perception.sensors.length <= max ? perception.sensors.map(round2) : null;
  return { sensors, speed: round2(perception.speed) };
}

/** Escribe un texto ya formado solo si cambió. */
const writeText = (node, text) => { if (node.textContent !== text) node.textContent = text; };

/**
 * Barras de percepción: una por rayo, de izquierda a derecha, con su lectura debajo (hasta 12
 * sensores), y la velocidad aparte, rotulada y siempre con su número.
 * @param {{i18n: object, count: number, names?: {sensorKey: string, speedKey: string}|null}} spec
 *   names: con nombres, debajo de cada lectura se lee el nombre del dato (clave de texto con {n}
 *   para los sensores) y la velocidad se rotula con `speedKey`.
 * @returns {{node: HTMLElement, update:(perception:{sensors:number[], speed:number}) => void}}
 */
export function perceptionBlock({ i18n, count, names = null }) {
  const setText = createTextSetter(i18n);
  const bars = el('div', { class: 'sensor-bars', attrs: { role: 'img' }, i18nAttr: 'aria-label:drive.perception.bars' });
  const barValues = el('div', { class: 'sensor-values', attrs: { 'aria-hidden': 'true' } });
  const barNames = names ? el('div', { class: 'sensor-values sensor-names', attrs: { 'aria-hidden': 'true' } }) : null;
  let barFills = [];
  let valueNodes = [];
  function buildBars(n) {
    barFills = Array.from({ length: n }, () => el('span', { class: 'sensor-fill' }));
    bars.replaceChildren(...barFills.map((f) => el('span', { class: 'sensor-bar' }, f)));
    valueNodes = Array.from({ length: n }, () => el('span', { class: 'sensor-value' }));
    barValues.replaceChildren(...valueNodes);
    if (barNames) {
      barNames.replaceChildren(...Array.from({ length: n }, (_, i) => {
        const name = el('span', { class: 'sensor-value sensor-name', i18n: names.sensorKey, params: { n: i + 1 } });
        name.style.gridColumn = String(i + 1); // columna fija: en dos renglones alternados, cada nombre sigue bajo su barra
        return name;
      }));
      i18n.translateTree(barNames);
      fitNames();
    }
    for (const node of [bars, barValues, barNames]) {
      if (!node) continue;
      node.style.setProperty('--bars', String(n));
      // Con muchos rayos la separación se angosta para que cada barra conserve ancho visible.
      node.style.setProperty('--bar-gap', n > 60 ? '0px' : n > 30 ? '1px' : '2px');
    }
  }
  /** Si los nombres no entran en el ancho de su barra, se escriben en dos renglones alternados. */
  function fitNames() {
    if (!barNames || barFills.length === 0) return;
    const doc = barNames.ownerDocument;
    const textWidth = (node) => { const r = doc.createRange(); r.selectNodeContents(node); return r.getBoundingClientRect().width; };
    const widest = Math.max(...[...barNames.children].map(textWidth));
    const stagger = barNames.clientWidth > 0 && barNames.clientWidth / barFills.length < widest + 4;
    if (barNames.dataset.stagger !== String(stagger)) barNames.dataset.stagger = String(stagger);
  }
  // Se aplica en el cuadro siguiente: pasar a dos renglones cambia el alto del elemento observado y,
  // hecho dentro del aviso, el navegador lo informaría como un bucle de ResizeObserver.
  let fitPending = false;
  const scheduleFit = () => {
    if (fitPending) return;
    fitPending = true;
    globalThis.requestAnimationFrame(() => { fitPending = false; fitNames(); });
  };
  const resizeObserver = barNames && typeof globalThis.ResizeObserver === 'function' ? new globalThis.ResizeObserver(scheduleFit) : null;
  resizeObserver?.observe(barNames);
  buildBars(count);
  const speedFill = el('span', { class: 'sensor-fill speed-fill' });
  const speedValue = el('span', { class: 'sensor-value speed-value' });
  const speedKey = names ? names.speedKey : 'network.input.speed';
  const speedLabel = el('span', { class: names ? 'speed-label speed-name' : 'speed-label', i18n: speedKey });
  const node = el('div', { class: 'perception' },
    el('div', { class: 'perception-sensors' }, bars, barValues, barNames),
    el('div', { class: 'perception-speed' },
      el('span', { class: 'sensor-bar speed-bar', attrs: { role: 'img' }, i18nAttr: `aria-label:${speedKey}` }, speedFill),
      speedValue,
      speedLabel));

  function update(perception) {
    if (perception.sensors.length !== barFills.length) buildBars(perception.sensors.length);
    perception.sensors.forEach((v, i) => {
      const h = `${Math.round(v * 100)}%`;
      if (barFills[i].style.height !== h) barFills[i].style.height = h;
    });
    const read = readings(perception);
    barValues.hidden = read.sensors === null;
    if (barNames) barNames.hidden = read.sensors === null;
    if (read.sensors) read.sensors.forEach((v, i) => writeText(valueNodes[i], formatFixed(v, 2, i18n.language)));
    const speedHeight = `${Math.round(Math.max(0, Math.min(1, read.speed)) * 100)}%`;
    if (speedFill.style.height !== speedHeight) speedFill.style.height = speedHeight;
    writeText(speedValue, formatFixed(read.speed, 2, i18n.language));
    setText(speedLabel, speedKey);
  }

  return { node, update };
}

/**
 * Los cuatro controles del auto; cada uno se resalta mientras está accionado.
 * @returns {{node: HTMLElement, update:(controls:{forward:boolean, reverse:boolean, left:boolean, right:boolean}) => void}}
 */
export function actionBlock() {
  const keys = Object.fromEntries(ACTIONS.map((a) => [a, el('span', { class: `action-key action-${a}`, dataset: { on: 'false' } },
    el('span', { class: 'action-glyph', i18n: `drive.action.${a}.key`, attrs: { 'aria-hidden': 'true' } }),
    el('span', { class: 'action-name', i18n: `drive.action.${a}` }))]));
  const node = el('div', { class: 'action-keys' }, ACTIONS.map((a) => keys[a]));
  function update(controls) {
    for (const a of ACTIONS) {
      const on = String(Boolean(controls[a]));
      if (keys[a].dataset.on !== on) keys[a].dataset.on = on;
    }
  }
  return { node, update };
}

// Copia para la V2 de src/tabs/shared/driving-cards.js (interfaz-v2, grupo 14): la V2 no importa la pantalla de la V1 (design.md D5).
// Cambian las importaciones y las clases de los botones; la conducta es la misma.
// Bloques del tablero compartidos por las pestañas 1 y 2 (design.md D5): las barras de lo que
// perciben los sensores, con su lectura y, si se pide, el nombre de cada dato; y los cuatro controles
// resaltados mientras se accionan. `readings` decide qué números se escriben y no usa el DOM.
import { el, setData } from '../dom.js';
import { formatFixed } from '../../ui/i18n.js';
import { createTextSetter } from '../components/legacy.js';
import { createFlashGuard } from '../../render/flash-guard.js';
import { roleTag } from './role-tag.js';

import { READINGS_MAX, ACTIONS, readings } from '../../tabs/shared/driving-logic.js';

export { READINGS_MAX, ACTIONS, readings, MATCH_FRAMES, COMPARE_ANNOUNCE_MS, sameControls, createMatchWindow, createCompareAnnouncer } from '../../tabs/shared/driving-logic.js';

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
export function perceptionBlock({ i18n, count, names = null, role = true }) {
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
    el('div', { class: 'perception-sensors' }, role ? roleTag('in') : null, bars, barValues, barNames),
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
 * Percepción en filas horizontales (reglas-mesa-de-trabajo D2 y D5), para la columna al costado de la escena
 * de Reglas a mano: una fila por sensor, de `sensor1` arriba, con el nombre a la izquierda, la barra y el
 * valor a la derecha; y la fila de la velocidad. Con hasta `READINGS_MAX` sensores y `onInsert`, cada fila es
 * un botón que avisa `onInsert(dato, valor)` con la lectura que muestra (la del último cuadro dibujado):
 * `dato` es `{ sensor: n }` o `'speed'`. Con más, las filas de los sensores van sin nombre ni valor y no son
 * botones; la de la velocidad sigue siendo un botón.
 * @param {{i18n: object, count: number, names: {sensorKey: string, speedKey: string}, help?: string,
 *   onInsert?: ((datum: {sensor:number}|'speed', value: number) => void)|null, role?: boolean}} spec
 * @returns {{node: HTMLElement, update:(perception:{sensors:number[], speed:number}) => void}}
 */
export function perceptionRows({ i18n, count, names, help = null, onInsert = null, role = true }) {
  const setText = createTextSetter(i18n);
  let shown = { sensors: [], speed: 0 }; // lo que muestran las filas ahora (dos decimales)
  /** Una fila: botón si se puede insertar; si no, un elemento quieto. */
  function row({ nameKey, params, datum, labeled }) {
    const fill = el('span', { class: 'sensor-row-fill' });
    const value = el('span', { class: 'sensor-row-value' });
    const name = labeled ? el('span', { class: 'sensor-row-name', i18n: nameKey, params }) : null;
    const track = el('span', { class: 'sensor-row-track', attrs: { 'aria-hidden': 'true' } }, fill);
    const button = Boolean(onInsert) && labeled;
    const node = button
      ? el('button', {
        class: 'sensor-row', help, attrs: { type: 'button', 'data-focus': 'keep', 'data-help-params': JSON.stringify({ name: i18n.t(nameKey, params) }) },
        on: { click: () => onInsert(datum, datum === 'speed' ? shown.speed : shown.sensors[datum.sensor - 1] ?? 0) },
      }, name, track, value)
      : el('span', { class: labeled ? 'sensor-row' : 'sensor-row sensor-row-bare' }, name, track, labeled ? value : null);
    if (!labeled) value.hidden = true;
    return { node, fill, value, name, nameKey, params };
  }
  const list = el('div', { class: 'sensor-rows', attrs: { role: 'group' }, i18nAttr: 'aria-label:drive.perception.bars' });
  let rows = [];
  function build(n) {
    const labeled = n <= READINGS_MAX;
    rows = Array.from({ length: n }, (_, i) => row({ nameKey: names.sensorKey, params: { n: i + 1 }, datum: { sensor: i + 1 }, labeled }));
    list.replaceChildren(...rows.map((r) => r.node));
    list.dataset.labeled = String(labeled);
    i18n.translateTree(list);
  }
  build(count);
  const speed = row({ nameKey: names.speedKey, datum: 'speed', labeled: true });
  speed.node.classList.add('speed-row');
  i18n.translateTree(speed.node);
  const node = el('div', { class: 'perception-rows' }, role ? roleTag('in') : null, list, speed.node);

  const width = (v) => `${Math.round(Math.max(0, Math.min(1, v)) * 100)}%`;
  function update(perception) {
    if (perception.sensors.length !== rows.length) build(perception.sensors.length);
    const read = readings(perception);
    perception.sensors.forEach((v, i) => {
      const w = width(v);
      if (rows[i].fill.style.width !== w) rows[i].fill.style.width = w;
    });
    if (read.sensors) read.sensors.forEach((v, i) => writeText(rows[i].value, formatFixed(v, 2, i18n.language)));
    const sw = width(read.speed);
    if (speed.fill.style.width !== sw) speed.fill.style.width = sw;
    writeText(speed.value, formatFixed(read.speed, 2, i18n.language));
    shown = { sensors: read.sensors ?? [], speed: read.speed };
  }
  /** Vuelve a escribir los nombres y las ayudas en el idioma activo. */
  function relabel() {
    for (const r of [...rows, speed]) {
      if (r.name) setText(r.name, r.nameKey, r.params);
      if (r.node.tagName === 'BUTTON') r.node.setAttribute('data-help-params', JSON.stringify({ name: i18n.t(r.nameKey, r.params) }));
    }
  }
  return { node, update, relabel };
}

/**
 * Los cuatro controles del auto; cada uno se resalta mientras está accionado.
 *
 * Con la red manejando de corrido (`live`), una tecla que se encendería y apagaría más de tres veces en
 * un segundo se ve quieta, rayada y a medio encender (`data-on="mixed"`, con la parte del último medio
 * segundo que estuvo encendida en `--action-level`), y su nombre accesible dice que titubea
 * (sin-destellos-en-la-red D4). Sin `live` (en pausa, paso a paso o manejando la persona), exacta.
 * @param {{i18n?: object, role?: boolean}} [spec] con `i18n`, el texto de "titubea" para el lector de pantalla; con
 *   `role`, el rótulo "Sale · lo que acciona" arriba de las teclas (sistema-de-diseno-base 5.2)
 * @returns {{node: HTMLElement, update:(controls:{forward:boolean, reverse:boolean, left:boolean, right:boolean}, opts?:{live?:boolean, now?:number}) => void}}
 */
export function actionBlock({ i18n = null, role = false } = {}) {
  const flickerText = () => (i18n ? i18n.t('flicker.action') : '');
  const marks = {};
  const keys = Object.fromEntries(ACTIONS.map((a) => {
    marks[a] = el('span', { class: 'v2-sr-only action-flicker' });
    marks[a].hidden = true;
    return [a, el('span', { class: `action-key action-${a}`, dataset: { on: 'false' } },
      el('span', { class: 'action-glyph', i18n: `drive.action.${a}.key`, attrs: { 'aria-hidden': 'true' } }),
      el('span', { class: 'action-name', i18n: `drive.action.${a}` }),
      marks[a])];
  }));
  const node = el('div', { class: 'action-keys' }, role ? roleTag('out') : null, ACTIONS.map((a) => keys[a]));
  const guard = createFlashGuard();
  function update(controls, { live = false, now = globalThis.performance?.now() ?? 0 } = {}) {
    if (!live) guard.reset();
    for (const a of ACTIONS) {
      const exact = Boolean(controls[a]);
      let on = String(exact);
      let level = null;
      if (live) {
        const g = guard.show(`a:${a}`, exact ? 1 : 0, now);
        if (g.flicker) { on = 'mixed'; level = g.level; }
      }
      const k = keys[a];
      if (k.dataset.on !== on) k.dataset.on = on;
      // Estado "se cumple" (sistema-de-diseno-base D6): la tecla encendida, con la misma barra que la línea del programa.
      if (on === 'true') { if (k.dataset.state !== 'holds') k.dataset.state = 'holds'; } else if (k.dataset.state) delete k.dataset.state;
      const lv = level === null ? '' : level.toFixed(2);
      if (k.style.getPropertyValue('--action-level') !== lv) {
        if (lv) k.style.setProperty('--action-level', lv); else k.style.removeProperty('--action-level');
      }
      const mixed = on === 'mixed';
      if (marks[a].hidden === mixed) marks[a].hidden = !mixed;
      const say = mixed ? flickerText() : '';
      if (marks[a].textContent !== say) marks[a].textContent = say;
    }
  }
  return { node, update };
}

// --- Tu decisión y la de la red (manejar-vos-en-inspeccionar D4) ------------------------------------
// La cola de coincidencia y el anunciador están en driving-logic.js.

/**
 * La decisión en dos filas: "Vos" (lo que aprieta la persona, exacto) y "La red" (lo que decidiría, con
 * la misma guarda de destellos que `actionBlock`). En cada tecla de la red, una marca de si coincide con
 * la de la persona: ✓ o ✗ (con texto para el lector), o ≈ si la tecla de la red titubea.
 * @param {{i18n: object, keys?: object}} spec claves de texto (por defecto, las de Inspeccionar)
 */
export function actionCompare({ i18n, keys: k = {} } = {}) {
  const keys = {
    you: 'inspect.compare.you', network: 'inspect.compare.network',
    match: 'inspect.compare.match', differ: 'inspect.compare.differ', ...k,
  };
  const you = actionBlock({ i18n });
  const net = actionBlock({ i18n });
  const marks = {};
  for (const a of ACTIONS) {
    const glyph = el('span', { class: 'action-match-glyph', attrs: { 'aria-hidden': 'true' } });
    const say = el('span', { class: 'v2-sr-only action-match-say' });
    marks[a] = { glyph, say, keyNet: net.node.querySelector(`.action-${a}`), keyYou: you.node.querySelector(`.action-${a}`) };
    marks[a].keyNet.append(el('span', { class: 'action-match' }, glyph, say));
  }
  const row = (labelKey, block, cls) => el('div', { class: `action-compare-row ${cls}` },
    el('span', { class: 'action-compare-label', i18n: labelKey }), block.node);
  const youRow = row(keys.you, you, 'action-compare-you');
  const netRow = row(keys.network, net, 'action-compare-network');
  const node = el('div', { class: 'action-compare' }, youRow, netRow);
  i18n?.translateTree?.(node);
  /**
   * @param {object} mine lo que aprieta la persona
   * @param {object} theirs lo que decidiría la red
   * @param {{live?:boolean, now?:number, decided?:boolean}} [opts] sin `decided`, la red todavía no decidió: sin marcas
   */
  function update(mine, theirs, { live = false, now = globalThis.performance?.now() ?? 0, decided = true } = {}) {
    you.update(mine);
    net.update(theirs, { live, now });
    setData(net.node, 'undecided', String(!decided));
    for (const a of ACTIONS) {
      const m = marks[a];
      const flicker = m.keyNet.dataset.on === 'mixed';
      const match = !decided ? '' : flicker ? 'flicker' : Boolean(mine[a]) === Boolean(theirs[a]) ? 'true' : 'false';
      if (m.keyNet.dataset.match !== match) { m.keyNet.dataset.match = match; m.keyYou.dataset.match = match; }
      writeText(m.glyph, match === 'true' ? '✓' : match === 'false' ? '✗' : match === 'flicker' ? '≈' : '');
      writeText(m.say, match === 'true' || match === 'false' ? `, ${i18n ? i18n.t(match === 'true' ? keys.match : keys.differ) : ''}` : '');
    }
  }
  return { node, update, you, network: net };
}

// Bloques del tablero compartidos por las pestañas 1 y 2 (design.md D5): las barras de lo que
// perciben los sensores, con su lectura y, si se pide, el nombre de cada dato; y los cuatro controles
// resaltados mientras se accionan. `readings` decide qué números se escriben y no usa el DOM.
import { el, setData } from '../../ui/dom.js';
import { formatFixed } from '../../ui/i18n.js';
import { createTextSetter } from '../../ui/controls.js';
import { createFlashGuard } from '../../render/flash-guard.js';

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
 *
 * Con la red manejando de corrido (`live`), una tecla que se encendería y apagaría más de tres veces en
 * un segundo se ve quieta, rayada y a medio encender (`data-on="mixed"`, con la parte del último medio
 * segundo que estuvo encendida en `--action-level`), y su nombre accesible dice que titubea
 * (sin-destellos-en-la-red D4). Sin `live` (en pausa, paso a paso o manejando la persona), exacta.
 * @param {{i18n?: object}} [spec] con `i18n`, el texto de "titubea" para el lector de pantalla
 * @returns {{node: HTMLElement, update:(controls:{forward:boolean, reverse:boolean, left:boolean, right:boolean}, opts?:{live?:boolean, now?:number}) => void}}
 */
export function actionBlock({ i18n = null } = {}) {
  const flickerText = () => (i18n ? i18n.t('flicker.action') : '');
  const marks = {};
  const keys = Object.fromEntries(ACTIONS.map((a) => {
    marks[a] = el('span', { class: 'sr-only action-flicker' });
    marks[a].hidden = true;
    return [a, el('span', { class: `action-key action-${a}`, dataset: { on: 'false' } },
      el('span', { class: 'action-glyph', i18n: `drive.action.${a}.key`, attrs: { 'aria-hidden': 'true' } }),
      el('span', { class: 'action-name', i18n: `drive.action.${a}` }),
      marks[a])];
  }));
  const node = el('div', { class: 'action-keys' }, ACTIONS.map((a) => keys[a]));
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

/** Cuadros de la cola de coincidencia: 10 s a 60 cuadros por segundo (el paso fijo de la simulación). */
export const MATCH_FRAMES = 600;
/** Entre dos anuncios al lector de la comparación, como mínimo (ms). */
export const COMPARE_ANNOUNCE_MS = 2000;

/** ¿Coinciden las cuatro acciones? */
export const sameControls = (a, b) => ACTIONS.every((k) => Boolean(a?.[k]) === Boolean(b?.[k]));

/**
 * Cola circular de los últimos `size` cuadros: en cada uno, si las cuatro acciones coincidieron. Sin DOM.
 * `percent()` es la parte de los cuadros guardados que coincidieron, redondeada a un entero (null sin cuadros).
 */
export function createMatchWindow(size = MATCH_FRAMES) {
  const ring = new Uint8Array(size);
  let count = 0;
  let next = 0;
  let matches = 0;
  return {
    push(match) {
      const v = match ? 1 : 0;
      if (count === size) matches -= ring[next]; else count += 1;
      ring[next] = v;
      matches += v;
      next = (next + 1) % size;
    },
    get count() { return count; },
    get matches() { return matches; },
    percent() { return count === 0 ? null : Math.round((100 * matches) / count); },
    reset() { ring.fill(0); count = 0; next = 0; matches = 0; },
  };
}

/**
 * Cuándo anunciar la comparación al lector: cuando cambia lo apretado o lo que haría la red (`key`), y
 * como mucho una vez cada `interval` ms. Un cambio que llega antes de tiempo se anuncia en la primera
 * consulta después del intervalo, si sigue distinto de lo último anunciado. Sin DOM.
 */
export function createCompareAnnouncer({ interval = COMPARE_ANNOUNCE_MS } = {}) {
  let said = null;
  let at = -Infinity;
  return {
    /** ¿Hay que anunciar ahora? Si devuelve true, `key` queda como lo último anunciado. */
    offer(key, now) {
      if (key === said || now - at < interval) return false;
      said = key;
      at = now;
      return true;
    },
    reset() { said = null; at = -Infinity; },
  };
}

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
    const say = el('span', { class: 'sr-only action-match-say' });
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

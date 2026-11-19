// Copia para la V2 de src/tabs/shared/response-curve.js (interfaz-v2, grupo 14): la V2 no importa la pantalla de la V1 (design.md D5).
// Cambian las importaciones y las clases de los botones; la conducta es la misma.
// Curva de respuesta de una neurona (vista-de-la-red, design.md D17), compartida por Inspeccionar y el
// Laboratorio. Cómo cambia la suma de la neurona elegida cuando una entrada de la red recorre su rango
// y las demás quedan como están. Tres anclas para que se entienda: la línea del cero con lo que sale de
// cada lado, el punto de "ahora" y una frase que la lee.
//
// La cuenta la hace responseCurve (núcleo, puro). Acá solo se dibuja: un SVG chico propio, porque el
// gráfico compartido no tiene la línea del cero con rótulos ni un punto que se arrastra.
//
// El punto se arrastra (y se mueve con las flechas) solo si la pestaña lo permite (`onDrag`): en
// Inspeccionar, en pausa, es otra forma de las entradas a mano.
import { el, setData } from '../dom.js';
import { formatValue } from '../../ui/i18n.js';
import { responseCurve, upstream } from '../../core/network-paths.js';

const SVG = 'http://www.w3.org/2000/svg';
/** Medidas del dibujo, en unidades del viewBox (se escala al ancho del panel). */
export const CURVE_BOX = Object.freeze({ width: 300, height: 120, left: 34, right: 8, top: 10, bottom: 18 });
/** Alto del dibujo en la forma chica (con el ancho de un tablero de 360 px, unos 72 px en pantalla). */
export const CURVE_COMPACT_HEIGHT = 66;

/**
 * Entrada que más aporta ahora a `target` (D17: la curva arranca en esa). En la primera capa oculta, la
 * de mayor |producto|; más atrás, la de mayor importancia en el camino hacia atrás (upstream). En un
 * empate, la de más arriba.
 */
export function strongestInput(trace, target) {
  if (!target || target.layer < 1) return 0;
  const count = trace.layers[0].neurons.length;
  const score = new Array(count).fill(0);
  if (target.layer === 1) {
    trace.layers[1].neurons[target.neuron].products.forEach((p, i) => { score[i] = Math.abs(p); });
  } else {
    for (const [key, v] of upstream(trace, target).links) {
      const [l, , i] = key.split(':').map(Number);
      if (l === 1) score[i] += v;
    }
  }
  let best = 0;
  for (let i = 1; i < count; i++) if (score[i] > score[best]) best = i;
  return best;
}

/** Escala de la suma: simétrica alrededor del cero, para que la línea del cero quede siempre adentro. */
export function curveScale(totals, nowTotal) {
  let m = Math.abs(nowTotal);
  for (const v of totals) m = Math.max(m, Math.abs(v));
  return m > 0 ? m * 1.1 : 1;
}

/**
 * @param {object} spec
 * @param {object} spec.i18n
 * @param {string} spec.idPrefix
 * @param {(i:number) => string} spec.names nombre completo de la entrada i
 * @param {(i:number) => string} spec.shortNames nombre corto, para su botón
 * @param {((input:number, value:number) => void)|null} [spec.onDrag] mover el punto (null: no se mueve)
 */
export function createResponseCurve({ i18n, idPrefix, names, shortNames, onDrag = null }) {
  const t = (k, p) => i18n.t(k, p);
  const fmt = (v) => formatValue(v, i18n.language);
  // Forma completa o chica (D20): la chica tiene el gráfico más bajo y solo la primera frase.
  let compact = false;
  const B = { ...CURVE_BOX };
  const plotW = B.width - B.left - B.right;
  let plotH = B.height - B.top - B.bottom;
  function setBox(isCompact) {
    B.height = isCompact ? CURVE_COMPACT_HEIGHT : CURVE_BOX.height;
    plotH = B.height - B.top - B.bottom;
    svg.setAttribute('viewBox', `0 0 ${B.width} ${B.height}`);
    frame.setAttribute('height', String(plotH));
    yBottom.setAttribute('y', String(B.top + plotH));
    for (const n of [xLeft, xRight, xName]) n.setAttribute('y', String(B.height - 4));
  }

  const titleId = `${idPrefix}-curve-title`;
  const title = el('h3', { class: 'curve-title', i18n: 'inspect.curve.title', help: 'inspect.curve', attrs: { id: titleId, tabindex: '0' } });
  const chips = el('div', { class: 'curve-chips', attrs: { role: 'group' }, i18nAttr: 'aria-label:inspect.curve.pick' });
  const svg = document.createElementNS(SVG, 'svg');
  svg.setAttribute('class', 'curve-graph');
  svg.setAttribute('viewBox', `0 0 ${B.width} ${B.height}`);
  svg.setAttribute('role', 'img');
  const mk = (tag, attrs = {}) => { const n = document.createElementNS(SVG, tag); for (const [k, v] of Object.entries(attrs)) n.setAttribute(k, String(v)); return n; };
  const frame = mk('rect', { x: B.left, y: B.top, width: plotW, height: plotH, class: 'curve-frame' });
  const zero = mk('line', { x1: B.left, x2: B.left + plotW, class: 'curve-zero' });
  const above = mk('text', { x: B.left + 4, class: 'curve-side', 'text-anchor': 'start' });
  const below = mk('text', { x: B.left + 4, class: 'curve-side', 'text-anchor': 'start' });
  const flipsGroup = mk('g', { class: 'curve-flips' });
  const path = mk('path', { class: 'curve-line' });
  const dot = mk('circle', { r: 5, class: 'curve-dot' });
  const yTop = mk('text', { x: B.left - 4, y: B.top + 8, class: 'curve-axis', 'text-anchor': 'end' });
  const yBottom = mk('text', { x: B.left - 4, y: B.top + plotH, class: 'curve-axis', 'text-anchor': 'end' });
  const xLeft = mk('text', { x: B.left, y: B.height - 4, class: 'curve-axis', 'text-anchor': 'start' });
  const xRight = mk('text', { x: B.left + plotW, y: B.height - 4, class: 'curve-axis', 'text-anchor': 'end' });
  const xName = mk('text', { x: B.left + plotW / 2, y: B.height - 4, class: 'curve-axis', 'text-anchor': 'middle' });
  svg.append(frame, zero, above, below, flipsGroup, path, dot, yTop, yBottom, xLeft, xRight, xName);
  // El punto como deslizador de verdad (teclado y lector), encima del dibujo.
  const handle = el('div', {
    class: 'curve-handle', help: 'inspect.curve.handle', dataset: { focus: 'keep' },
    attrs: { role: 'slider', tabindex: '0', 'aria-orientation': 'horizontal' },
  });
  const plot = el('div', { class: 'curve-plot' }, svg, handle);
  const sentence = el('p', { class: 'caption curve-sentence', attrs: { id: `${idPrefix}-curve-sentence` } });
  // El lector de pantalla lee la frase entera, también en la forma chica (aria-label, en sync).
  const node = el('section', { class: 'curve', attrs: { 'aria-labelledby': titleId } }, title, chips, plot, sentence);

  let chosen = null; // entrada elegida a mano (se recuerda entre neuronas mientras exista)
  let auto = { key: '', input: 0 }; // la que más aportaba al elegir la neurona: no salta en cada cuadro
  let chipKey = '';
  let chipButtons = [];
  let last = null; // { input, range, now, draggable }
  const write = (n, text) => { if (n.textContent !== text) n.textContent = text; };
  const setAttr = (n, k, v) => { const s = String(v); if (n.getAttribute(k) !== s) n.setAttribute(k, s); };

  function buildChips(count) {
    chips.replaceChildren();
    chipButtons = Array.from({ length: count }, (_, i) => {
      const b = el('button', {
        class: 'curve-chip', help: 'inspect.curve.chip', dataset: { focus: 'keep', input: String(i) },
        attrs: { type: 'button', 'aria-pressed': 'false' },
        on: { click: () => { chosen = i; if (lastState) sync(lastState); } },
      });
      chips.append(b);
      return b;
    });
  }

  const xOf = (x, range) => B.left + ((x - range[0]) / (range[1] - range[0])) * plotW;
  const yOf = (v, scale) => B.top + plotH / 2 - (v / scale) * (plotH / 2);
  const valueAt = (clientX) => {
    const r = svg.getBoundingClientRect();
    const unit = ((clientX - r.left) / r.width) * B.width;
    const k = Math.max(0, Math.min(1, (unit - B.left) / plotW));
    return last.range[0] + k * (last.range[1] - last.range[0]);
  };

  // Arrastre del punto (solo si la pestaña lo permite en este momento).
  let dragging = null;
  const startDrag = (e) => {
    if (!last?.draggable || e.button !== 0) return;
    e.preventDefault();
    dragging = e.pointerId;
    try { e.currentTarget.setPointerCapture(e.pointerId); } catch { /* sin captura */ }
    handle.focus({ preventScroll: true });
    chosen = last.input; // mientras se mueve, la curva no cambia de entrada
    onDrag(last.input, valueAt(e.clientX));
  };
  const moveDrag = (e) => { if (dragging === e.pointerId && last?.draggable) onDrag(last.input, valueAt(e.clientX)); };
  const endDrag = (e) => { if (dragging === e.pointerId) dragging = null; };
  for (const target of [svg, handle]) {
    target.addEventListener('pointerdown', startDrag);
    target.addEventListener('pointermove', moveDrag);
    target.addEventListener('pointerup', endDrag);
    target.addEventListener('pointercancel', endDrag);
  }
  handle.addEventListener('keydown', (e) => {
    if (!last?.draggable) return;
    const dir = e.key === 'ArrowRight' || e.key === 'ArrowUp' ? 1 : e.key === 'ArrowLeft' || e.key === 'ArrowDown' ? -1 : 0;
    if (!dir) return;
    e.preventDefault();
    e.stopPropagation();
    chosen = last.input;
    onDrag(last.input, last.now.x + dir * (e.shiftKey ? 0.1 : 0.01));
  });

  let lastState = null;
  /**
   * @param {object} state
   * @param {object} state.net la red (sin los cambios: se pasan aparte)
   * @param {number[]} state.inputs lo que recibe la red ahora
   * @param {object} state.trace la cuenta de ahora (para la entrada que más aporta)
   * @param {{layer:number, neuron:number}} state.target
   * @param {object|null} [state.changes] cambios de prueba (Inspeccionar)
   * @param {object|null} [state.off] partes apagadas (Laboratorio)
   * @param {boolean} [state.soft] activaciones suaves (Laboratorio)
   * @param {(i:number) => [number, number]} state.range rango de cada entrada
   * @param {boolean} [state.draggable] el punto se puede mover ahora
   * @param {string} [state.title] título propio (en el tablero del Laboratorio, con el nombre de la neurona)
   */
  function sync(state) {
    lastState = state;
    const { net, inputs, trace, target } = state;
    const count = inputs.length;
    if (chipKey !== String(count)) { chipKey = String(count); buildChips(count); chosen = null; }
    const targetKey = `${target.layer}:${target.neuron}`;
    if (auto.key !== targetKey) auto = { key: targetKey, input: strongestInput(trace, target) };
    const input = chosen !== null && chosen < count ? chosen : auto.input;
    const range = state.range(input);
    const c = responseCurve(net, inputs, target, input, { changes: state.changes ?? null, off: state.off ?? null, soft: Boolean(state.soft), range });
    const draggable = Boolean(onDrag && state.draggable);
    last = { input, range, now: c.now, draggable };
    chipButtons.forEach((b, i) => {
      write(b, shortNames(i));
      setAttr(b, 'aria-label', names(i));
      setAttr(b, 'aria-pressed', i === input);
    });
    // Dibujo
    const scale = curveScale(c.totals, c.now.total);
    const y0 = yOf(0, scale);
    setAttr(zero, 'y1', y0.toFixed(1));
    setAttr(zero, 'y2', y0.toFixed(1));
    const n = trace.layers[target.layer].neurons[target.neuron];
    const act = n.activation;
    write(above, t(`inspect.curve.above.${act}`));
    write(below, t(`inspect.curve.below.${act}`));
    setAttr(above, 'y', (y0 - 4).toFixed(1));
    setAttr(below, 'y', (y0 + 11).toFixed(1));
    const d = c.xs.map((x, k) => `${k === 0 ? 'M' : 'L'}${xOf(x, range).toFixed(1)} ${yOf(c.totals[k], scale).toFixed(1)}`).join(' ');
    setAttr(path, 'd', d);
    flipsGroup.replaceChildren(...c.flips.map((x) => {
      const X = xOf(x, range).toFixed(1);
      return mk('line', { x1: X, x2: X, y1: B.top, y2: B.top + plotH, class: 'curve-flip' });
    }));
    const dx = xOf(Math.max(range[0], Math.min(range[1], c.now.x)), range);
    const dy = yOf(c.now.total, scale);
    setAttr(dot, 'cx', dx.toFixed(1));
    setAttr(dot, 'cy', dy.toFixed(1));
    write(yTop, fmt(scale / 1.1));
    write(yBottom, fmt(-scale / 1.1));
    write(xLeft, fmt(range[0]));
    write(xRight, fmt(range[1]));
    write(xName, names(input));
    // El deslizador sobre el punto: posición en porcentaje del recuadro.
    handle.hidden = !draggable;
    setData(node, 'draggable', String(draggable));
    if (draggable) {
      handle.style.left = `${((dx / B.width) * 100).toFixed(2)}%`;
      handle.style.top = `${((dy / B.height) * 100).toFixed(2)}%`;
      setAttr(handle, 'aria-label', t('inspect.curve.handle.label', { input: names(input) }));
      setAttr(handle, 'aria-valuemin', range[0]);
      setAttr(handle, 'aria-valuemax', range[1]);
      setAttr(handle, 'aria-valuenow', c.now.x);
      setAttr(handle, 'aria-valuetext', fmt(c.now.x));
    }
    // La frase que la lee
    const outText = act === 'step' ? t(c.now.output === 1 ? 'inspect.curve.out.one' : 'inspect.curve.out.zero') : t('inspect.curve.out.value', { value: fmt(c.now.output) });
    const parts = [t('inspect.curve.now', { input: names(input), x: fmt(c.now.x), total: fmt(c.now.total), out: outText })];
    if (target.layer === 1) parts.push(t('inspect.curve.line', { weight: fmt(n.weights[input]) }));
    else if (state.soft) parts.push(t('inspect.curve.smooth'));
    else parts.push(t('inspect.curve.steps'));
    if (c.flips.length === 0) parts.push(t('inspect.curve.noFlip', { input: names(input) }));
    else parts.push(t('inspect.curve.flip', { input: names(input), x: c.flips.map((x) => fmt(x)).join(', ') }));
    write(sentence, compact ? parts[0] : parts.join(' '));
    svg.setAttribute('aria-label', parts.join(' '));
    if (state.title) write(title, state.title);
    return c;
  }

  /** Forma chica o completa (D20). */
  function setCompact(on) {
    if (compact === Boolean(on)) return;
    compact = Boolean(on);
    setBox(compact);
    setData(node, 'compact', String(compact));
    if (lastState) sync(lastState);
  }

  return { node, sync, setCompact, get compact() { return compact; }, get input() { return last?.input ?? null; }, get handle() { return handle; }, get svg() { return svg; } };
}

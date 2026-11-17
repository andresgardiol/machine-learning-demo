// Tarjeta de la neurona elegida, compartida por Inspeccionar y el Laboratorio (pestana-inspeccionar D8
// y D9; pestana-laboratorio D15). Inspeccionar usa la completa (createNeuronCard); el Laboratorio, la
// compacta (createCompactNeuronCard): una fila por conexión con su deslizador, su campo y apagar, el
// sesgo y el botón de apagar, sin entrada a mano ni el dibujo de la activación.
//
// Tarjeta completa: la cuenta real de una sola
// neurona y el lugar donde se la cambia. Una tabla con una fila por entrada (de dónde viene, valor,
// peso con su deslizador, producto con una barra según el signo, y apagar la conexión) y al pie, fijo,
// la suma, el sesgo (con su deslizador), la activación con un gráfico chico y la salida. En una
// entrada: qué sensor es, qué lee, de dónde sale ese número y, en pausa, un deslizador para ponerla a
// mano. Las filas se desplazan por dentro; el pie queda a la vista.
//
// La tarjeta no calcula: muestra la cuenta de traceNetwork. Los números se escriben con dos decimales;
// los totales se calculan con los números enteros y se redondean al final (lo dice un tooltip).
import { el, setData } from '../../ui/dom.js';
import { formatValue } from '../../ui/i18n.js';
import { createTextSetter } from '../../ui/controls.js';
import { activationFunction } from '../../core/network.js';
import { neuronLabel, layerName, activationName } from '../inspect/describe.js';
import { OUTPUT_KEYS } from '../../render/network-view.js';
import { focusOp } from '../../core/pass-cursor.js';

/**
 * Rango del deslizador de un peso o un sesgo: [−base, base], o hasta el valor si está más lejos. En
 * Inspeccionar la base es 1 (pesos de la evolución); en el Laboratorio, 3 (los de backpropagation
 * pasan de 1 seguido).
 */
export function weightRange(original, base = 1) {
  const m = Math.max(base, Math.ceil(Math.abs(original) * 100) / 100);
  return { min: -m, max: m, step: 0.01 };
}

/**
 * Filas que muestra la tarjeta con el filtro de conexiones: las destacadas, en su orden, y la suma de
 * los productos de las demás. Sin filtro, todas.
 * @returns {{rows:number[], others:{count:number, sum:number}|null}}
 */
export function cardRows(products, topSet) {
  const all = products.map((_, i) => i);
  if (!topSet) return { rows: all, others: null };
  const rows = all.filter((i) => topSet.has(i));
  const rest = all.filter((i) => !topSet.has(i));
  if (rest.length === 0) return { rows, others: null };
  let sum = 0;
  for (const i of rest) sum += products[i];
  return { rows, others: { count: rest.length, sum } };
}

const ACT_RANGE = 3; // el gráfico de la activación va de −3 a 3

/** Puntos del gráfico de una activación (escalón, sigmoide, tanh o ReLU) en un recuadro w × h. */
export function activationPath(name, w, h) {
  const fn = activationFunction(name);
  const yMin = name === 'tanh' ? -1 : 0;
  const yMax = name === 'relu' ? ACT_RANGE : 1;
  const pts = [];
  const N = 48;
  for (let k = 0; k <= N; k++) {
    const x = -ACT_RANGE + (2 * ACT_RANGE * k) / N;
    pts.push([(k / N) * w, h - ((fn(x) - yMin) / (yMax - yMin)) * h]);
  }
  const point = (total, output) => [
    ((Math.max(-ACT_RANGE, Math.min(ACT_RANGE, total)) + ACT_RANGE) / (2 * ACT_RANGE)) * w,
    h - ((Math.max(yMin, Math.min(yMax, output)) - yMin) / (yMax - yMin)) * h,
  ];
  return { d: pts.map((p, k) => `${k === 0 ? 'M' : 'L'}${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(' '), point };
}

/**
 * @param {object} spec
 * @param {object} spec.i18n
 * @param {(target:object) => void} spec.onToggleNeuron apagar o encender la neurona elegida
 * @param {(input:number) => void} spec.onToggleConnection
 * @param {(input:number, value:number) => void} spec.onWeight
 * @param {(value:number) => void} spec.onBias
 * @param {(input:number, value:number) => void} spec.onManualInput
 * @param {(input:number) => void} [spec.onSelectConnection]
 */
export function createNeuronCard({ i18n, onToggleNeuron, onToggleConnection, onWeight, onBias, onManualInput, onSelectConnection = () => {} }) {
  const t = (k, p) => i18n.t(k, p);
  const setText = createTextSetter(i18n);
  const fmt = (v) => formatValue(v, i18n.language);
  const SVG = 'http://www.w3.org/2000/svg';

  const title = el('h2', { class: 'panel-heading inspect-card-title', attrs: { id: 'inspect-card-title' } });
  const subtitle = el('span', { class: 'inspect-card-sub muted' });
  const offButton = el('button', { class: 'tool small inspect-off', help: 'inspect.turnOff', attrs: { type: 'button', 'aria-pressed': 'false' }, on: { click: () => onToggleNeuron() } });
  const head = el('div', { class: 'inspect-card-head' }, el('div', { class: 'inspect-card-names' }, title, subtitle), offButton);

  // Filas (una por entrada)
  const tbody = el('tbody');
  const table = el('table', { class: 'inspect-rows', attrs: { 'aria-labelledby': 'inspect-card-title' } },
    el('thead', {}, el('tr', {},
      el('th', { attrs: { scope: 'col' }, i18n: 'inspect.card.from', help: 'inspect.card.from' }),
      el('th', { class: 'num', attrs: { scope: 'col' }, i18n: 'inspect.card.value', help: 'inspect.card.value' }),
      el('th', { class: 'num', attrs: { scope: 'col' }, i18n: 'inspect.card.weight', help: 'inspect.card.weight' }),
      el('th', { class: 'num', attrs: { scope: 'col' }, i18n: 'inspect.card.product', help: 'inspect.card.product' }),
      el('th', { class: 'inspect-col-off', attrs: { scope: 'col' } }, el('span', { class: 'sr-only', i18n: 'inspect.card.offColumn' })))),
    tbody);
  const scroller = el('div', { class: 'inspect-rows-scroll' }, table);

  // Entrada: qué es, qué lee y su deslizador en pausa.
  const inputWhat = el('p', { class: 'inspect-input-what' });
  const inputReading = el('p', { class: 'inspect-input-reading' });
  const inputSliderId = 'inspect-input-slider';
  const inputSliderValue = el('output', { class: 'setting-value', attrs: { for: inputSliderId } });
  const inputSlider = el('input', {
    help: 'inspect.manual.slider',
    attrs: { type: 'range', id: inputSliderId, min: 0, max: 1, step: 0.01 },
    on: { input: (e) => onManualInput(current.target.neuron, Number(e.target.value)) },
  });
  const inputSliderRow = el('div', { class: 'setting inspect-input-slider' },
    el('label', { class: 'setting-label', attrs: { for: inputSliderId }, i18n: 'inspect.manual.label' }), inputSliderValue, inputSlider);
  const inputBlock = el('div', { class: 'inspect-input' }, inputWhat, inputReading, inputSliderRow);

  // Pie: suma, sesgo, activación y salida.
  const sumValue = el('dd', { class: 'num' });
  const sumLabel = el('dt', { i18n: 'inspect.op.sum', help: 'inspect.card.sum' });
  let lastCurrent = null; // la fila en curso que se trajo a la vista
  const biasValue = el('span', { class: 'num inspect-bias-value' });
  const biasOriginal = el('span', { class: 'inspect-original muted' });
  const biasId = 'inspect-bias-slider';
  const biasSlider = el('input', {
    help: 'inspect.bias.slider', attrs: { type: 'range', id: biasId, step: 0.01 },
    on: { input: (e) => onBias(Number(e.target.value)) },
  });
  const actName = el('span', { class: 'inspect-act-name' });
  const actValue = el('dd', { class: 'num' });
  const graph = document.createElementNS(SVG, 'svg');
  graph.setAttribute('class', 'inspect-act-graph');
  graph.setAttribute('viewBox', '0 0 64 28');
  graph.setAttribute('width', '64');
  graph.setAttribute('height', '28');
  graph.setAttribute('aria-hidden', 'true');
  const curve = document.createElementNS(SVG, 'path');
  curve.setAttribute('class', 'inspect-act-curve');
  const dot = document.createElementNS(SVG, 'circle');
  dot.setAttribute('r', '3');
  dot.setAttribute('class', 'inspect-act-dot');
  graph.append(curve, dot);
  const outValue = el('dd', { class: 'num inspect-out' });
  const roundNote = el('p', { class: 'caption muted inspect-round', i18n: 'inspect.card.rounding', help: 'inspect.card.rounding', attrs: { tabindex: '0' } });
  const foot = el('dl', { class: 'inspect-foot' },
    el('div', { class: 'inspect-foot-row', dataset: { op: 'sum' } }, sumLabel, sumValue),
    el('div', { class: 'inspect-foot-row inspect-foot-bias', dataset: { op: 'bias' } },
      el('dt', {}, el('label', { attrs: { for: biasId }, i18n: 'inspect.op.bias', help: 'inspect.term.bias' })),
      el('dd', { class: 'inspect-bias' }, el('span', { class: 'inspect-bias-line' }, biasValue, biasOriginal), biasSlider)),
    el('div', { class: 'inspect-foot-row', dataset: { op: 'activation' } },
      el('dt', { i18n: 'inspect.op.activation', help: 'inspect.term.activation' }),
      el('dd', { class: 'inspect-act' }, actName, graph, actValue)),
    el('div', { class: 'inspect-foot-row inspect-foot-out', dataset: { op: 'output' } }, el('dt', { i18n: 'inspect.card.output', help: 'inspect.card.output' }), outValue));
  const outputRule = el('p', { class: 'caption inspect-output-rule' });
  // La cuenta escrita (D7): "suma −0,07 + sesgo 0,00 = −0,07 → escalón → 0".
  const formula = el('p', { class: 'inspect-formula num' });
  const footBlock = el('div', { class: 'inspect-foot-block' }, formula, foot, outputRule, roundNote);

  // Lo que titubea (sin-destellos-en-la-red D5): entre qué valores y cuánto del último segundo en cada uno.
  const flickerNote = el('p', { class: 'caption inspect-flicker', help: 'flicker', attrs: { tabindex: '0' } });
  flickerNote.hidden = true;
  const node = el('section', { class: 'inspect-card', attrs: { 'aria-labelledby': 'inspect-card-title' } }, head, flickerNote, inputBlock, scroller, footBlock);

  let current = { key: null, target: null };
  let rowNodes = new Map(); // input → nodos de la fila
  let othersRow = null;
  let actKey = '';

  let openInput = null; // fila con el deslizador abierto
  function openRow(i) {
    if (openInput === i) return;
    openInput = i;
    for (const [k, r] of rowNodes) {
      const open = k === i;
      r.sliderRow.hidden = !open || r.row.hidden;
      r.weightButton.setAttribute('aria-expanded', String(open));
    }
  }

  function buildRows(state) {
    const { target, sizes } = state;
    tbody.replaceChildren();
    rowNodes = new Map();
    openInput = null;
    const n = sizes[target.layer - 1];
    for (let i = 0; i < n; i++) {
      // El nombre de la entrada es un botón que elige esa conexión (vista-de-la-red D7).
      const fromButton = el('button', {
        class: 'inspect-from-button', help: 'inspect.card.pickLink', dataset: { focus: 'keep' },
        attrs: { type: 'button' }, on: { click: () => onSelectConnection(i) },
      });
      const from = el('th', { attrs: { scope: 'row' }, class: 'inspect-from' }, fromButton);
      const value = el('td', { class: 'num' });
      const weightNum = el('span', { class: 'num inspect-weight-num' });
      const original = el('span', { class: 'inspect-original muted' });
      const sliderId = `inspect-w-${i}`;
      const slider = el('input', {
        help: 'inspect.weight.slider',
        attrs: { type: 'range', id: sliderId, step: 0.01 },
        on: { input: (e) => onWeight(i, Number(e.target.value)) },
      });
      // Un renglón por fila (vista-de-la-red D17): el peso es un botón; al hacerle clic o llegar con Tab,
      // la fila abre debajo un renglón con su deslizador a todo el ancho. Una fila abierta por vez.
      const weightButton = el('button', {
        class: 'inspect-weight-open', help: 'inspect.weight.open', dataset: { focus: 'keep' },
        attrs: { type: 'button', 'aria-expanded': 'false', 'aria-controls': `inspect-w-row-${i}` },
        on: { click: () => { openRow(i); slider.focus({ preventScroll: true }); }, focus: () => openRow(i) },
      }, el('span', { class: 'inspect-weight-line' }, weightNum));
      const weight = el('td', { class: 'inspect-weight' }, weightButton, original);
      slider.addEventListener('focus', () => openRow(i));
      // La barra de lo que aporta va al costado del número, nunca encima.
      const barFill = el('span', { class: 'inspect-bar-fill' });
      const productNum = el('span', { class: 'num' });
      // Marca de sumada (operacion-por-operacion D6): una tilde, no solo un color.
      const termMark = el('span', { class: 'inspect-term-mark', attrs: { 'aria-hidden': 'true' } });
      const product = el('td', { class: 'num inspect-product' },
        el('div', { class: 'inspect-product-box' }, termMark, el('span', { class: 'inspect-bar', attrs: { 'aria-hidden': 'true' } }, barFill), productNum));
      const off = el('button', {
        class: 'inspect-row-off', help: 'inspect.connection.off', dataset: { focus: 'keep' },
        attrs: { type: 'button', 'aria-pressed': 'false' }, on: { click: () => onToggleConnection(i) },
      }, el('span', { attrs: { 'aria-hidden': 'true' } }, '⏻'));
      const row = el('tr', { dataset: { input: String(i) } }, from, value, weight, product, el('td', { class: 'inspect-col-off' }, off));
      const sliderRow = el('tr', { class: 'inspect-slider-row', attrs: { id: `inspect-w-row-${i}` } },
        el('td', { attrs: { colspan: '5' } }, slider));
      sliderRow.hidden = true;
      tbody.append(row, sliderRow);
      rowNodes.set(i, { row, sliderRow, weightButton, from: fromButton, value, weightNum, original, slider, barFill, productNum, termMark, off, weight });
    }
    othersRow = el('tr', { class: 'inspect-others' },
      el('th', { attrs: { scope: 'row', colspan: '3' }, class: 'inspect-from' }),
      el('td', { class: 'num inspect-product' }),
      el('td', {}));
    tbody.append(othersRow);
    i18n.translateTree(table);
  }

  const write = (node2, text) => { if (node2.textContent !== text) node2.textContent = text; };
  const setAttr = (node2, k, v) => { if (node2.getAttribute(k) !== v) node2.setAttribute(k, v); };

  /**
   * @param {object} state
   * @param {{layer:number, neuron:number}} state.target
   * @param {number[]} state.sizes
   * @param {object} state.trace
   * @param {object} state.changes conjunto de cambios (para el valor original y las marcas)
   * @param {object} state.original la red del cerebro, sin cambios
   * @param {object|null} state.cursor cursor que ve la vista (lo no hecho va con raya)
   * @param {Set<number>|null} state.top entradas destacadas de esta neurona (filtro) o null
   * @param {boolean} state.paused
   * @param {(number|null)[]} state.manual lectura a mano de cada entrada (null si no)
   * @param {number|null} state.connection conexión elegida (fila destacada)
   * @param {{low:number, high:number, highShare:number}|null} [state.flicker] si titubea: sus dos valores y
   *   la parte del último segundo en el mayor (sin-destellos-en-la-red D5)
   */
  function sync(state) {
    const { target, sizes, trace, changes, original, cursor, top, paused } = state;
    const fl = state.flicker ?? null;
    if (flickerNote.hidden === Boolean(fl)) flickerNote.hidden = !fl;
    if (fl) {
      write(flickerNote, t('inspect.card.flicker', { low: fmt(fl.low), high: fmt(fl.high), share: `${Math.round(fl.highShare * 100)} %` }));
    }
    const key = `${sizes.join('-')}|${target.layer}:${target.neuron}`;
    const isInput = target.layer === 0;
    const isOutput = target.layer === sizes.length - 1;
    if (outputRule.hidden === isOutput) outputRule.hidden = !isOutput;
    if (isOutput) write(outputRule, t('inspect.card.outputRule', { action: t(`network.output.${OUTPUT_KEYS[target.neuron]}`) }));
    const n = trace.layers[target.layer].neurons[target.neuron];
    if (key !== current.key) {
      current = { key, target };
      if (!isInput) buildRows(state);
      scroller.scrollTop = 0;
    }
    current.target = target;

    // Título
    const hiddenNeuron = !isInput && !isOutput;
    write(title, hiddenNeuron ? t('inspect.card.neuron', { n: target.neuron + 1 }) : neuronLabel(t, sizes, target.layer, target.neuron));
    const sub = isInput ? layerName(t, 0, sizes.length)
      : isOutput ? t('inspect.card.outputOf', { action: t(`network.output.${OUTPUT_KEYS[target.neuron]}`) })
        : layerName(t, target.layer, sizes.length);
    write(subtitle, sub);
    const off = Boolean(n.off);
    setText(offButton, off ? 'inspect.turnOn' : 'inspect.turnOff');
    setData(offButton, 'help', off ? 'inspect.turnOn' : 'inspect.turnOff');
    setAttr(offButton, 'aria-pressed', String(off));
    setData(node, 'off', String(off));

    if (inputBlock.hidden === isInput) inputBlock.hidden = !isInput;
    if (scroller.hidden !== isInput) scroller.hidden = isInput;
    if (footBlock.hidden !== isInput) footBlock.hidden = isInput;
    if (isInput) {
      const speed = target.neuron === sizes[0] - 1;
      write(inputWhat, speed ? t('inspect.input.speed.what') : t('inspect.input.sensor.what', { n: target.neuron + 1 }));
      const manualValue = state.manual?.[target.neuron] ?? null;
      write(inputReading, t(manualValue !== null ? 'inspect.input.readingManual' : 'inspect.input.reading', { value: fmt(n.raw) }));
      if (inputSliderRow.hidden === paused) inputSliderRow.hidden = !paused;
      if (paused) {
        const min = speed ? -1 : 0;
        setAttr(inputSlider, 'min', String(min));
        setAttr(inputSlider, 'aria-valuetext', fmt(n.raw));
        if (document.activeElement !== inputSlider && Number(inputSlider.value) !== n.raw) inputSlider.value = String(n.raw);
        write(inputSliderValue, fmt(n.raw));
        setData(inputSlider, 'help', speed ? 'inspect.manual.speed' : 'inspect.manual.slider');
      }
      return;
    }

    const ops = cursor ? cursor.opsDone(target.layer, target.neuron) : 4;
    const has = (k) => ops > k; // 0 productos, 1 suma, 2 sesgo, 3 activación
    // De a operaciones (operacion-por-operacion D6), con un cursor que dice qué entradas van hechas: la
    // cuenta fila por fila. Sin él (Laboratorio), los aportes de la neurona todos juntos, como siempre.
    // La fila en curso es la de la operación recién hecha (operacion-por-operacion D5, focusOp): la misma
    // que explica la franja. Con los demás tamaños, la próxima.
    const opNow = cursor && typeof cursor.terms === 'function' ? focusOp(cursor, state.stepSize ?? 'operation') : null;
    const here = Boolean(opNow) && opNow.layer === target.layer && opNow.neuron === target.neuron;
    const tm = cursor && typeof cursor.terms === 'function' && (ops < 4 || (here && opNow.op === 'activation' && state.stepSize === 'operation')) ? cursor.terms(target.layer, target.neuron) : null;
    const curInput = here && (opNow.op === 'multiply' || opNow.op === 'add') ? opNow.input : null;
    const fineOp = here ? (curInput !== null ? 'sum' : opNow.op) : null;
    const curOp = tm ? fineOp : cursor && ops > 0 && ops < 4 ? ['products', 'sum', 'bias', 'activation'][ops - 1] : null;
    setData(node, 'op', tm ? 'fine' : curOp ?? (ops === 4 ? 'done' : 'pending'));
    const multiplied = (i) => (tm ? i < tm.multiplied : has(0));

    const { rows, others } = cardRows(n.products, top);
    const shown = new Set(rows);
    if (curInput !== null) shown.add(curInput); // la fila en curso se ve aunque el filtro la deje en «Otras»
    // Barras con signo: el largo es relativo al mayor producto de esta neurona (D7).
    let maxProduct = 0;
    for (const p of n.products) maxProduct = Math.max(maxProduct, Math.abs(p));
    for (const [i, r] of rowNodes) {
      const visible = shown.has(i);
      if (r.row.hidden === visible) r.row.hidden = !visible;
      const sliderOpen = visible && openInput === i;
      if (r.sliderRow.hidden === sliderOpen) r.sliderRow.hidden = !sliderOpen;
      if (!visible) continue;
      const fromName = neuronLabel(t, sizes, target.layer - 1, i);
      write(r.from, fromName);
      setAttr(r.from, 'aria-label', t('inspect.card.pickLinkLabel', { from: fromName }));
      setAttr(r.from, 'aria-pressed', String(state.connection === i));
      write(r.value, fmt(n.from[i]));
      const w = n.weights[i];
      write(r.weightNum, fmt(w));
      const orig = original.layers[target.layer - 1].weights[target.neuron][i];
      const changed = changes.has({ kind: 'weight', layer: target.layer, neuron: target.neuron, input: i });
      write(r.original, changed ? t('inspect.original', { value: fmt(orig) }) : '');
      setData(r.weight, 'changed', String(changed));
      const range = weightRange(orig);
      setAttr(r.slider, 'min', String(range.min));
      setAttr(r.slider, 'max', String(range.max));
      setAttr(r.slider, 'aria-label', t('inspect.weight.label', { from: neuronLabel(t, sizes, target.layer - 1, i) }));
      setAttr(r.slider, 'aria-valuetext', fmt(w));
      setAttr(r.weightButton, 'aria-label', t('inspect.weight.openLabel', { from: neuronLabel(t, sizes, target.layer - 1, i), value: fmt(w) }));
      if (document.activeElement !== r.slider && Number(r.slider.value) !== w) r.slider.value = String(w);
      const connOff = Boolean(n.offConnections?.[i]);
      setData(r.row, 'off', String(connOff || trace.layers[target.layer - 1].neurons[i].off));
      setAttr(r.off, 'aria-pressed', String(connOff));
      setAttr(r.off, 'aria-label', t(connOff ? 'inspect.connection.on.label' : 'inspect.connection.off.label', { from: neuronLabel(t, sizes, target.layer - 1, i) }));
      setData(r.off, 'help', connOff ? 'inspect.connection.on' : 'inspect.connection.off');
      const p = n.products[i];
      const done = multiplied(i);
      write(r.productNum, done ? fmt(p) : '–');
      const width = done && maxProduct > 0 ? `${((Math.abs(p) / maxProduct) * 50).toFixed(1)}%` : '0%';
      const term = !tm ? 'none' : i < tm.added ? 'added' : done ? 'multiplied' : 'pending';
      setData(r.row, 'term', term);
      setData(r.row, 'current', String(i === curInput));
      write(r.termMark, term === 'added' ? '✓' : '');
      if (r.barFill.style.width !== width) r.barFill.style.width = width;
      setData(r.barFill, 'sign', p < 0 ? 'negative' : 'positive');
      setData(r.row, 'selected', String(state.connection === i));
    }
    if (othersRow.hidden !== !others) othersRow.hidden = !others;
    if (others) {
      write(othersRow.children[0], t('inspect.card.others', { count: others.count }));
      write(othersRow.children[1], has(0) && (!tm || tm.multiplied >= tm.inputs) ? fmt(others.sum) : '–');
    }
    // La fila en curso, a la vista dentro de las filas (sin mover la página).
    if (curInput !== null && curInput !== lastCurrent) {
      const r = rowNodes.get(curInput);
      const head = table.tHead?.offsetHeight ?? 0;
      const top0 = r.row.offsetTop - head;
      const bottom = r.row.offsetTop + r.row.offsetHeight;
      if (top0 < scroller.scrollTop) scroller.scrollTop = top0;
      else if (bottom > scroller.scrollTop + scroller.clientHeight) scroller.scrollTop = bottom - scroller.clientHeight;
    }
    lastCurrent = curInput;

    // Suma: completa, o la suma hasta acá mientras se van sumando los aportes.
    const midway = Boolean(tm) && tm.added > 0 && tm.added < tm.inputs;
    setText(sumLabel, midway ? 'inspect.card.partialSum' : 'inspect.op.sum');
    let partial = 0;
    if (midway) for (let q = 0; q < tm.added; q++) partial += n.products[q];
    write(sumValue, midway ? fmt(partial) : has(1) ? fmt(n.sum) : '–');
    write(biasValue, has(2) ? fmt(n.bias) : '–');
    const origBias = original.layers[target.layer - 1].biases[target.neuron];
    const biasChanged = changes.has({ kind: 'bias', layer: target.layer, neuron: target.neuron });
    write(biasOriginal, biasChanged ? t('inspect.original', { value: fmt(origBias) }) : '');
    setData(biasValue.parentElement, 'changed', String(biasChanged));
    const br = weightRange(origBias);
    setAttr(biasSlider, 'min', String(br.min));
    setAttr(biasSlider, 'max', String(br.max));
    setAttr(biasSlider, 'aria-valuetext', fmt(n.bias));
    if (document.activeElement !== biasSlider && Number(biasSlider.value) !== n.bias) biasSlider.value = String(n.bias);
    // Activación: nombre, gráfico con el punto donde cae, y la salida.
    write(actName, activationName(t, n.activation));
    if (actKey !== n.activation) {
      actKey = n.activation;
      curve.setAttribute('d', activationPath(n.activation, 64, 28).d);
    }
    const [cx, cy] = activationPath(n.activation, 64, 28).point(n.total, n.output);
    setAttr(dot, 'cx', cx.toFixed(1));
    setAttr(dot, 'cy', cy.toFixed(1));
    setAttr(dot, 'visibility', has(3) ? 'visible' : 'hidden');
    write(actValue, has(2) ? (isOutput ? t('inspect.card.total', { value: fmt(n.total) }) : `(${fmt(n.total)})`) : '–');
    const out = isOutput ? t(n.output === 1 ? 'inspect.card.yes' : 'inspect.card.no') : fmt(n.output);
    write(outValue, has(3) ? (off ? t('inspect.card.offOutput') : out) : '–');
    for (const row of foot.children) setData(row, 'current', String(row.dataset.op === curOp));
    write(formula, t('inspect.card.formula', {
      sum: has(1) ? fmt(n.sum) : '–', bias: has(2) ? fmt(n.bias) : '–', total: has(2) ? fmt(n.total) : '–',
      activation: activationName(t, n.activation), output: has(3) ? (off ? t('inspect.card.offOutput') : (isOutput ? String(n.output) : fmt(n.output))) : '–',
    }));
  }

  return { node, sync, get scroller() { return scroller; }, get rows() { return rowNodes; } };
}


/**
 * Valor escrito en un campo: un número (con coma o punto decimal) o null si no lo es.
 * @param {string} text
 */
export function parseWeight(text) {
  const clean = String(text ?? '').trim().replace(/\s/g, '').replace('−', '-').replace(',', '.');
  if (clean === '' || !/^[-+]?(\d+\.?\d*|\.\d+)(e[-+]?\d+)?$/i.test(clean)) return null;
  const v = Number(clean);
  return Number.isFinite(v) ? v : null;
}

/**
 * Tarjeta compacta (pestana-laboratorio D15).
 * @param {object} spec
 * @param {object} spec.i18n
 * @param {(target:object, l:number, j:number) => string} spec.names nombre de una neurona: names(l, j)
 * @param {(input:number, value:number, info:{gesture:string}) => void} spec.onWeight
 * @param {(value:number, info:{gesture:string}) => void} spec.onBias
 * @param {() => void} spec.onGestureEnd terminó un arrastre (el siguiente cambio cuenta aparte)
 * @param {() => void} spec.onToggleNeuron
 * @param {(input:number) => void} spec.onToggleConnection
 * @param {() => void} spec.onClose
 * @param {number} [spec.base] rango de los deslizadores (3)
 * @param {string} [spec.idPrefix]
 */
export function createCompactNeuronCard({ i18n, names, layerNames, onWeight, onBias, onGestureEnd, onToggleNeuron, onToggleConnection, onClose, onInput = null, base = 3, idPrefix = 'lab-card' }) {
  const t = (k, p) => i18n.t(k, p);
  const fmt = (v) => formatValue(v, i18n.language);
  const titleId = `${idPrefix}-title`;
  const title = el('h2', { class: 'panel-heading inspect-card-title', attrs: { id: titleId } });
  const subtitle = el('span', { class: 'inspect-card-sub muted' });
  const offButton = el('button', { class: 'tool small inspect-off', help: 'lab.card.turnOff', attrs: { type: 'button', 'aria-pressed': 'false' }, on: { click: () => onToggleNeuron() } });
  const closeButton = el('button', {
    class: 'tool small lab-card-close', help: 'lab.card.close', i18nAttr: 'aria-label:lab.card.close.label',
    attrs: { type: 'button' }, on: { click: () => onClose() },
  }, el('span', { attrs: { 'aria-hidden': 'true' } }, '×'));
  const head = el('div', { class: 'inspect-card-head' }, el('div', { class: 'inspect-card-names' }, title, subtitle), offButton, closeButton);
  const inputNote = el('p', { class: 'caption lab-card-input', i18n: 'lab.card.inputNote' });
  // Entrada x o y con puntos (punto-de-prueba D3): un deslizador que mueve el punto de prueba.
  const inputId = `${idPrefix}-input`;
  const inputValue = el('output', { class: 'setting-value', attrs: { for: inputId } });
  const inputSlider = el('input', {
    help: 'lab.probe.slider', dataset: { focus: 'keep' },
    attrs: { type: 'range', id: inputId, min: -1, max: 1, step: 0.01 },
    on: { input: (e) => { if (onInput && lastState) onInput(lastState.target.neuron, Number(e.target.value)); } },
  });
  const inputRow = el('div', { class: 'setting lab-card-probe' },
    el('label', { class: 'setting-label', attrs: { for: inputId } }), inputValue, inputSlider);
  inputRow.hidden = true;
  const tbody = el('tbody');
  const table = el('table', { class: 'inspect-rows lab-card-rows', attrs: { 'aria-labelledby': titleId } },
    el('thead', {}, el('tr', {},
      el('th', { attrs: { scope: 'col' }, i18n: 'inspect.card.from', help: 'inspect.card.from' }),
      el('th', { class: 'num', attrs: { scope: 'col' }, i18n: 'inspect.card.weight', help: 'lab.card.weight' }),
      el('th', { class: 'inspect-col-off', attrs: { scope: 'col' } }, el('span', { class: 'sr-only', i18n: 'inspect.card.offColumn' })))),
    tbody);
  const scroller = el('div', { class: 'inspect-rows-scroll lab-card-scroll' }, table);
  const biasId = `${idPrefix}-bias`;
  const biasSlider = el('input', { help: 'lab.card.bias', attrs: { type: 'range', id: biasId, step: 0.01 } });
  const biasField = el('input', { class: 'lab-card-field', help: 'lab.card.field', i18nAttr: 'aria-label:lab.card.biasField', attrs: { type: 'text', inputmode: 'decimal', size: '5' } });
  const biasRow = el('div', { class: 'lab-card-bias' },
    el('label', { attrs: { for: biasId }, i18n: 'inspect.op.bias', help: 'inspect.term.bias' }), biasSlider, biasField);
  const message = el('p', { class: 'caption lab-card-message', attrs: { role: 'status' } });
  // Lo que titubea (sin-destellos-en-la-red D5), como en Inspeccionar.
  const flickerNote = el('p', { class: 'caption inspect-flicker', help: 'flicker', attrs: { tabindex: '0' } });
  flickerNote.hidden = true;
  const node = el('section', { class: 'inspect-card lab-card', attrs: { 'aria-labelledby': titleId } }, head, flickerNote, inputNote, inputRow, scroller, biasRow, message);

  let key = null;
  let rows = [];
  let lastState = null;
  const write = (n, text) => { if (n.textContent !== text) n.textContent = text; };
  const setAttr = (n, k, v) => { if (n.getAttribute(k) !== v) n.setAttribute(k, v); };
  const say = (text) => write(message, text);

  /** Conecta un deslizador y su campo: un arrastre es un solo cambio; el campo cambia al confirmar. */
  function wire(slider, field, gestureKey, apply) {
    slider.addEventListener('input', (e) => apply(Number(e.target.value), { gesture: gestureKey() }));
    slider.addEventListener('change', () => onGestureEnd());
    const commit = () => {
      const v = parseWeight(field.value);
      if (v === null) { say(t('lab.card.notANumber', { text: field.value })); return; }
      say('');
      apply(v, { gesture: null });
      onGestureEnd();
    };
    field.addEventListener('change', commit);
    field.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); commit(); } });
  }
  wire(biasSlider, biasField, () => `b:${key}`, (v, info) => onBias(v, info));

  let openInput = null;
  function openRow(i) {
    if (openInput === i) return;
    openInput = i;
    rows.forEach((r, k) => { r.sliderRow.hidden = k !== i; r.weightButton.setAttribute('aria-expanded', String(k === i)); });
  }
  function build(state) {
    const { target, sizes } = state;
    tbody.replaceChildren();
    rows = [];
    openInput = null;
    if (target.layer === 0) return;
    for (let i = 0; i < sizes[target.layer - 1]; i++) {
      const from = el('th', { attrs: { scope: 'row' }, class: 'inspect-from' });
      const sliderId = `${idPrefix}-w-${i}`;
      const slider = el('input', { help: 'lab.card.slider', attrs: { type: 'range', id: sliderId, step: 0.01 } });
      const field = el('input', { class: 'lab-card-field', help: 'lab.card.field', attrs: { type: 'text', inputmode: 'decimal', size: '5' } });
      const off = el('button', {
        class: 'inspect-row-off', help: 'lab.card.connectionOff', dataset: { focus: 'keep' },
        attrs: { type: 'button', 'aria-pressed': 'false' }, on: { click: () => onToggleConnection(i) },
      }, el('span', { attrs: { 'aria-hidden': 'true' } }, '⏻'));
      // Como en Inspeccionar (vista-de-la-red D17, 4.12): el peso es un botón; al hacerle clic o llegar con
      // Tab, la fila abre debajo un renglón con su deslizador a todo el ancho y su campo. Una por vez.
      const weightNum = el('span', { class: 'num inspect-weight-num' });
      const weightButton = el('button', {
        class: 'inspect-weight-open', help: 'inspect.weight.open', dataset: { focus: 'keep' },
        attrs: { type: 'button', 'aria-expanded': 'false', 'aria-controls': `${idPrefix}-w-row-${i}` },
        on: { click: () => { openRow(i); slider.focus({ preventScroll: true }); }, focus: () => openRow(i) },
      }, el('span', { class: 'inspect-weight-line' }, weightNum));
      slider.addEventListener('focus', () => openRow(i));
      field.addEventListener('focus', () => openRow(i));
      const row = el('tr', { dataset: { input: String(i) } }, from, el('td', { class: 'inspect-weight' }, weightButton), el('td', { class: 'inspect-col-off' }, off));
      const sliderRow = el('tr', { class: 'inspect-slider-row', attrs: { id: `${idPrefix}-w-row-${i}` } },
        el('td', { attrs: { colspan: '3' } }, el('div', { class: 'lab-card-slider-box' }, slider, field)));
      sliderRow.hidden = true;
      wire(slider, field, () => `w:${key}:${i}`, (v, info) => onWeight(i, v, info));
      tbody.append(row, sliderRow);
      rows.push({ row, sliderRow, weightButton, weightNum, from, slider, field, off });
    }
    i18n.translateTree(table);
  }

  /**
   * @param {object} state
   * @param {{layer:number, neuron:number}} state.target
   * @param {number[]} state.sizes
   * @param {object} state.network la red de ahora
   * @param {(l:number, j:number, i?:number) => boolean} state.isOff
   */
  function sync(state) {
    lastState = state;
    const { target, sizes, network } = state;
    const fl = state.flicker ?? null;
    if (flickerNote.hidden === Boolean(fl)) flickerNote.hidden = !fl;
    if (fl) write(flickerNote, t('inspect.card.flicker', { low: fmt(fl.low), high: fmt(fl.high), share: `${Math.round(fl.highShare * 100)} %` }));
    const k = `${sizes.join('-')}|${target.layer}:${target.neuron}`;
    if (k !== key) { key = k; build(state); scroller.scrollTop = 0; say(''); }
    const isInput = target.layer === 0;
    const isOutput = target.layer === sizes.length - 1;
    write(title, !isInput && !isOutput ? t('inspect.card.neuron', { n: target.neuron + 1 }) : names(target.layer, target.neuron));
    write(subtitle, layerNames(target.layer));
    const off = !isOutput && state.isOff(target.layer, target.neuron);
    // A una salida no se la apaga: el botón no se muestra (D15).
    if (offButton.hidden !== isOutput) offButton.hidden = isOutput;
    write(offButton, t(off ? 'inspect.turnOn' : 'inspect.turnOff'));
    setData(offButton, 'help', off ? 'lab.card.turnOn' : 'lab.card.turnOff');
    setAttr(offButton, 'aria-pressed', String(off));
    setData(node, 'off', String(off));
    if (inputNote.hidden === isInput) inputNote.hidden = !isInput;
    if (scroller.hidden !== isInput) scroller.hidden = isInput;
    if (biasRow.hidden !== isInput) biasRow.hidden = isInput;
    const probe = isInput && state.probe ? state.probe : null; // con puntos: { value, label }
    if (inputRow.hidden === Boolean(probe)) inputRow.hidden = !probe;
    if (probe) {
      write(inputRow.querySelector('label'), probe.label);
      write(inputValue, fmt(probe.value));
      setAttr(inputSlider, 'aria-valuetext', fmt(probe.value));
      if (document.activeElement !== inputSlider && Number(inputSlider.value) !== probe.value) inputSlider.value = String(probe.value);
    }
    if (isInput) return;
    const layer = network.layers[target.layer - 1];
    rows.forEach((r, i) => {
      const w = layer.weights[target.neuron][i];
      write(r.from, names(target.layer - 1, i));
      write(r.weightNum, fmt(w));
      setAttr(r.weightButton, 'aria-label', t('inspect.weight.openLabel', { from: names(target.layer - 1, i), value: fmt(w) }));
      const range = weightRange(w, base);
      setAttr(r.slider, 'min', String(range.min));
      setAttr(r.slider, 'max', String(range.max));
      setAttr(r.slider, 'aria-label', t('inspect.weight.label', { from: names(target.layer - 1, i) }));
      setAttr(r.slider, 'aria-valuetext', fmt(w));
      setAttr(r.field, 'aria-label', t('lab.card.weightField', { from: names(target.layer - 1, i) }));
      if (document.activeElement !== r.slider && Number(r.slider.value) !== w) r.slider.value = String(w);
      if (document.activeElement !== r.field) { const text = fmt(w); if (r.field.value !== text) r.field.value = text; }
      const cOff = state.isOff(target.layer, target.neuron, i);
      const fromOff = state.isOff(target.layer - 1, i);
      setData(r.row, 'off', String(cOff || fromOff));
      setAttr(r.off, 'aria-pressed', String(cOff));
      setAttr(r.off, 'aria-label', t(cOff ? 'inspect.connection.on.label' : 'inspect.connection.off.label', { from: names(target.layer - 1, i) }));
      setData(r.off, 'help', cOff ? 'lab.card.connectionOn' : 'lab.card.connectionOff');
    });
    const b = layer.biases[target.neuron];
    const br = weightRange(b, base);
    setAttr(biasSlider, 'min', String(br.min));
    setAttr(biasSlider, 'max', String(br.max));
    setAttr(biasSlider, 'aria-valuetext', fmt(b));
    if (document.activeElement !== biasSlider && Number(biasSlider.value) !== b) biasSlider.value = String(b);
    if (document.activeElement !== biasField) { const text = fmt(b); if (biasField.value !== text) biasField.value = text; }
  }

  return { node, sync, get scroller() { return scroller; }, get rows() { return rows; }, get lastState() { return lastState; } };
}

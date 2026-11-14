// Tarjeta de la neurona elegida (pestana-inspeccionar, design.md D8 y D9): la cuenta real de una sola
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
import { neuronLabel, layerName, activationName } from './describe.js';
import { OUTPUT_KEYS } from '../../render/network-view.js';

/** Rango del deslizador de un peso o un sesgo: [−1, 1], o hasta el valor original si está más lejos. */
export function weightRange(original) {
  const m = Math.max(1, Math.ceil(Math.abs(original) * 100) / 100);
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
  const offButton = el('button', { class: 'tool small inspect-off', attrs: { type: 'button', 'aria-pressed': 'false' }, on: { click: () => onToggleNeuron() } });
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
    el('div', { class: 'inspect-foot-row', dataset: { op: 'sum' } }, el('dt', { i18n: 'inspect.op.sum', help: 'inspect.card.sum' }), sumValue),
    el('div', { class: 'inspect-foot-row inspect-foot-bias', dataset: { op: 'bias' } },
      el('dt', {}, el('label', { attrs: { for: biasId }, i18n: 'inspect.op.bias', help: 'inspect.term.bias' })),
      el('dd', { class: 'inspect-bias' }, el('span', { class: 'inspect-bias-line' }, biasValue, biasOriginal), biasSlider)),
    el('div', { class: 'inspect-foot-row', dataset: { op: 'activation' } },
      el('dt', { i18n: 'inspect.op.activation', help: 'inspect.term.activation' }),
      el('dd', { class: 'inspect-act' }, actName, graph, actValue)),
    el('div', { class: 'inspect-foot-row inspect-foot-out', dataset: { op: 'output' } }, el('dt', { i18n: 'inspect.card.output', help: 'inspect.card.output' }), outValue));
  const outputRule = el('p', { class: 'caption inspect-output-rule' });
  const footBlock = el('div', { class: 'inspect-foot-block' }, foot, outputRule, roundNote);

  const node = el('section', { class: 'inspect-card', attrs: { 'aria-labelledby': 'inspect-card-title' } }, head, inputBlock, scroller, footBlock);

  let current = { key: null, target: null };
  let rowNodes = new Map(); // input → nodos de la fila
  let othersRow = null;
  let actKey = '';

  function buildRows(state) {
    const { target, sizes } = state;
    tbody.replaceChildren();
    rowNodes = new Map();
    const n = sizes[target.layer - 1];
    for (let i = 0; i < n; i++) {
      const from = el('th', { attrs: { scope: 'row' }, class: 'inspect-from' });
      const value = el('td', { class: 'num' });
      const weightNum = el('span', { class: 'num inspect-weight-num' });
      const original = el('span', { class: 'inspect-original muted' });
      const sliderId = `inspect-w-${i}`;
      const slider = el('input', {
        help: 'inspect.weight.slider',
        attrs: { type: 'range', id: sliderId, step: 0.01 },
        on: { input: (e) => onWeight(i, Number(e.target.value)), focus: () => onSelectConnection(i) },
      });
      const weight = el('td', { class: 'inspect-weight' }, el('span', { class: 'inspect-weight-line' }, weightNum, original), slider);
      const barFill = el('span', { class: 'inspect-bar-fill' });
      const productNum = el('span', { class: 'num' });
      const product = el('td', { class: 'num inspect-product' }, el('span', { class: 'inspect-bar', attrs: { 'aria-hidden': 'true' } }, barFill), productNum);
      const off = el('button', {
        class: 'inspect-row-off', help: 'inspect.connection.off', dataset: { focus: 'keep' },
        attrs: { type: 'button', 'aria-pressed': 'false' }, on: { click: () => onToggleConnection(i) },
      }, el('span', { attrs: { 'aria-hidden': 'true' } }, '⏻'));
      const row = el('tr', { dataset: { input: String(i) }, on: { click: (e) => { if (e.target === row || e.target.closest('th, .num')) onSelectConnection(i); } } },
        from, value, weight, product, el('td', { class: 'inspect-col-off' }, off));
      tbody.append(row);
      rowNodes.set(i, { row, from, value, weightNum, original, slider, barFill, productNum, off, weight });
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
   */
  function sync(state) {
    const { target, sizes, trace, changes, original, cursor, top, paused } = state;
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
    // Por dónde va la cuenta de esta neurona: la última operación hecha, mientras no esté completa.
    const curOp = cursor && ops > 0 && ops < 4 ? ['products', 'sum', 'bias', 'activation'][ops - 1] : null;
    setData(node, 'op', curOp ?? (ops === 4 ? 'done' : 'pending'));

    const { rows, others } = cardRows(n.products, top);
    const shown = new Set(rows);
    for (const [i, r] of rowNodes) {
      const visible = shown.has(i);
      if (r.row.hidden === visible) r.row.hidden = !visible;
      if (!visible) continue;
      write(r.from, neuronLabel(t, sizes, target.layer - 1, i));
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
      if (document.activeElement !== r.slider && Number(r.slider.value) !== w) r.slider.value = String(w);
      const connOff = Boolean(n.offConnections?.[i]);
      setData(r.row, 'off', String(connOff || trace.layers[target.layer - 1].neurons[i].off));
      setAttr(r.off, 'aria-pressed', String(connOff));
      setAttr(r.off, 'aria-label', t(connOff ? 'inspect.connection.on.label' : 'inspect.connection.off.label', { from: neuronLabel(t, sizes, target.layer - 1, i) }));
      setData(r.off, 'help', connOff ? 'inspect.connection.on' : 'inspect.connection.off');
      const p = n.products[i];
      write(r.productNum, has(0) ? fmt(p) : '–');
      const width = has(0) ? `${Math.round(Math.min(1, Math.abs(p)) * 50)}%` : '0%';
      if (r.barFill.style.width !== width) r.barFill.style.width = width;
      setData(r.barFill, 'sign', p < 0 ? 'negative' : 'positive');
      setData(r.row, 'selected', String(state.connection === i));
    }
    if (othersRow.hidden !== !others) othersRow.hidden = !others;
    if (others) {
      write(othersRow.children[0], t('inspect.card.others', { count: others.count }));
      write(othersRow.children[1], has(0) ? fmt(others.sum) : '–');
    }

    write(sumValue, has(1) ? fmt(n.sum) : '–');
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
  }

  return { node, sync, get scroller() { return scroller; }, get rows() { return rowNodes; } };
}

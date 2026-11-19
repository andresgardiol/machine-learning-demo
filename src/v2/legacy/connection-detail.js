// Copia para la V2 de src/tabs/shared/connection-detail.js (interfaz-v2, grupo 14): la V2 no importa la pantalla de la V1 (design.md D5).
// Cambian las importaciones y las clases de los botones; la conducta es la misma.
// Detalle de una conexión elegida (vista-de-la-red, design.md D7), compartido por Inspeccionar y el
// Laboratorio. De dónde a dónde va (los dos nombres son botones que eligen esa neurona), el peso en
// grande con su deslizador y su campo, el original si cambió, lo que pasa ahora (entrada × peso =
// producto), qué parte es de lo que recibe su neurona, y apagarla. El Laboratorio le suma, abajo, la
// historia del peso (`extra`).
//
// No calcula: muestra lo que le pasa la pestaña, que sale de la misma cuenta que dibuja la red.
import { el, setData } from '../dom.js';
import { formatValue } from '../../ui/i18n.js';
import { weightRange, parseWeight } from './neuron-card.js';

/**
 * Parte de lo que recibe la neurona que pasa por la conexión `input`: |producto| sobre la suma de los
 * |productos| de sus conexiones encendidas. null si no recibe nada.
 */
export function linkShare(neuron, input) {
  let sum = 0;
  neuron.products.forEach((p, i) => { if (!neuron.offConnections?.[i]) sum += Math.abs(p); });
  if (sum === 0) return null;
  return neuron.offConnections?.[input] ? 0 : Math.abs(neuron.products[input]) / sum;
}

/**
 * @param {object} spec
 * @param {object} spec.i18n
 * @param {string} spec.idPrefix
 * @param {(l:number, j:number) => string} spec.names
 * @param {(target:{layer:number, neuron:number}) => void} spec.onSelectNeuron
 * @param {(value:number, info:{gesture:string|null}) => void} spec.onWeight
 * @param {() => void} [spec.onGestureEnd]
 * @param {() => void} spec.onToggle apagar o encender la conexión
 * @param {number} [spec.base] rango del deslizador (1 en Inspeccionar, 3 en el Laboratorio)
 * @param {string} [spec.helpPrefix] prefijo de las ayudas ('inspect.link' o 'lab.link')
 */
export function createConnectionDetail({ i18n, idPrefix, names, onSelectNeuron, onWeight, onGestureEnd = () => {}, onToggle, base = 1, helpPrefix = 'inspect.link' }) {
  const t = (k, p) => i18n.t(k, p);
  const fmt = (v) => formatValue(v, i18n.language);
  const titleId = `${idPrefix}-link-title`;
  const title = el('h2', { class: 'panel-heading inspect-card-title', i18n: 'inspect.link.title', attrs: { id: titleId } });
  const fromButton = el('button', { class: 'link-end', help: `${helpPrefix}.goFrom`, dataset: { focus: 'keep' }, attrs: { type: 'button' }, on: { click: () => go('from') } });
  const toButton = el('button', { class: 'link-end', help: `${helpPrefix}.goTo`, dataset: { focus: 'keep' }, attrs: { type: 'button' }, on: { click: () => go('to') } });
  const route = el('p', { class: 'link-route' }, fromButton, el('span', { class: 'link-arrow', attrs: { 'aria-hidden': 'true' } }, '→'), toButton);
  const offButton = el('button', { class: 'v2-btn v2-small inspect-off', help: `${helpPrefix}.off`, attrs: { type: 'button', 'aria-pressed': 'false' }, on: { click: () => onToggle() } });
  const head = el('div', { class: 'inspect-card-head link-head' }, el('div', { class: 'inspect-card-names' }, title, route), offButton);

  const weightBig = el('span', { class: 'num link-weight' });
  const original = el('span', { class: 'link-original muted' });
  const sliderId = `${idPrefix}-link-slider`;
  const slider = el('input', { help: `${helpPrefix}.slider`, attrs: { type: 'range', id: sliderId, step: 0.01 } });
  const field = el('input', { class: 'lab-card-field link-field', help: `${helpPrefix}.field`, attrs: { type: 'text', inputmode: 'decimal', size: '5' } });
  const weightRow = el('div', { class: 'link-weight-row' },
    el('label', { class: 'link-weight-label', attrs: { for: sliderId }, i18n: 'inspect.card.weight', help: 'inspect.card.weight' }),
    weightBig, original);
  const sliderRow = el('div', { class: 'link-slider-row' }, slider, field);
  const nowLine = el('p', { class: 'link-now num' });
  const shareLine = el('p', { class: 'link-share' });
  const message = el('p', { class: 'caption lab-card-message', attrs: { role: 'status' } });
  const extra = el('div', { class: 'link-extra' });
  const body = el('div', { class: 'link-body' }, weightRow, sliderRow, nowLine, shareLine, message, extra);
  const node = el('section', { class: 'inspect-card link-detail', attrs: { 'aria-labelledby': titleId } }, head, body);

  let current = null; // { layer, neuron, input }
  let key = '';
  const write = (n, text) => { if (n.textContent !== text) n.textContent = text; };
  const setAttr = (n, k, v) => { const s = String(v); if (n.getAttribute(k) !== s) n.setAttribute(k, s); };
  function go(end) {
    if (!current) return;
    onSelectNeuron(end === 'from' ? { layer: current.layer - 1, neuron: current.input } : { layer: current.layer, neuron: current.neuron });
  }
  slider.addEventListener('input', (e) => onWeight(Number(e.target.value), { gesture: `link:${key}` }));
  slider.addEventListener('change', () => onGestureEnd());
  const commit = () => {
    const v = parseWeight(field.value);
    if (v === null) { write(message, t('lab.card.notANumber', { text: field.value })); return; }
    write(message, '');
    onWeight(v, { gesture: null });
    onGestureEnd();
  };
  field.addEventListener('change', commit);
  field.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); commit(); } });

  /**
   * @param {object} state
   * @param {{layer:number, neuron:number, input:number}} state.target
   * @param {number} state.weight el peso de ahora (con los cambios)
   * @param {number|null} state.original el del cerebro si está cambiado; null si no
   * @param {number} state.rangeFrom el valor del que sale el rango del deslizador
   * @param {number|null} state.input lo que llega por la conexión ahora (null: no se muestra la cuenta)
   * @param {number|null} state.product
   * @param {number|null} state.share de 0 a 1, o null si la neurona no recibe nada
   * @param {boolean} state.off la conexión está apagada
   * @param {boolean} [state.computed] la cuenta ya pasó por acá (en el paso a paso)
   */
  function sync(state) {
    const { target } = state;
    current = target;
    const k = `${target.layer}:${target.neuron}:${target.input}`;
    if (k !== key) { key = k; write(message, ''); }
    const from = names(target.layer - 1, target.input);
    const to = names(target.layer, target.neuron);
    write(fromButton, from);
    write(toButton, to);
    setAttr(fromButton, 'aria-label', t('inspect.link.goLabel', { name: from }));
    setAttr(toButton, 'aria-label', t('inspect.link.goLabel', { name: to }));
    write(weightBig, fmt(state.weight));
    write(original, state.original === null ? '' : t('inspect.original', { value: fmt(state.original) }));
    setData(weightRow, 'changed', String(state.original !== null));
    const range = weightRange(state.rangeFrom, base);
    setAttr(slider, 'min', range.min);
    setAttr(slider, 'max', range.max);
    setAttr(slider, 'aria-label', t('inspect.link.sliderLabel', { from, to }));
    setAttr(slider, 'aria-valuetext', fmt(state.weight));
    setAttr(field, 'aria-label', t('inspect.link.fieldLabel', { from, to }));
    if (document.activeElement !== slider && Number(slider.value) !== state.weight) slider.value = String(state.weight);
    if (document.activeElement !== field) { const text = fmt(state.weight); if (field.value !== text) field.value = text; }
    const computed = state.computed !== false;
    nowLine.hidden = state.input === null;
    if (state.input !== null) {
      write(nowLine, t('inspect.link.now', { input: fmt(state.input), weight: fmt(state.weight), product: computed ? fmt(state.product) : '–' }));
    }
    shareLine.hidden = state.input === null;
    if (state.input !== null) {
      write(shareLine, !computed ? '' : state.share === null ? t('inspect.link.shareNone', { to }) : t('inspect.link.share', { value: Math.round(state.share * 100), to }));
    }
    const off = Boolean(state.off);
    write(offButton, t(off ? 'inspect.turnOn' : 'inspect.turnOff'));
    setData(offButton, 'help', off ? `${helpPrefix}.on` : `${helpPrefix}.off`);
    setAttr(offButton, 'aria-pressed', off);
    setData(node, 'off', String(off));
  }

  return { node, sync, extra, get slider() { return slider; }, get field() { return field; }, get fromButton() { return fromButton; }, get toButton() { return toButton; } };
}

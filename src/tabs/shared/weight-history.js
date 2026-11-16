// Historia de un peso (vista-de-la-red, design.md D12): una línea con el valor del peso a lo largo de
// las épocas, el valor de ahora en números y una marca donde hubo un cambio a mano. Un SVG chico
// propio: el gráfico compartido (src/ui/chart.js) recorta los valores negativos a cero, y un peso puede
// ser negativo.
import { el } from '../../ui/dom.js';
import { formatValue } from '../../ui/i18n.js';

const SVG = 'http://www.w3.org/2000/svg';
export const HISTORY_BOX = Object.freeze({ width: 300, height: 86, left: 34, right: 8, top: 8, bottom: 16 });

/**
 * Puntos del dibujo: la muestra inicial en la época 0 y las de cada época, en el recuadro.
 * @param {{initial:number, points:{epoch:number, value:number}[], manual:number[]}} history
 * @returns {{d:string, lo:number, hi:number, last:number, xOf:(e:number)=>number, yOf:(v:number)=>number, marks:number[]}|null}
 */
export function historyModel(history, box = HISTORY_BOX) {
  if (!history || history.points.length === 0) return null;
  const pts = [{ epoch: 0, value: history.initial }, ...history.points];
  let lo = Math.min(...pts.map((p) => p.value));
  let hi = Math.max(...pts.map((p) => p.value));
  if (hi - lo < 1e-6) { lo -= 0.5; hi += 0.5; }
  const pad = (hi - lo) * 0.08;
  lo -= pad;
  hi += pad;
  const last = pts[pts.length - 1].epoch;
  const w = box.width - box.left - box.right;
  const h = box.height - box.top - box.bottom;
  const xOf = (e) => box.left + (last > 0 ? (e / last) * w : w);
  const yOf = (v) => box.top + (1 - (v - lo) / (hi - lo)) * h;
  const d = pts.map((p, k) => `${k === 0 ? 'M' : 'L'}${xOf(p.epoch).toFixed(1)} ${yOf(p.value).toFixed(1)}`).join(' ');
  return { d, lo, hi, last, xOf, yOf, marks: history.manual.filter((e) => e <= last) };
}

/**
 * @param {{i18n:object, idPrefix:string}} spec
 */
export function createWeightHistory({ i18n, idPrefix }) {
  const t = (k, p) => i18n.t(k, p);
  const fmt = (v) => formatValue(v, i18n.language);
  const B = HISTORY_BOX;
  const titleId = `${idPrefix}-history-title`;
  const title = el('h3', { class: 'history-title', i18n: 'lab.history.title', help: 'lab.history', attrs: { id: titleId, tabindex: '0' } });
  const now = el('span', { class: 'history-now num' });
  const empty = el('p', { class: 'caption history-empty', i18n: 'lab.history.empty' });
  const svg = document.createElementNS(SVG, 'svg');
  svg.setAttribute('class', 'history-graph');
  svg.setAttribute('viewBox', `0 0 ${B.width} ${B.height}`);
  svg.setAttribute('role', 'img');
  const mk = (tag, attrs = {}) => { const n = document.createElementNS(SVG, tag); for (const [k, v] of Object.entries(attrs)) n.setAttribute(k, String(v)); return n; };
  const frame = mk('rect', { x: B.left, y: B.top, width: B.width - B.left - B.right, height: B.height - B.top - B.bottom, class: 'curve-frame' });
  const zero = mk('line', { x1: B.left, x2: B.width - B.right, class: 'curve-zero' });
  const marks = mk('g', { class: 'history-marks' });
  const path = mk('path', { class: 'curve-line' });
  const yTop = mk('text', { x: B.left - 4, y: B.top + 8, class: 'curve-axis', 'text-anchor': 'end' });
  const yBottom = mk('text', { x: B.left - 4, y: B.height - B.bottom, class: 'curve-axis', 'text-anchor': 'end' });
  const xLeft = mk('text', { x: B.left, y: B.height - 3, class: 'curve-axis', 'text-anchor': 'start' });
  const xRight = mk('text', { x: B.width - B.right, y: B.height - 3, class: 'curve-axis', 'text-anchor': 'end' });
  svg.append(frame, zero, marks, path, yTop, yBottom, xLeft, xRight);
  const node = el('section', { class: 'history', attrs: { 'aria-labelledby': titleId } },
    el('div', { class: 'history-head' }, title, now), empty, svg);
  const write = (n, text) => { if (n.textContent !== text) n.textContent = text; };

  /** @param {{initial:number, points:{epoch:number, value:number}[], manual:number[]}} history @param {number} current */
  function sync(history, current) {
    write(now, t('lab.history.now', { value: fmt(current) }));
    const m = historyModel(history);
    empty.hidden = Boolean(m);
    svg.style.display = m ? '' : 'none';
    if (!m) return;
    path.setAttribute('d', m.d);
    const showZero = m.lo < 0 && m.hi > 0;
    zero.style.display = showZero ? '' : 'none';
    if (showZero) { const y = m.yOf(0).toFixed(1); zero.setAttribute('y1', y); zero.setAttribute('y2', y); }
    marks.replaceChildren(...m.marks.map((e) => {
      const x = m.xOf(e);
      const y = B.top + 4;
      return mk('path', { d: `M${x.toFixed(1)} ${y - 4} L${(x + 4).toFixed(1)} ${y} L${x.toFixed(1)} ${y + 4} L${(x - 4).toFixed(1)} ${y} Z`, class: 'history-mark' });
    }));
    write(yTop, fmt(m.hi));
    write(yBottom, fmt(m.lo));
    write(xLeft, '0');
    write(xRight, t('lab.history.epoch', { value: m.last }));
    svg.setAttribute('aria-label', t('lab.history.aria', { initial: fmt(history.initial), now: fmt(current), epochs: m.last, manual: m.marks.length }));
  }

  return { node, sync };
}

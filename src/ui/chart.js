// Curva de fitness en SVG (design.md D13): el mejor fitness y el promedio de cada generación
// terminada, con leyenda, ejes rotulados (generación y unidad de la función de fitness) y las dos
// series distinguibles sin depender del color (línea continua con círculos y línea punteada con
// cuadrados). Los valores de la generación señalada se muestran en una línea de texto bajo el
// gráfico, no en un globo flotante, para no competir con los tooltips de ayuda.
//
// La escala y los puntos salen de una función pura (chartModel) que se prueba en Node. Cuando
// cambia la función de fitness, la curva empieza de nuevo: los valores anteriores no se comparan.

export const UNITS = Object.freeze({ distance: 'meters', survival: 'seconds', speed: 'metersPerSecond' });

export const CHART_LAYOUT = Object.freeze({ width: 320, height: 170, left: 44, right: 10, top: 10, bottom: 30 });

/** Paso "redondo" (1, 2 o 5 por una potencia de 10) para que entren unas `count` marcas hasta `max`. */
export function niceStep(max, count = 4) {
  if (!(max > 0)) return 1;
  const raw = max / count;
  const power = 10 ** Math.floor(Math.log10(raw));
  const f = raw / power;
  const nice = f < 1.5 ? 1 : f < 3 ? 2 : f < 7 ? 5 : 10;
  return nice * power;
}

/** Registros que se dibujan: los últimos con la misma función de fitness que el más reciente. */
export function currentRun(history) {
  if (history.length === 0) return [];
  const fitness = history[history.length - 1].fitness;
  let start = history.length - 1;
  while (start > 0 && history[start - 1].fitness === fitness) start -= 1;
  return history.slice(start);
}

/**
 * Modelo de la curva.
 * @param {{generation:number, best:number, average:number, fitness:string}[]} history
 * @param {object} [layout] medidas en px (CHART_LAYOUT)
 * @returns {{empty:boolean, restarted:boolean, fitness:string|null, unit:string|null,
 *   best:{x:number,y:number,generation:number,value:number}[], average:{...}[],
 *   yMax:number, yTicks:{value:number,y:number}[], xTicks:{generation:number,x:number}[], plot:object}}
 */
export function chartModel(history, layout = CHART_LAYOUT) {
  const { width, height, left, right, top, bottom } = layout;
  const plot = { x0: left, x1: width - right, y0: height - bottom, y1: top };
  const run = currentRun(history);
  if (run.length === 0) {
    return { empty: true, restarted: false, fitness: null, unit: null, best: [], average: [], yMax: 1, yTicks: [], xTicks: [], plot };
  }
  const fitness = run[0].fitness;
  const top1 = Math.max(...run.map((r) => Math.max(r.best, r.average)), 0);
  const step = niceStep(top1);
  // El máximo de la escala queda por encima del mayor valor (si todos valen 0, la escala va de 0 a 1).
  const yMax = top1 > 0 ? Math.ceil(top1 / step + 1e-9) * step : 1;
  const yStep = top1 > 0 ? step : niceStep(yMax);
  const yOf = (v) => plot.y0 - ((plot.y0 - plot.y1) * Math.max(0, v)) / yMax;
  const g0 = run[0].generation;
  const g1 = run[run.length - 1].generation;
  const xOf = (g) => (g1 === g0 ? (plot.x0 + plot.x1) / 2 : plot.x0 + ((plot.x1 - plot.x0) * (g - g0)) / (g1 - g0));
  const point = (r, key) => ({ x: xOf(r.generation), y: yOf(r[key]), generation: r.generation, value: r[key] });
  const yTicks = [];
  for (let v = 0; v <= yMax + 1e-9; v += yStep) yTicks.push({ value: Number(v.toFixed(10)), y: yOf(v) });
  const span = g1 - g0;
  const gStep = span === 0 ? 1 : Math.max(1, niceStep(span, 4));
  const xTicks = [];
  for (let g = Math.ceil(g0 / gStep) * gStep; g <= g1; g += gStep) xTicks.push({ generation: g, x: xOf(g) });
  if (xTicks.length === 0 || xTicks[0].generation !== g0) xTicks.unshift({ generation: g0, x: xOf(g0) });
  return {
    empty: false,
    restarted: run.length < history.length,
    fitness,
    unit: UNITS[fitness] ?? null,
    best: run.map((r) => point(r, 'best')),
    average: run.map((r) => point(r, 'average')),
    yMax, yTicks, xTicks, plot,
  };
}

/** Punto más cercano en horizontal a la coordenada `x` (para señalar una generación). */
export function nearestIndex(points, x) {
  let best = -1;
  let dist = Infinity;
  points.forEach((p, i) => {
    const d = Math.abs(p.x - x);
    if (d < dist) { dist = d; best = i; }
  });
  return best;
}

// --- Vista en SVG ------------------------------------------------------------------------------

const SVG_NS = 'http://www.w3.org/2000/svg';

/**
 * Curva de fitness.
 * @param {{container: HTMLElement, i18n: object, doc?: Document}} spec
 * @returns {{update:(history:object[])=>void, refresh:()=>void, dispose:()=>void, element:SVGElement}}
 */
export function createFitnessChart({ container, i18n, doc = document }) {
  const L = CHART_LAYOUT;
  const svg = doc.createElementNS(SVG_NS, 'svg');
  svg.setAttribute('class', 'fitness-chart');
  svg.setAttribute('viewBox', `0 0 ${L.width} ${L.height}`);
  svg.setAttribute('role', 'img');
  const legend = doc.createElement('ul');
  legend.className = 'chart-legend';
  const readout = doc.createElement('p');
  readout.className = 'chart-readout';
  const note = doc.createElement('p');
  note.className = 'chart-note muted';
  const empty = doc.createElement('p');
  empty.className = 'chart-empty muted';
  container.append(svg, legend, readout, note, empty);

  let history = [];
  let model = chartModel(history);
  let selected = null; // índice del punto señalado

  const node = (tag, attrs = {}, text) => {
    const n = doc.createElementNS(SVG_NS, tag);
    for (const [k, v] of Object.entries(attrs)) n.setAttribute(k, String(v));
    if (text !== undefined) n.textContent = text;
    return n;
  };
  const number = (v) => Math.round(v * 10) / 10;
  const unitText = () => (model.unit ? i18n.t(`train.chart.unit.${model.unit}`) : '');

  function draw() {
    model = chartModel(history);
    svg.replaceChildren();
    const { plot } = model;
    empty.hidden = !model.empty;
    empty.textContent = i18n.t('train.chart.empty');
    svg.style.display = model.empty ? 'none' : '';
    legend.hidden = model.empty;
    note.hidden = !model.restarted;
    note.textContent = model.restarted ? i18n.t('train.chart.restarted') : '';
    svg.setAttribute('aria-label', i18n.t('train.chart.aria'));
    legend.replaceChildren(
      legendItem('best', i18n.t('train.chart.best')),
      legendItem('average', i18n.t('train.chart.average')));
    if (model.empty) { readout.textContent = ''; return; }

    // Ejes y marcas
    svg.append(node('line', { class: 'chart-axis', x1: plot.x0, y1: plot.y0, x2: plot.x1, y2: plot.y0 }));
    svg.append(node('line', { class: 'chart-axis', x1: plot.x0, y1: plot.y0, x2: plot.x0, y2: plot.y1 }));
    for (const t of model.yTicks) {
      svg.append(node('line', { class: 'chart-grid', x1: plot.x0, y1: t.y, x2: plot.x1, y2: t.y }));
      svg.append(node('text', { class: 'chart-tick', x: plot.x0 - 4, y: t.y, 'text-anchor': 'end', 'dominant-baseline': 'middle' }, i18n.t('train.chart.tick', { value: t.value })));
    }
    for (const t of model.xTicks) {
      svg.append(node('text', { class: 'chart-tick', x: t.x, y: plot.y0 + 12, 'text-anchor': 'middle' }, i18n.t('train.chart.tick', { value: t.generation })));
    }
    svg.append(node('text', { class: 'chart-label', x: (plot.x0 + plot.x1) / 2, y: L.height - 2, 'text-anchor': 'middle' }, i18n.t('train.chart.xAxis')));
    svg.append(node('text', { class: 'chart-label', x: 10, y: (plot.y0 + plot.y1) / 2, 'text-anchor': 'middle', transform: `rotate(-90 10 ${(plot.y0 + plot.y1) / 2})` }, i18n.t('train.chart.yAxis', { unit: unitText() })));

    // Series: promedio punteado con cuadrados, mejor continua con círculos.
    for (const [key, pts] of [['average', model.average], ['best', model.best]]) {
      if (pts.length > 1) svg.append(node('polyline', { class: `chart-line chart-${key}`, points: pts.map((p) => `${p.x},${p.y}`).join(' ') }));
      for (const p of pts) {
        if (key === 'best') svg.append(node('circle', { class: 'chart-mark chart-best', cx: p.x, cy: p.y, r: 2.6 }));
        else svg.append(node('rect', { class: 'chart-mark chart-average', x: p.x - 2.2, y: p.y - 2.2, width: 4.4, height: 4.4 }));
      }
    }
    // Generación señalada
    const index = selected === null ? model.best.length - 1 : Math.min(selected, model.best.length - 1);
    const b = model.best[index];
    const a = model.average[index];
    svg.append(node('line', { class: 'chart-cursor', x1: b.x, y1: plot.y0, x2: b.x, y2: plot.y1 }));
    readout.textContent = i18n.t('train.chart.readout', { generation: b.generation, best: number(b.value), average: number(a.value), unit: unitText() });
  }

  function legendItem(key, text) {
    const li = doc.createElement('li');
    const mark = doc.createElement('span');
    mark.className = `legend-series ${key}`;
    mark.setAttribute('aria-hidden', 'true');
    const label = doc.createElement('span');
    label.textContent = text;
    li.append(mark, label);
    return li;
  }

  function onMove(e) {
    if (model.empty) return;
    const rect = svg.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * L.width;
    const i = nearestIndex(model.best, x);
    if (i !== selected) { selected = i; draw(); }
  }
  function onLeave() { selected = null; draw(); }
  svg.addEventListener('pointermove', onMove);
  svg.addEventListener('pointerleave', onLeave);

  draw();
  return {
    element: svg,
    update(next) { history = next.slice(); draw(); },
    refresh: draw,
    get model() { return model; },
    dispose() {
      svg.removeEventListener('pointermove', onMove);
      svg.removeEventListener('pointerleave', onLeave);
      svg.remove(); legend.remove(); readout.remove(); note.remove(); empty.remove();
    },
  };
}

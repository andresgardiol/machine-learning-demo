// Copia para la V2 de src/ui/chart.js (interfaz-v2, grupo 12): la curva de fitness con sus marcas de ajuste.
// La V2 no importa la pantalla de la V1 (design.md D5); solo cambia la importación.
// Curva de fitness en SVG (design.md D13): el mejor fitness y el promedio de cada generación
// terminada, con leyenda, ejes rotulados (generación y unidad de la función de fitness) y las dos
// series distinguibles sin depender del color (línea continua con círculos y línea punteada con
// cuadrados). Los valores de la generación señalada se muestran en una línea de texto bajo el
// gráfico, no en un globo flotante, para no competir con los tooltips de ayuda.
//
// La escala y los puntos salen de una función pura (chartModel) que se prueba en Node. Cuando
// cambia la función de fitness, la curva empieza de nuevo: los valores anteriores no se comparan.

import { FITNESS_UNITS } from '../../core/evolution.js';

/** Unidad del eje de cada función de fitness: la misma que el resto de la pestaña. */
export const UNITS = FITNESS_UNITS;

export const CHART_LAYOUT = Object.freeze({ width: 320, height: 170, left: 44, right: 10, top: 10, bottom: 30 });

/** Medidas mínimas del gráfico (px): por debajo, el SVG se achica en lugar de apretar los ejes. */
export const CHART_MIN = Object.freeze({ width: 240, height: 120 });

/**
 * Medidas del gráfico para una zona de `width` × `height` px (design.md D5): el viewBox usa estas
 * medidas, así un píxel del SVG es un píxel de pantalla y el texto conserva su tamaño.
 */
export function chartLayoutFor({ width, height }) {
  const w = Number.isFinite(width) ? width : 0;
  const h = Number.isFinite(height) ? height : 0;
  return {
    width: Math.max(CHART_MIN.width, Math.floor(w)),
    height: Math.max(CHART_MIN.height, Math.floor(h)),
    left: CHART_LAYOUT.left, right: CHART_LAYOUT.right, top: CHART_LAYOUT.top, bottom: CHART_LAYOUT.bottom,
  };
}

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
 *   yMax:number, yTicks:{value:number,y:number}[], xTicks:{generation:number,x:number}[], plot:object,
 *   marks:{generation:number, x:number, changes:{key:string, from:any, to:any}[]}[]}}
 *   marks: las generaciones del historial con `changes` (los cambios de la persona que rigen desde ella).
 */
export function chartModel(history, layout = CHART_LAYOUT) {
  const { width, height, left, right, top, bottom } = layout;
  const plot = { x0: left, x1: width - right, y0: height - bottom, y1: top };
  const run = currentRun(history);
  if (run.length === 0) {
    return { empty: true, restarted: false, fitness: null, unit: null, best: [], average: [], yMax: 1, yTicks: [], xTicks: [], marks: [], plot };
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
    // Generaciones en que empezó a regir un cambio de la persona (entrenar-la-generacion-ensena D6).
    marks: run.filter((r) => r.changes?.length > 0).map((r) => ({ generation: r.generation, x: xOf(r.generation), changes: r.changes })),
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

/** Textos del gráfico de Entrenar. Otra pestaña (el Laboratorio) puede pasar los suyos. */
export const TRAIN_CHART_KEYS = Object.freeze({
  empty: 'train.chart.empty', restarted: 'train.chart.restarted', aria: 'train.chart.aria', best: 'train.chart.best',
  average: 'train.chart.average', tick: 'train.chart.tick', xAxis: 'train.chart.xAxis', yAxis: 'train.chart.yAxis',
  readout: 'train.chart.readout', marker: null, readoutChanges: 'train.chart.readoutChanges',
});

/**
 * Curva de fitness.
 * @param {{container: HTMLElement, i18n: object, doc?: Document, keys?: object, value?: (v:number)=>number|string,
 *   focusable?: {help:string}, describeChanges?: (changes:object[]) => string}} spec
 *   keys: textos (TRAIN_CHART_KEYS); value: cómo se escribe un valor en la lectura (un decimal por
 *   defecto); focusable: el gráfico recibe el foco y las flechas señalan otro punto (pestana-laboratorio).
 *   describeChanges: con él, las generaciones con cambios llevan una marca sobre el eje y la lectura suma los
 *   cambios de la generación señalada (entrenar-la-generacion-ensena D6).
 * @returns {{update:(history:object[], extra?:{marker?:number|null})=>void, refresh:()=>void, dispose:()=>void, element:SVGElement}}
 */
export function createFitnessChart({ container, i18n, doc = document, keys = TRAIN_CHART_KEYS, value = null, focusable = null, describeChanges = null }) {
  const K = { ...TRAIN_CHART_KEYS, ...keys };
  // Medidas vigentes: las de la zona del gráfico (se observa su tamaño).
  let L = CHART_LAYOUT;
  const svg = doc.createElementNS(SVG_NS, 'svg');
  svg.setAttribute('class', 'fitness-chart');
  svg.setAttribute('viewBox', `0 0 ${L.width} ${L.height}`);
  svg.setAttribute('role', 'img');
  const plotZone = doc.createElement('div');
  plotZone.className = 'chart-plot';
  plotZone.append(svg);
  const legend = doc.createElement('ul');
  legend.className = 'chart-legend';
  const readout = doc.createElement('p');
  readout.className = 'chart-readout';
  const note = doc.createElement('p');
  note.className = 'chart-note muted';
  const empty = doc.createElement('p');
  empty.className = 'chart-empty muted';
  container.append(plotZone, legend, readout, note, empty);

  let history = [];
  let model = chartModel(history);
  let selected = null; // índice del punto señalado
  let marker = null; // generación (época) marcada, o null
  let single = false; // solo la serie "mejor" (el Laboratorio con compuertas: no hay apartados)

  const node = (tag, attrs = {}, text) => {
    const n = doc.createElementNS(SVG_NS, tag);
    for (const [k, v] of Object.entries(attrs)) n.setAttribute(k, String(v));
    if (text !== undefined) n.textContent = text;
    return n;
  };
  const number = value ?? ((v) => Math.round(v * 10) / 10);
  const unitText = () => (model.unit ? i18n.t(`train.chart.unit.${model.unit}`) : '');

  /** Toma las medidas de la zona; si no se ve (tamaño 0), conserva las anteriores. */
  function measure() {
    const width = plotZone.clientWidth;
    const height = plotZone.clientHeight;
    if (width > 0 && height > 0) L = chartLayoutFor({ width, height });
    svg.setAttribute('viewBox', `0 0 ${L.width} ${L.height}`);
  }

  function draw() {
    measure();
    model = chartModel(history, L);
    svg.replaceChildren();
    const { plot } = model;
    empty.hidden = !model.empty;
    empty.textContent = i18n.t(K.empty);
    svg.style.display = model.empty ? 'none' : '';
    legend.hidden = model.empty;
    note.hidden = !model.restarted;
    note.textContent = model.restarted ? i18n.t(K.restarted) : '';
    svg.setAttribute('aria-label', i18n.t(K.aria));
    legend.replaceChildren(
      legendItem('best', i18n.t(K.best)),
      ...(single ? [] : [legendItem('average', i18n.t(K.average))]),
      ...(K.marker && marker !== null ? [legendItem('marker', i18n.t(K.marker))] : []));
    if (model.empty) { readout.textContent = ''; return; }

    // Ejes y marcas
    svg.append(node('line', { class: 'chart-axis', x1: plot.x0, y1: plot.y0, x2: plot.x1, y2: plot.y0 }));
    svg.append(node('line', { class: 'chart-axis', x1: plot.x0, y1: plot.y0, x2: plot.x0, y2: plot.y1 }));
    for (const t of model.yTicks) {
      svg.append(node('line', { class: 'chart-grid', x1: plot.x0, y1: t.y, x2: plot.x1, y2: t.y }));
      svg.append(node('text', { class: 'chart-tick', x: plot.x0 - 4, y: t.y, 'text-anchor': 'end', 'dominant-baseline': 'middle' }, i18n.t(K.tick, { value: t.value })));
    }
    for (const t of model.xTicks) {
      svg.append(node('text', { class: 'chart-tick', x: t.x, y: plot.y0 + 12, 'text-anchor': 'middle' }, i18n.t(K.tick, { value: t.generation })));
    }
    svg.append(node('text', { class: 'chart-label', x: (plot.x0 + plot.x1) / 2, y: L.height - 2, 'text-anchor': 'middle' }, i18n.t(K.xAxis)));
    svg.append(node('text', { class: 'chart-label', x: 10, y: (plot.y0 + plot.y1) / 2, 'text-anchor': 'middle', transform: `rotate(-90 10 ${(plot.y0 + plot.y1) / 2})` }, i18n.t(K.yAxis, { unit: unitText() })));

    // Series: promedio punteado con cuadrados, mejor continua con círculos.
    for (const [key, pts] of single ? [['best', model.best]] : [['average', model.average], ['best', model.best]]) {
      if (pts.length > 1) svg.append(node('polyline', { class: `chart-line chart-${key}`, points: pts.map((p) => `${p.x},${p.y}`).join(' ') }));
      for (const p of pts) {
        if (key === 'best') svg.append(node('circle', { class: 'chart-mark chart-best', cx: p.x, cy: p.y, r: 2.6 }));
        else svg.append(node('rect', { class: 'chart-mark chart-average', x: p.x - 2.2, y: p.y - 2.2, width: 4.4, height: 4.4 }));
      }
    }
    // Generación marcada (la mejor época, en el Laboratorio): una línea vertical punteada con su rótulo.
    const mark = marker === null ? null : model.best.find((p) => p.generation === marker);
    if (mark) {
      svg.append(node('line', { class: 'chart-marker', x1: mark.x, y1: plot.y0, x2: mark.x, y2: plot.y1 }));
      svg.append(node('polygon', { class: 'chart-marker-head', points: `${mark.x - 4},${plot.y1} ${mark.x + 4},${plot.y1} ${mark.x},${plot.y1 + 6}` }));
    }
    // Generación señalada
    const index = selected === null ? model.best.length - 1 : Math.min(selected, model.best.length - 1);
    const b = model.best[index];
    const a = model.average[index];
    svg.append(node('line', { class: 'chart-cursor', x1: b.x, y1: plot.y0, x2: b.x, y2: plot.y1 }));
    // Cambios de la persona: un triángulo chico parado sobre el eje x (forma, no solo color), con su tooltip. Va
    // arriba de la línea de la generación señalada, que si no le quita el puntero.
    if (describeChanges) {
      for (const m of model.marks) {
        svg.append(node('polygon', { class: 'chart-change', 'data-help': 'train.chart.change', points: `${m.x - 5},${plot.y0} ${m.x + 5},${plot.y0} ${m.x},${plot.y0 - 8}` }));
      }
    }
    const values = i18n.t(single && K.readoutSingle ? K.readoutSingle : K.readout, { generation: b.generation, best: number(b.value), average: number(a.value), unit: unitText() });
    const marked = describeChanges ? model.marks.find((m) => m.generation === b.generation) : null;
    readout.textContent = marked ? i18n.t(K.readoutChanges, { values, changes: describeChanges(marked.changes) }) : values;
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
  // Con el foco (pestana-laboratorio): las flechas señalan otro punto; Inicio y Fin, el primero y el último.
  function onKey(e) {
    if (model.empty) return;
    const last = model.best.length - 1;
    const cur = selected === null ? last : selected;
    const to = { ArrowLeft: cur - 1, ArrowRight: cur + 1, Home: 0, End: last }[e.key];
    if (to === undefined) return;
    e.preventDefault();
    e.stopPropagation();
    selected = Math.max(0, Math.min(last, to));
    draw();
  }
  if (focusable) {
    svg.setAttribute('tabindex', '0');
    svg.setAttribute('data-help', focusable.help);
    svg.setAttribute('data-shortcuts', 'pass');
    svg.addEventListener('keydown', onKey);
    svg.addEventListener('blur', onLeave);
  }

  // Al cambiar el tamaño de la zona se redibuja con las medidas nuevas (nunca por cuadro).
  let lastSize = '';
  const observer = new (doc.defaultView ?? globalThis).ResizeObserver(() => {
    const size = `${plotZone.clientWidth}x${plotZone.clientHeight}`;
    if (size === lastSize) return;
    lastSize = size;
    draw();
  });
  observer.observe(plotZone);

  draw();
  return {
    element: svg,
    /** `extra.single`: solo la primera serie, sin la segunda ni su leyenda. */
    update(next, extra = {}) { history = next.slice(); marker = extra.marker ?? null; single = Boolean(extra.single); if (selected !== null && selected >= history.length) selected = null; draw(); },
    /** La lectura del punto señalado (o del último). */
    get readout() { return readout.textContent; },
    refresh: draw,
    get model() { return model; },
    dispose() {
      svg.removeEventListener('pointermove', onMove);
      svg.removeEventListener('pointerleave', onLeave);
      svg.removeEventListener('keydown', onKey);
      svg.removeEventListener('blur', onLeave);
      observer.disconnect();
      plotZone.remove(); legend.remove(); readout.remove(); note.remove(); empty.remove();
    },
  };
}

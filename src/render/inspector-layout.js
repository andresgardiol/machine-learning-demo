// Disposición del inspector de la red (pestana-inspeccionar, design.md D6), sin DOM: columnas por capa
// de izquierda a derecha, con lugar arriba para el encabezado de cada capa, y capas resumidas como una
// columna angosta de cuadritos pegados. Usa las medidas y la convención de network-view.js (el
// diagrama de Entrenar, que no cambia): sus rótulos de entradas y salidas, sus radios y su separación
// mínima entre rótulos.
//
// Las coordenadas son píxeles CSS de la zona con el acercamiento en 1 (la red entera); la cámara del
// inspector las lleva a la pantalla. La detección de lo que está bajo el cursor también vive acá.
import { LAYOUT, OUTPUT_KEYS } from './network-view.js';

export const INSPECTOR_LAYOUT = Object.freeze({
  header: 34, // alto reservado arriba para los encabezados de capa
  headerRow: 28, // alto de un segundo renglón de encabezados, si no entran en uno
  maxRadius: 44, // vista-de-la-red D3: las neuronas usan el espacio
  minRadius: 1,
  heightShare: 0.38, // del alto que le toca a cada neurona de la capa abierta más alta
  gapShare: 0.3, // del hueco entre columnas
  square: 14, // lado máximo de un cuadrito de una capa resumida
  collapsedWidth: 18, // ancho de la columna de una capa resumida
  collapsedGapWeight: 0.35, // cuánto pesa en el reparto del ancho el lado de una capa resumida
  hitSlop: 4, // px de tolerancia alrededor de una neurona al hacer clic
  labelLeft: 76, // lugar para el texto de los rótulos de las entradas, sin contar el radio
  labelRight: 88, // lugar para el texto de los rótulos de las salidas ("Retroceder" entero), sin el radio
  linkSlop: 6, // px de pantalla: a esta distancia o menos de una línea, el clic la toca (D5)
});

/**
 * @param {{sizes:number[], width:number, height:number, collapsed?:boolean[], headerRows?:1|2}} spec
 *   headerRows: con encabezados en dos renglones (escalonados, si no entran en uno), la red baja un renglón.
 * @returns {{columns:{x:number, collapsed:boolean, side:number, nodes:{x:number,y:number}[]}[],
 *   radius:number, inputLabels:object[], outputLabels:object[], width:number, height:number, top:number, bottom:number}}
 */
export function layoutInspector({ sizes, width, height, collapsed = [], headerRows = 1, knobs = false }) {
  const { padding, minLabelGap } = LAYOUT;
  const header = INSPECTOR_LAYOUT.header + (headerRows > 1 ? INSPECTOR_LAYOUT.headerRow : 0);
  const { maxRadius, minRadius, square, collapsedWidth, collapsedGapWeight, labelLeft, labelRight } = INSPECTOR_LAYOUT;
  // Con perillas sobre la red (laboratorio-empieza-por-compuertas D5), las neuronas dejan lugar a las
  // pastillas: un radio más chico respecto del hueco entre columnas y del alto de cada neurona.
  const heightShare = knobs ? KNOBS.heightShare : INSPECTOR_LAYOUT.heightShare;
  const gapShare = knobs ? KNOBS.gapShare : INSPECTOR_LAYOUT.gapShare;
  const isCollapsed = (c) => Boolean(collapsed[c]);
  const top = header + padding;
  const bottom = Math.max(top + 1, height - padding);
  const span = bottom - top;
  const C = sizes.length;

  // Radio (D3): el menor de 44, 0,38 del alto por neurona de la capa abierta más alta y 0,3 del hueco
  // entre columnas. Con una capa resumida, la más alta deja de limitar y las otras crecen solas. El
  // lugar de los rótulos de entradas y salidas va del borde de la neurona hacia afuera.
  const openSizes = sizes.filter((_, c) => !isCollapsed(c));
  const tallest = openSizes.length > 0 ? Math.max(...openSizes) : 1;
  const byHeight = (span / tallest) * heightShare;
  const edges = (r) => {
    const left = isCollapsed(0) ? collapsedWidth + padding : labelLeft + r;
    const right = Math.max(left + 1, width - (isCollapsed(C - 1) ? collapsedWidth + padding : labelRight + r));
    return { left, right };
  };
  // Reparto del ancho: cada hueco entre dos columnas pesa por sus dos lados; el lado de una capa
  // resumida pesa menos, así las demás ganan lugar.
  const sideWeight = (c) => (isCollapsed(c) ? collapsedGapWeight : 1);
  const gaps = [];
  for (let c = 0; c < C - 1; c++) gaps.push(sideWeight(c) + sideWeight(c + 1));
  const totalGap = gaps.reduce((a, b) => a + b, 0);
  const minGap = ({ left, right }) => {
    let g = Infinity;
    for (let c = 0; c < C - 1; c++) if (!isCollapsed(c) || !isCollapsed(c + 1)) g = Math.min(g, ((right - left) * gaps[c]) / totalGap);
    return g;
  };
  let radius = Math.min(maxRadius, byHeight);
  if (C > 1) radius = Math.min(radius, gapShare * minGap(edges(radius)));
  radius = Math.max(minRadius, radius);
  const { left, right } = edges(radius);
  const xs = [left];
  for (let c = 0; c < C - 1; c++) xs.push(xs[c] + (totalGap > 0 ? ((right - left) * gaps[c]) / totalGap : 0));
  if (C === 1) xs[0] = (left + right) / 2;

  const columns = sizes.map((count, c) => {
    const x = xs[c];
    if (isCollapsed(c)) {
      const side = Math.max(2, Math.min(square, span / count));
      const start = top + (span - side * count) / 2;
      return { x, collapsed: true, side, nodes: Array.from({ length: count }, (_, i) => ({ x, y: start + side * (i + 0.5) })) };
    }
    const stepY = span / count;
    return { x, collapsed: false, side: 0, nodes: Array.from({ length: count }, (_, i) => ({ x, y: top + stepY * (i + 0.5) })) };
  });

  // Rótulos de entradas (con la capa abierta): como en el diagrama de Entrenar, de a saltos si no
  // entran todos, el primero siempre y la velocidad sin taparse. Los demás nombres se leen al posar
  // el cursor o con el foco.
  const inputLabels = [];
  if (!isCollapsed(0)) {
    const inputs = columns[0].nodes;
    const sensorCount = inputs.length - 1;
    const inputStep = span / inputs.length;
    const every = Math.max(1, Math.ceil(minLabelGap / inputStep));
    const speedY = inputs[sensorCount].y;
    for (let i = 0; i < sensorCount; i += every) {
      if (speedY - inputs[i].y < minLabelGap) break;
      inputLabels.push({ index: i, kind: 'sensor', n: i + 1, y: inputs[i].y });
    }
    inputLabels.push({ index: sensorCount, kind: 'speed', y: speedY });
  }
  const outputLabels = isCollapsed(C - 1) ? [] : columns[C - 1].nodes.map((n, i) => ({ index: i, key: OUTPUT_KEYS[i] ?? String(i), y: n.y }));
  return { columns, radius, inputLabels, outputLabels, width, height, top, bottom };
}

/**
 * Neurona bajo un punto (en coordenadas de la disposición), o null. `scale` es el acercamiento: la
 * tolerancia se mide en píxeles de pantalla. En una capa resumida, el cuadrito que contiene el punto.
 * @returns {{layer:number, neuron:number}|null}
 */
export function hitNeuron(layout, point, scale = 1) {
  const slop = INSPECTOR_LAYOUT.hitSlop / scale;
  let best = null;
  let bestDist = Infinity;
  layout.columns.forEach((col, c) => {
    if (col.collapsed) {
      const half = col.side / 2;
      if (Math.abs(point.x - col.x) > INSPECTOR_LAYOUT.collapsedWidth / 2 + slop) return;
      col.nodes.forEach((n, i) => {
        if (Math.abs(point.y - n.y) <= half && best === null) { best = { layer: c, neuron: i }; bestDist = 0; }
      });
      return;
    }
    const reach = layout.radius + slop;
    col.nodes.forEach((n, i) => {
      const d = Math.hypot(point.x - n.x, point.y - n.y);
      if (d <= reach && d < bestDist) { best = { layer: c, neuron: i }; bestDist = d; }
    });
  });
  return best;
}

/**
 * Puntas de las líneas de una columna (conexiones-en-capas-resumidas D1): en una capa resumida, el borde
 * del cuadrito hacia la otra capa (`side` 1: sale a la derecha; −1: llega por la izquierda); si no, el
 * centro de la neurona.
 */
export function linkEnds(col, side) {
  return col.collapsed ? col.nodes.map((n) => ({ x: n.x + (side * col.side) / 2, y: n.y })) : col.nodes;
}

/** Distancia de un punto al segmento a–b. */
export function segmentDistance(p, a, b) {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const len2 = dx * dx + dy * dy;
  const t = len2 === 0 ? 0 : Math.max(0, Math.min(1, ((p.x - a.x) * dx + (p.y - a.y) * dy) / len2));
  return Math.hypot(p.x - (a.x + t * dx), p.y - (a.y + t * dy));
}

/**
 * Conexión bajo un punto (D5), o null: la más cercana a `linkSlop` px de pantalla o menos. Con una
 * neurona elegida, primero las suyas (las que le entran y las que salen de ella). Entre capas resumidas
 * también: la línea va del borde de un cuadrito al otro (conexiones-en-capas-resumidas D1 y D3).
 * Devuelve la conexión como en los cambios: `layer` es la capa de destino.
 * @returns {{layer:number, neuron:number, input:number, distance:number}|null}
 */
export function hitLink(layout, point, scale = 1, selected = null) {
  const slop = INSPECTOR_LAYOUT.linkSlop / scale;
  let best = null;
  let bestMine = null;
  const cols = layout.columns;
  for (let l = 1; l < cols.length; l++) {
    const from = linkEnds(cols[l - 1], 1);
    const to = linkEnds(cols[l], -1);
    // Descarte rápido: fuera de la franja entre las dos columnas.
    if (point.x < Math.min(cols[l - 1].x, cols[l].x) - slop || point.x > Math.max(cols[l - 1].x, cols[l].x) + slop) continue;
    for (let j = 0; j < to.length; j++) {
      for (let i = 0; i < from.length; i++) {
        const d = segmentDistance(point, from[i], to[j]);
        if (d > slop) continue;
        const hit = { layer: l, neuron: j, input: i, distance: d };
        if (!best || d < best.distance) best = hit;
        const mine = selected && selected.input === undefined
          && ((selected.layer === l && selected.neuron === j) || (selected.layer === l - 1 && selected.neuron === i));
        if (mine && (!bestMine || d < bestMine.distance)) bestMine = hit;
      }
    }
  }
  return bestMine ?? best;
}

/**
 * Lo que toca un punto (D5): una neurona gana sobre las líneas que pasan por ella; si no, la línea más
 * cercana. null si no hay nada.
 * @returns {{kind:'neuron', layer:number, neuron:number}|{kind:'link', layer:number, neuron:number, input:number}|null}
 */
export function hitTarget(layout, point, scale = 1, selected = null) {
  const n = hitNeuron(layout, point, scale);
  if (n) return { kind: 'neuron', ...n };
  const k = hitLink(layout, point, scale, selected);
  return k ? { kind: 'link', layer: k.layer, neuron: k.neuron, input: k.input } : null;
}

/** Vecino de una neurona para el foco con flechas: arriba y abajo en la capa, izquierda y derecha entre capas. */
export function neighborOf(sizes, { layer, neuron }, key) {
  const C = sizes.length;
  if (key === 'ArrowUp') return { layer, neuron: Math.max(0, neuron - 1) };
  if (key === 'ArrowDown') return { layer, neuron: Math.min(sizes[layer] - 1, neuron + 1) };
  if (key === 'Home') return { layer, neuron: 0 };
  if (key === 'End') return { layer, neuron: sizes[layer] - 1 };
  if (key === 'ArrowLeft' || key === 'ArrowRight') {
    const to = Math.max(0, Math.min(C - 1, layer + (key === 'ArrowRight' ? 1 : -1)));
    if (to === layer) return { layer, neuron };
    // Mantiene la altura relativa en la capa nueva.
    const rel = sizes[layer] > 1 ? neuron / (sizes[layer] - 1) : 0;
    return { layer: to, neuron: Math.round(rel * (sizes[to] - 1)) };
  }
  return null;
}

// --- Perillas sobre la red (laboratorio-empieza-por-compuertas D5) ---------------------------------
/**
 * Medidas de las perillas: con hasta `allMax` conexiones se ven todas; la pastilla de un peso mide
 * w × h y va sobre su línea, primero al 30 % desde la neurona de destino (así las que llegan a una
 * misma neurona se abren en abanico); el sesgo, debajo de su neurona (o a un costado, si abajo no
 * entra); el control de una entrada, a la izquierda de la neurona, dejando lugar a su nombre.
 */
export const KNOBS = Object.freeze({
  allMax: 16, w: 42, h: 18, inputW: 34, gap: 3, labelRoom: 20,
  gapShare: 0.16, heightShare: 0.25,
  // Lugares que se prueban sobre la línea, como fracción desde el destino: 30 % primero.
  along: Object.freeze([0.3, 0.35, 0.25, 0.4, 0.45, 0.5, 0.2, 0.55, 0.6, 0.65, 0.7, 0.75, 0.8, 0.15, 0.85]),
});

/** Conexiones de una red (sin contar los sesgos). */
export const connectionCount = (sizes) => sizes.reduce((s, n, l) => (l === 0 ? 0 : s + n * sizes[l - 1]), 0);

/**
 * Qué perillas se ven, en el orden del foco (de la primera capa a la última): las entradas (si se
 * piden), y por cada neurona sus pesos y su sesgo. Con más de `allMax` conexiones, solo las que entran
 * a la neurona elegida y su sesgo (y las entradas, que no son conexiones).
 * @param {number[]} sizes
 * @param {{layer:number, neuron:number, input?:number}|null} selected
 * @param {{inputs?:boolean, allMax?:number}} [opts]
 * @returns {{kind:'input'|'weight'|'bias', layer:number, neuron:number, input?:number}[]}
 */
export function knobTargets(sizes, selected, { inputs = false, allMax = KNOBS.allMax } = {}) {
  const out = [];
  if (inputs) for (let i = 0; i < sizes[0]; i++) out.push({ kind: 'input', layer: 0, neuron: i });
  const all = connectionCount(sizes) <= allMax;
  const only = !all && selected && selected.input === undefined && selected.layer > 0 ? selected : null;
  for (let l = 1; l < sizes.length; l++) {
    for (let j = 0; j < sizes[l]; j++) {
      if (!all && !(only && only.layer === l && only.neuron === j)) continue;
      for (let i = 0; i < sizes[l - 1]; i++) out.push({ kind: 'weight', layer: l, neuron: j, input: i });
      out.push({ kind: 'bias', layer: l, neuron: j });
    }
  }
  return out;
}

const overlaps = (a, b, m = 0) => a.x - a.w / 2 < b.x + b.w / 2 + m && b.x - b.w / 2 < a.x + a.w / 2 + m && a.y - a.h / 2 < b.y + b.h / 2 + m && b.y - b.h / 2 < a.y + a.h / 2 + m;
/** ¿El rectángulo (centro x, y; w × h) toca un círculo de centro c y radio r? */
function hitsCircle(b, c, r) {
  const dx = Math.max(Math.abs(c.x - b.x) - b.w / 2, 0);
  const dy = Math.max(Math.abs(c.y - b.y) - b.h / 2, 0);
  return dx * dx + dy * dy < r * r;
}

/**
 * Dónde va cada perilla, en píxeles de pantalla: { ...target, x, y, w, h, at } (centro; `at`, la
 * fracción sobre la línea para los pesos). Las entradas y los sesgos van primero en su lugar fijo; los
 * pesos se prueban sobre su línea (KNOBS.along) hasta no tocar ninguna neurona ni otra pastilla. Si
 * ninguno entra, queda en el 30 % y `crowded` lo dice.
 * @param {ReturnType<typeof knobTargets>} targets
 * @param {{centers:{x:number,y:number}[][], radius:number, bounds?:{left:number, top:number, right:number, bottom:number}}} geo
 *   centers: el centro de cada neurona en pantalla, por capa
 */
export function placeKnobs(targets, { centers, radius, bounds = null }) {
  const { w, h, inputW, gap, labelRoom } = KNOBS;
  const margin = 2;
  const placed = [];
  const circles = centers.flat();
  const clear = (b) => !circles.some((c) => hitsCircle(b, c, radius + margin)) && !placed.some((p) => overlaps(p, b, 1))
    && (!bounds || (b.x - b.w / 2 >= bounds.left && b.x + b.w / 2 <= bounds.right && b.y - b.h / 2 >= bounds.top && b.y + b.h / 2 <= bounds.bottom));
  let crowded = false;
  for (const t of targets.filter((x) => x.kind !== 'weight')) {
    const c = centers[t.layer][t.neuron];
    if (t.kind === 'input') {
      placed.push({ ...t, x: c.x - radius - labelRoom - inputW / 2, y: c.y, w: inputW, h });
      continue;
    }
    const below = { ...t, x: c.x, y: c.y + radius + gap + h / 2, w, h };
    const left = { ...t, x: c.x - radius - gap - w / 2, y: c.y + radius * 0.6, w, h };
    const right = { ...t, x: c.x + radius + gap + w / 2, y: c.y + radius * 0.6, w, h };
    const pick = [below, left, right].find(clear) ?? { ...below, crowded: true };
    if (pick.crowded) crowded = true;
    placed.push(pick);
  }
  const weights = targets.filter((x) => x.kind === 'weight');
  const spots = (t) => {
    const a = centers[t.layer - 1][t.input];
    const b = centers[t.layer][t.neuron];
    return KNOBS.along.map((f) => ({ ...t, x: b.x + (a.x - b.x) * f, y: b.y + (a.y - b.y) * f, w, h, at: f }));
  };
  const pending = [];
  for (const t of weights) {
    const pick = spots(t).find(clear);
    if (pick) placed.push(pick); else pending.push(t);
  }
  // Reparación: una pastilla que no entra corre a otro lugar de su línea a la única pastilla de peso que
  // la bloquea, si esa encuentra otro lugar libre.
  for (const t of pending) {
    let done = false;
    for (const box of spots(t)) {
      if (circles.some((c) => hitsCircle(box, c, radius + margin))) continue;
      const blockers = placed.filter((p) => overlaps(p, box, 1));
      if (blockers.length !== 1 || blockers[0].kind !== 'weight') continue;
      const blocker = blockers[0];
      placed.splice(placed.indexOf(blocker), 1);
      placed.push(box);
      const moved = spots(blocker).find(clear);
      if (moved) { placed.push(moved); done = true; break; }
      placed.pop();
      placed.push(blocker);
    }
    if (!done) { placed.push({ ...spots(t)[0], crowded: true }); crowded = true; }
  }
  // En el orden pedido (el del foco).
  const key = (t) => `${t.kind}:${t.layer}:${t.neuron}:${t.input ?? ''}`;
  const byKey = new Map(placed.map((p) => [key(p), p]));
  return { knobs: targets.map((t) => byKey.get(key(t))), crowded };
}

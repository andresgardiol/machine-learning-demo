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
  maxRadius: 16,
  minRadius: 2,
  square: 14, // lado máximo de un cuadrito de una capa resumida
  collapsedWidth: 18, // ancho de la columna de una capa resumida
  collapsedGapWeight: 0.35, // cuánto pesa en el reparto del ancho el lado de una capa resumida
  hitSlop: 4, // px de tolerancia alrededor de una neurona al hacer clic
  labelLeft: 92, // lugar para los rótulos de las entradas (más que en Entrenar: las neuronas son más grandes)
  labelRight: 104, // lugar para los rótulos de las salidas ("Retroceder" entero)
});

/**
 * @param {{sizes:number[], width:number, height:number, collapsed?:boolean[]}} spec
 * @returns {{columns:{x:number, collapsed:boolean, side:number, nodes:{x:number,y:number}[]}[],
 *   radius:number, inputLabels:object[], outputLabels:object[], width:number, height:number, top:number, bottom:number}}
 */
export function layoutInspector({ sizes, width, height, collapsed = [] }) {
  const { padding, minLabelGap } = LAYOUT;
  const { header, maxRadius, minRadius, square, collapsedWidth, collapsedGapWeight, labelLeft, labelRight } = INSPECTOR_LAYOUT;
  const isCollapsed = (c) => Boolean(collapsed[c]);
  const left = isCollapsed(0) ? collapsedWidth + padding : labelLeft;
  const right = Math.max(left + 1, width - (isCollapsed(sizes.length - 1) ? collapsedWidth + padding : labelRight));
  const top = header + padding;
  const bottom = Math.max(top + 1, height - padding);
  const span = bottom - top;

  // Reparto del ancho: cada hueco entre dos columnas pesa por sus dos lados; el lado de una capa
  // resumida pesa menos, así las demás ganan lugar.
  const C = sizes.length;
  const sideWeight = (c) => (isCollapsed(c) ? collapsedGapWeight : 1);
  const gaps = [];
  for (let c = 0; c < C - 1; c++) gaps.push(sideWeight(c) + sideWeight(c + 1));
  const totalGap = gaps.reduce((a, b) => a + b, 0);
  const xs = [left];
  for (let c = 0; c < C - 1; c++) xs.push(xs[c] + (totalGap > 0 ? ((right - left) * gaps[c]) / totalGap : 0));
  if (C === 1) xs[0] = (left + right) / 2;

  const openSizes = sizes.filter((_, c) => !isCollapsed(c));
  const tallest = openSizes.length > 0 ? Math.max(...openSizes) : 1;
  const radius = Math.max(minRadius, Math.min(maxRadius, (span / tallest) * 0.38));

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

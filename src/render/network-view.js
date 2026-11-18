// Diagrama de una red neuronal en un canvas propio (design.md D12): capas como columnas de
// izquierda a derecha (entradas, ocultas, salidas), un nodo por neurona y una línea por conexión.
//
// - Peso: el signo con dos colores y dos trazos (positivo continuo, negativo punteado) y la
//   magnitud con el grosor y la opacidad de la línea.
// - Sesgo: el contorno de cada neurona oculta y de salida, con la misma convención.
// - Actividad: el relleno de cada nodo, según el valor que tomó en el cálculo actual.
//
// Con la red corriendo (`live`), el relleno de cada nodo pasa por la guarda de destellos
// (sin-destellos-en-la-red D3 y D4): el que cambiaría mucho por cuarta vez en un segundo se ve quieto,
// con su promedio y rayado.
//
// La disposición (columnas, nodos y qué rótulos se muestran) es una función pura que se prueba en
// Node. Con muchas conexiones, las líneas se dibujan agrupadas por aspecto para reducir los cambios
// de estilo. El diagrama solo muestra: no tiene controles que cambien la red.
// Los colores salen de styles/tokens.css y los rótulos, de los diccionarios.
import { computeDetailed } from '../core/network.js';
import { maxWeightOf } from './link-look.js';
import { createFlashGuard, FILL } from './flash-guard.js';

export const OUTPUT_KEYS = Object.freeze(['forward', 'left', 'right', 'reverse']);

/** Medidas de la disposición (px). */
export const LAYOUT = Object.freeze({
  padding: 10, // margen arriba y abajo
  labelLeft: 76, // espacio para los rótulos de las entradas
  labelRight: 84, // espacio para los rótulos de las salidas
  maxRadius: 12,
  minRadius: 1,
  minLabelGap: 14, // separación vertical mínima entre dos rótulos
  fontSize: 12, // px de los rótulos, constante sea cual sea el tamaño de la zona
});

/** Alto (px) que se usa si la zona todavía no tiene alto (por ejemplo, oculta). */
export const FALLBACK_HEIGHT = 240;

/** Niveles de magnitud con los que se agrupan las líneas al dibujar. */
export const WEIGHT_LEVELS = 4;

/**
 * Disposición del diagrama dentro de un rectángulo de `width` × `height` px.
 * @param {{sizes:number[], width:number, height:number}} spec
 * @returns {{columns:{x:number, nodes:{x:number,y:number}[]}[], radius:number,
 *   inputLabels:{index:number, kind:'sensor'|'speed', n?:number, x:number, y:number}[],
 *   outputLabels:{index:number, key:string, x:number, y:number}[], links:number[]}}
 *   links: cantidad de conexiones entre cada par de columnas consecutivas.
 */
export function layoutNetwork({ sizes, width, height }) {
  const { padding, labelLeft, labelRight, maxRadius, minRadius, minLabelGap } = LAYOUT;
  const left = labelLeft;
  const right = Math.max(left + 1, width - labelRight);
  const top = padding;
  const bottom = Math.max(top + 1, height - padding);
  const tallest = Math.max(...sizes);
  const spacing = (bottom - top) / tallest;
  const radius = Math.max(minRadius, Math.min(maxRadius, spacing * 0.38));

  const columns = sizes.map((count, c) => {
    const x = sizes.length === 1 ? (left + right) / 2 : left + ((right - left) * c) / (sizes.length - 1);
    const step = (bottom - top) / count;
    const nodes = Array.from({ length: count }, (_, i) => ({ x, y: top + step * (i + 0.5) }));
    return { x, nodes };
  });

  // Entradas: un sensor por nodo y la velocidad al final. Si no entran todos los rótulos, se
  // muestran los sensores de a saltos (el primero siempre) y nunca se tapa el de la velocidad.
  const inputs = columns[0].nodes;
  const sensorCount = inputs.length - 1;
  const inputStep = (bottom - top) / inputs.length;
  const every = Math.max(1, Math.ceil(minLabelGap / inputStep));
  const speedY = inputs[sensorCount].y;
  const labelX = left - radius - 6;
  const inputLabels = [];
  for (let i = 0; i < sensorCount; i += every) {
    if (speedY - inputs[i].y < minLabelGap) break;
    inputLabels.push({ index: i, kind: 'sensor', n: i + 1, x: labelX, y: inputs[i].y });
  }
  inputLabels.push({ index: sensorCount, kind: 'speed', x: labelX, y: speedY });

  const outputs = columns[columns.length - 1].nodes;
  const outputLabels = outputs.map((n, i) => ({ index: i, key: OUTPUT_KEYS[i] ?? String(i), x: right + radius + 6, y: n.y }));

  const links = sizes.slice(1).map((n, i) => n * sizes[i]);
  return { columns, radius, inputLabels, outputLabels, links };
}

/**
 * Aspecto de un peso o un sesgo: signo y nivel de magnitud (1 a WEIGHT_LEVELS; 0 si es 0). La magnitud
 * es relativa a `maxWeight`, el mayor peso de la red sin el signo (vista-de-la-red D2: la misma escala
 * relativa que el inspector); sin él, la escala fija de 0 a 1.
 */
export function weightStyle(value, maxWeight = 1) {
  const sign = value < 0 ? 'negative' : 'positive';
  const magnitude = Math.min(1, Math.abs(value) / (maxWeight > 0 ? maxWeight : 1));
  const level = magnitude === 0 ? 0 : Math.max(1, Math.ceil(magnitude * WEIGHT_LEVELS));
  return { sign, level, dashed: sign === 'negative' };
}

/**
 * Grosor (px) y opacidad de una línea según su nivel de magnitud: marcada si pesa, tenue si no, pero
 * siempre por encima de un mínimo que se distingue del fondo (vista-de-la-red, delta de vista-red).
 */
export function levelLook(level) {
  return { width: 1 + level * 0.55, alpha: 0.4 + (level / WEIGHT_LEVELS) * 0.55 };
}

/** Actividad de un nodo entre 0 y 1 a partir de su valor (las entradas y tanh pueden ser negativas). */
export const activity = (value) => Math.min(1, Math.abs(Number(value) || 0));

const COLOR_VARS = {
  positive: '--color-weight-positive',
  negative: '--color-weight-negative',
  active: '--color-neuron-active',
  input: '--color-network-input', // entra: contorno de las entradas (sistema-de-diseno-base D1, B)
  node: '--color-neuron',
  label: '--color-text-muted',
  background: '--color-surface',
  text: '--color-text',
};

/**
 * Vista del diagrama: ocupa el ancho y el alto de `container` (design.md D6).
 * @param {{container: HTMLElement, i18n: object, doc?: Document}} spec
 */
export function createNetworkView({ container, i18n, doc = document }) {
  const win = doc.defaultView;
  const canvas = doc.createElement('canvas');
  canvas.className = 'network-canvas';
  canvas.setAttribute('role', 'img');
  container.append(canvas);
  const ctx = canvas.getContext('2d');

  let colors = readColors();
  let size = { width: 0, height: 0 };
  let dpr = 1;

  function readColors() {
    const style = getComputedStyle(doc.documentElement);
    return Object.fromEntries(Object.entries(COLOR_VARS).map(([k, v]) => [k, style.getPropertyValue(v).trim()]));
  }

  function resize() {
    const w = Math.max(1, container.clientWidth);
    const height = container.clientHeight > 0 ? container.clientHeight : FALLBACK_HEIGHT;
    const ratio = win.devicePixelRatio || 1;
    if (w === size.width && height === size.height && ratio === dpr) return;
    size = { width: w, height };
    dpr = ratio;
    canvas.style.width = `${w}px`;
    canvas.style.height = `${height}px`;
    canvas.width = Math.round(w * ratio);
    canvas.height = Math.round(height * ratio);
  }
  const observer = new win.ResizeObserver(() => resize());
  observer.observe(container);
  const guard = createFlashGuard({ fill: FILL });
  let stripes = null; // rayado fijo de lo que titubea, creado una vez
  function stripePattern() {
    if (stripes) return stripes;
    const tile = doc.createElement('canvas');
    tile.width = 6;
    tile.height = 6;
    const t = tile.getContext('2d');
    if (!t) return null;
    t.strokeStyle = colors.text;
    t.globalAlpha = 0.35;
    t.lineWidth = 1.5;
    t.beginPath();
    t.moveTo(-1.5, 7.5); t.lineTo(7.5, -1.5);
    t.moveTo(-1.5, 1.5); t.lineTo(1.5, -1.5);
    t.moveTo(4.5, 7.5); t.lineTo(7.5, 4.5);
    t.stroke();
    stripes = ctx.createPattern(tile, 'repeat');
    return stripes;
  }

  /** Líneas de una capa agrupadas por signo y nivel: un trazo por grupo. */
  function drawLinks(from, to, weights, maxWeight) {
    const groups = new Map();
    for (let j = 0; j < to.length; j++) {
      const row = weights[j];
      for (let i = 0; i < from.length; i++) {
        const st = weightStyle(row[i], maxWeight);
        if (st.level === 0) continue;
        const key = `${st.sign}${st.level}`;
        let g = groups.get(key);
        if (!g) { g = { st, segs: [] }; groups.set(key, g); }
        g.segs.push(from[i], to[j]);
      }
    }
    for (const { st, segs } of groups.values()) {
      const look = levelLook(st.level);
      ctx.strokeStyle = colors[st.sign];
      ctx.globalAlpha = look.alpha;
      ctx.lineWidth = look.width;
      ctx.setLineDash(st.dashed ? [4, 3] : []);
      ctx.beginPath();
      for (let k = 0; k < segs.length; k += 2) { ctx.moveTo(segs[k].x, segs[k].y); ctx.lineTo(segs[k + 1].x, segs[k + 1].y); }
      ctx.stroke();
    }
    ctx.setLineDash([]);
    ctx.globalAlpha = 1;
  }

  /** Nodo: relleno según su actividad y, si tiene sesgo, contorno según el sesgo. */
  function drawNode(p, r, level, bias, maxWeight, flicker = false) {
    ctx.beginPath();
    ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
    ctx.fillStyle = colors.background;
    ctx.fill();
    if (level > 0) {
      ctx.globalAlpha = 0.15 + 0.85 * level;
      ctx.fillStyle = colors.active;
      ctx.fill();
      ctx.globalAlpha = 1;
    }
    const pattern = flicker ? stripePattern() : null;
    if (pattern) { ctx.fillStyle = pattern; ctx.fill(); }
    if (bias === undefined) {
      ctx.strokeStyle = colors.input;
      ctx.lineWidth = 1;
      ctx.setLineDash([]);
    } else {
      const st = weightStyle(bias, maxWeight);
      const look = levelLook(st.level);
      ctx.strokeStyle = st.level === 0 ? colors.node : colors[st.sign];
      ctx.lineWidth = Math.max(1, look.width * 1.4);
      ctx.setLineDash(st.dashed ? [2.5, 2] : []);
    }
    ctx.stroke();
    ctx.setLineDash([]);
  }

  /** Rombo relleno del color del texto: la marca de lo cambiado, la misma forma que en el inspector. */
  function diamond(p, r) {
    ctx.beginPath();
    ctx.moveTo(p.x + r, p.y); ctx.lineTo(p.x, p.y + r); ctx.lineTo(p.x - r, p.y); ctx.lineTo(p.x, p.y - r);
    ctx.closePath();
    ctx.fill();
  }

  /**
   * Dibuja la red con la actividad del cálculo para `inputs` (lecturas de los sensores y velocidad).
   * No modifica la red. Con `live` (la red corre), la guarda de destellos; sin él, todo exacto.
   * `marks` (entrenar-la-generacion-ensena D5): pesos y sesgos cambiados, con las claves del inspector
   * ('l:j:i' y 'l:j', la capa contada desde las entradas); se marcan con un rombo, como en el inspector.
   */
  function render(network, inputs, { live = false, marks = null } = {}) {
    resize();
    if (!live) guard.reset();
    const now = (win.performance ?? performance).now();
    const layout = layoutNetwork({ sizes: network.sizes, width: size.width, height: size.height });
    const detail = inputs ? computeDetailed(network, inputs) : null;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, size.width, size.height);
    const { columns, radius } = layout;
    const maxWeight = maxWeightOf(network);
    for (let l = 0; l < network.layers.length; l++) drawLinks(columns[l].nodes, columns[l + 1].nodes, network.layers[l].weights, maxWeight);
    columns.forEach((col, c) => {
      const values = detail ? detail.values[c] : null;
      const biases = c === 0 ? null : network.layers[c - 1].biases;
      col.nodes.forEach((p, i) => {
        const level = values ? activity(values[i]) : 0;
        const g = live && values ? guard.show(`n:${c}:${i}`, level, now) : { level, flicker: false };
        drawNode(p, radius, g.level, biases ? biases[i] : undefined, maxWeight, g.flicker);
      });
    });
    if (marks) {
      // Arriba de todo: un rombo en el medio de cada conexión cambiada y otro arriba a la derecha de cada neurona
      // con el sesgo cambiado (no depende del color).
      ctx.fillStyle = colors.text;
      for (const key of marks.changedWeights) {
        const [l, j, i] = key.split(':').map(Number);
        const a = columns[l - 1]?.nodes[i];
        const b = columns[l]?.nodes[j];
        if (a && b) diamond({ x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 }, 3.5);
      }
      for (const key of marks.changedBiases) {
        const [l, j] = key.split(':').map(Number);
        const p = columns[l]?.nodes[j];
        if (p) diamond({ x: p.x + radius * 0.75, y: p.y - radius * 0.75 }, 4);
      }
    }
    // Rótulos
    ctx.fillStyle = colors.label;
    ctx.font = `${LAYOUT.fontSize}px system-ui, -apple-system, "Segoe UI", Roboto, sans-serif`;
    ctx.textBaseline = 'middle';
    ctx.textAlign = 'right';
    for (const lab of layout.inputLabels) {
      const text = lab.kind === 'speed' ? i18n.t('network.input.speed') : i18n.t('network.input.sensor', { n: lab.n });
      ctx.fillText(text, lab.x, lab.y);
    }
    ctx.textAlign = 'left';
    for (const lab of layout.outputLabels) ctx.fillText(i18n.t(`network.output.${lab.key}`), lab.x, lab.y);
    canvas.setAttribute('aria-label', i18n.t('network.aria', { shape: network.sizes.join('-') }));
    return layout;
  }

  return {
    canvas,
    render,
    refreshColors() { colors = readColors(); stripes = null; },
    /** Si una neurona titubea ahora (verificación desde la consola). */
    flickering: (layer, neuron) => guard.flickering(`n:${layer}:${neuron}`),
    dispose() { observer.disconnect(); canvas.remove(); },
  };
}

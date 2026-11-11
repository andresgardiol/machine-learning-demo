// Diagrama de una red neuronal en un canvas propio (design.md D12): capas como columnas de
// izquierda a derecha (entradas, ocultas, salidas), un nodo por neurona y una línea por conexión.
//
// - Peso: el signo con dos colores y dos trazos (positivo continuo, negativo punteado) y la
//   magnitud con el grosor y la opacidad de la línea.
// - Sesgo: el contorno de cada neurona oculta y de salida, con la misma convención.
// - Actividad: el relleno de cada nodo, según el valor que tomó en el cálculo actual.
//
// La disposición (columnas, nodos y qué rótulos se muestran) es una función pura que se prueba en
// Node. Con muchas conexiones, las líneas se dibujan agrupadas por aspecto para reducir los cambios
// de estilo. El diagrama solo muestra: no tiene controles que cambien la red.
// Los colores salen de styles/tokens.css y los rótulos, de los diccionarios.
import { computeDetailed } from '../core/network.js';

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

/** Aspecto de un peso o un sesgo: signo y nivel de magnitud (1 a WEIGHT_LEVELS; 0 si es 0). */
export function weightStyle(value) {
  const sign = value < 0 ? 'negative' : 'positive';
  const magnitude = Math.min(1, Math.abs(value));
  const level = magnitude === 0 ? 0 : Math.max(1, Math.ceil(magnitude * WEIGHT_LEVELS));
  return { sign, level, dashed: sign === 'negative' };
}

/** Grosor (px) y opacidad de una línea según su nivel de magnitud: marcada si pesa, tenue si no. */
export function levelLook(level) {
  return { width: 0.5 + level * 0.6, alpha: 0.12 + (level / WEIGHT_LEVELS) * 0.78 };
}

/** Actividad de un nodo entre 0 y 1 a partir de su valor (las entradas y tanh pueden ser negativas). */
export const activity = (value) => Math.min(1, Math.abs(Number(value) || 0));

const COLOR_VARS = {
  positive: '--color-weight-positive',
  negative: '--color-weight-negative',
  active: '--color-neuron-active',
  node: '--color-neuron',
  label: '--color-text-muted',
  background: '--color-surface',
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

  /** Líneas de una capa agrupadas por signo y nivel: un trazo por grupo. */
  function drawLinks(from, to, weights) {
    const groups = new Map();
    for (let j = 0; j < to.length; j++) {
      const row = weights[j];
      for (let i = 0; i < from.length; i++) {
        const st = weightStyle(row[i]);
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
  function drawNode(p, r, level, bias) {
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
    if (bias === undefined) {
      ctx.strokeStyle = colors.node;
      ctx.lineWidth = 1;
      ctx.setLineDash([]);
    } else {
      const st = weightStyle(bias);
      const look = levelLook(st.level);
      ctx.strokeStyle = st.level === 0 ? colors.node : colors[st.sign];
      ctx.lineWidth = Math.max(1, look.width * 1.4);
      ctx.setLineDash(st.dashed ? [2.5, 2] : []);
    }
    ctx.stroke();
    ctx.setLineDash([]);
  }

  /**
   * Dibuja la red con la actividad del cálculo para `inputs` (lecturas de los sensores y velocidad).
   * No modifica la red.
   */
  function render(network, inputs) {
    resize();
    const layout = layoutNetwork({ sizes: network.sizes, width: size.width, height: size.height });
    const detail = inputs ? computeDetailed(network, inputs) : null;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, size.width, size.height);
    const { columns, radius } = layout;
    for (let l = 0; l < network.layers.length; l++) drawLinks(columns[l].nodes, columns[l + 1].nodes, network.layers[l].weights);
    columns.forEach((col, c) => {
      const values = detail ? detail.values[c] : null;
      const biases = c === 0 ? null : network.layers[c - 1].biases;
      col.nodes.forEach((p, i) => drawNode(p, radius, values ? activity(values[i]) : 0, biases ? biases[i] : undefined));
    });
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
    refreshColors() { colors = readColors(); },
    dispose() { observer.disconnect(); canvas.remove(); },
  };
}

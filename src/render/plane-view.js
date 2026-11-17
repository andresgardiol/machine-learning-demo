// Plano de puntos del Laboratorio (pestana-laboratorio, design.md D7): el fondo pintado con lo que la
// red contesta en cada lugar (el color de la clase que elegiría y, con la intensidad, cuán segura
// está) y, encima, los puntos. Las dos clases se distinguen por la forma (círculos y cuadrados) y los
// dos grupos por el relleno (llenos los de práctica, huecos los apartados), no solo por el color.
//
// El fondo es una grilla de PLANE_GRID × PLANE_GRID que se recalcula como mucho 15 veces por segundo;
// los puntos se dibujan en cada render. La cuenta del fondo es pura (planeGrid), para probarla.
import { softOutputs } from '../core/backprop.js';

export const PLANE_GRID = 50;
export const PLANE_FPS = 15;

/** Rango del plano por defecto: de −1 a 1 en los dos ejes (con compuertas, de −0,5 a 1,5). */
export const DEFAULT_RANGE = Object.freeze([-1, 1]);

/**
 * Respuesta de la red (0 a 1) en el centro de cada celda de una grilla de n × n sobre el rango
 * [lo, hi]² (por defecto [−1, 1]²). Fila 0 arriba.
 */
export function planeGrid(net, n = PLANE_GRID, off = null, range = DEFAULT_RANGE) {
  const [lo, hi] = range;
  const span = hi - lo;
  const out = new Float32Array(n * n);
  for (let r = 0; r < n; r++) {
    const y = hi - ((r + 0.5) / n) * span;
    for (let c = 0; c < n; c++) {
      const x = lo + ((c + 0.5) / n) * span;
      out[r * n + c] = softOutputs(net, [x, y], off)[0];
    }
  }
  return out;
}

/** Color y opacidad del fondo para una respuesta: la clase que elegiría y la seguridad (0 en 0,5, 1 en 0 o 1). */
export const cellShade = (y) => ({ cls: y > 0.5 ? 'a' : 'b', alpha: Math.min(1, Math.abs(y - 0.5) * 2) });

/**
 * Valor de una neurona oculta llevado a la escala del plano (0 a 1, con 0,5 en el medio), para pintar su
 * mapa con los mismos colores (vista-de-la-red D12): tanh va de −1 a 1, sigmoide de 0 a 1, y ReLU de 0
 * a su mayor valor en el plano (`max`).
 */
export function mapShade(value, activation, max = 1) {
  if (activation === 'tanh') return (value + 1) / 2;
  if (activation === 'relu') return max > 0 ? 0.5 + 0.5 * Math.min(1, value / max) : 0.5;
  return value; // sigmoide (y la salida)
}

/** Dónde se enciende más un mapa: 'top-left', 'top', …, 'center', …, 'bottom-right' (para el lector de pantalla). */
export function brightestRegion(values, size) {
  let best = 0;
  for (let k = 1; k < values.length; k++) if (values[k] > values[best]) best = k;
  const row = Math.floor(best / size);
  const col = best % size;
  const third = (v) => (v < size / 3 ? 0 : v < (2 * size) / 3 ? 1 : 2);
  const v = ['top', '', 'bottom'][third(row)];
  const h = ['left', '', 'right'][third(col)];
  return v && h ? `${v}-${h}` : v || h || 'center';
}

// --- Punto de prueba (punto-de-prueba D2 a D4) ------------------------------------------------------
/** Radio del marcador y lado mínimo de su área de agarre (px). */
export const PROBE = Object.freeze({ radius: 10, grab: 28, step: 0.05, fineStep: 0.01 });

/**
 * El cuadrado del plano dentro de una zona de w × h: el lado es el menor y queda centrado. `range` es
 * lo que abarca en los dos ejes (laboratorio-empieza-por-compuertas D2), por defecto [−1, 1].
 */
export function planeGeometry(w, h, range = DEFAULT_RANGE) {
  const side = Math.min(w, h);
  return { ox: (w - side) / 2, oy: (h - side) / 2, side, lo: range[0], hi: range[1] };
}
const loOf = (g) => g.lo ?? -1;
const hiOf = (g) => g.hi ?? 1;
/** Coordenadas del plano (dentro del rango, y hacia arriba) → píxeles de la zona. */
export const planeToPx = (g, x, y) => {
  const lo = loOf(g);
  const span = hiOf(g) - lo;
  return { x: g.ox + ((x - lo) / span) * g.side, y: g.oy + ((hiOf(g) - y) / span) * g.side };
};
const clampTo = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
const round2 = (v) => Math.round(v * 100) / 100 || 0; // sin «−0»
/** Píxeles de la zona → coordenadas del plano, redondeadas a centésimos y dentro del rango. */
export function pxToPlane(g, px, py) {
  const lo = loOf(g);
  const hi = hiOf(g);
  const span = hi - lo;
  return { x: round2(clampTo(lo + ((px - g.ox) / g.side) * span, lo, hi)), y: round2(clampTo(hi - ((py - g.oy) / g.side) * span, lo, hi)) };
}
/**
 * El punto movido con una flecha: 0,05 por tecla, 0,01 con Mayúsculas, dentro del rango; null si la
 * tecla no es una flecha.
 */
export function nudgeProbe(p, key, fine = false, range = DEFAULT_RANGE) {
  const d = fine ? PROBE.fineStep : PROBE.step;
  const dx = key === 'ArrowRight' ? d : key === 'ArrowLeft' ? -d : 0;
  const dy = key === 'ArrowUp' ? d : key === 'ArrowDown' ? -d : 0;
  if (dx === 0 && dy === 0) return null;
  return { x: round2(clampTo(p.x + dx, range[0], range[1])), y: round2(clampTo(p.y + dy, range[0], range[1])) };
}
/**
 * Dónde va el rótulo de w × h junto al marcador en (px, py): a la derecha, a la izquierda, arriba,
 * abajo o en diagonal, el primero que entra en el plano sin tapar el marcador; si ninguno entra (un
 * rótulo más ancho que el plano), pegado al borde.
 */
export function probeLabelBox(g, px, py, w, h, r = PROBE.radius) {
  const gap = 6;
  const inside = (b) => b.x >= g.ox && b.y >= g.oy && b.x + w <= g.ox + g.side && b.y + h <= g.oy + g.side;
  const options = [
    { x: px + r + gap, y: py - h / 2 },
    { x: px - r - gap - w, y: py - h / 2 },
    { x: px - w / 2, y: py - r - gap - h },
    { x: px - w / 2, y: py + r + gap },
    // En una esquina, en diagonal.
    { x: px + r + gap, y: py - r - gap - h },
    { x: px - r - gap - w, y: py - r - gap - h },
    { x: px + r + gap, y: py + r + gap },
    { x: px - r - gap - w, y: py + r + gap },
  ];
  const fit = options.find(inside);
  if (fit) return { ...fit, w, h };
  const x = Math.max(g.ox, Math.min(g.ox + g.side - w, px + r + gap));
  const y = Math.max(g.oy, Math.min(g.oy + g.side - h, py + r + gap));
  return { x, y, w, h };
}
/** Lo que contesta la red en un lugar: la clase ('a' o 'b') y cuán segura está (0,5 a 1). */
export function probeAnswer(net, x, y, off = null) {
  const v = softOutputs(net, [x, y], off)[0];
  return { value: v, cls: v > 0.5 ? 'a' : 'b', confidence: Math.max(v, 1 - v) };
}

const hexToRgb = (hex) => {
  const h = hex.replace('#', '').trim();
  const v = h.length === 3 ? h.split('').map((c) => c + c).join('') : h;
  const n = Number.parseInt(v, 16);
  return Number.isFinite(n) ? [(n >> 16) & 255, (n >> 8) & 255, n & 255] : [128, 128, 128];
};

/**
 * @param {{container:HTMLElement, doc?:Document, now?:()=>number}} spec
 */
export function createPlaneView({ container, doc = document, now = () => performance.now() }) {
  const win = doc.defaultView;
  const canvas = doc.createElement('canvas');
  canvas.className = 'plane-canvas';
  canvas.setAttribute('aria-hidden', 'true');
  container.append(canvas);
  const ctx = canvas.getContext('2d');
  const grid = doc.createElement('canvas');
  grid.width = PLANE_GRID;
  grid.height = PLANE_GRID;
  const gctx = grid.getContext('2d');
  const image = gctx.createImageData(PLANE_GRID, PLANE_GRID);
  let size = { w: 0, h: 0, dpr: 1 };
  let lastGrid = -Infinity;
  let gridKey = null;
  let colors = readColors();
  let lastRange = DEFAULT_RANGE;

  function readColors() {
    const st = getComputedStyle(doc.documentElement);
    const v = (k) => st.getPropertyValue(k).trim();
    return { a: v('--color-class-a'), b: v('--color-class-b'), bg: v('--color-bg'), text: v('--color-text'), current: v('--color-network-current'), border: v('--color-border') };
  }
  function resize() {
    const w = Math.max(1, container.clientWidth);
    const h = Math.max(1, container.clientHeight);
    const dpr = win.devicePixelRatio || 1;
    if (w === size.w && h === size.h && dpr === size.dpr) return false;
    size = { w, h, dpr };
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    return true;
  }
  const observer = new win.ResizeObserver(() => { if (resize()) gridKey = null; });
  observer.observe(container);
  resize();

  /** Pinta `values` (respuestas de 0 a 1 por celda) en `img` con los colores del plano. */
  function paintValues(img, values, toY = (v) => v) {
    const A = hexToRgb(colors.a);
    const B = hexToRgb(colors.b);
    const BG = hexToRgb(colors.bg);
    for (let k = 0; k < values.length; k++) {
      const { cls, alpha } = cellShade(toY(values[k]));
      const C = cls === 'a' ? A : B;
      const a = 0.12 + 0.5 * alpha;
      img.data[k * 4] = Math.round(BG[0] + (C[0] - BG[0]) * a);
      img.data[k * 4 + 1] = Math.round(BG[1] + (C[1] - BG[1]) * a);
      img.data[k * 4 + 2] = Math.round(BG[2] + (C[2] - BG[2]) * a);
      img.data[k * 4 + 3] = 255;
    }
  }

  function paintGrid(net, off, map, range) {
    if (map) { paintValues(image, map.values, map.toY); gctx.putImageData(image, 0, 0); return; }
    const values = planeGrid(net, PLANE_GRID, off, range);
    const A = hexToRgb(colors.a);
    const B = hexToRgb(colors.b);
    const BG = hexToRgb(colors.bg);
    for (let k = 0; k < values.length; k++) {
      const { cls, alpha } = cellShade(values[k]);
      const C = cls === 'a' ? A : B;
      const a = 0.12 + 0.5 * alpha;
      image.data[k * 4] = Math.round(BG[0] + (C[0] - BG[0]) * a);
      image.data[k * 4 + 1] = Math.round(BG[1] + (C[1] - BG[1]) * a);
      image.data[k * 4 + 2] = Math.round(BG[2] + (C[2] - BG[2]) * a);
      image.data[k * 4 + 3] = 255;
    }
    gctx.putImageData(image, 0, 0);
  }

  /**
   * @param {object} state
   * @param {object} state.network la red de ahora
   * @param {string|number} state.version cambia cuando la red cambia (para no repintar el fondo de más)
   * @param {{inputs:number[], targets:number[]}[]} state.examples
   * @param {boolean[]} state.held cuáles están apartados
   * @param {number|null} [state.highlight] índice del ejemplo en curso
   * @param {boolean} [state.force] repintar el fondo ya
   * @param {number|null} [state.selected] índice del punto elegido en la tabla de datos (anillo continuo)
   * @param {{key:string, values:Float32Array, toY:(v:number)=>number}|null} [state.map] mapa de una neurona
   *   oculta para el fondo, en lugar de lo que contesta la red (D12)
   * @param {string} [state.label] rótulo sobre el plano: de quién es el fondo
   * @param {[number, number]} [state.range] lo que abarca el plano en los dos ejes (por defecto [−1, 1])
   * @param {number[]} [state.ticks] marcas en los ejes (con compuertas, 0 y 1)
   * @param {boolean} [state.big] ejemplos grandes (los cuatro casos de las compuertas)
   * @param {number|null} [state.live] durante un gesto de perilla, el fondo se repinta en cada cuadro (D11)
   */
  function render(state) {
    if (size.w <= 1) resize();
    const t = now();
    const range = state.range ?? DEFAULT_RANGE;
    lastRange = range;
    const key = `${state.version}|${state.map?.key ?? 'red'}|${range.join(',')}`;
    const mapChanged = gridKey !== null && String(gridKey).split('|').slice(1).join('|') !== `${state.map?.key ?? 'red'}|${range.join(',')}`;
    if (state.force || mapChanged || (key !== gridKey && (state.live || t - lastGrid >= 1000 / PLANE_FPS))) {
      paintGrid(state.network, state.off ?? null, state.map ?? null, range);
      gridKey = key;
      lastGrid = t;
    }
    const { w, h, dpr } = size;
    const side = Math.min(w, h);
    const ox = (w - side) / 2;
    const oy = (h - side) / 2;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);
    ctx.imageSmoothingEnabled = true;
    ctx.drawImage(grid, ox, oy, side, side);
    ctx.strokeStyle = colors.border;
    ctx.lineWidth = 1;
    ctx.strokeRect(ox + 0.5, oy + 0.5, side - 1, side - 1);
    const g = { ox, oy, side, lo: range[0], hi: range[1] };
    const toPx = (x, y) => planeToPx(g, x, y);
    const r = state.big ? Math.max(6, Math.min(12, side / 28)) : Math.max(2.5, Math.min(5, side / 70));
    if (state.ticks?.length) {
      // Marcas en los ejes (D2): con compuertas, 0 y 1, para leer dónde está cada caso.
      ctx.font = `600 11px system-ui, -apple-system, "Segoe UI", Roboto, sans-serif`;
      ctx.fillStyle = colors.text;
      ctx.strokeStyle = colors.border;
      ctx.lineWidth = 1;
      ctx.setLineDash([2, 3]);
      for (const v of state.ticks) {
        const p = toPx(v, v);
        ctx.beginPath(); ctx.moveTo(p.x, oy); ctx.lineTo(p.x, oy + side); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(ox, p.y); ctx.lineTo(ox + side, p.y); ctx.stroke();
      }
      ctx.setLineDash([]);
      for (const v of state.ticks) {
        const p = toPx(v, v);
        ctx.textAlign = 'center';
        ctx.textBaseline = 'bottom';
        ctx.fillText(String(v), p.x, oy + side - 3);
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        ctx.fillText(String(v), ox + 4, p.y);
      }
    }
    const shape = (p, cls) => {
      ctx.beginPath();
      if (cls === 1) ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
      else ctx.rect(p.x - r * 0.9, p.y - r * 0.9, r * 1.8, r * 1.8);
    };
    state.examples.forEach((ex, i) => {
      const p = toPx(ex.inputs[0], ex.inputs[1]);
      const cls = ex.targets[0] >= 0.5 ? 1 : 0;
      const color = cls === 1 ? colors.a : colors.b;
      shape(p, cls);
      if (state.held?.[i]) {
        ctx.fillStyle = colors.bg;
        ctx.fill();
        ctx.strokeStyle = color;
        ctx.lineWidth = 1.8;
        ctx.stroke();
      } else {
        ctx.fillStyle = color;
        ctx.fill();
        ctx.strokeStyle = colors.bg;
        ctx.lineWidth = 1;
        ctx.stroke();
      }
    });
    if (state.selected !== null && state.selected !== undefined && state.examples[state.selected]) {
      const ex = state.examples[state.selected];
      const p = toPx(ex.inputs[0], ex.inputs[1]);
      ctx.strokeStyle = colors.text;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(p.x, p.y, r + 4, 0, Math.PI * 2);
      ctx.stroke();
    }
    if (state.label) {
      // Rótulo: de quién es el fondo (D12). Es lo que evita un modo oculto.
      ctx.font = `600 12px system-ui, -apple-system, "Segoe UI", Roboto, sans-serif`;
      const tw = ctx.measureText(state.label).width + 12;
      const bx = ox + 6;
      const by = oy + 6;
      ctx.globalAlpha = 0.88;
      ctx.fillStyle = colors.bg;
      ctx.fillRect(bx, by, Math.min(tw, side - 12), 20);
      ctx.globalAlpha = 1;
      ctx.fillStyle = colors.text;
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillText(state.label, bx + 6, by + 10.5, side - 24);
    }
    if (state.highlight !== null && state.highlight !== undefined && state.examples[state.highlight]) {
      const ex = state.examples[state.highlight];
      const p = toPx(ex.inputs[0], ex.inputs[1]);
      ctx.strokeStyle = colors.current;
      ctx.lineWidth = 2.5;
      ctx.setLineDash([3, 2]);
      ctx.beginPath();
      ctx.arc(p.x, p.y, r + 5, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
    }
  }

  /** Pinta el mapa de una neurona en `target` (un canvas de PLANE_GRID × PLANE_GRID), con los colores del plano. */
  function paintMap(target, values, toY) {
    const c = target.getContext('2d');
    const img = c.createImageData(PLANE_GRID, PLANE_GRID);
    paintValues(img, values, toY);
    c.putImageData(img, 0, 0);
  }

  return {
    canvas,
    render,
    /** El cuadrado del plano en la zona, en px CSS (para el punto de prueba), con el rango del último render. */
    get geometry() { if (size.w <= 1) resize(); return planeGeometry(size.w, size.h, lastRange); },
    paintMap,
    refreshColors() { colors = readColors(); gridKey = null; },
    dispose() { observer.disconnect(); canvas.remove(); },
  };
}

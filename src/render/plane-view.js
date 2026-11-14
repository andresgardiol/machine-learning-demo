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

/** Respuesta de la red (0 a 1) en el centro de cada celda de una grilla de n × n sobre [−1, 1]². Fila 0 arriba. */
export function planeGrid(net, n = PLANE_GRID, off = null) {
  const out = new Float32Array(n * n);
  for (let r = 0; r < n; r++) {
    const y = 1 - ((r + 0.5) / n) * 2;
    for (let c = 0; c < n; c++) {
      const x = ((c + 0.5) / n) * 2 - 1;
      out[r * n + c] = softOutputs(net, [x, y], off)[0];
    }
  }
  return out;
}

/** Color y opacidad del fondo para una respuesta: la clase que elegiría y la seguridad (0 en 0,5, 1 en 0 o 1). */
export const cellShade = (y) => ({ cls: y > 0.5 ? 'a' : 'b', alpha: Math.min(1, Math.abs(y - 0.5) * 2) });

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

  function paintGrid(net, off) {
    const values = planeGrid(net, PLANE_GRID, off);
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
   */
  function render(state) {
    if (size.w <= 1) resize();
    const t = now();
    const key = state.version;
    if (state.force || (key !== gridKey && t - lastGrid >= 1000 / PLANE_FPS)) {
      paintGrid(state.network, state.off ?? null);
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
    const toPx = (x, y) => ({ x: ox + ((x + 1) / 2) * side, y: oy + ((1 - y) / 2) * side });
    const r = Math.max(2.5, Math.min(5, side / 70));
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

  return {
    canvas,
    render,
    refreshColors() { colors = readColors(); gridKey = null; },
    dispose() { observer.disconnect(); canvas.remove(); },
  };
}

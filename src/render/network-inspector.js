// Diagrama del inspector de la red (pestana-inspeccionar, design.md D6, D6b y D7b): la red en grande,
// en un canvas propio, con la convención de colores y trazos del diagrama de Entrenar (signo con
// color y trazo, magnitud con grosor y opacidad, sesgo en el contorno, actividad en el relleno).
//
// Suma lo que necesita la pestaña Inspeccionar: acercar, alejar y moverse con la cámara del
// escenario; capas resumidas en cuadritos; la neurona elegida con sus conexiones destacadas; el
// filtro de conexiones; lo calculado, lo que se calcula y lo que falta en el paso a paso; las marcas
// de lo apagado, lo cambiado y las entradas a mano; y la animación de cada paso con los valores
// reales. La disposición y la detección bajo el cursor son funciones puras (inspector-layout.js).
//
// El inspector no guarda estado de la simulación: dibuja lo que se le pasa en `render(state)`.
import { weightStyle, levelLook, activity } from './network-view.js';
import { layoutInspector, hitNeuron, INSPECTOR_LAYOUT } from './inspector-layout.js';
import { createCamera, panStarts } from './camera.js';
import { OPERATIONS } from '../core/pass-cursor.js';
import { formatFixed } from '../ui/i18n.js';

/** Acercamiento del diagrama: 1 es la red entera. */
export const INSPECTOR_CAMERA = Object.freeze({ zoom: 1, minZoom: 1, maxZoom: 6, step: 1.25, anchor: Object.freeze({ x: 0.5, y: 0.5 }) });

/** Factor de opacidad de una conexión según su papel. */
export const LINK_EMPHASIS = Object.freeze({ emphasized: 1, normal: 0.5, filtered: 0.07 });

const COLOR_VARS = {
  positive: '--color-weight-positive',
  negative: '--color-weight-negative',
  active: '--color-neuron-active',
  node: '--color-neuron',
  label: '--color-text-muted',
  text: '--color-text',
  background: '--color-surface',
  selected: '--color-accent',
  current: '--color-network-current',
  changed: '--color-network-changed',
  manual: '--color-network-manual',
  bg: '--color-bg',
};

const FONT = 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif';

/** Nivel (0, 1 o 2) de lo que aporta una conexión en el cuadro, para agrupar los trazos. */
export const contributionBucket = (product) => {
  const a = Math.abs(product);
  return a < 0.05 ? 0 : a < 0.3 ? 1 : 2;
};

/**
 * Papel de una conexión: 'emphasized' (entra a la neurona elegida o a la que se calcula), 'filtered'
 * (queda fuera del filtro de conexiones) o 'normal'. Función pura, para las pruebas.
 */
export function linkRole({ layer, neuron, input, emphasis, top }) {
  if (emphasis && emphasis.has(`${layer}:${neuron}`)) return 'emphasized';
  if (top && top[layer] && !top[layer][neuron].has(input)) return 'filtered';
  return 'normal';
}

/**
 * @param {{container: HTMLElement, i18n: object, doc?: Document, onSelect?: (target:{layer:number, neuron:number}) => void,
 *   onViewChange?: () => void}} spec
 */
export function createNetworkInspector({ container, i18n, doc = document, onSelect = () => {}, onViewChange = () => {} }) {
  const win = doc.defaultView;
  const canvas = doc.createElement('canvas');
  canvas.className = 'inspector-canvas';
  canvas.setAttribute('aria-hidden', 'true'); // lo accesible es la capa de botones (overlay)
  const overlay = doc.createElement('div');
  overlay.className = 'inspector-overlay';
  container.append(canvas, overlay);
  const ctx = canvas.getContext('2d');
  const camera = createCamera(INSPECTOR_CAMERA);
  const fmt = (v) => formatFixed(Math.abs(v) < 0.005 ? 0 : v, 2, i18n.language);

  let colors = readColors();
  let viewport = { width: 0, height: 0 };
  let dpr = 1;
  let layout = null;
  let lastState = null;
  let hover = null;

  function readColors() {
    const style = getComputedStyle(doc.documentElement);
    return Object.fromEntries(Object.entries(COLOR_VARS).map(([k, v]) => [k, style.getPropertyValue(v).trim()]));
  }

  function resize() {
    const w = Math.max(1, container.clientWidth);
    const h = Math.max(1, container.clientHeight);
    const ratio = win.devicePixelRatio || 1;
    if (w === viewport.width && h === viewport.height && ratio === dpr) return false;
    viewport = { width: w, height: h };
    dpr = ratio;
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;
    canvas.width = Math.round(w * ratio);
    canvas.height = Math.round(h * ratio);
    return true;
  }
  const observer = new win.ResizeObserver(() => { if (resize() && lastState) render(lastState); });
  observer.observe(container);
  resize();

  // --- Cámara: el mundo son las coordenadas de la disposición con y hacia arriba -------------------
  const target = () => ({ x: viewport.width / 2, y: -viewport.height / 2 });
  const toScreen = (p) => {
    const z = camera.zoom;
    const c = camera.center;
    return { x: (p.x - c.x) * z + viewport.width / 2, y: (p.y + c.y) * z + viewport.height / 2 };
  };
  const toLayout = (s) => {
    const z = camera.zoom;
    const c = camera.center;
    return { x: (s.x - viewport.width / 2) / z + c.x, y: (s.y - viewport.height / 2) / z - c.y };
  };
  const redraw = () => { if (lastState) render(lastState); onViewChange(); };
  function zoomBy(factor) { camera.zoomBy(factor, viewport, target()); redraw(); }
  function resetView() { camera.reset(); redraw(); }

  function onWheel(e) {
    e.preventDefault();
    const pixels = e.deltaMode === 1 ? e.deltaY * 16 : e.deltaMode === 2 ? e.deltaY * viewport.height : e.deltaY;
    const factor = Math.exp(-Math.max(-200, Math.min(200, pixels)) * 0.0015);
    camera.zoomAt({ x: e.offsetX, y: e.offsetY }, factor, viewport, target());
    redraw();
  }
  let drag = null;
  function onPointerDown(e) {
    if (e.button !== 0) return;
    drag = { id: e.pointerId, x: e.clientX, y: e.clientY, startX: e.clientX, startY: e.clientY, panning: false };
    try { canvas.setPointerCapture(e.pointerId); } catch { /* sin puntero activo: sigue sin capturar */ }
  }
  function onPointerMove(e) {
    if (drag && e.pointerId === drag.id) {
      if (!drag.panning) {
        if (!panStarts(e.clientX - drag.startX, e.clientY - drag.startY)) return;
        drag.panning = true;
        canvas.classList.add('dragging');
      }
      const dx = e.clientX - drag.x;
      const dy = e.clientY - drag.y;
      drag.x = e.clientX;
      drag.y = e.clientY;
      if (camera.zoom <= INSPECTOR_CAMERA.minZoom + 1e-9) return; // la red entera: no hay a dónde moverse
      camera.pan(dx, dy);
      redraw();
      return;
    }
    if (!layout) return;
    const h = hitNeuron(layout, toLayout({ x: e.offsetX, y: e.offsetY }), camera.zoom);
    const key = h ? `${h.layer}:${h.neuron}` : null;
    if (key !== (hover ? `${hover.layer}:${hover.neuron}` : null)) {
      hover = h;
      canvas.style.cursor = h ? 'pointer' : '';
      if (lastState) render(lastState);
    }
  }
  function onPointerUp(e) {
    if (!drag || e.pointerId !== drag.id) return;
    const wasPan = drag.panning;
    drag = null;
    canvas.classList.remove('dragging');
    if (wasPan || !layout) return;
    const h = hitNeuron(layout, toLayout({ x: e.offsetX, y: e.offsetY }), camera.zoom);
    if (h) onSelect(h); // un clic en un lugar vacío no cambia la elección
  }
  function onPointerLeave() { if (hover) { hover = null; canvas.style.cursor = ''; if (lastState) render(lastState); } }
  canvas.addEventListener('wheel', onWheel, { passive: false });
  canvas.addEventListener('pointerdown', onPointerDown);
  canvas.addEventListener('pointermove', onPointerMove);
  canvas.addEventListener('pointerup', onPointerUp);
  canvas.addEventListener('pointercancel', onPointerUp);
  canvas.addEventListener('pointerleave', onPointerLeave);

  // --- Dibujo --------------------------------------------------------------------------------------

  /** Agrupa segmentos por aspecto para trazarlos con pocos cambios de estilo. */
  function strokeGroups(groups) {
    for (const g of groups.values()) {
      ctx.strokeStyle = g.color;
      ctx.globalAlpha = g.alpha;
      ctx.lineWidth = g.width;
      ctx.setLineDash(g.dash);
      ctx.beginPath();
      const s = g.segs;
      for (let k = 0; k < s.length; k += 4) { ctx.moveTo(s[k], s[k + 1]); ctx.lineTo(s[k + 2], s[k + 3]); }
      ctx.stroke();
    }
    ctx.setLineDash([]);
    ctx.globalAlpha = 1;
  }

  function addSeg(groups, key, look, a, b) {
    let g = groups.get(key);
    if (!g) { g = { ...look, segs: [] }; groups.set(key, g); }
    g.segs.push(a.x, a.y, b.x, b.y);
  }

  /** Banda de una capa resumida: un solo trapecio tenue entre las dos columnas. */
  function drawBand(fromCol, toCol, P) {
    const a0 = P[fromCol.index][0];
    const a1 = P[fromCol.index][P[fromCol.index].length - 1];
    const b0 = P[toCol.index][0];
    const b1 = P[toCol.index][P[toCol.index].length - 1];
    ctx.beginPath();
    ctx.moveTo(a0.x, a0.y); ctx.lineTo(b0.x, b0.y); ctx.lineTo(b1.x, b1.y); ctx.lineTo(a1.x, a1.y);
    ctx.closePath();
    ctx.globalAlpha = 0.14;
    ctx.fillStyle = colors.node;
    ctx.fill();
    ctx.globalAlpha = 1;
  }

  function diamond(p, r, color) {
    ctx.beginPath();
    ctx.moveTo(p.x, p.y - r); ctx.lineTo(p.x + r, p.y); ctx.lineTo(p.x, p.y + r); ctx.lineTo(p.x - r, p.y);
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();
    ctx.strokeStyle = colors.bg;
    ctx.lineWidth = 1;
    ctx.stroke();
  }

  function cross(p, r, color, width = 1.5) {
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.beginPath();
    ctx.moveTo(p.x - r, p.y - r); ctx.lineTo(p.x + r, p.y + r);
    ctx.moveTo(p.x + r, p.y - r); ctx.lineTo(p.x - r, p.y + r);
    ctx.stroke();
  }

  /**
   * Dibuja la red.
   * @param {object} state
   * @param {number[]} state.sizes
   * @param {object} state.trace la cuenta de traceNetwork (con los cambios de prueba)
   * @param {object|null} [state.cursor] cursor del paso a paso; null: todo calculado
   * @param {{layer:number, neuron:number}} [state.selected]
   * @param {boolean[]} [state.collapsed] capas resumidas
   * @param {Array<Array<Set<number>>>|null} [state.top] filtro de conexiones: top[l][j] = entradas destacadas
   * @param {{changedWeights:Set<string>, changedBiases:Set<string>}} [state.marks] lo cambiado ('l:j:i', 'l:j')
   * @param {boolean[]} [state.manual] entradas a mano
   * @param {{items:{layer:number, neuron:number, op:string, p:number}[]}|null} [state.animation]
   * @param {boolean} [state.visible] falso: no se dibuja (la vista es la tabla)
   */
  function render(state) {
    lastState = state;
    // El tamaño lo lleva el ResizeObserver: leerlo en cada cuadro obligaría a recalcular la página.
    if (state.visible === false) return layout;
    if (viewport.width <= 1) resize();
    const { sizes, trace } = state;
    const cursor = state.cursor ?? null;
    const collapsed = state.collapsed ?? [];
    layout = layoutInspector({ sizes, width: viewport.width, height: viewport.height, collapsed });
    camera.update(target(), viewport);
    const z = camera.zoom;
    const r = Math.min(40, layout.radius * z);
    const P = layout.columns.map((col) => col.nodes.map(toScreen));
    const C = sizes.length;
    const selected = state.selected ?? null;
    const current = cursor && !cursor.done ? cursor.next : null;
    const emphasis = new Set();
    if (selected && selected.layer > 0) emphasis.add(`${selected.layer}:${selected.neuron}`);
    if (current) emphasis.add(`${current.layer}:${current.neuron}`);
    const top = state.top ?? null;
    const marks = state.marks ?? { changedWeights: new Set(), changedBiases: new Set() };
    const animated = new Map();
    for (const it of state.animation?.items ?? []) animated.set(`${it.layer}:${it.neuron}`, it);

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, viewport.width, viewport.height);

    // Conexiones
    const groups = new Map();
    const offSegs = [];
    const changedAt = [];
    for (let l = 1; l < C; l++) {
      const fromCol = layout.columns[l - 1];
      const toCol = layout.columns[l];
      const banded = fromCol.collapsed || toCol.collapsed;
      if (banded) drawBand({ index: l - 1 }, { index: l }, P);
      const neurons = trace.layers[l].neurons;
      for (let j = 0; j < neurons.length; j++) {
        const n = neurons[j];
        const emph = emphasis.has(`${l}:${j}`);
        if (banded && !emph) continue; // en una banda solo se ven las de la neurona destacada
        for (let i = 0; i < n.weights.length; i++) {
          const a = P[l - 1][i];
          const b = P[l][j];
          const offConn = n.offConnections?.[i] || trace.layers[l - 1].neurons[i].off;
          if (offConn) { offSegs.push(a.x, a.y, b.x, b.y); continue; }
          const st = weightStyle(n.weights[i]);
          if (st.level === 0) continue;
          const role = linkRole({ layer: l, neuron: j, input: i, emphasis, top });
          const look = levelLook(st.level);
          const bucket = contributionBucket(n.products[i]);
          const alpha = Math.min(1, look.alpha * LINK_EMPHASIS[role] * (0.45 + 0.275 * bucket) * (role === 'emphasized' ? 1.25 : 1));
          const width = look.width * (role === 'emphasized' ? 1.6 : 1) * Math.min(2, Math.sqrt(z));
          addSeg(groups, `${st.sign}${st.level}${role}${bucket}`, { color: colors[st.sign], alpha, width, dash: st.dashed ? [4, 3] : [] }, a, b);
          if (marks.changedWeights.has(`${l}:${j}:${i}`)) changedAt.push({ x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 });
        }
      }
    }
    strokeGroups(groups);
    if (offSegs.length > 0) {
      const off = new Map([['off', { color: colors.node, alpha: 0.4, width: 1, dash: [1.5, 3], segs: offSegs }]]);
      strokeGroups(off);
    }
    for (const p of changedAt) diamond(p, 4.5, colors.changed);

    // Animación de los productos: una marca por conexión que viaja hasta la neurona (D7b).
    for (const it of animated.values()) {
      if (it.op !== 'products' && it.op !== 'sum') continue;
      const n = trace.layers[it.layer]?.neurons[it.neuron];
      if (!n) continue;
      const to = P[it.layer][it.neuron];
      const k = it.op === 'products' ? it.p : 1;
      for (let i = 0; i < n.products.length; i++) {
        const prod = n.products[i];
        if (prod === 0 && (n.offConnections?.[i])) continue;
        const from = P[it.layer - 1][i];
        const at = it.op === 'sum' ? { x: to.x + (from.x - to.x) * (1 - it.p) * 0.15, y: to.y + (from.y - to.y) * (1 - it.p) * 0.15 }
          : { x: from.x + (to.x - from.x) * k, y: from.y + (to.y - from.y) * k };
        const size = 1.5 + Math.min(5, Math.sqrt(Math.abs(prod)) * 5);
        ctx.globalAlpha = it.op === 'sum' ? 1 - it.p * 0.8 : 0.95;
        ctx.fillStyle = prod < 0 ? colors.negative : colors.positive;
        ctx.beginPath();
        ctx.arc(at.x, at.y, size, 0, Math.PI * 2);
        ctx.fill();
        if (prod < 0) { ctx.strokeStyle = colors.bg; ctx.lineWidth = 1; ctx.stroke(); }
      }
      ctx.globalAlpha = 1;
    }

    // Neuronas
    ctx.font = `${Math.round(Math.max(9, Math.min(13, r * 0.7)))}px ${FONT}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    for (let c = 0; c < C; c++) {
      const col = layout.columns[c];
      const neurons = trace.layers[c].neurons;
      for (let i = 0; i < neurons.length; i++) {
        const n = neurons[i];
        const p = P[c][i];
        const ops = cursor ? cursor.opsDone(c, i) : 4;
        const anim = animated.get(`${c}:${i}`);
        const computed = ops === 4;
        let level = computed ? activity(n.output) : 0;
        if (anim && anim.op === 'activation') level = activity(n.output) * anim.p;
        const bias = c === 0 ? undefined : n.bias;
        const state2 = { computed: computed || (anim && anim.op === 'activation'), biasShown: c > 0 && (ops >= 3 || (anim && anim.op === 'bias')) };
        if (col.collapsed) drawSquare(p, col.side * z, level, bias, n, state2);
        else drawNode(p, r, level, bias, n, state2, anim);
        if (n.off) {
          const rr = col.collapsed ? (col.side * z) / 2 : r;
          cross(p, rr * 0.8, colors.text, 1.5);
        }
        if (c === 0 && state.manual?.[i]) {
          const rr = col.collapsed ? (col.side * z) / 2 + 2 : r + 3;
          ctx.fillStyle = colors.manual;
          ctx.fillRect(p.x - rr - 6, p.y - 3, 5, 6);
        }
        if (c > 0 && marks.changedBiases.has(`${c}:${i}`)) diamond({ x: p.x + r * 0.75, y: p.y - r * 0.75 }, 4, colors.changed);
        // Valor dentro de la neurona, si entra.
        if (!col.collapsed && r >= 12) {
          const showValue = c === 0 || computed;
          const text = showValue ? fmt(n.output) : '–';
          ctx.fillStyle = level > 0.55 ? colors.bg : colors.text;
          ctx.fillText(text, p.x, p.y + 0.5);
        }
        if (anim && anim.op === 'sum') {
          // La suma que se va juntando: los productos ya sumados, en orden (los reales).
          const k = Math.round(anim.p * n.products.length);
          let partial = 0;
          for (let q = 0; q < k; q++) partial += n.products[q];
          labelBox(fmt(partial), { x: p.x, y: p.y - r - 12 });
        }
      }
    }
    // Elegida y en curso
    const ring = (target2, color, dash, extra) => {
      const col = layout.columns[target2.layer];
      const p = P[target2.layer]?.[target2.neuron];
      if (!p) return;
      ctx.strokeStyle = color;
      ctx.lineWidth = 2.5;
      ctx.setLineDash(dash);
      ctx.beginPath();
      if (col.collapsed) {
        const s = (col.side * z) / 2 + extra - 1;
        ctx.rect(p.x - s, p.y - s, 2 * s, 2 * s);
      } else {
        ctx.arc(p.x, p.y, r + extra, 0, Math.PI * 2);
      }
      ctx.stroke();
      ctx.setLineDash([]);
    };
    if (current) ring(current, colors.current, [4, 3], 7);
    if (selected) ring(selected, colors.selected, [], 3.5);

    // Rótulos de entradas y salidas, de tamaño fijo en pantalla.
    ctx.font = `12px ${FONT}`;
    ctx.fillStyle = colors.label;
    ctx.textBaseline = 'middle';
    ctx.textAlign = 'right';
    for (const lab of layout.inputLabels) {
      const p = P[0][lab.index];
      ctx.fillText(inputName(lab.index, sizes[0]), p.x - r - 8, p.y);
    }
    ctx.textAlign = 'left';
    for (const lab of layout.outputLabels) {
      const p = P[C - 1][lab.index];
      ctx.fillText(i18n.t(`network.output.${lab.key}`), p.x + r + 8, p.y);
    }
    // Lo que está bajo el cursor: nombre y valor.
    if (hover && trace.layers[hover.layer]?.neurons[hover.neuron]) {
      const p = P[hover.layer][hover.neuron];
      const n = trace.layers[hover.layer].neurons[hover.neuron];
      const ops = cursor ? cursor.opsDone(hover.layer, hover.neuron) : 4;
      const value = hover.layer === 0 || ops === 4 ? fmt(n.output) : '–';
      labelBox(`${neuronName(hover, sizes)} · ${value}`, { x: p.x, y: p.y + r + 14 });
    }
    return layout;
  }

  function labelBox(text, p) {
    ctx.font = `12px ${FONT}`;
    const w = ctx.measureText(text).width + 10;
    const x = Math.max(2, Math.min(viewport.width - w - 2, p.x - w / 2));
    const y = Math.max(2, Math.min(viewport.height - 20, p.y - 9));
    ctx.globalAlpha = 0.92;
    ctx.fillStyle = colors.bg;
    ctx.fillRect(x, y, w, 18);
    ctx.globalAlpha = 1;
    ctx.fillStyle = colors.text;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, x + 5, y + 9.5);
  }

  /** Nodo: relleno según la actividad; contorno según el sesgo. Sin calcular, contorno punteado gris. */
  function drawNode(p, r, level, bias, n, { computed, biasShown }, anim) {
    ctx.globalAlpha = n.off ? 0.4 : 1;
    ctx.beginPath();
    ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
    ctx.fillStyle = colors.background;
    ctx.fill();
    if (level > 0) {
      ctx.globalAlpha = (n.off ? 0.4 : 1) * (0.15 + 0.85 * level);
      ctx.fillStyle = colors.active;
      if (anim && anim.op === 'activation') {
        // El relleno crece desde el centro hasta el valor.
        ctx.beginPath();
        ctx.arc(p.x, p.y, r * Math.max(0.15, anim.p), 0, Math.PI * 2);
      }
      ctx.fill();
      ctx.globalAlpha = n.off ? 0.4 : 1;
    }
    ctx.beginPath();
    ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
    if (bias === undefined) {
      ctx.strokeStyle = colors.node;
      ctx.lineWidth = 1;
      ctx.setLineDash([]);
    } else if (!computed && !biasShown) {
      ctx.strokeStyle = colors.node;
      ctx.lineWidth = 1.2;
      ctx.setLineDash([2, 3]);
    } else {
      const st = weightStyle(bias);
      const look = levelLook(st.level);
      ctx.strokeStyle = st.level === 0 ? colors.node : colors[st.sign];
      ctx.lineWidth = Math.max(1, look.width * 1.4) * (anim && anim.op === 'bias' ? 1 + 1.5 * (1 - Math.abs(anim.p * 2 - 1)) : 1);
      ctx.setLineDash(st.dashed ? [2.5, 2] : []);
    }
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.globalAlpha = 1;
  }

  function drawSquare(p, side, level, bias, n, { computed }) {
    const h = side / 2;
    ctx.globalAlpha = n.off ? 0.4 : 1;
    ctx.fillStyle = colors.background;
    ctx.fillRect(p.x - h, p.y - h, side, side);
    if (level > 0) {
      ctx.globalAlpha = (n.off ? 0.4 : 1) * (0.15 + 0.85 * level);
      ctx.fillStyle = colors.active;
      ctx.fillRect(p.x - h, p.y - h, side, side);
    }
    ctx.globalAlpha = n.off ? 0.4 : 1;
    ctx.lineWidth = 1;
    if (bias === undefined || !computed) {
      ctx.strokeStyle = colors.node;
      ctx.setLineDash(computed || bias === undefined ? [] : [2, 2]);
    } else {
      const st = weightStyle(bias);
      ctx.strokeStyle = st.level === 0 ? colors.node : colors[st.sign];
      ctx.setLineDash(st.dashed ? [2, 1.5] : []);
    }
    ctx.strokeRect(p.x - h + 0.5, p.y - h + 0.5, side - 1, side - 1);
    ctx.setLineDash([]);
    ctx.globalAlpha = 1;
  }

  /** Nombre visible de una entrada (sensor o velocidad). */
  function inputName(i, count) {
    return i === count - 1 ? i18n.t('network.input.speed') : i18n.t('network.input.sensor', { n: i + 1 });
  }

  /** Nombre de una neurona: la entrada, la acción, o la capa y el número. */
  function neuronName({ layer, neuron }, sizes) {
    if (layer === 0) return inputName(neuron, sizes[0]);
    if (layer === sizes.length - 1) return i18n.t(`network.output.${['forward', 'left', 'right', 'reverse'][neuron]}`);
    return i18n.t('inspect.neuron.hidden', { layer, n: neuron + 1 });
  }

  return {
    canvas,
    overlay,
    camera,
    render,
    zoomBy,
    zoomIn: () => zoomBy(INSPECTOR_CAMERA.step),
    zoomOut: () => zoomBy(1 / INSPECTOR_CAMERA.step),
    resetView,
    /** Posición en pantalla (px de la zona) de una neurona, según el último dibujo. */
    screenOf(layer, neuron) {
      const p = layout?.columns[layer]?.nodes[neuron];
      return p ? toScreen(p) : null;
    },
    /** Posición en pantalla de la columna de una capa (x) y del borde de arriba de la red (y). */
    columnScreenX(layer) { const col = layout?.columns[layer]; return col ? toScreen({ x: col.x, y: 0 }).x : null; },
    get layout() { return layout; },
    get radius() { return layout ? Math.min(40, layout.radius * camera.zoom) : 0; },
    get viewport() { return { ...viewport }; },
    get zoomed() { return camera.zoom > INSPECTOR_CAMERA.minZoom + 1e-9 || !camera.following; },
    refreshColors() { colors = readColors(); },
    neuronName,
    dispose() {
      observer.disconnect();
      canvas.removeEventListener('wheel', onWheel);
      canvas.remove();
      overlay.remove();
    },
  };
}

/** Operaciones de una neurona en orden (reexportadas para la vista). */
export { OPERATIONS, INSPECTOR_LAYOUT };

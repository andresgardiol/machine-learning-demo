// Diagrama del inspector de la red (pestana-inspeccionar D6, D6b y D7b; vista-de-la-red D1 a D12): la
// red en grande, en un canvas propio.
//
// Una conexión se lee con tres canales que no se multiplican (link-look.js): el signo con color y
// trazo, el peso con el grosor (relativo al mayor de la red) y la señal que pasa ahora con el brillo.
// La elección no cambia ninguno: atenúa lo que no está relacionado. Sin nada elegido, la red se ve
// entera y pareja.
//
// Suma lo que necesitan Inspeccionar y el Laboratorio: acercar, alejar y moverse con la cámara del
// escenario; capas resumidas en cuadritos; vista previa al posar el cursor con una lectura junto a él;
// elegir y soltar una neurona o una conexión; números sobre las conexiones de lo elegido; la pastilla
// para cambiar un peso en el lugar; de dónde viene una neurona (upstream); el flujo de la señal; mapas
// dentro de las neuronas; el filtro de conexiones; el paso a paso con la operación en curso; las
// marcas de lo apagado, lo cambiado y las entradas a mano; y la vuelta del aprendizaje.
//
// El inspector no guarda estado de la simulación: dibuja lo que se le pasa en `render(state)`. Lo
// único propio es lo que está bajo el cursor y el reloj del flujo.
import { activity } from './network-view.js';
import { linkLook, maxWeightOfTrace } from './link-look.js';
import { layoutInspector, hitTarget, INSPECTOR_LAYOUT } from './inspector-layout.js';
import { createCamera, panStarts } from './camera.js';
import { OPERATIONS } from '../core/pass-cursor.js';
import { activationFunction } from '../core/network.js';
import { upstream } from '../core/network-paths.js';
import { formatValue } from '../ui/i18n.js';

/** Acercamiento del diagrama: 1 es la red entera. */
export const INSPECTOR_CAMERA = Object.freeze({ zoom: 1, minZoom: 1, maxZoom: 6, step: 1.25, anchor: Object.freeze({ x: 0.5, y: 0.5 }) });

/** Detalle dentro de una neurona según su radio en pantalla (D4). */
export const INSIDE = Object.freeze({ value: 12, curve: 24, detail: 40, map: 20, maxRadius: 110 });

/** Flujo de la señal (D10): marcas a la vez y segundos para cruzar un tramo. */
export const FLOW = Object.freeze({ marks: 150, crossing: 0.6 });

/** Pastilla (D8): píxeles de arrastre por cada 0,01 de peso. */
export const PILL = Object.freeze({ pxPerStep: 4, step: 0.01, bigStep: 0.1 });

/** Qué muestra adentro una neurona de radio `r` (D4): 'fill', 'value', 'curve' o 'detail'. */
export function insideLevel(r) {
  if (r >= INSIDE.detail) return 'detail';
  if (r >= INSIDE.curve) return 'curve';
  if (r >= INSIDE.value) return 'value';
  return 'fill';
}

/**
 * Cuántas marcas de flujo lleva cada conexión (D10): como mucho FLOW.marks en total, repartidas según
 * |producto|; ninguna donde no pasa señal. `products` es una lista plana. Puro, para las pruebas.
 */
export function flowCounts(products, total = FLOW.marks) {
  let sum = 0;
  for (const p of products) sum += Math.abs(p);
  if (sum === 0) return products.map(() => 0);
  const counts = products.map((p) => Math.floor((total * Math.abs(p)) / sum));
  let left = total - counts.reduce((x, y) => x + y, 0);
  // Las que tienen señal pero no llegaron a una marca reciben una, de la que más pasa a la que menos,
  // mientras alcance.
  const rest = products.map((p, k) => ({ k, a: Math.abs(p) })).filter((x) => x.a > 0 && counts[x.k] === 0).sort((x, y) => (y.a - x.a) || (x.k - y.k));
  for (const x of rest) { if (left <= 0) break; counts[x.k] = 1; left -= 1; }
  return counts;
}

/** Mismo blanco: dos elecciones (neurona o conexión) iguales. */
export const sameTarget = (a, b) => Boolean(a && b) && a.layer === b.layer && a.neuron === b.neuron && (a.input ?? null) === (b.input ?? null);

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
  blame: '--color-network-blame',
  bg: '--color-bg',
};

const FONT = 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif';

/**
 * @param {{container: HTMLElement, i18n: object, doc?: Document,
 *   onSelect?: (target:{layer:number, neuron:number, input?:number}|null) => void,
 *   onHover?: (target:{layer:number, neuron:number, input?:number}|null) => void,
 *   onViewChange?: () => void,
 *   onPill?: {change:(value:number, info:{gesture:string|null}) => void, end:() => void}}} spec
 */
export function createNetworkInspector({ container, i18n, doc = document, onSelect = () => {}, onHover = () => {}, onViewChange = () => {}, onPill = null }) {
  const win = doc.defaultView;
  const canvas = doc.createElement('canvas');
  canvas.className = 'inspector-canvas';
  canvas.setAttribute('aria-hidden', 'true'); // lo accesible es la capa de botones (overlay)
  const overlay = doc.createElement('div');
  overlay.className = 'inspector-overlay';
  container.append(canvas, overlay);
  const ctx = canvas.getContext('2d');
  const camera = createCamera(INSPECTOR_CAMERA);
  const fmt = (v) => formatValue(v, i18n.language);

  // Pastilla (D8): un deslizador de verdad en la capa de botones.
  const pill = doc.createElement('div');
  pill.className = 'inspector-pill';
  pill.setAttribute('role', 'slider');
  pill.setAttribute('tabindex', '0');
  pill.setAttribute('aria-orientation', 'vertical');
  pill.dataset.focus = 'keep';
  pill.hidden = true;
  overlay.append(pill);

  let colors = readColors();
  let viewport = { width: 0, height: 0 };
  let dpr = 1;
  let layout = null;
  let lastState = null;
  let hover = null; // { layer, neuron, input? } bajo el cursor
  let hoverPoint = null; // dónde está el cursor (px de la zona)
  let flowClock = 0; // segundos de flujo acumulados
  let flowLast = null;
  let pillInfo = null; // { target, value, min, max, name }

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
    // El tamaño en pantalla lo da el CSS (100 % de la zona): así un tamaño viejo nunca ensancha la zona.
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

  const hitAt = (offsetX, offsetY) => (layout ? hitTarget(layout, toLayout({ x: offsetX, y: offsetY }), camera.zoom, lastState?.selected ?? null) : null);
  const asTarget = (h) => (h ? (h.kind === 'link' ? { layer: h.layer, neuron: h.neuron, input: h.input } : { layer: h.layer, neuron: h.neuron }) : null);

  function setHover(h, point) {
    hoverPoint = point;
    if (sameTarget(h, hover) || (!h && !hover)) { if (h && lastState) render(lastState); return; }
    hover = h;
    canvas.style.cursor = h ? 'pointer' : '';
    onHover(h);
    if (lastState) render(lastState); // en el mismo cuadro (D6)
  }

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
        setHover(null, null);
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
    setHover(asTarget(hitAt(e.offsetX, e.offsetY)), { x: e.offsetX, y: e.offsetY });
  }
  function onPointerUp(e) {
    if (!drag || e.pointerId !== drag.id) return;
    const wasPan = drag.panning;
    drag = null;
    canvas.classList.remove('dragging');
    if (wasPan || !layout) return; // arrastrar mueve la vista y no suelta lo elegido
    const h = asTarget(hitAt(e.offsetX, e.offsetY));
    const selected = lastState?.selected ?? null;
    // Otro clic en lo mismo, o un clic en un lugar vacío, sueltan lo elegido (D5).
    onSelect(h && !sameTarget(h, selected) ? h : null);
  }
  function onPointerLeave() { if (!drag) setHover(null, null); }
  function onOverlayKey(e) {
    if (e.key !== 'Escape' || !lastState?.selected) return;
    e.preventDefault();
    e.stopPropagation();
    onSelect(null);
  }
  canvas.addEventListener('wheel', onWheel, { passive: false });
  canvas.addEventListener('pointerdown', onPointerDown);
  canvas.addEventListener('pointermove', onPointerMove);
  canvas.addEventListener('pointerup', onPointerUp);
  canvas.addEventListener('pointercancel', onPointerUp);
  canvas.addEventListener('pointerleave', onPointerLeave);
  overlay.addEventListener('keydown', onOverlayKey);

  // --- Pastilla: arrastre vertical y flechas -------------------------------------------------------
  let pillDrag = null;
  const clampPill = (v) => {
    if (!pillInfo) return v;
    const r = Math.round(v / PILL.step) * PILL.step;
    return Math.max(pillInfo.min, Math.min(pillInfo.max, Number(r.toFixed(2))));
  };
  pill.addEventListener('pointerdown', (e) => {
    if (e.button !== 0 || !pillInfo || !onPill) return;
    e.preventDefault();
    e.stopPropagation();
    pillDrag = { id: e.pointerId, y: e.clientY, start: pillInfo.value, key: `pill:${pillInfo.target.layer}:${pillInfo.target.neuron}:${pillInfo.target.input}:${e.timeStamp}` };
    try { pill.setPointerCapture(e.pointerId); } catch { /* sigue sin capturar */ }
    pill.focus({ preventScroll: true });
    pill.classList.add('dragging');
  });
  pill.addEventListener('pointermove', (e) => {
    if (!pillDrag || e.pointerId !== pillDrag.id) return;
    const steps = (pillDrag.y - e.clientY) / PILL.pxPerStep; // hacia arriba, sube
    const v = clampPill(pillDrag.start + steps * PILL.step);
    if (v !== pillInfo.value) { pillInfo.value = v; onPill.change(v, { gesture: pillDrag.key }); }
  });
  const endPill = (e) => {
    if (!pillDrag || e.pointerId !== pillDrag.id) return;
    pillDrag = null;
    pill.classList.remove('dragging');
    onPill?.end();
  };
  pill.addEventListener('pointerup', endPill);
  pill.addEventListener('pointercancel', endPill);
  pill.addEventListener('keydown', (e) => {
    if (!pillInfo || !onPill) return;
    const dir = e.key === 'ArrowUp' || e.key === 'ArrowRight' ? 1 : e.key === 'ArrowDown' || e.key === 'ArrowLeft' ? -1 : 0;
    if (dir === 0) return;
    e.preventDefault();
    e.stopPropagation();
    const v = clampPill(pillInfo.value + dir * (e.shiftKey ? PILL.bigStep : PILL.step));
    if (v === pillInfo.value) return;
    pillInfo.value = v;
    onPill.change(v, { gesture: null });
    onPill.end();
  });

  // --- Dibujo --------------------------------------------------------------------------------------

  /** Trazos agrupados por aspecto (color, brillo, grosor y trazo) para pocos cambios de estilo. */
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
  function addSeg(groups, look, a, b) {
    // Brillo de a 0,04 y grosor de a 0,25 px: se ve continuo y agrupa los trazos.
    const alpha = Math.round(look.alpha * 25) / 25;
    const width = Math.round(look.width * 4) / 4;
    const key = `${look.color}|${alpha}|${width}|${look.dash.join()}`;
    let g = groups.get(key);
    if (!g) { g = { color: look.color, alpha, width, dash: look.dash, segs: [] }; groups.set(key, g); }
    g.segs.push(a.x, a.y, b.x, b.y);
  }

  /** Banda de una capa resumida: un solo trapecio tenue entre las dos columnas. */
  function drawBand(from, to) {
    const a0 = from[0];
    const a1 = from[from.length - 1];
    const b0 = to[0];
    const b1 = to[to.length - 1];
    ctx.beginPath();
    ctx.moveTo(a0.x, a0.y); ctx.lineTo(b0.x, b0.y); ctx.lineTo(b1.x, b1.y); ctx.lineTo(a1.x, a1.y);
    ctx.closePath();
    ctx.globalAlpha = 0.14;
    ctx.fillStyle = colors.node;
    ctx.fill();
    ctx.globalAlpha = 1;
  }

  function diamond(p, r, color, outline = colors.bg) {
    ctx.beginPath();
    ctx.moveTo(p.x, p.y - r); ctx.lineTo(p.x + r, p.y); ctx.lineTo(p.x, p.y + r); ctx.lineTo(p.x - r, p.y);
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();
    ctx.strokeStyle = outline;
    ctx.lineWidth = 1.2;
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
   * @param {{layer:number, neuron:number, input?:number}|null} [state.selected] neurona o conexión elegida
   * @param {boolean[]} [state.collapsed] capas resumidas
   * @param {Array<Array<Set<number>>>|null} [state.top] filtro de conexiones: top[l][j] = entradas destacadas
   * @param {'all'|number} [state.filter] el mismo filtro, para seguir el camino hacia atrás (D9)
   * @param {{changedWeights:Set<string>, changedBiases:Set<string>}} [state.marks] lo cambiado ('l:j:i', 'l:j')
   * @param {boolean[]} [state.manual] entradas a mano
   * @param {{items:{layer:number, neuron:number, op:string, p:number}[]}|null} [state.animation]
   * @param {boolean} [state.visible] falso: no se dibuja (la vista es la tabla)
   * @param {'run'|'frozen'|'off'} [state.flow] flujo de la señal (D10): corre, quieto o no se ve
   * @param {{min:number, max:number}|null} [state.pill] la conexión elegida se puede cambiar en el lugar (D8)
   * @param {string|null} [state.banner] rótulo sobre la red (por ejemplo, "Original, sin tus cambios")
   * @param {(layer:number, neuron:number) => (HTMLCanvasElement|null)} [state.maps] mapa de cada neurona (D12)
   * @param {{input:(i:number)=>string, output:(j:number)=>string, neuron?:(t:{layer:number, neuron:number})=>string}} [state.labels]
   *   nombres de las entradas y salidas (pestana-laboratorio: x, y y "Color"); sin ellos, los del auto
   * @param {object} [state.learning] la vuelta de un aprendizaje (inspector-de-red, "La vuelta en la red")
   */
  function render(state) {
    lastState = state;
    // El tamaño lo lleva el ResizeObserver: leerlo en cada cuadro obligaría a recalcular la página.
    if (state.visible === false) { pill.hidden = true; return layout; }
    if (viewport.width <= 1) resize();
    const { sizes, trace } = state;
    const cursor = state.cursor ?? null;
    const collapsed = state.collapsed ?? [];
    layout = layoutInspector({ sizes, width: viewport.width, height: viewport.height, collapsed, headerRows: state.headerRows ?? 1 });
    camera.update(target(), viewport);
    const z = camera.zoom;
    const r = Math.min(INSIDE.maxRadius, layout.radius * z);
    const P = layout.columns.map((col) => col.nodes.map(toScreen));
    const C = sizes.length;
    const selected = state.selected ?? null;
    if (hover && !trace.layers[hover.layer]?.neurons[hover.neuron]) hover = null;
    const focus = hover ?? selected; // vista previa: como si estuviera elegida, sin perder lo elegido
    const current = cursor && !cursor.done ? cursor.next : null;
    const top = state.top ?? null;
    const marks = state.marks ?? { changedWeights: new Set(), changedBiases: new Set() };
    const animated = new Map();
    for (const it of state.animation?.items ?? []) animated.set(`${it.layer}:${it.neuron}`, it);
    const computedProducts = (l, j) => !cursor || cursor.opsDone(l, j) > 0;

    // Relacionado con lo que se mira (D2, D5 y D9).
    const direct = new Set(); // 'l:j:i' de las conexiones directas de lo enfocado
    const relatedNeurons = new Set();
    let back = null;
    if (focus && focus.input !== undefined) {
      direct.add(`${focus.layer}:${focus.neuron}:${focus.input}`);
      relatedNeurons.add(`${focus.layer}:${focus.neuron}`).add(`${focus.layer - 1}:${focus.input}`);
    } else if (focus) {
      relatedNeurons.add(`${focus.layer}:${focus.neuron}`);
      if (focus.layer > 0) {
        for (let i = 0; i < sizes[focus.layer - 1]; i++) direct.add(`${focus.layer}:${focus.neuron}:${i}`);
        back = upstream(trace, focus, state.filter ?? 'all');
      }
      if (focus.layer < C - 1) for (let j = 0; j < sizes[focus.layer + 1]; j++) direct.add(`${focus.layer + 1}:${j}:${focus.neuron}`);
    }
    if (current) for (let i = 0; i < sizes[current.layer - 1]; i++) direct.add(`${current.layer}:${current.neuron}:${i}`);
    const anyFocus = direct.size > 0;

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, viewport.width, viewport.height);

    // Conexiones
    const maxWeight = maxWeightOfTrace(trace);
    let maxProduct = 0;
    for (let l = 1; l < C; l++) trace.layers[l].neurons.forEach((n, j) => { if (computedProducts(l, j)) for (const p of n.products) { const a = Math.abs(p); if (a > maxProduct) maxProduct = a; } });
    const groups = new Map();
    const zeroSegs = [];
    const offSegs = [];
    const changedAt = [];
    const flowLinks = []; // { a, b, product, faded }
    const zoomWidth = Math.min(2, Math.sqrt(z));
    let selectedLink = null;
    for (let l = 1; l < C; l++) {
      const fromCol = layout.columns[l - 1];
      const toCol = layout.columns[l];
      const banded = fromCol.collapsed || toCol.collapsed;
      if (banded) drawBand(P[l - 1], P[l]);
      const neurons = trace.layers[l].neurons;
      const density = sizes[l] * sizes[l - 1];
      for (let j = 0; j < neurons.length; j++) {
        const n = neurons[j];
        const shown = computedProducts(l, j);
        for (let i = 0; i < n.weights.length; i++) {
          const key = `${l}:${j}:${i}`;
          const isDirect = direct.has(key);
          const importance = back?.links.get(key);
          const related = isDirect || importance !== undefined;
          if (banded && !related) continue; // en una banda solo se ven las de lo enfocado
          const a = P[l - 1][i];
          const b = P[l][j];
          if (selected && selected.input === i && selected.layer === l && selected.neuron === j) selectedLink = { a, b, n, i };
          const offConn = n.offConnections?.[i] || trace.layers[l - 1].neurons[i].off;
          if (offConn) { offSegs.push(a.x, a.y, b.x, b.y); continue; }
          const filtered = top && top[l] && !top[l][j].has(i);
          const role = related ? 'related' : anyFocus ? 'unrelated' : filtered ? 'filtered' : 'normal';
          const look = linkLook({
            weight: n.weights[i], maxWeight, product: shown ? n.products[i] : null, maxProduct,
            role: filtered && !isDirect && role !== 'unrelated' ? 'filtered' : role, density, importance: isDirect ? 1 : importance,
          });
          if (look.sign === 'zero') { zeroSegs.push(a.x, a.y, b.x, b.y); continue; }
          addSeg(groups, { color: colors[look.sign], alpha: look.alpha, width: look.width * zoomWidth, dash: look.dashed ? [5, 3.5] : [] }, a, b);
          if (marks.changedWeights.has(key)) changedAt.push({ x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 });
          if (!banded && shown && n.products[i] !== 0 && !filtered) flowLinks.push({ a, b, product: n.products[i], faded: anyFocus && !related });
        }
      }
    }
    // La conexión elegida lleva un halo del color de la elección, debajo de su trazo.
    if (selectedLink) {
      ctx.strokeStyle = colors.selected;
      ctx.globalAlpha = 0.45;
      ctx.lineWidth = 10 * zoomWidth;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(selectedLink.a.x, selectedLink.a.y);
      ctx.lineTo(selectedLink.b.x, selectedLink.b.y);
      ctx.stroke();
      ctx.lineCap = 'butt';
      ctx.globalAlpha = 1;
    }
    strokeGroups(groups);
    if (zeroSegs.length > 0) strokeGroups(new Map([['zero', { color: colors.node, alpha: 0.5, width: 1, dash: [], segs: zeroSegs }]]));
    if (offSegs.length > 0) strokeGroups(new Map([['off', { color: colors.node, alpha: 0.4, width: 1, dash: [1.5, 3], segs: offSegs }]]));
    for (const p of changedAt) diamond(p, 5, colors.text); // cambiado a mano: rombo del color del texto (D11)

    drawFlow(state.flow ?? 'off', flowLinks);

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
        const st = { computed: computed || (anim && anim.op === 'activation'), biasShown: c > 0 && (ops >= 3 || (anim && anim.op === 'bias')) };
        if (col.collapsed) drawSquare(p, col.side * z, level, bias, n, st, maxWeight);
        else {
          const map = state.maps && c > 0 && c < C - 1 && r >= INSIDE.map ? state.maps(c, i) : null;
          drawNode(p, r, level, bias, n, st, anim, maxWeight, map);
          if (computed || c === 0) drawInside(p, r, n, c, level, Boolean(map));
        }
        if (n.off) {
          const rr = col.collapsed ? (col.side * z) / 2 : r;
          cross(p, rr * 0.8, colors.text, 1.5);
        }
        if (c === 0 && state.manual?.[i]) {
          // Entrada a mano: una marca cuadrada del color del texto, a la izquierda (D11).
          const rr = col.collapsed ? (col.side * z) / 2 + 2 : r + 3;
          ctx.fillStyle = colors.text;
          ctx.fillRect(p.x - rr - 7, p.y - 3.5, 6, 7);
        }
        if (c > 0 && marks.changedBiases.has(`${c}:${i}`)) diamond({ x: p.x + r * 0.75, y: p.y - r * 0.75 }, 4.5, colors.text);
        if (anim && anim.op === 'sum') {
          // La suma que se va juntando: los productos ya sumados, en orden (los reales).
          const k = Math.round(anim.p * n.products.length);
          let partial = 0;
          for (let q = 0; q < k; q++) partial += n.products[q];
          labelBox(fmt(partial), { x: p.x, y: p.y - r - 12 });
        }
      }
    }
    // Anillos: elegida, extremos de la conexión elegida, en curso y bajo el cursor.
    const ring = (t, color, dash, extra, width = 2.5) => {
      const col = layout.columns[t.layer];
      const p = P[t.layer]?.[t.neuron];
      if (!p || !col) return;
      ctx.strokeStyle = color;
      ctx.lineWidth = width;
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
    if (hover && hover.input === undefined && !sameTarget(hover, selected)) ring(hover, colors.text, [], 3, 1.5);
    if (hover && hover.input !== undefined) { ring({ layer: hover.layer, neuron: hover.neuron }, colors.text, [], 3, 1.2); ring({ layer: hover.layer - 1, neuron: hover.input }, colors.text, [], 3, 1.2); }
    if (selected && selected.input === undefined) ring(selected, colors.selected, [], 3.5);
    if (selected && selected.input !== undefined) {
      ring({ layer: selected.layer, neuron: selected.neuron }, colors.selected, [], 3.5, 1.8);
      ring({ layer: selected.layer - 1, neuron: selected.input }, colors.selected, [], 3.5, 1.8);
    }

    // Rótulos de entradas y salidas, de tamaño fijo en pantalla.
    ctx.font = `12px ${FONT}`;
    ctx.fillStyle = colors.label;
    ctx.textBaseline = 'middle';
    ctx.textAlign = 'right';
    const labels = state.labels ?? null;
    for (const lab of layout.inputLabels) {
      const p = P[0][lab.index];
      ctx.fillText(labels ? labels.input(lab.index) : inputName(lab.index, sizes[0]), p.x - r - 8, p.y);
    }
    ctx.textAlign = 'left';
    for (const lab of layout.outputLabels) {
      const p = P[C - 1][lab.index];
      ctx.fillText(labels ? labels.output(lab.index) : i18n.t(`network.output.${lab.key}`), p.x + r + 8, p.y);
    }
    if (state.learning) drawLearning(state.learning, P, r, C, layout, z);
    drawLinkNumbers(selected, trace, P, layout, Boolean(state.pill));
    placePill(state, P, trace);
    if (state.banner) bannerBox(state.banner);
    drawReadout(state, P, r, cursor, labels);
    return layout;
  }

  /** Lo que se ve adentro de una neurona según su radio (D4). */
  function drawInside(p, r, n, layer, level, withMap) {
    const what = insideLevel(r);
    if (what === 'fill') return;
    const dark = !withMap && level > 0.55;
    const ink = dark ? colors.bg : colors.text;
    const isInput = layer === 0;
    const valueText = fmt(n.output);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    if (withMap) {
      // Sobre un mapa, el valor va sobre una pastilla del fondo para leerse.
      ctx.font = `${Math.round(Math.max(10, Math.min(15, r * 0.34)))}px ${FONT}`;
      const w = ctx.measureText(valueText).width + 6;
      ctx.globalAlpha = 0.78;
      ctx.fillStyle = colors.bg;
      ctx.fillRect(p.x - w / 2, p.y - 8, w, 16);
      ctx.globalAlpha = 1;
      ctx.fillStyle = colors.text;
      ctx.fillText(valueText, p.x, p.y + 0.5);
      return;
    }
    if (what === 'value' || isInput) {
      ctx.font = `${Math.round(Math.max(9, Math.min(16, r * 0.62)))}px ${FONT}`;
      ctx.fillStyle = ink;
      ctx.fillText(valueText, p.x, p.y + 0.5);
      return;
    }
    const detail = what === 'detail';
    const valueY = p.y - r * (detail ? 0.46 : 0.26);
    ctx.font = `600 ${Math.round(Math.max(10, Math.min(16, r * (detail ? 0.36 : 0.42))))}px ${FONT}`;
    ctx.fillStyle = ink;
    ctx.fillText(valueText, p.x, valueY);
    // La curva de su activación con un punto donde cae la suma.
    const w = r * (detail ? 1.1 : 1.2);
    const h = r * (detail ? 0.3 : 0.42);
    const cy = p.y + r * (detail ? -0.06 : 0.3);
    drawActivation(n, p.x - w / 2, cy - h / 2, w, h, ink);
    if (detail) {
      ctx.font = `${Math.round(Math.max(10, Math.min(12, r * 0.26)))}px ${FONT}`;
      ctx.fillStyle = ink;
      ctx.fillText(i18n.t('inspect.inside.sum', { value: fmt(n.sum) }), p.x, p.y + r * 0.27);
      ctx.fillText(i18n.t('inspect.inside.bias', { value: fmt(n.bias) }), p.x, p.y + r * 0.53);
    }
  }

  const ACT_RANGE = 3;
  function drawActivation(n, x, y, w, h, ink) {
    const fn = activationFunction(n.activation);
    const yMin = n.activation === 'tanh' ? -1 : 0;
    const yMax = n.activation === 'relu' ? ACT_RANGE : 1;
    const toY = (v) => y + h - ((Math.max(yMin, Math.min(yMax, v)) - yMin) / (yMax - yMin)) * h;
    ctx.strokeStyle = ink;
    ctx.globalAlpha = 0.7;
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    const N = 24;
    for (let k = 0; k <= N; k++) {
      const v = -ACT_RANGE + (2 * ACT_RANGE * k) / N;
      const px = x + (k / N) * w;
      if (k === 0) ctx.moveTo(px, toY(fn(v))); else ctx.lineTo(px, toY(fn(v)));
    }
    ctx.stroke();
    ctx.globalAlpha = 1;
    const tx = x + ((Math.max(-ACT_RANGE, Math.min(ACT_RANGE, n.total)) + ACT_RANGE) / (2 * ACT_RANGE)) * w;
    ctx.fillStyle = colors.current;
    ctx.beginPath();
    ctx.arc(tx, toY(n.output), Math.max(2, h * 0.16), 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = colors.bg;
    ctx.lineWidth = 1;
    ctx.stroke();
  }

  /** Flujo de la señal (D10): marcas que viajan por las conexiones con señal, del color del signo. */
  function drawFlow(mode, links) {
    const now = (win.performance ?? performance).now() / 1000;
    if (mode === 'run') { if (flowLast !== null) flowClock += Math.min(0.1, now - flowLast); flowLast = now; } else flowLast = null;
    if (mode === 'off' || links.length === 0) return;
    const counts = flowCounts(links.map((x) => x.product));
    const phase = flowClock / FLOW.crossing;
    for (let k = 0; k < links.length; k++) {
      const count = counts[k];
      if (count === 0) continue;
      const { a, b, product, faded } = links[k];
      const seed = ((k * 0.6180339887) % 1);
      ctx.fillStyle = product < 0 ? colors.negative : colors.positive;
      ctx.globalAlpha = faded ? 0.2 : 0.95;
      for (let q = 0; q < count; q++) {
        const t = (phase + q / count + seed) % 1;
        const x = a.x + (b.x - a.x) * t;
        const y = a.y + (b.y - a.y) * t;
        ctx.beginPath();
        ctx.arc(x, y, 2.4, 0, Math.PI * 2);
        ctx.fill();
        if (product < 0) { ctx.strokeStyle = colors.bg; ctx.lineWidth = 0.8; ctx.stroke(); }
      }
    }
    ctx.globalAlpha = 1;
  }

  /** Números sobre las conexiones de lo elegido (D?): los pesos, sin encimarse; los que no entran se leen con el cursor. */
  function drawLinkNumbers(selected, trace, P, lay, hasPill) {
    if (!selected) return;
    const items = [];
    if (selected.input !== undefined) {
      if (hasPill) return; // la pastilla ya muestra su peso
      const n = trace.layers[selected.layer]?.neurons[selected.neuron];
      if (n) items.push({ a: P[selected.layer - 1][selected.input], b: P[selected.layer][selected.neuron], w: n.weights[selected.input] });
    } else if (selected.layer > 0) {
      if (lay.columns[selected.layer].collapsed || lay.columns[selected.layer - 1].collapsed) return;
      const n = trace.layers[selected.layer].neurons[selected.neuron];
      n.weights.forEach((w, i) => items.push({ a: P[selected.layer - 1][i], b: P[selected.layer][selected.neuron], w }));
    } else if (selected.layer === 0 && lay.columns.length > 1 && !lay.columns[0].collapsed && !lay.columns[1].collapsed) {
      trace.layers[1].neurons.forEach((n, j) => items.push({ a: P[0][selected.neuron], b: P[1][j], w: n.weights[selected.neuron], out: true }));
    }
    ctx.font = `12px ${FONT}`;
    const placed = [];
    items.sort((x, y) => Math.abs(y.w) - Math.abs(x.w));
    for (const it of items) {
      const t = it.out ? 0.62 : 0.38; // donde las líneas están más separadas
      const x = it.a.x + (it.b.x - it.a.x) * t;
      const y = it.a.y + (it.b.y - it.a.y) * t;
      const text = fmt(it.w);
      const w = ctx.measureText(text).width + 8;
      const box = { x: x - w / 2, y: y - 9, w, h: 18 };
      if (box.x < 0 || box.y < 0 || box.x + w > viewport.width || box.y + 18 > viewport.height) continue;
      if (placed.some((q) => box.x < q.x + q.w + 2 && q.x < box.x + box.w + 2 && box.y < q.y + q.h + 1 && q.y < box.y + box.h + 1)) continue;
      placed.push(box);
      ctx.globalAlpha = 0.9;
      ctx.fillStyle = colors.bg;
      ctx.fillRect(box.x, box.y, box.w, box.h);
      ctx.globalAlpha = 1;
      ctx.strokeStyle = it.w < 0 ? colors.negative : colors.positive;
      ctx.lineWidth = 1;
      ctx.setLineDash(it.w < 0 ? [3, 2] : []);
      ctx.strokeRect(box.x + 0.5, box.y + 0.5, box.w - 1, box.h - 1);
      ctx.setLineDash([]);
      ctx.fillStyle = colors.text;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(text, x, y + 0.5);
    }
    ctx.textAlign = 'left';
  }

  /** Pastilla sobre la conexión elegida (D8), en su punto medio. */
  function placePill(state, P, trace) {
    const sel = state.selected;
    const ok = sel && sel.input !== undefined && state.pill && onPill
      && !layout.columns[sel.layer]?.collapsed && !layout.columns[sel.layer - 1]?.collapsed;
    if (!ok) { pill.hidden = true; pillInfo = null; return; }
    const n = trace.layers[sel.layer].neurons[sel.neuron];
    const a = P[sel.layer - 1][sel.input];
    const b = P[sel.layer][sel.neuron];
    const value = n.weights[sel.input];
    if (!pillDrag) pillInfo = { target: sel, value, min: state.pill.min, max: state.pill.max };
    else pillInfo.target = sel;
    const text = fmt(value);
    if (pill.textContent !== text) pill.textContent = text;
    const name = state.pill.name ?? '';
    if (pill.getAttribute('aria-label') !== name) pill.setAttribute('aria-label', name);
    pill.setAttribute('aria-valuemin', String(state.pill.min));
    pill.setAttribute('aria-valuemax', String(state.pill.max));
    pill.setAttribute('aria-valuenow', String(value));
    pill.setAttribute('aria-valuetext', text);
    if (state.pill.help && pill.dataset.help !== state.pill.help) pill.dataset.help = state.pill.help;
    pill.dataset.sign = value < 0 ? 'negative' : 'positive';
    const mx = (a.x + b.x) / 2;
    const my = (a.y + b.y) / 2;
    const inside = mx > -20 && mx < viewport.width + 20 && my > -20 && my < viewport.height + 20;
    pill.hidden = !inside;
    pill.style.transform = `translate(${Math.round(mx)}px, ${Math.round(my)}px) translate(-50%, -50%)`;
  }

  /** Rótulo sobre la red, arriba al centro. */
  function bannerBox(text) {
    ctx.font = `600 13px ${FONT}`;
    const w = ctx.measureText(text).width + 16;
    const x = (viewport.width - w) / 2;
    const y = viewport.height - 30;
    ctx.globalAlpha = 0.92;
    ctx.fillStyle = colors.bg;
    ctx.fillRect(x, y, w, 22);
    ctx.globalAlpha = 1;
    ctx.strokeStyle = colors.selected;
    ctx.lineWidth = 1;
    ctx.strokeRect(x + 0.5, y + 0.5, w - 1, 21);
    ctx.fillStyle = colors.text;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, viewport.width / 2, y + 11.5);
    ctx.textAlign = 'left';
  }

  /** Texto de la lectura de lo que está bajo el cursor (D6). */
  function readoutText(t, trace, cursor, labels, learning, sizes) {
    const nameOf = (x) => (labels?.neuron ? labels.neuron(x) : neuronName(x, sizes));
    if (t.input !== undefined) {
      const n = trace.layers[t.layer].neurons[t.neuron];
      const shown = !cursor || cursor.opsDone(t.layer, t.neuron) > 0;
      return i18n.t('inspect.readout.link', {
        from: nameOf({ layer: t.layer - 1, neuron: t.input }), to: nameOf({ layer: t.layer, neuron: t.neuron }),
        weight: fmt(n.weights[t.input]), product: shown ? fmt(n.products[t.input]) : '–',
      });
    }
    const n = trace.layers[t.layer].neurons[t.neuron];
    const done = t.layer === 0 || !cursor || cursor.opsDone(t.layer, t.neuron) === 4;
    const blame = learning?.blame(t.layer, t.neuron);
    const extra = blame === null || blame === undefined ? '' : ` · ${i18n.t('lab.term.blame')} ${fmt(blame)}`;
    if (t.layer === 0) return i18n.t('inspect.readout.input', { name: nameOf(t), value: fmt(n.output) }) + extra;
    return i18n.t('inspect.readout.neuron', {
      name: nameOf(t), value: done ? fmt(n.output) : '–', sum: done ? fmt(n.sum) : '–', bias: fmt(n.bias),
    }) + extra;
  }

  /** La lectura junto al cursor, ubicada para no tapar lo que describe (D6). */
  function drawReadout(state, P, r, cursor, labels) {
    if (!hover || !hoverPoint) return;
    const text = readoutText(hover, state.trace, cursor, labels, state.learning, state.sizes);
    ctx.font = `12px ${FONT}`;
    const w = ctx.measureText(text).width + 12;
    const h = 22;
    let candidates;
    let avoid;
    if (hover.input === undefined) {
      const p = P[hover.layer][hover.neuron];
      const col = layout.columns[hover.layer];
      const rr = (col.collapsed ? (col.side * camera.zoom) / 2 : r) + 8;
      candidates = [{ x: p.x + rr, y: p.y - h / 2 }, { x: p.x - rr - w, y: p.y - h / 2 }, { x: p.x - w / 2, y: p.y + rr }, { x: p.x - w / 2, y: p.y - rr - h }];
      avoid = (box) => {
        const cx = Math.max(box.x, Math.min(p.x, box.x + box.w));
        const cy = Math.max(box.y, Math.min(p.y, box.y + box.h));
        return Math.hypot(cx - p.x, cy - p.y) < rr - 4;
      };
    } else {
      const a = P[hover.layer - 1][hover.input];
      const b = P[hover.layer][hover.neuron];
      const q = hoverPoint;
      const g = 14;
      candidates = [{ x: q.x + g, y: q.y + g }, { x: q.x + g, y: q.y - g - h }, { x: q.x - g - w, y: q.y + g }, { x: q.x - g - w, y: q.y - g - h }];
      avoid = (box) => {
        for (let k = 0; k <= 24; k++) {
          const x = a.x + ((b.x - a.x) * k) / 24;
          const y = a.y + ((b.y - a.y) * k) / 24;
          if (x > box.x - 3 && x < box.x + box.w + 3 && y > box.y - 3 && y < box.y + box.h + 3) return true;
        }
        return false;
      };
    }
    const fits = (box) => box.x >= 2 && box.y >= 2 && box.x + box.w <= viewport.width - 2 && box.y + box.h <= viewport.height - 2;
    let best = null;
    for (const c of candidates) {
      const box = { ...c, w, h };
      if (fits(box) && !avoid(box)) { best = box; break; }
    }
    if (!best) {
      const c = candidates[0];
      best = { x: Math.max(2, Math.min(viewport.width - w - 2, c.x)), y: Math.max(2, Math.min(viewport.height - h - 2, c.y)), w, h };
    }
    ctx.globalAlpha = 0.95;
    ctx.fillStyle = colors.bg;
    ctx.fillRect(best.x, best.y, w, h);
    ctx.globalAlpha = 1;
    ctx.strokeStyle = colors.node;
    ctx.lineWidth = 1;
    ctx.strokeRect(best.x + 0.5, best.y + 0.5, w - 1, h - 1);
    ctx.fillStyle = colors.text;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, best.x + 6, best.y + h / 2 + 0.5);
  }

  /**
   * La vuelta (pestana-laboratorio D10), como capas sobre el diagrama: flechas en los pesos que
   * cambian, un anillo con la culpa de cada neurona (grosor según el tamaño, trazo según el signo),
   * la respuesta correcta junto a cada salida y rombos que viajan hacia atrás.
   */
  function drawLearning(learning, P, r, C, lay, z) {
    for (let l = 1; l < C; l++) {
      if (lay.columns[l - 1].collapsed || lay.columns[l].collapsed) continue;
      for (let j = 0; j < P[l].length; j++) {
        for (let i = 0; i < P[l - 1].length; i++) {
          const d = learning.change(l, j, i);
          if (d === null || d === undefined || Math.abs(d) < 1e-4) continue;
          const a = P[l - 1][i];
          const b = P[l][j];
          const m = { x: a.x + (b.x - a.x) * 0.62, y: a.y + (b.y - a.y) * 0.62 };
          const size = 3 + Math.min(4, Math.sqrt(Math.abs(d)) * 14) * Math.min(1.6, Math.sqrt(z));
          arrow(m, size, d > 0);
        }
      }
    }
    for (let l = 1; l < C; l++) {
      const col = lay.columns[l];
      for (let j = 0; j < P[l].length; j++) {
        const b = learning.blame(l, j);
        if (b === null || b === undefined) continue;
        const p = P[l][j];
        const w = 1.2 + Math.min(5, Math.abs(b) * 8);
        ctx.strokeStyle = colors.blame;
        ctx.lineWidth = w;
        ctx.setLineDash(b < 0 ? [2, 3] : []);
        ctx.beginPath();
        if (col.collapsed) {
          const h = (col.side * z) / 2 + 3 + w / 2;
          ctx.rect(p.x - h, p.y - h, 2 * h, 2 * h);
        } else {
          ctx.arc(p.x, p.y, r + 3 + w / 2, 0, Math.PI * 2);
        }
        ctx.stroke();
        ctx.setLineDash([]);
      }
    }
    for (const e of learning.errors ?? []) {
      const p = P[C - 1][e.neuron];
      if (!p) continue;
      labelBox(i18n.t('lab.diagram.target', { target: Number.isInteger(e.target) ? String(e.target) : fmt(e.target), error: fmt(e.output - e.target) }), { x: p.x - r - 70, y: p.y - r - 12 });
    }
    for (const f of learning.flows ?? []) {
      const a = P[f.from.layer]?.[f.from.neuron];
      const b = P[f.to.layer]?.[f.to.neuron];
      if (!a || !b) continue;
      const at = { x: a.x + (b.x - a.x) * f.p, y: a.y + (b.y - a.y) * f.p };
      const size = 2.5 + Math.min(5, Math.sqrt(Math.abs(f.value)) * 6);
      ctx.globalAlpha = 0.95;
      diamond(at, size, colors.blame);
      if (f.value < 0) { ctx.strokeStyle = colors.text; ctx.lineWidth = 1; ctx.stroke(); }
      ctx.globalAlpha = 1;
    }
  }

  /** Flecha chica: hacia arriba si el peso sube, hacia abajo si baja. */
  function arrow(p, size, up) {
    ctx.beginPath();
    if (up) { ctx.moveTo(p.x, p.y - size); ctx.lineTo(p.x + size * 0.8, p.y + size * 0.6); ctx.lineTo(p.x - size * 0.8, p.y + size * 0.6); }
    else { ctx.moveTo(p.x, p.y + size); ctx.lineTo(p.x + size * 0.8, p.y - size * 0.6); ctx.lineTo(p.x - size * 0.8, p.y - size * 0.6); }
    ctx.closePath();
    ctx.fillStyle = colors.blame;
    ctx.fill();
    ctx.strokeStyle = colors.bg;
    ctx.lineWidth = 1;
    ctx.stroke();
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

  /** Contorno del sesgo: color y trazo del signo, grosor relativo al mayor peso de la red. */
  function biasStroke(bias, maxWeight, scale = 1) {
    if (bias === 0) return { color: colors.node, width: 1, dash: [] };
    const rel = maxWeight > 0 ? Math.min(1, Math.abs(bias) / maxWeight) : 1;
    return { color: bias < 0 ? colors.negative : colors.positive, width: (1.2 + 2.6 * rel) * scale, dash: bias < 0 ? [3, 2.2] : [] };
  }

  /** Nodo: relleno según la actividad (o su mapa); contorno según el sesgo. Sin calcular, contorno punteado gris. */
  function drawNode(p, r, level, bias, n, { computed, biasShown }, anim, maxWeight, map) {
    ctx.globalAlpha = n.off ? 0.4 : 1;
    ctx.beginPath();
    ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
    ctx.fillStyle = colors.background;
    ctx.fill();
    if (map) {
      ctx.save();
      ctx.clip();
      ctx.imageSmoothingEnabled = true;
      ctx.drawImage(map, p.x - r, p.y - r, 2 * r, 2 * r);
      ctx.restore();
    } else if (level > 0) {
      ctx.globalAlpha = (n.off ? 0.4 : 1) * (0.15 + 0.85 * level);
      ctx.fillStyle = colors.active;
      if (anim && anim.op === 'activation') {
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
      const s = biasStroke(bias, maxWeight, anim && anim.op === 'bias' ? 1 + 1.5 * (1 - Math.abs(anim.p * 2 - 1)) : 1);
      ctx.strokeStyle = s.color;
      ctx.lineWidth = s.width;
      ctx.setLineDash(s.dash);
    }
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.globalAlpha = 1;
  }

  function drawSquare(p, side, level, bias, n, { computed }, maxWeight) {
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
      const s = biasStroke(bias, maxWeight);
      ctx.strokeStyle = s.color;
      ctx.setLineDash(s.dash.length ? [2, 1.5] : []);
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
    pill,
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
    get radius() { return layout ? Math.min(INSIDE.maxRadius, layout.radius * camera.zoom) : 0; },
    get viewport() { return { ...viewport }; },
    get zoomed() { return camera.zoom > INSPECTOR_CAMERA.minZoom + 1e-9 || !camera.following; },
    /** Lo que está bajo el cursor (vista previa), o null. */
    get hover() { return hover; },
    /** Simula el cursor en un punto de la zona (verificación desde la consola). */
    hoverAt(x, y) { setHover(asTarget(hitAt(x, y)), x === null ? null : { x, y }); },
    refreshColors() { colors = readColors(); },
    neuronName,
    dispose() {
      observer.disconnect();
      canvas.removeEventListener('wheel', onWheel);
      overlay.removeEventListener('keydown', onOverlayKey);
      canvas.remove();
      overlay.remove();
    },
  };
}

/** Operaciones de una neurona en orden (reexportadas para la vista). */
export { OPERATIONS, INSPECTOR_LAYOUT };

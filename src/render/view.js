// Vista del escenario en un canvas 2D (design.md D8): pista, carriles, tráfico, auto y rayos,
// con una cámara que sigue al auto, zoom con rueda y botones, paneo y restablecer (control y tecla V).
// Con una población (design.md D11) dibuja a todos los autos: los que quedaron fuera de carrera muy
// tenues y con contorno punteado, los que siguen en carrera como siluetas simples semitransparentes,
// la élite con una marca propia y, por último, el auto en foco con todos sus detalles y sus rayos.
// La cámara sigue al auto en foco y, cuando cambia, se desliza hasta el nuevo (camera.retarget).
// La calle recta se muestra vertical, con el sentido de avance hacia arriba (camera.orientationFor).
// Es la misma vista para todas las pestañas con escenario. Solo dibuja lo que cae en el encuadre.
//
// Los colores salen de las variables de styles/tokens.css. Los textos de los botones se
// declaran con data-i18n / data-help y los completa el sistema de idiomas de la interfaz.
import { carContour } from '../core/car.js';
import { CAR_LENGTH } from '../core/constants.js';
import { MAX_VEHICLE_LENGTH } from '../core/traffic.js';
import {
  createCamera, orientationFor, panStarts, retarget, advanceBlend, blendTarget, NO_BLEND, fitTrack,
} from './camera.js';
import { createSceneryPainter } from './scenery.js';
import { keyAllowed } from '../input/keyboard.js';
import { rangeMeters } from '../core/sensors.js';
import { DEFAULT_PALETTE, VEHICLE_SIZES } from './vehicles.js';
import { createVehicleCache } from './vehicle-cache.js';
import { legibleOn } from './contrast.js';

/** Contraste mínimo de la moto del tráfico contra el asfalto (WCAG 1.4.11, lo que no es texto). */
export const MOTORCYCLE_CONTRAST = 3;

/** Escena chica (pestana-inspeccionar D10): el auto en el centro y lo que alcanzan sus rayos, con este margen. */
export const SMALL_FIT = Object.freeze({ anchor: Object.freeze({ x: 0.5, y: 0.5 }), fill: 0.92 });

/** Acercamiento de la escena chica: el alcance de los sensores (más un auto) entra en el lado más corto. */
export function smallZoom(sensors, viewport) {
  const reach = rangeMeters(sensors) + CAR_LENGTH;
  return (SMALL_FIT.fill * Math.min(viewport.width, viewport.height)) / 2 / reach;
}

const COLOR_VARS = {
  background: '--color-bg',
  road: '--color-road',
  roadEdge: '--color-road-edge',
  laneLine: '--color-lane-line',
  car: '--color-car',
  carCrashed: '--color-car-crashed',
  traffic: '--color-traffic', // respaldo si falta un color de la paleta
  // Paleta del tráfico (vehiculos-ilustrados D8): el índice de pintura de cada vehículo elige uno.
  traffic1: '--color-traffic-1',
  traffic2: '--color-traffic-2',
  traffic3: '--color-traffic-3',
  traffic4: '--color-traffic-4',
  traffic5: '--color-traffic-5',
  sensor: '--color-sensor',
  sensorHit: '--color-sensor-hit',
  glass: '--color-car-glass',
  headlight: '--color-headlight',
  taillight: '--color-taillight',
  elite: '--color-elite',
  outline: '--color-bg',
  // Paisaje (circuitos-y-paisaje D9): colores apagados, distintos de los de autos, tráfico y sensores.
  grass: '--color-grass',
  sidewalk: '--color-sidewalk',
  tree: '--color-tree',
  treeDark: '--color-tree-dark',
  kerbA: '--color-kerb-a',
  kerbB: '--color-kerb-b',
  stand: '--color-stand',
  crosswalk: '--color-crosswalk',
  checkerA: '--color-crosswalk',
  checkerB: '--color-bg',
  // Carrera (pestana-competir D11): un color por casilla; el número es la identificación principal.
  competitor1: '--color-competitor-1',
  competitor2: '--color-competitor-2',
  competitor3: '--color-competitor-3',
  competitor4: '--color-competitor-4',
  competitor5: '--color-competitor-5',
  competitor6: '--color-competitor-6',
  finishA: '--color-road-edge',
  finishB: '--color-bg',
  // Rayos con el peso de una neurona (pestana-inspeccionar D9): la convención de signo del diagrama.
  weightPositive: '--color-weight-positive',
  weightNegative: '--color-weight-negative',
  handle: '--color-text', // manijas de las entradas a mano: color del texto (vista-de-la-red D11)
  highlight: '--color-accent',
  reading: '--color-network-current', // el rayo que se lee de a operaciones (operacion-por-operacion)
};

/** Manijas de los rayos (pestana-inspeccionar D9): radio dibujado y distancia para agarrarlas (px). */
export const HANDLE = Object.freeze({ radius: 6, grab: 12 });

/** Fracción [0, 1] del rayo a–b más cercana al punto p (todo en píxeles de pantalla). */
export function projectOnRay(p, a, b) {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const len2 = dx * dx + dy * dy;
  if (len2 === 0) return 0;
  return Math.max(0, Math.min(1, ((p.x - a.x) * dx + (p.y - a.y) * dy) / len2));
}

/** Lectura de un sensor según dónde está su manija: 1 junto al auto, 0 en la punta (no detecta nada). */
export const readingAt = (fraction) => Math.round((1 - fraction) * 100) / 100;

/** Índice de la manija más cercana a p dentro de `grab` px, o null. */
export function nearestHandle(points, p, grab = HANDLE.grab) {
  let best = null;
  let bestD = Infinity;
  points.forEach((q, i) => {
    if (!q) return;
    const d = Math.hypot(q.x - p.x, q.y - p.y);
    if (d <= grab && d < bestD) { best = i; bestD = d; }
  });
  return best;
}

// Opacidad de los autos de la población que no están en foco.
const RACING_ALPHA = 0.4;
const ELITE_ALPHA = 0.7;
const OUT_ALPHA = 0.3;
// Carrera: los que ya no corren, atenuados; el recién reaparecido, translúcido como un fantasma.
const RACE_DONE_ALPHA = 0.4;
const RACE_GHOST_ALPHA = 0.45;
const BADGE_RADIUS = 9; // radio de la insignia con el número (px)
const FINISH_SQUARE = 1; // lado de cada cuadro de la meta (m)

const DASH = 3; // largo de cada trazo de la línea de carril (m); el hueco mide lo mismo
const RESET_VIEW_KEY = 'KeyV';

export function readColors(doc = document) {
  const style = getComputedStyle(doc.documentElement);
  return Object.fromEntries(Object.entries(COLOR_VARS).map(([k, v]) => [k, style.getPropertyValue(v).trim()]));
}

const isTypingTarget = (t) => Boolean(t) && (t.isContentEditable
  || t.tagName === 'TEXTAREA' || t.tagName === 'SELECT'
  || (t.tagName === 'INPUT' && !['button', 'checkbox', 'radio', 'range', 'reset', 'submit'].includes(t.type)));

/**
 * @param {{container: HTMLElement, camera?: object, doc?: Document, store?: object, small?: boolean}} spec
 *   store: almacén de la app; si está, la vista ofrece junto a los controles de cámara el interruptor
 *   del paisaje, que lee y cambia `scenery` (el mismo para todas las pestañas).
 *   small: escena chica (pestana-inspeccionar D10), para una pestaña donde el auto no es lo principal:
 *   sigue al auto, encuadra lo que alcanzan sus sensores y no muestra controles de cámara ni responde
 *   a sus gestos (ni a la tecla V). El paisaje sigue la preferencia de la app.
 *   framing: 'rays' (red-al-centro D2), la escena de Inspeccionar y de Tu manejo: los controles de cámara del
 *   escenario grande, pero el encuadre por defecto es el de la escena chica (el auto en el centro y sus rayos
 *   enteros). Acercar, alejar o arrastrar lo dejan; "Seguir al auto" vuelve a él. Las manijas de los rayos
 *   siguen andando: un arrastre que empieza sobre una manija mueve el rayo; uno que empieza en otro lado, la cámara.
 *   resetKey: false para que la tecla V no restablezca la escena (en esas pestañas, V es de la red); el botón
 *   dice "Seguir al auto", sin el atajo.
 */
export function createStageView({ container, camera: givenCamera = null, doc = document, store = null, small = false, framing = null, resetKey = true }) {
  const rays = framing === 'rays' && !small;
  const camera = givenCamera ?? createCamera(small ? { minZoom: 0.2, maxZoom: 400 } : rays ? { minZoom: 0.5, maxZoom: 80 } : {});
  // Con el encuadre de los rayos: ¿la cámara está en ese encuadre (nadie la acercó ni la movió)?
  let fitted = true;
  const win = doc.defaultView;
  const canvas = doc.createElement('canvas');
  canvas.className = 'stage-canvas';
  const ctx = canvas.getContext('2d');

  // Controles de cámara en pantalla.
  const button = (i18n, help, labelKey, onClick) => {
    const b = doc.createElement('button');
    b.type = 'button';
    b.className = 'camera-button';
    b.setAttribute('data-i18n', i18n);
    b.setAttribute('data-help', help);
    b.setAttribute('data-i18n-attr', `aria-label:${labelKey}`);
    b.addEventListener('click', onClick);
    return b;
  };
  const zoomInButton = button('camera.zoomIn', 'camera.zoomIn', 'camera.zoomIn.label', () => zoomBy(camera.limits.step));
  const zoomOutButton = button('camera.zoomOut', 'camera.zoomOut', 'camera.zoomOut.label', () => zoomBy(1 / camera.limits.step));
  const resetButton = resetKey
    ? button('camera.reset', 'camera.reset', 'camera.reset.label', () => resetView())
    : button('camera.reset.plain', 'camera.reset.rays', 'camera.reset.label', () => resetView());
  const controls = doc.createElement('div');
  controls.className = 'camera-controls';
  // Interruptor del paisaje (circuitos-y-paisaje D9): un botón con estado, igual en todas las pestañas.
  const sceneryOn = () => (store ? store.get().scenery !== false : true);
  const sceneryButton = store ? button('camera.scenery', 'camera.scenery', 'camera.scenery.label', () => {
    store.set({ scenery: !sceneryOn() });
  }) : null;
  const syncScenery = () => { if (sceneryButton) sceneryButton.setAttribute('aria-pressed', String(sceneryOn())); };
  if (sceneryButton) sceneryButton.classList.add('camera-scenery');
  syncScenery();
  const unsubscribeScenery = store ? store.subscribe((state, prev) => { if (state.scenery !== prev.scenery) syncScenery(); }) : () => {};
  controls.append(...(sceneryButton ? [sceneryButton] : []), zoomInButton, zoomOutButton, resetButton);

  container.append(canvas);
  if (!small) container.append(controls);
  if (small) canvas.classList.add('stage-canvas-small');

  // Esquina superior izquierda, en el segundo renglón (el primero es para los controles de cámara y
  // el paisaje): los mensajes que cada pestaña agrega, uno debajo del otro (panel-de-entrenar-por-vistas D11).
  const corner = doc.createElement('div');
  corner.className = 'stage-corner';
  container.append(corner);

  let colors = readColors(doc);
  // Vehículos ilustrados (vehiculos-ilustrados D3): cada dibujo se arma una vez por tipo, color y escala.
  const paletteOf = (c) => ({ ...DEFAULT_PALETTE, glass: c.glass || DEFAULT_PALETTE.glass, headlight: c.headlight || DEFAULT_PALETTE.headlight, taillight: c.taillight || DEFAULT_PALETTE.taillight });
  const vehicles = createVehicleCache({ createCanvas: () => doc.createElement('canvas'), palette: paletteOf(colors) });
  const scenery = createSceneryPainter();
  let viewport = { width: 0, height: 0 };
  let dpr = 1;
  let lastTarget = null;
  // Seguimiento de un auto que cambia: mundo y agente en foco del cuadro anterior y transición en curso.
  let focusWorld = null;
  let focusIndex = null;
  let blend = NO_BLEND;
  let lastFrame = null;
  let fitTrackRef = null; // pista y tamaño del escenario con que se calculó el zoom mínimo
  let fitViewport = '';

  function resize() {
    const w = Math.max(1, container.clientWidth);
    const h = Math.max(1, container.clientHeight);
    const ratio = win.devicePixelRatio || 1;
    if (w === viewport.width && h === viewport.height && ratio === dpr) return;
    viewport = { width: w, height: h };
    dpr = ratio;
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;
    canvas.width = Math.round(w * ratio);
    canvas.height = Math.round(h * ratio);
  }
  const observer = new win.ResizeObserver(() => resize());
  observer.observe(container);
  resize();

  function zoomBy(factor) {
    camera.zoomBy(factor, viewport, lastTarget);
    fitted = false;
    syncFollowIndicator();
  }

  function resetView() {
    camera.reset();
    fitted = true;
    syncFollowIndicator();
  }

  function syncFollowIndicator() {
    const active = camera.following && (!rays || fitted) ? 'false' : 'true';
    if (resetButton.dataset.active !== active) resetButton.dataset.active = active;
  }

  // Zoom con la rueda: el punto bajo el cursor queda fijo.
  function onWheel(e) {
    e.preventDefault();
    const pixels = e.deltaMode === 1 ? e.deltaY * 16 : e.deltaMode === 2 ? e.deltaY * viewport.height : e.deltaY;
    const factor = Math.exp(-Math.max(-200, Math.min(200, pixels)) * 0.0015);
    camera.zoomAt({ x: e.offsetX, y: e.offsetY }, factor, viewport, lastTarget);
    fitted = false;
    syncFollowIndicator();
  }

  // Paneo arrastrando con el mouse. Un clic (aunque el mouse se mueva un poco) no es un paneo:
  // el arrastre empieza recién al superar PAN_THRESHOLD píxeles, así la cámara sigue al auto.
  let drag = null;
  function onPointerDown(e) {
    if (e.button !== 0 || grabbed) return; // sobre una manija, el arrastre es del rayo

    drag = { id: e.pointerId, x: e.clientX, y: e.clientY, startX: e.clientX, startY: e.clientY, panning: false };
    canvas.setPointerCapture(e.pointerId);
  }
  function onPointerMove(e) {
    if (!drag || e.pointerId !== drag.id) return;
    if (!drag.panning) {
      if (!panStarts(e.clientX - drag.startX, e.clientY - drag.startY)) return;
      drag.panning = true;
      fitted = false;
      canvas.classList.add('dragging');
    }
    const dx = e.clientX - drag.x;
    const dy = e.clientY - drag.y;
    if (dx === 0 && dy === 0) return;
    drag.x = e.clientX;
    drag.y = e.clientY;
    // Con el auto seguido, el arrastre corre su lugar en la pantalla y la cámara lo sigue desde ahí
    // (bienvenida-y-primer-manejo D1). La escena chica vuelve a centrar al auto en cada cuadro: ahí el paneo
    // queda como antes.
    if (small) camera.pan(dx, dy);
    else camera.pan(dx, dy, viewport, lastTarget);
    syncFollowIndicator();
  }
  function onPointerUp(e) {
    if (!drag || e.pointerId !== drag.id) return;
    drag = null;
    canvas.classList.remove('dragging');
  }

  // Atajo para restablecer la vista.
  function onKeyDown(e) {
    if (e.code !== RESET_VIEW_KEY || e.repeat || e.ctrlKey || e.metaKey || e.altKey) return;
    if (!keyAllowed(e.code)) return; // atajos de una tecla apagados (panel-de-entrenar-por-vistas D9)
    if (isTypingTarget(e.target)) return;
    resetView();
  }

  // Manijas de los rayos (escena chica, en pausa): se arrastran a lo largo de su rayo (D9).
  let handleState = null; // { onDrag, rays: [{a, b, h}] } del último dibujo, en píxeles de pantalla
  let grabbed = null;
  function handleAt(e) {
    if (!handleState) return null;
    return nearestHandle(handleState.rays.map((r) => r.h), { x: e.offsetX, y: e.offsetY });
  }
  function onHandleDown(e) {
    if (e.button !== 0) return;
    const i = handleAt(e);
    if (i === null) return;
    e.preventDefault();
    grabbed = { id: e.pointerId, index: i };
    try { canvas.setPointerCapture(e.pointerId); } catch { /* sin puntero activo: sigue sin capturar */ }
    canvas.classList.add('dragging');
  }
  function onHandleMove(e) {
    if (grabbed && e.pointerId === grabbed.id && handleState) {
      const r = handleState.rays[grabbed.index];
      if (r) handleState.onDrag(grabbed.index, readingAt(projectOnRay({ x: e.offsetX, y: e.offsetY }, r.a, r.b)));
      return;
    }
    canvas.style.cursor = handleAt(e) !== null ? 'grab' : '';
  }
  function onHandleUp(e) {
    if (!grabbed || e.pointerId !== grabbed.id) return;
    grabbed = null;
    canvas.classList.remove('dragging');
  }
  if (small || rays) {
    canvas.addEventListener('pointerdown', onHandleDown);
    canvas.addEventListener('pointermove', onHandleMove);
    canvas.addEventListener('pointerup', onHandleUp);
    canvas.addEventListener('pointercancel', onHandleUp);
  }
  if (!small) {
    canvas.addEventListener('wheel', onWheel, { passive: false });
    canvas.addEventListener('pointerdown', onPointerDown);
    canvas.addEventListener('pointermove', onPointerMove);
    canvas.addEventListener('pointerup', onPointerUp);
    canvas.addEventListener('pointercancel', onPointerUp);
    if (resetKey) win.addEventListener('keydown', onKeyDown);
  }
  syncFollowIndicator();

  // --- Dibujo ------------------------------------------------------------------

  /** Tramos [inicio, fin] de la línea central desplazada `offset` (izquierda +) entre las distancias from y to. */
  function offsetPieces(track, offset, from, to) {
    const pieces = [];
    for (const seg of track.segments) {
      const s0 = Math.max(from, seg.start);
      const s1 = Math.min(to, seg.start + seg.len);
      if (s1 <= s0) continue;
      const at = (s) => ({
        x: seg.a.x + seg.dir.x * (s - seg.start) + seg.normal.x * offset,
        y: seg.a.y + seg.dir.y * (s - seg.start) + seg.normal.y * offset,
      });
      pieces.push([at(s0), at(s1)]);
    }
    return pieces;
  }

  function strokePieces(pieces, color, width, dash) {
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.setLineDash(dash ?? []);
    ctx.beginPath();
    for (const [a, b] of pieces) { ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); }
    ctx.stroke();
    ctx.setLineDash([]);
  }

  /**
   * Pista cerrada (circuitos-y-paisaje D7): la calzada entre los dos bordes y los bordes encima,
   * solo en los tramos cuyo recuadro cae en el encuadre `b`, y la línea de salida de borde a borde.
   * Sin líneas de carril: un circuito tiene un solo carril.
   */
  function drawClosedTrack(track, b, px, afterRoad = () => {}) {
    const L = track.leftBorder;
    const R = track.rightBorder;
    const visible = [];
    for (let i = 0; i < L.length - 1; i++) {
      const xs = [L[i].x, L[i + 1].x, R[i].x, R[i + 1].x];
      const ys = [L[i].y, L[i + 1].y, R[i].y, R[i + 1].y];
      if (Math.max(...xs) < b.minX || Math.min(...xs) > b.maxX || Math.max(...ys) < b.minY || Math.min(...ys) > b.maxY) continue;
      visible.push(i);
    }
    if (visible.length === 0) return;
    // Calzada en un solo trazado: sin costuras entre tramos vecinos.
    ctx.fillStyle = colors.road;
    ctx.beginPath();
    for (const i of visible) {
      ctx.moveTo(L[i].x, L[i].y); ctx.lineTo(L[i + 1].x, L[i + 1].y);
      ctx.lineTo(R[i + 1].x, R[i + 1].y); ctx.lineTo(R[i].x, R[i].y);
      ctx.closePath();
    }
    ctx.fill();
    afterRoad();
    // Línea de salida, de borde a borde.
    strokePieces([[L[0], R[0]]], colors.laneLine, 3 * px);
    // Bordes
    const edges = [];
    for (const i of visible) edges.push([L[i], L[i + 1]], [R[i], R[i + 1]]);
    ctx.lineCap = 'round';
    strokePieces(edges, colors.roadEdge, 3 * px);
    ctx.lineCap = 'butt';
  }

  function drawTrack(track, from, to, px, afterRoad = () => {}) {
    const half = track.width / 2;
    // Calzada
    ctx.fillStyle = colors.road;
    const left = offsetPieces(track, half, from, to);
    const right = offsetPieces(track, -half, from, to);
    left.forEach(([a, b], i) => {
      const [c, d] = right[i];
      ctx.beginPath();
      ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.lineTo(d.x, d.y); ctx.lineTo(c.x, c.y);
      ctx.closePath();
      ctx.fill();
    });
    afterRoad();
    // Separación entre carriles: trazos fijos sobre la calle (el inicio se alinea al patrón).
    const dashFrom = Math.max(track.start, Math.floor(from / (2 * DASH)) * 2 * DASH);
    for (let i = 1; i < track.lanes; i++) {
      strokePieces(offsetPieces(track, half - i * track.laneWidth, dashFrom, to), colors.laneLine, 2 * px, [DASH, DASH]);
    }
    // Bordes
    strokePieces([...left, ...right], colors.roadEdge, 3 * px);
  }

  function polygon(points) {
    ctx.beginPath();
    points.forEach((p, i) => (i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y)));
    ctx.closePath();
  }

  /**
   * Un vehículo ilustrado (vehiculos-ilustrados D1 y D2), estampado desde el caché: la carrocería del color
   * `body`, con el detalle neutro y la sombra (layer 'full'), o solo la carrocería (layer 'mask', la población).
   * El dibujo queda dentro de su rectángulo de choque; solo la sombra asoma, tenue (spec "Lo que se ve es lo
   * que choca"). kind: 'player' (el auto del conductor y los competidores) o el tipo del tráfico.
   */
  function drawVehicle(position, angle, body, px, kind = 'player', layer = 'full') {
    ctx.save();
    ctx.translate(position.x, position.y);
    ctx.rotate(angle);
    vehicles.stamp(ctx, VEHICLE_SIZES[kind] ? kind : 'car', body, dpr / px, layer);
    ctx.restore();
  }

  /** Marca de choque (no depende del color): el contorno punteado y una cruz de esquina a esquina. */
  function crashMarks(car, px, edge, cross) {
    const [fl, fr, rr, rl] = carContour(car);
    polygon([fl, fr, rr, rl]);
    ctx.strokeStyle = edge;
    ctx.lineWidth = 2 * px;
    ctx.setLineDash([0.5, 0.4]);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.strokeStyle = cross;
    ctx.lineWidth = 3 * px;
    ctx.beginPath();
    ctx.moveTo(fl.x, fl.y); ctx.lineTo(rr.x, rr.y);
    ctx.moveTo(fr.x, fr.y); ctx.lineTo(rl.x, rl.y);
    ctx.stroke();
  }

  /** Color del tráfico para un índice de pintura: --color-traffic-{paint + 1}, o --color-traffic si falta. */
  const trafficColor = (paint) => (Number.isInteger(paint) && colors[`traffic${paint + 1}`]) || colors.traffic;

  // La moto es chica: su color se aclara lo justo para llegar a 3:1 contra el asfalto (como pide WCAG
  // 1.4.11 para lo que no es texto). Los vehículos grandes conservan el color de la paleta tal cual.
  const legible = new Map();
  function motorcycleColor(color) {
    const key = `${color}|${colors.road}`;
    if (!legible.has(key)) legible.set(key, legibleOn(color, colors.road, MOTORCYCLE_CONTRAST));
    return legible.get(key);
  }

  function drawTraffic(list, px) {
    for (const v of list) {
      const color = trafficColor(v.paint);
      drawVehicle(v.position, v.angle, v.type === 'motorcycle' ? motorcycleColor(color) : color, px, v.type ?? 'car');
    }
  }

  function drawCar(car, px) {
    if (!car.crashed) {
      drawVehicle(car.position, car.angle, colors.car, px);
      return;
    }
    // Chocado (D2): el mismo dibujo con la carrocería del color del choque y, encima, el contorno punteado
    // y la cruz de siempre, así se reconoce también sin color.
    drawVehicle(car.position, car.angle, colors.carCrashed, px);
    crashMarks(car, px, colors.roadEdge, colors.outline);
  }

  /**
   * Rayos de un auto. Con `color` (una carrera, pestana-competir D10c), con el color del competidor; el
   * punto donde detectan algo se distingue por la forma: un aro claro con el centro oscuro.
   */
  function drawRays(rays, px, color = null) {
    for (const r of rays) {
      const reach = r.hit ?? r.end;
      ctx.strokeStyle = color ?? colors.sensor;
      ctx.lineWidth = 2 * px;
      ctx.beginPath();
      ctx.moveTo(r.origin.x, r.origin.y);
      ctx.lineTo(reach.x, reach.y);
      ctx.stroke();
      if (r.hit) {
        // Tramo detrás del obstáculo: otro color, más fino y punteado.
        ctx.strokeStyle = colors.sensorHit;
        ctx.lineWidth = 1.5 * px;
        ctx.setLineDash([4 * px, 3 * px]);
        ctx.beginPath();
        ctx.moveTo(r.hit.x, r.hit.y);
        ctx.lineTo(r.end.x, r.end.y);
        ctx.stroke();
        ctx.setLineDash([]);
        if (color) {
          ctx.fillStyle = colors.outline;
          ctx.beginPath();
          ctx.arc(r.hit.x, r.hit.y, 4.5 * px, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = color;
          ctx.lineWidth = 2 * px;
          ctx.stroke();
        } else {
          ctx.fillStyle = colors.sensorHit;
          ctx.beginPath();
          ctx.arc(r.hit.x, r.hit.y, 3.5 * px, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }
  }

  /**
   * Población (D5): la forma del auto ilustrado, en un solo tono y sin detalle, con la opacidad dada. Cada auto
   * es un drawImage de la misma imagen del caché.
   */
  function silhouettes(cars, fill, alpha) {
    if (cars.length === 0) return;
    const base = ctx.getTransform();
    const ppm = dpr * camera.zoom;
    ctx.globalAlpha = alpha;
    for (const car of cars) {
      ctx.setTransform(base);
      ctx.translate(car.position.x, car.position.y);
      ctx.rotate(car.angle);
      vehicles.stamp(ctx, 'player', fill, ppm, 'mask');
    }
    ctx.setTransform(base);
    ctx.globalAlpha = 1;
  }

  /** Autos fuera de carrera de la población: muy tenues, sin relleno y con contorno punteado. */
  function drawOut(cars, px) {
    if (cars.length === 0) return;
    ctx.globalAlpha = OUT_ALPHA;
    ctx.strokeStyle = colors.carCrashed;
    ctx.lineWidth = 1.5 * px;
    ctx.setLineDash([4 * px, 3 * px]);
    ctx.beginPath();
    for (const car of cars) {
      const [a, b, c, d] = carContour(car);
      ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.lineTo(c.x, c.y); ctx.lineTo(d.x, d.y);
      ctx.closePath();
    }
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.globalAlpha = 1;
  }

  /** Élite: silueta más marcada, contorno propio y un rombo en el centro (no depende solo del color). */
  function drawElite(cars, px) {
    if (cars.length === 0) return;
    silhouettes(cars, colors.car, ELITE_ALPHA);
    eliteMarks(cars, px);
  }

  /** La marca de élite sola: el contorno propio y el rombo en el centro. */
  function eliteMarks(cars, px) {
    ctx.strokeStyle = colors.elite;
    ctx.lineWidth = 2.5 * px;
    ctx.beginPath();
    for (const car of cars) {
      const [a, b, c, d] = carContour(car);
      ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.lineTo(c.x, c.y); ctx.lineTo(d.x, d.y);
      ctx.closePath();
    }
    ctx.stroke();
    ctx.fillStyle = colors.elite;
    ctx.beginPath();
    const r = Math.max(0.5, 5 * px);
    for (const { position: p } of cars) {
      ctx.moveTo(p.x + r, p.y); ctx.lineTo(p.x, p.y + r); ctx.lineTo(p.x - r, p.y); ctx.lineTo(p.x, p.y - r);
      ctx.closePath();
    }
    ctx.fill();
  }

  /**
   * Franja a cuadros que cruza la pista de borde a borde a `distance` metros de la salida, de
   * `rows` cuadros de largo (pestana-competir D11): la meta en la calle recta, la salida-llegada en un circuito.
   */
  function drawCheckeredLine(track, distance, b, rows = 2) {
    const at = track.pointAt(distance);
    const p = at.position;
    if (p.x < b.minX - track.width || p.x > b.maxX + track.width || p.y < b.minY - track.width || p.y > b.maxY + track.width) return;
    const cols = Math.max(1, Math.round(track.width / FINISH_SQUARE));
    const side = track.width / cols;
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(at.angle);
    for (const tone of [0, 1]) {
      ctx.fillStyle = tone === 0 ? colors.finishA : colors.finishB;
      ctx.beginPath();
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          if ((r + c) % 2 !== tone) continue;
          ctx.rect(r * side - (rows * side) / 2, -track.width / 2 + c * side, side, side);
        }
      }
      ctx.fill();
    }
    ctx.restore();
  }

  /** Contorno de un auto. */
  function contourPath(car) {
    const [a, b2, c, d] = carContour(car);
    ctx.beginPath();
    ctx.moveTo(a.x, a.y); ctx.lineTo(b2.x, b2.y); ctx.lineTo(c.x, c.y); ctx.lineTo(d.x, d.y);
    ctx.closePath();
  }

  /**
   * Un competidor de una carrera (D11): con su color; chocado (cumpliendo la penalización), con la
   * marca de choque; recién reaparecido, como un fantasma (translúcido y con contorno punteado); ya
   * sin correr, atenuado.
   */
  function drawCompetitor(car, look, px) {
    const color = colors[look.color] || colors.car;
    if (look.state === 'penalized') {
      // Cumpliendo la penalización: su dibujo con su color, y encima la marca de choque.
      drawVehicle(car.position, car.angle, color, px);
      crashMarks(car, px, colors.carCrashed, colors.carCrashed);
      return;
    }
    if (look.state === 'protected') {
      ctx.globalAlpha = RACE_GHOST_ALPHA;
      drawVehicle(car.position, car.angle, color, px);
      ctx.globalAlpha = 1;
      contourPath(car);
      ctx.strokeStyle = color;
      ctx.lineWidth = 2 * px;
      ctx.setLineDash([5 * px, 4 * px]);
      ctx.stroke();
      ctx.setLineDash([]);
      return;
    }
    if (look.state === 'done') {
      ctx.globalAlpha = RACE_DONE_ALPHA;
      drawVehicle(car.position, car.angle, color, px);
      ctx.globalAlpha = 1;
      return;
    }
    drawVehicle(car.position, car.angle, color, px);
  }

  /** Insignias con el número de cada competidor, de tamaño fijo en pantalla, junto a su auto. */
  function drawBadges(entries) {
    const m = ctx.getTransform();
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const k = 1 / dpr;
    ctx.font = `700 ${11}px system-ui, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    // Varios autos en el mismo lugar (la salida): las insignias se escalonan para que se lean todas.
    const placed = [];
    for (const { car, look } of entries) {
      const sx = (m.a * car.position.x + m.c * car.position.y + m.e) * k;
      const sy = (m.b * car.position.x + m.d * car.position.y + m.f) * k;
      let x = sx + BADGE_RADIUS + 8;
      let y = sy - BADGE_RADIUS - 6;
      while (placed.some((q) => Math.hypot(q.x - x, q.y - y) < 2 * BADGE_RADIUS)) x += 2 * BADGE_RADIUS + 2;
      placed.push({ x, y });
      ctx.globalAlpha = look.state === 'done' ? 0.75 : 1;
      ctx.beginPath();
      ctx.arc(x, y, BADGE_RADIUS, 0, Math.PI * 2);
      ctx.fillStyle = colors[look.color] || colors.car;
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.strokeStyle = look.focus ? colors.roadEdge : colors.outline;
      ctx.stroke();
      ctx.fillStyle = colors.outline;
      ctx.fillText(String(look.number), x, y + 0.5);
      ctx.globalAlpha = 1;
    }
    ctx.setTransform(m);
  }

  /**
   * Rayos indicados por la pestaña (pestana-inspeccionar D9): cada uno con el color (signo) y el grosor
   * (magnitud) de un peso, apagado (atenuado y tachado) o destacado; y, en pausa, una manija por rayo
   * donde detecta algo (en la punta si no detecta nada) o en la lectura puesta a mano.
   * @param {{looks?:({sign:string, level:number, dashed:boolean, off?:boolean}|null)[]|null, off?:boolean[],
   *   highlight?:number|null, reading?:number|null, handles?:{readings:number[], onDrag:(i:number, reading:number)=>void}|null}} spec
   *   reading: el rayo que se está leyendo en el paso a paso; se dibuja en el color de lo que se calcula
   *   y los demás se atenúan.
   * Se dibuja en dos pasadas (vehiculos-ilustrados D9): esta, con los rayos, va antes del auto, así el auto
   * queda encima; drawRayMarks, con los puntos de detección y las manijas, va después, así siguen a la vista.
   */
  function rayAlpha(spec, i) {
    const look = spec.looks?.[i] ?? null;
    const off = Boolean(spec.off?.[i] || look?.off);
    const reading = spec.reading ?? null;
    return (off ? 0.3 : 1) * (reading !== null && reading !== i ? 0.35 : 1);
  }

  function drawCustomRays(rays, px, spec) {
    const looks = spec.looks ?? null;
    rays.forEach((r, i) => {
      const look = looks?.[i] ?? null;
      const off = Boolean(spec.off?.[i] || look?.off);
      const reach = r.hit ?? r.end;
      const reading = spec.reading ?? null;
      ctx.globalAlpha = rayAlpha(spec, i);
      if (look && look.level > 0) {
        ctx.strokeStyle = look.sign === 'negative' ? colors.weightNegative : colors.weightPositive;
        ctx.lineWidth = (0.8 + look.level * 0.9) * px;
        ctx.setLineDash(look.dashed ? [4 * px, 3 * px] : []);
      } else {
        ctx.strokeStyle = colors.sensor;
        ctx.lineWidth = (look ? 0.8 : 2) * px;
        ctx.setLineDash([]);
      }
      if (spec.highlight === i) { ctx.strokeStyle = colors.highlight; ctx.lineWidth = 4 * px; ctx.setLineDash([]); }
      if (reading === i) { ctx.strokeStyle = colors.reading; ctx.lineWidth = 4 * px; ctx.setLineDash([]); }
      ctx.beginPath();
      ctx.moveTo(r.origin.x, r.origin.y);
      ctx.lineTo(reach.x, reach.y);
      ctx.stroke();
      ctx.setLineDash([]);
      if (r.hit) {
        ctx.strokeStyle = colors.sensorHit;
        ctx.lineWidth = 1.5 * px;
        ctx.setLineDash([4 * px, 3 * px]);
        ctx.beginPath();
        ctx.moveTo(r.hit.x, r.hit.y);
        ctx.lineTo(r.end.x, r.end.y);
        ctx.stroke();
        ctx.setLineDash([]);
      }
      if (off) {
        // Tachado: una cruz en el medio del rayo.
        const m = { x: (r.origin.x + r.end.x) / 2, y: (r.origin.y + r.end.y) / 2 };
        const k = 5 * px;
        ctx.globalAlpha = 0.9;
        ctx.strokeStyle = colors.roadEdge;
        ctx.lineWidth = 2 * px;
        ctx.beginPath();
        ctx.moveTo(m.x - k, m.y - k); ctx.lineTo(m.x + k, m.y + k);
        ctx.moveTo(m.x + k, m.y - k); ctx.lineTo(m.x - k, m.y + k);
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
    });
  }

  /** Segunda pasada de los rayos a medida, después del auto: los puntos donde detectan algo y las manijas. */
  function drawRayMarks(rays, px, spec) {
    rays.forEach((r, i) => {
      if (!r.hit) return;
      ctx.globalAlpha = rayAlpha(spec, i);
      ctx.fillStyle = colors.sensorHit;
      ctx.beginPath();
      ctx.arc(r.hit.x, r.hit.y, 3 * px, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.globalAlpha = 1;
    // Manijas, en píxeles de pantalla para poder agarrarlas.
    if (!spec.handles) { handleState = null; return; }
    const m = ctx.getTransform();
    const k = 1 / dpr;
    const toScreen = (p) => ({ x: (m.a * p.x + m.c * p.y + m.e) * k, y: (m.b * p.x + m.d * p.y + m.f) * k });
    const list = rays.map((r, i) => {
      const a = toScreen(r.origin);
      const b = toScreen(r.end);
      const reading = spec.handles.readings[i] ?? r.reading;
      const f = 1 - Math.max(0, Math.min(1, reading));
      return { a, b, h: { x: a.x + (b.x - a.x) * f, y: a.y + (b.y - a.y) * f } };
    });
    handleState = { onDrag: spec.handles.onDrag, rays: list };
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    for (const r of list) {
      ctx.beginPath();
      ctx.arc(r.h.x, r.h.y, HANDLE.radius, 0, Math.PI * 2);
      ctx.fillStyle = colors.handle;
      ctx.fill();
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = colors.outline;
      ctx.stroke();
    }
    ctx.setTransform(m);
  }

  /** Objetivo de la cámara con un foco que puede cambiar (design.md D11). */
  function focusTarget(world, focus) {
    const now = win.performance.now();
    const dt = lastFrame === null ? 0 : (now - lastFrame) / 1000;
    lastFrame = now;
    const agents = world.agents;
    if (world !== focusWorld) {
      blend = NO_BLEND; // mundo nuevo (otra generación o un reinicio): la cámara va directo a la salida
    } else if (focus !== focusIndex && agents[focusIndex]) {
      blend = retarget(blend, agents[focusIndex].car.position, agents[focus].car.position);
    } else {
      blend = advanceBlend(blend, dt);
    }
    focusWorld = world;
    focusIndex = focus;
    return blendTarget(agents[focus].car.position, blend);
  }

  /**
   * Dibuja un cuadro.
   * @param {object} world mundo del núcleo
   * @param {{showSensors?: boolean, machineView?: boolean, scenery?: boolean, focus?: number, elite?: number[]}} [options]
   *   machineView omite las capas de pista, tráfico y paisaje ("ver como la máquina") y, con una
   *   población, a todos los autos menos el del foco (circuitos-y-paisaje D13).
   *   scenery: dibuja el paisaje alrededor de la pista (encendido por defecto; machineView lo anula).
   *   focus: índice del agente a destacar y seguir (sin focus, dibuja el primer auto como siempre).
   *   elite: índices de los agentes de élite, que llevan una marca propia.
   *   focusElite: el auto del foco lleva la marca de élite (corte de generación, entrenar-la-generacion-ensena D4:
   *   en la largada todos están en el mismo lugar y el del foco es la copia del mejor).
   *   competitors: en una carrera (pestana-competir D11), por cada agente { color, number, state }:
   *     color es una clave de color ('car' para la persona, 'competitor1' a 'competitor6'); state,
   *     'racing', 'penalized' (cumpliendo la penalización), 'protected' (recién reaparecido) o 'done'.
   *   goal: la meta de la carrera ({ kind, meters }); se dibuja a cuadros.
   */
  function render(world, {
    showSensors = true, machineView = false, scenery: showScenery = sceneryOn(), focus, elite = [], competitors = null, goal = null,
    rays: raySpec = null, focusElite = false,
  } = {}) {
    resize();
    const population = Number.isInteger(focus) && world.agents?.[focus] !== undefined;
    const car = population ? world.agents[focus].car : world.car;
    const target = population ? focusTarget(world, focus) : car.position;
    lastTarget = target;
    const orientation = small || rays ? { ...orientationFor(world.track), anchor: SMALL_FIT.anchor } : orientationFor(world.track);
    camera.setOrientation(orientation);
    if (small || (rays && fitted)) {
      // Escena chica: el auto en el centro y el alcance de sus sensores a la vista, siempre igual.
      const z = smallZoom(car.sensors, viewport);
      if (Math.abs(camera.zoom - z) > 1e-9) camera.zoomBy(z / camera.zoom, viewport, target);
      if (!camera.following) camera.follow();
    }
    // Zoom mínimo de un circuito: lo necesario para verlo entero en este escenario (D7). Se recalcula
    // solo si cambia la pista o el tamaño del escenario.
    const fitKey = `${viewport.width}x${viewport.height}`;
    if (!small && !rays && (world.track !== fitTrackRef || fitKey !== fitViewport)) {
      fitTrackRef = world.track;
      fitViewport = fitKey;
      camera.setFit(world.track.closed ? fitTrack(world.track, viewport, orientation.rotation) : null);
    }
    syncFollowIndicator();
    camera.update(target, viewport);
    const z = camera.zoom;
    const c = camera.center;
    const cos = Math.cos(camera.rotation);
    const sin = Math.sin(camera.rotation);
    const px = 1 / z; // un píxel CSS en metros

    const withScenery = showScenery && !machineView;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    // Con el paisaje, el fondo es el pasto.
    ctx.fillStyle = withScenery ? colors.grass : colors.background;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    // Mundo -> pantalla: giro de la cámara, escala z, y invertida, centrado en la cámara.
    ctx.setTransform(
      dpr * z * cos, -dpr * z * sin,
      -dpr * z * sin, -dpr * z * cos,
      dpr * (viewport.width / 2 - z * (cos * c.x - sin * c.y)),
      dpr * (viewport.height / 2 + z * (sin * c.x + cos * c.y)),
    );

    // Orden de dibujo (D9): pasto, veredas, pianitos y tribunas, calzada, sendas y línea de largada,
    // líneas de carril y bordes, árboles, tráfico, autos y rayos.
    if (!machineView) {
      const b = camera.visibleBounds(viewport);
      if (withScenery) scenery.under(ctx, world, b, colors);
      const paint = withScenery ? () => scenery.paint(ctx, world, b, colors) : undefined;
      // Meta de una carrera: en la calle recta, a la distancia de la meta; en un circuito, la salida.
      const finish = goal ? () => { if (paint) paint(); drawCheckeredLine(world.track, world.track.closed ? 0 : goal.meters, b); } : paint;
      if (world.track.closed) {
        drawClosedTrack(world.track, b, px, finish);
        if (withScenery) scenery.over(ctx, world, b, colors);
      } else {
        const middle = { x: (b.minX + b.maxX) / 2, y: (b.minY + b.maxY) / 2 };
        const radius = Math.hypot(b.maxX - b.minX, b.maxY - b.minY) / 2;
        const at = world.track.progressOf(middle).progress;
        const from = Math.max(world.track.start, at - radius);
        const to = Math.min(world.track.end, at + radius);
        drawTrack(world.track, from, to, px, finish);
        if (withScenery) scenery.over(ctx, world, b, colors);
        // Margen de medio vehículo del más largo: un camión con el centro afuera puede asomar (trafico-vivo D9).
        const m = MAX_VEHICLE_LENGTH / 2 + 1;
        const inView = (v) => v.position.x >= b.minX - m && v.position.x <= b.maxX + m
          && v.position.y >= b.minY - m && v.position.y <= b.maxY + m;
        drawTraffic(world.vehiclesIn(from - m, to + m).filter(inView), px);
      }
    }
    if (population && competitors) {
      // Carrera: cada competidor con su color y su número; el seguido, último y con sus rayos.
      const b = camera.visibleBounds(viewport);
      const margin = CAR_LENGTH;
      const inView = (c) => c.position.x >= b.minX - margin && c.position.x <= b.maxX + margin
        && c.position.y >= b.minY - margin && c.position.y <= b.maxY + margin;
      const entries = [];
      world.agents.forEach((a, i) => {
        if (i === focus || !inView(a.car) || !competitors[i]) return;
        entries.push({ car: a.car, look: competitors[i] });
      });
      const raysOf = (agent, look) => {
        if (look.state === 'done' || look.state === 'penalized') return;
        drawRays(agent.rays, px, colors[look.color] || colors.sensor);
      };
      if (!machineView) {
        // Los sensores de cada competidor que los tenga encendidos (D10c), se lo siga o no.
        world.agents.forEach((a, i) => { if (i !== focus && competitors[i]?.sensors && inView(a.car)) raysOf(a, competitors[i]); });
        // Primero los que ya no corren, después los que corren.
        for (const e of entries) if (e.look.state === 'done') drawCompetitor(e.car, e.look, px);
        for (const e of entries) if (e.look.state !== 'done') drawCompetitor(e.car, e.look, px);
      }
      const own = competitors[focus] ?? { color: 'car', number: focus + 1, state: 'racing' };
      // El seguido: con sus sensores si los tiene encendidos o si se ve como la máquina.
      if (own.sensors || (machineView && showSensors)) raysOf(world.agents[focus], own);
      drawCompetitor(car, own, px);
      drawBadges([...(machineView ? [] : entries), { car, look: { ...own, focus: true } }]);
      return;
    }
    if (population && machineView) {
      // Ver como la máquina con una población: solo el auto del foco y sus rayos.
      if (showSensors) drawRays(world.agents[focus].rays, px);
      drawCar(car, px);
      return;
    }
    if (population) {
      const b = camera.visibleBounds(viewport);
      const margin = CAR_LENGTH;
      const inView = (c) => c.position.x >= b.minX - margin && c.position.x <= b.maxX + margin
        && c.position.y >= b.minY - margin && c.position.y <= b.maxY + margin;
      const eliteSet = new Set(elite);
      const out = [];
      const racing = [];
      const eliteCars = [];
      world.agents.forEach((a, i) => {
        if (i === focus || !inView(a.car)) return;
        if (a.car.crashed) out.push(a.car);
        else if (eliteSet.has(i)) eliteCars.push(a.car);
        else racing.push(a.car);
      });
      drawOut(out, px);
      silhouettes(racing, colors.car, RACING_ALPHA);
      drawElite(eliteCars, px);
      if (showSensors) drawRays(world.agents[focus].rays, px);
      drawCar(car, px);
      if (focusElite) eliteMarks([car], px);
      return;
    }
    if (raySpec) {
      // Los rayos debajo del auto y sus marcas encima (vehiculos-ilustrados D9).
      if (showSensors) drawCustomRays(world.rays, px, raySpec);
      drawCar(car, px);
      if (showSensors) drawRayMarks(world.rays, px, raySpec);
      return;
    }
    if (showSensors) drawRays(world.rays, px);
    drawCar(car, px);
  }

  return {
    canvas,
    camera,
    render,
    resetView,
    /** Vuelve a seguir al auto (al reiniciar la simulación); un cambio de foco pendiente se completa de inmediato. */
    followCar() { camera.follow(); blend = NO_BLEND; syncFollowIndicator(); },
    /** Renglón de los controles de cámara (para sumarle un botón de la pestaña, como "Manejar vos"). */
    controls,
    /** Manijas de los rayos del último dibujo, en píxeles de la escena (verificación desde la consola). */
    get handlePoints() { return handleState ? handleState.rays.map((r) => ({ ...r.h })) : []; },
    /** ¿La cámara está en el encuadre de los rayos? (con `framing: 'rays'`) */
    get fitted() { return rays && fitted && camera.following; },
    refreshColors() { colors = readColors(doc); vehicles.reset(paletteOf(colors)); },
    get viewport() { return { ...viewport }; },
    /** Esquina superior izquierda, en el segundo renglón: los mensajes del escenario van acá. */
    corner,
    dispose() {
      corner.remove();
      observer.disconnect();
      unsubscribeScenery();
      canvas.removeEventListener('wheel', onWheel);
      canvas.removeEventListener('pointerdown', onHandleDown);
      canvas.removeEventListener('pointerdown', onPointerDown);
      win.removeEventListener('keydown', onKeyDown);
      canvas.remove();
      controls.remove();
    },
  };
}

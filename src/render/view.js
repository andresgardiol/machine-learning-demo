// Vista del escenario en un canvas 2D (design.md D8): pista, carriles, tráfico, auto y rayos,
// con una cámara que sigue al auto, zoom con rueda y botones, paneo y restablecer (control y tecla V).
// La calle recta se muestra vertical, con el sentido de avance hacia arriba (camera.orientationFor).
// Es la misma vista para todas las pestañas con escenario. Solo dibuja lo que cae en el encuadre.
//
// Los colores salen de las variables de styles/tokens.css. Los textos de los botones se
// declaran con data-i18n / data-help y los completa el sistema de idiomas de la interfaz.
import { carContour } from '../core/car.js';
import { CAR_LENGTH } from '../core/constants.js';
import { createCamera, orientationFor } from './camera.js';

const COLOR_VARS = {
  background: '--color-bg',
  road: '--color-road',
  roadEdge: '--color-road-edge',
  laneLine: '--color-lane-line',
  car: '--color-car',
  carCrashed: '--color-car-crashed',
  traffic: '--color-traffic',
  sensor: '--color-sensor',
  sensorHit: '--color-sensor-hit',
  outline: '--color-bg',
};

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
 * @param {{container: HTMLElement, camera?: object, doc?: Document}} spec
 */
export function createStageView({ container, camera = createCamera(), doc = document }) {
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
  const resetButton = button('camera.reset', 'camera.reset', 'camera.reset.label', () => resetView());
  const controls = doc.createElement('div');
  controls.className = 'camera-controls';
  controls.append(zoomInButton, zoomOutButton, resetButton);

  container.append(canvas, controls);

  let colors = readColors(doc);
  let viewport = { width: 0, height: 0 };
  let dpr = 1;
  let lastTarget = null;

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
    syncFollowIndicator();
  }

  function resetView() {
    camera.reset();
    syncFollowIndicator();
  }

  function syncFollowIndicator() {
    const active = camera.following ? 'false' : 'true';
    if (resetButton.dataset.active !== active) resetButton.dataset.active = active;
  }

  // Zoom con la rueda: el punto bajo el cursor queda fijo.
  function onWheel(e) {
    e.preventDefault();
    const pixels = e.deltaMode === 1 ? e.deltaY * 16 : e.deltaMode === 2 ? e.deltaY * viewport.height : e.deltaY;
    const factor = Math.exp(-Math.max(-200, Math.min(200, pixels)) * 0.0015);
    camera.zoomAt({ x: e.offsetX, y: e.offsetY }, factor, viewport, lastTarget);
    syncFollowIndicator();
  }

  // Paneo arrastrando con el mouse.
  let drag = null;
  function onPointerDown(e) {
    if (e.button !== 0) return;
    drag = { id: e.pointerId, x: e.clientX, y: e.clientY };
    canvas.setPointerCapture(e.pointerId);
    canvas.classList.add('dragging');
  }
  function onPointerMove(e) {
    if (!drag || e.pointerId !== drag.id) return;
    const dx = e.clientX - drag.x;
    const dy = e.clientY - drag.y;
    if (dx === 0 && dy === 0) return;
    drag.x = e.clientX;
    drag.y = e.clientY;
    camera.pan(dx, dy);
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
    if (isTypingTarget(e.target)) return;
    resetView();
  }

  canvas.addEventListener('wheel', onWheel, { passive: false });
  canvas.addEventListener('pointerdown', onPointerDown);
  canvas.addEventListener('pointermove', onPointerMove);
  canvas.addEventListener('pointerup', onPointerUp);
  canvas.addEventListener('pointercancel', onPointerUp);
  win.addEventListener('keydown', onKeyDown);
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

  function drawTrack(track, from, to, px) {
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
    // Separación entre carriles: trazos fijos sobre la calle (el inicio se alinea al patrón).
    const dashFrom = Math.max(0, Math.floor(from / (2 * DASH)) * 2 * DASH);
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

  function drawTraffic(vehicles, px) {
    ctx.fillStyle = colors.traffic;
    ctx.strokeStyle = colors.outline;
    ctx.lineWidth = 1.5 * px;
    for (const v of vehicles) {
      polygon(v.contour);
      ctx.fill();
      ctx.stroke();
    }
  }

  function drawCar(car, px) {
    const [fl, fr, rr, rl] = carContour(car);
    polygon([fl, fr, rr, rl]);
    if (car.crashed) {
      // Chocado: otro color, contorno punteado y una cruz (no solo cambia el color).
      ctx.fillStyle = colors.carCrashed;
      ctx.fill();
      ctx.strokeStyle = colors.roadEdge;
      ctx.lineWidth = 2 * px;
      ctx.setLineDash([0.5, 0.4]);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.strokeStyle = colors.outline;
      ctx.lineWidth = 3 * px;
      ctx.beginPath();
      ctx.moveTo(fl.x, fl.y); ctx.lineTo(rr.x, rr.y);
      ctx.moveTo(fr.x, fr.y); ctx.lineTo(rl.x, rl.y);
      ctx.stroke();
      return;
    }
    ctx.fillStyle = colors.car;
    ctx.fill();
    ctx.strokeStyle = colors.outline;
    ctx.lineWidth = 1.5 * px;
    ctx.stroke();
    // Parabrisas: marca el frente del auto.
    const mix = (a, b, t) => ({ x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t });
    const wl = mix(fl, rl, 0.22);
    const wr = mix(fr, rr, 0.22);
    ctx.lineWidth = 3 * px;
    ctx.beginPath();
    ctx.moveTo(mix(wl, wr, 0.15).x, mix(wl, wr, 0.15).y);
    ctx.lineTo(mix(wl, wr, 0.85).x, mix(wl, wr, 0.85).y);
    ctx.stroke();
  }

  function drawRays(rays, px) {
    for (const r of rays) {
      const reach = r.hit ?? r.end;
      ctx.strokeStyle = colors.sensor;
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
        ctx.fillStyle = colors.sensorHit;
        ctx.beginPath();
        ctx.arc(r.hit.x, r.hit.y, 3.5 * px, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  /**
   * Dibuja un cuadro.
   * @param {object} world mundo del núcleo
   * @param {{showSensors?: boolean, machineView?: boolean}} [options]
   *   machineView omite las capas de pista y tráfico ("ver como la máquina").
   */
  function render(world, { showSensors = true, machineView = false } = {}) {
    resize();
    const car = world.car;
    lastTarget = car.position;
    camera.setOrientation(orientationFor(world.track));
    syncFollowIndicator();
    camera.update(car.position, viewport);
    const z = camera.zoom;
    const c = camera.center;
    const cos = Math.cos(camera.rotation);
    const sin = Math.sin(camera.rotation);
    const px = 1 / z; // un píxel CSS en metros

    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = colors.background;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    // Mundo -> pantalla: giro de la cámara, escala z, y invertida, centrado en la cámara.
    ctx.setTransform(
      dpr * z * cos, -dpr * z * sin,
      -dpr * z * sin, -dpr * z * cos,
      dpr * (viewport.width / 2 - z * (cos * c.x - sin * c.y)),
      dpr * (viewport.height / 2 + z * (sin * c.x + cos * c.y)),
    );

    if (!machineView) {
      const b = camera.visibleBounds(viewport);
      const middle = { x: (b.minX + b.maxX) / 2, y: (b.minY + b.maxY) / 2 };
      const radius = Math.hypot(b.maxX - b.minX, b.maxY - b.minY) / 2;
      const at = world.track.progressOf(middle).progress;
      const from = Math.max(0, at - radius);
      const to = Math.min(world.track.length, at + radius);
      drawTrack(world.track, from, to, px);
      const inView = (v) => v.position.x >= b.minX - CAR_LENGTH && v.position.x <= b.maxX + CAR_LENGTH
        && v.position.y >= b.minY - CAR_LENGTH && v.position.y <= b.maxY + CAR_LENGTH;
      drawTraffic(world.vehiclesIn(from - CAR_LENGTH, to + CAR_LENGTH).filter(inView), px);
    }
    if (showSensors) drawRays(world.rays, px);
    drawCar(car, px);
  }

  return {
    canvas,
    camera,
    render,
    resetView,
    /** Vuelve a seguir al auto (al reiniciar la simulación). */
    followCar() { camera.follow(); syncFollowIndicator(); },
    refreshColors() { colors = readColors(doc); },
    get viewport() { return { ...viewport }; },
    dispose() {
      observer.disconnect();
      canvas.removeEventListener('wheel', onWheel);
      win.removeEventListener('keydown', onKeyDown);
      canvas.remove();
      controls.remove();
    },
  };
}

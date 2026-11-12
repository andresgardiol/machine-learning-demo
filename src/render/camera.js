// Cámara del escenario: posición, zoom e indicador de seguimiento (design.md D8).
//
// Trabaja en metros (mundo, ejes matemáticos con y hacia arriba) y píxeles CSS (pantalla,
// y hacia abajo): al pasar a pantalla se invierte y. El zoom es cuántos píxeles mide un metro.
// Al seguir al auto, este queda en un punto fijo de la pantalla (`anchor`, en fracciones del
// ancho y del alto), corrido hacia atrás para dejar más pista a la vista por delante.
// La cámara puede además girar el encuadre (`rotation`, en radianes, antihorario): por ejemplo,
// la vista gira la calle recta para mostrarla vertical, con el sentido de avance hacia arriba.

/** Margen alrededor del trazado al calcular el zoom mínimo de un circuito (m, de cada lado). */
export const FIT_MARGIN = 15;

/**
 * Encuadre de un circuito entero (circuitos-y-paisaje D7): el zoom con que el trazado, ya orientado
 * con el giro `rotation` y con un margen, entra en el escenario `vp`, y el punto del mundo que queda
 * en el centro. El zoom nunca supera `maxMin` (el mínimo de siempre, 2 px por metro).
 * @param {{leftBorder:{x:number,y:number}[], rightBorder:{x:number,y:number}[]}} track
 * @returns {{zoom:number, center:{x:number,y:number}}}
 */
export function fitTrack(track, vp, rotation = 0, { margin = FIT_MARGIN, maxMin = 2 } = {}) {
  const c = Math.cos(rotation);
  const s = Math.sin(rotation);
  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;
  for (const p of [...track.leftBorder, ...track.rightBorder]) {
    const x = c * p.x - s * p.y;
    const y = s * p.x + c * p.y;
    if (x < minX) minX = x;
    if (x > maxX) maxX = x;
    if (y < minY) minY = y;
    if (y > maxY) maxY = y;
  }
  const zoom = Math.min(maxMin, vp.width / (maxX - minX + 2 * margin), vp.height / (maxY - minY + 2 * margin));
  const mx = (minX + maxX) / 2;
  const my = (minY + maxY) / 2;
  return { zoom, center: { x: c * mx + s * my, y: -s * mx + c * my } };
}

export const CAMERA_DEFAULTS = Object.freeze({
  zoom: 10, // px por metro
  minZoom: 2, // en un circuito baja lo necesario para verlo entero (setFit)
  maxZoom: 40,
  anchor: Object.freeze({ x: 0.3, y: 0.5 }),
  step: 1.25, // factor de los botones de acercar y alejar
});

/** Distancia (px) que hay que arrastrar para que empiece un paneo: un clic no deja de seguir al auto. */
export const PAN_THRESHOLD = 5;

/** ¿Un arrastre de (dx, dy) píxeles desde donde se apretó el botón ya es un paneo? */
export const panStarts = (dx, dy) => Math.hypot(dx, dy) > PAN_THRESHOLD;

/** Punto de seguimiento con la calle recta vertical: centrado y al 70 % del alto (más pista por delante, arriba). */
export const VERTICAL_ANCHOR = Object.freeze({ x: 0.5, y: 0.7 });

/**
 * Orientación del encuadre para una pista. La calle recta (un solo tramo) se muestra vertical,
 * con el sentido de avance hacia arriba, para aprovechar el alto del escenario. Un circuito cerrado
 * usa un giro fijo que deja su recta de salida vertical, con el sentido de avance hacia arriba
 * (circuitos-y-paisaje D7): la pista no gira con el auto. Las demás pistas con curvas, sin girar.
 * @param {{segments: {dir:{x:number,y:number}}[], closed?: boolean}} track
 */
export function orientationFor(track) {
  if (track?.segments?.length === 1 || (track?.closed && track.segments?.length > 0)) {
    const { dir } = track.segments[0];
    return { rotation: Math.PI / 2 - Math.atan2(dir.y, dir.x), anchor: VERTICAL_ANCHOR };
  }
  return { rotation: 0, anchor: CAMERA_DEFAULTS.anchor };
}

export function createCamera(options = {}) {
  const cfg = { ...CAMERA_DEFAULTS, ...options };
  let center = { x: 0, y: 0 };
  let zoom = cfg.zoom;
  let following = true;
  let baseAnchor = { ...cfg.anchor }; // punto de seguimiento de la orientación actual
  let anchor = { ...baseAnchor };
  let rotation = 0;
  let cos = 1;
  let sin = 0;

  const clampZoom = (z) => Math.min(Math.max(z, cfg.minZoom), cfg.maxZoom);
  const baseMinZoom = cfg.minZoom;
  let frameCenter = null; // centro del circuito entero: con el zoom al mínimo, la cámara lo encuadra

  /** Gira un vector del mundo al encuadre (antihorario `rotation`). */
  const turn = (v) => ({ x: cos * v.x - sin * v.y, y: sin * v.x + cos * v.y });
  /** Gira un vector del encuadre al mundo. */
  const unturn = (v) => ({ x: cos * v.x + sin * v.y, y: -sin * v.x + cos * v.y });

  function worldToScreen(p, vp) {
    const r = turn({ x: p.x - center.x, y: p.y - center.y });
    return { x: r.x * zoom + vp.width / 2, y: -r.y * zoom + vp.height / 2 };
  }

  /** Punto de mundo que corresponde a un punto de pantalla relativo al centro del encuadre. */
  const offsetToWorld = (s, vp) => unturn({ x: (s.x - vp.width / 2) / zoom, y: -(s.y - vp.height / 2) / zoom });

  function screenToWorld(s, vp) {
    const d = offsetToWorld(s, vp);
    return { x: center.x + d.x, y: center.y + d.y };
  }

  /** Mueve el centro para que el punto de mundo `p` quede en el punto de pantalla `s`. */
  function place(p, s, vp) {
    const d = offsetToWorld(s, vp);
    center = { x: p.x - d.x, y: p.y - d.y };
  }

  /** Si sigue al auto, lo ubica en su punto fijo de la pantalla. */
  function update(target, vp) {
    if (following && frameCenter && zoom <= cfg.minZoom * (1 + 1e-9)) {
      center = { ...frameCenter }; // al mínimo, el circuito entero a la vista
      return;
    }
    if (following && target) place(target, { x: anchor.x * vp.width, y: anchor.y * vp.height }, vp);
  }

  /**
   * Encuadre del circuito entero (fitTrack): el zoom mínimo baja hasta el que lo deja ver completo y,
   * al llegar a ese mínimo siguiendo al auto, la cámara centra el circuito. Sin encuadre (la calle),
   * vuelve el mínimo de siempre.
   */
  function setFit(fit) {
    cfg.minZoom = fit ? Math.min(baseMinZoom, fit.zoom) : baseMinZoom;
    frameCenter = fit ? { ...fit.center } : null;
    if (zoom < cfg.minZoom) zoom = cfg.minZoom;
  }

  /**
   * Cambia el zoom dejando fijo en pantalla el punto `s` (por ejemplo, el que está bajo el cursor).
   * Si sigue al auto, este conserva su nuevo lugar en pantalla; si quedaría fuera de ella, deja de seguirlo.
   * @returns {boolean} si el zoom cambió (false al llegar a un límite)
   */
  function zoomAt(s, factor, vp, target) {
    const next = clampZoom(zoom * factor);
    if (next === zoom) return false;
    const p = screenToWorld(s, vp);
    zoom = next;
    place(p, s, vp);
    if (following && target) {
      const t = worldToScreen(target, vp);
      const a = { x: t.x / vp.width, y: t.y / vp.height };
      if (a.x < 0 || a.x > 1 || a.y < 0 || a.y > 1) following = false;
      else anchor = a;
    }
    return true;
  }

  /** Botones de acercar y alejar: alrededor del auto si lo sigue, si no alrededor del centro de la pantalla. */
  function zoomBy(factor, vp, target) {
    const s = following && target ? worldToScreen(target, vp) : { x: vp.width / 2, y: vp.height / 2 };
    return zoomAt(s, factor, vp, target);
  }

  /** Desplaza el encuadre según un arrastre en píxeles de pantalla y deja de seguir al auto. */
  function pan(dx, dy) {
    const d = unturn({ x: dx / zoom, y: -dy / zoom });
    center = { x: center.x - d.x, y: center.y - d.y };
    following = false;
  }

  /** Restablecer la vista: vuelve a seguir al auto con el zoom por defecto. */
  function reset() {
    zoom = cfg.zoom;
    anchor = { ...baseAnchor };
    following = true;
  }

  /** Vuelve a seguir al auto (por ejemplo al reiniciar la simulación), sin tocar el zoom. */
  function follow() {
    anchor = { ...baseAnchor };
    following = true;
  }

  /**
   * Orientación del encuadre: giro (radianes, antihorario) y punto de seguimiento del auto.
   * Si cambia, la cámara vuelve a seguir al auto en ese punto.
   */
  function setOrientation({ rotation: r = 0, anchor: a = cfg.anchor } = {}) {
    if (r === rotation && a.x === baseAnchor.x && a.y === baseAnchor.y) return;
    rotation = r;
    cos = Math.cos(r);
    sin = Math.sin(r);
    baseAnchor = { x: a.x, y: a.y };
    anchor = { ...baseAnchor };
    following = true;
  }

  /** Rectángulo de mundo (alineado con los ejes) que contiene todo lo visible. */
  function visibleBounds(vp) {
    const corners = [[0, 0], [vp.width, 0], [0, vp.height], [vp.width, vp.height]].map(([x, y]) => screenToWorld({ x, y }, vp));
    const xs = corners.map((c) => c.x);
    const ys = corners.map((c) => c.y);
    return { minX: Math.min(...xs), maxX: Math.max(...xs), minY: Math.min(...ys), maxY: Math.max(...ys) };
  }

  return {
    worldToScreen, screenToWorld, update, zoomAt, zoomBy, pan, reset, follow, setOrientation, setFit, visibleBounds,
    get zoom() { return zoom; },
    get rotation() { return rotation; },
    get center() { return { ...center }; },
    get following() { return following; },
    get anchor() { return { ...anchor }; },
    get limits() { return { min: cfg.minZoom, max: cfg.maxZoom, default: cfg.zoom, step: cfg.step }; },
  };
}

// --- Cambio del auto seguido (design.md D11) ----------------------------------------------------
//
// Cuando el auto seguido cambia, la vista guarda la diferencia de posición entre el anterior y el
// nuevo y la reduce a cero en FOCUS_BLEND_SECONDS, sumándola al objetivo de la cámara: el encuadre
// se desliza en vez de saltar. Si la diferencia supera FOCUS_JUMP_METERS, el cambio es inmediato.
// En régimen normal no hay retraso: sin cambio de foco la diferencia es cero.

export const FOCUS_BLEND_SECONDS = 0.3;
export const FOCUS_JUMP_METERS = 50;

/** Sin transición en curso. */
export const NO_BLEND = Object.freeze({ offset: Object.freeze({ x: 0, y: 0 }), remaining: 0 });

/**
 * Transición al cambiar el foco de `from` a `to` (posiciones), partiendo de la transición actual:
 * el objetivo de la cámara no se mueve en el instante del cambio.
 */
export function retarget(blend, from, to) {
  const offset = { x: from.x + blend.offset.x - to.x, y: from.y + blend.offset.y - to.y };
  if (Math.hypot(offset.x, offset.y) > FOCUS_JUMP_METERS) return NO_BLEND;
  return { offset, remaining: FOCUS_BLEND_SECONDS };
}

/** Avanza la transición `dt` segundos reales: la diferencia baja en línea recta hasta cero. */
export function advanceBlend(blend, dt) {
  if (blend.remaining <= 0) return NO_BLEND;
  const left = blend.remaining - Math.max(0, dt);
  if (left <= 1e-9) return NO_BLEND; // tolerancia: 18 cuadros de 1/60 s completan los 0,3 s
  const k = left / blend.remaining;
  return { offset: { x: blend.offset.x * k, y: blend.offset.y * k }, remaining: left };
}

/** Objetivo de la cámara: la posición del auto seguido más la diferencia que queda. */
export const blendTarget = (position, blend) => ({ x: position.x + blend.offset.x, y: position.y + blend.offset.y });

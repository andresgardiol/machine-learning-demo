// Cámara del escenario: posición, zoom e indicador de seguimiento (design.md D8).
//
// Trabaja en metros (mundo, ejes matemáticos con y hacia arriba) y píxeles CSS (pantalla,
// y hacia abajo): al pasar a pantalla se invierte y. El zoom es cuántos píxeles mide un metro.
// Al seguir al auto, este queda en un punto fijo de la pantalla (`anchor`, en fracciones del
// ancho y del alto), corrido hacia atrás para dejar más pista a la vista por delante.

export const CAMERA_DEFAULTS = Object.freeze({
  zoom: 8, // px por metro
  minZoom: 2,
  maxZoom: 40,
  anchor: Object.freeze({ x: 0.3, y: 0.5 }),
  step: 1.25, // factor de los botones de acercar y alejar
});

export function createCamera(options = {}) {
  const cfg = { ...CAMERA_DEFAULTS, ...options };
  let center = { x: 0, y: 0 };
  let zoom = cfg.zoom;
  let following = true;
  let anchor = { ...cfg.anchor };

  const clampZoom = (z) => Math.min(Math.max(z, cfg.minZoom), cfg.maxZoom);

  function worldToScreen(p, vp) {
    return { x: (p.x - center.x) * zoom + vp.width / 2, y: -(p.y - center.y) * zoom + vp.height / 2 };
  }

  function screenToWorld(s, vp) {
    return { x: (s.x - vp.width / 2) / zoom + center.x, y: -(s.y - vp.height / 2) / zoom + center.y };
  }

  /** Mueve el centro para que el punto de mundo `p` quede en el punto de pantalla `s`. */
  function place(p, s, vp) {
    center = { x: p.x - (s.x - vp.width / 2) / zoom, y: p.y + (s.y - vp.height / 2) / zoom };
  }

  /** Si sigue al auto, lo ubica en su punto fijo de la pantalla. */
  function update(target, vp) {
    if (following && target) place(target, { x: anchor.x * vp.width, y: anchor.y * vp.height }, vp);
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
    center = { x: center.x - dx / zoom, y: center.y + dy / zoom };
    following = false;
  }

  /** Restablecer la vista: vuelve a seguir al auto con el zoom por defecto. */
  function reset() {
    zoom = cfg.zoom;
    anchor = { ...cfg.anchor };
    following = true;
  }

  /** Vuelve a seguir al auto (por ejemplo al reiniciar la simulación), sin tocar el zoom. */
  function follow() {
    anchor = { ...cfg.anchor };
    following = true;
  }

  /** Rectángulo de mundo visible. */
  function visibleBounds(vp) {
    const a = screenToWorld({ x: 0, y: 0 }, vp);
    const b = screenToWorld({ x: vp.width, y: vp.height }, vp);
    return { minX: Math.min(a.x, b.x), maxX: Math.max(a.x, b.x), minY: Math.min(a.y, b.y), maxY: Math.max(a.y, b.y) };
  }

  return {
    worldToScreen, screenToWorld, update, zoomAt, zoomBy, pan, reset, follow, visibleBounds,
    get zoom() { return zoom; },
    get center() { return { ...center }; },
    get following() { return following; },
    get anchor() { return { ...anchor }; },
    get limits() { return { min: cfg.minZoom, max: cfg.maxZoom, default: cfg.zoom, step: cfg.step }; },
  };
}

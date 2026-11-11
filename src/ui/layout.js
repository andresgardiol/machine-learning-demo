// Ancho del panel derecho, ajustable arrastrando su borde (como en un IDE). Sin DOM.

export const PANEL_WIDTH = Object.freeze({
  default: 360, // px
  min: 300,
  maxFraction: 0.5, // como mucho, la mitad de la ventana
  step: 16, // con las flechas del teclado
});

/** Ancho máximo del panel para una ventana dada (nunca menor que el mínimo). */
export const maxPanelWidth = (windowWidth) => Math.max(PANEL_WIDTH.min, Math.floor(windowWidth * PANEL_WIDTH.maxFraction));

/** Ancho válido: redondeado y dentro de [mínimo, mitad de la ventana]. Un valor inválido usa el de por defecto. */
export function clampPanelWidth(width, windowWidth) {
  const n = Number(width);
  const w = Number.isFinite(n) ? Math.round(n) : PANEL_WIDTH.default;
  return Math.min(Math.max(w, PANEL_WIDTH.min), maxPanelWidth(windowWidth));
}

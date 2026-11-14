// Anchos de las zonas de la disposición común, ajustables arrastrando sus bordes (como en un IDE). Sin DOM.

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

// --- Tres zonas: escenario, tablero y panel (design.md D2) --------------------------------------
// Las preferencias guardan lo que la persona eligió; fitZones solo decide lo que se muestra, así al
// agrandar la ventana vuelven los anchos elegidos. Arrastrar un borde nunca mueve el otro.

export const ZONES = Object.freeze({
  stage: Object.freeze({ default: 400, min: 260 }),
  board: Object.freeze({ min: 360 }),
  panel: Object.freeze({ default: 360, min: 300, maxFraction: 0.5 }),
  splitter: 6, // px de cada borde
  wideFrom: 960, // desde este ancho de ventana, tres columnas
  stackedBoard: 0.45, // fracción del alto para el tablero en "stacked"
  step: 16, // con las flechas del teclado
});

/** Disposición: 'plain' si la pestaña no usa el tablero; si no, 'wide' desde 960 px y 'stacked' por debajo. */
export function layoutMode(windowWidth, hasBoard) {
  if (!hasBoard) return 'plain';
  return windowWidth >= ZONES.wideFrom ? 'wide' : 'stacked';
}

/** Ancho útil para las tres zonas: la ventana menos los dos bordes. */
const freeWidth = (windowWidth) => windowWidth - 2 * ZONES.splitter;

/** Número redondeado, o el valor por defecto si no es válido. */
function widthOr(value, fallback) {
  const n = Number(value);
  return value !== null && value !== undefined && Number.isFinite(n) ? Math.round(n) : fallback;
}

/** Valor dentro de [min, max]; si el máximo queda por debajo del mínimo, manda el mínimo. */
const clamp = (v, min, max) => Math.max(min, Math.min(v, max));

/** Límites del panel al arrastrar su borde, con el escenario en `stage`. */
export function panelLimits(stage, windowWidth, spec = {}) {
  const half = Math.floor(windowWidth * ZONES.panel.maxFraction);
  return { min: ZONES.panel.min, max: Math.max(ZONES.panel.min, Math.min(half, freeWidth(windowWidth) - (spec.boardMin ?? ZONES.board.min) - stage)) };
}

/**
 * Límites del escenario al arrastrar su borde, con el panel en `panel`. Una pestaña puede pedir otro
 * mínimo para su zona izquierda (`spec.stageMin`, pestana-inspeccionar D1: la red no baja de 600 px).
 */
export function stageLimits(panel, windowWidth, spec = {}) {
  const min = spec.stageMin ?? ZONES.stage.min;
  return { min, max: Math.max(min, freeWidth(windowWidth) - (spec.boardMin ?? ZONES.board.min) - panel) };
}

/**
 * Anchos que se muestran para una ventana dada a partir de los elegidos: cede primero el tablero
 * (hasta 360), después el escenario (hasta 260) y por último el panel (hasta 300).
 * @param {{stage?:number|null, panel?:number|null}} preferred
 * @param {number} windowWidth
 * @param {{stageMin?:number, stageDefault?:number|'rest', boardMin?:number}} [spec] zonas propias de una pestaña
 * @returns {{stage:number, board:number, panel:number}}
 */
export function fitZones({ stage, panel } = {}, windowWidth, spec = {}) {
  // Una pestaña puede tener su propio mínimo y su propio ancho por defecto para la zona izquierda
  // (pestana-inspeccionar D1): 'rest' es todo lo que dejan el tablero en su mínimo y el panel.
  // Con su propio mínimo de tablero (spec.boardMin), el tablero cede antes que la zona izquierda y que
  // el panel; el ancho 'rest' se calcula con el tablero en su mínimo de siempre (360 px).
  const stageMin = spec.stageMin ?? ZONES.stage.min;
  const boardMin = spec.boardMin ?? ZONES.board.min;
  const F = freeWidth(windowWidth);
  const half = Math.floor(windowWidth * ZONES.panel.maxFraction);
  const p = clamp(widthOr(panel, ZONES.panel.default), ZONES.panel.min, Math.min(half, F - boardMin - stageMin));
  const stageDefault = spec.stageDefault === 'rest' ? F - ZONES.board.min - p : (spec.stageDefault ?? ZONES.stage.default);
  const s = clamp(widthOr(stage, stageDefault), stageMin, F - boardMin - p);
  return { stage: s, board: F - s - p, panel: p };
}

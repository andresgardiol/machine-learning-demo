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

/**
 * Disposición: 'plain' si la pestaña no usa el tablero; si no, 'wide' desde 960 px y 'stacked' por debajo.
 * Una pestaña sin panel (`spec.panel === false`, reglas-mesa-de-trabajo D1) queda siempre lado a lado:
 * por debajo de 600 px manda el aviso de pantalla angosta.
 */
export function layoutMode(windowWidth, hasBoard, spec = {}) {
  if (!hasBoard) return 'plain';
  if (spec.panel === false) return 'wide';
  return windowWidth >= ZONES.wideFrom ? 'wide' : 'stacked';
}

/** ¿La pestaña tiene panel? Solo Reglas a mano lo saca (reglas-mesa-de-trabajo D1). */
const hasPanel = (spec) => spec.panel !== false;

/** Ancho útil para las zonas: la ventana menos los bordes (dos con panel, uno sin él). */
const freeWidth = (windowWidth, spec = {}) => windowWidth - (hasPanel(spec) ? 2 : 1) * ZONES.splitter;

/** Número redondeado, o el valor por defecto si no es válido. */
function widthOr(value, fallback) {
  const n = Number(value);
  return value !== null && value !== undefined && Number.isFinite(n) ? Math.round(n) : fallback;
}

/** Valor dentro de [min, max]; si el máximo queda por debajo del mínimo, manda el mínimo. */
const clamp = (v, min, max) => Math.max(min, Math.min(v, max));

/**
 * Mínimo de la zona izquierda. Una pestaña puede pedir que ceda en una ventana angosta
 * (vista-de-la-red D18): con `stageFloor` y `boardKeep`, el mínimo es el menor entre `stageMin` y lo que
 * deja la ventana con el tablero en `boardKeep` y el panel en `panel`, sin bajar de `stageFloor`.
 */
export function stageMinFor(spec, windowWidth, panel) {
  const min = spec.stageMin ?? ZONES.stage.min;
  if (!spec.stageFloor) return min;
  return Math.max(spec.stageFloor, Math.min(min, freeWidth(windowWidth) - (spec.boardKeep ?? ZONES.board.min) - panel));
}

// --- La red al centro (red-al-centro D2) --------------------------------------------------------
// Inspeccionar y el Laboratorio declaran { stageDefault, stageKeep, stageMin, boardMin, boardFloor }: la
// zona izquierda (lo que la red mira) mide `stageDefault`; en una ventana angosta cede primero hasta
// `stageKeep` mientras la red conserva `boardMin`; después cede la red, hasta `boardFloor`; y al final la
// zona izquierda, hasta `stageMin`. El panel cede antes que todos, como siempre, sin bajar de su mínimo.

/** ¿La pestaña pone la red en la zona central (red-al-centro D2)? */
export const netInCenter = (spec = {}) => Number.isFinite(spec.boardFloor);

/** Límites de la zona izquierda con la red al centro, para el ancho útil `F` y el panel en `p`. */
function netStageRange(spec, F, p) {
  const max = Math.max(Math.min(spec.stageKeep, F - p - spec.boardFloor), F - p - spec.boardMin);
  const min = Math.max(spec.stageMin, Math.min(spec.stageKeep, max));
  return { min, max: Math.max(min, max) };
}

/** Límites del panel al arrastrar su borde, con el escenario en `stage`. Sin panel, 0 y 0. */
export function panelLimits(stage, windowWidth, spec = {}) {
  if (!hasPanel(spec)) return { min: 0, max: 0 };
  if (netInCenter(spec)) {
    const half = Math.floor(windowWidth * ZONES.panel.maxFraction);
    return { min: ZONES.panel.min, max: Math.max(ZONES.panel.min, Math.min(half, freeWidth(windowWidth) - spec.boardMin - stage)) };
  }
  const half = Math.floor(windowWidth * ZONES.panel.maxFraction);
  return { min: ZONES.panel.min, max: Math.max(ZONES.panel.min, Math.min(half, freeWidth(windowWidth) - (spec.boardMin ?? ZONES.board.min) - stage)) };
}

/**
 * Límites del escenario al arrastrar su borde, con el panel en `panel`. Una pestaña puede pedir otro
 * mínimo para su zona izquierda (`spec.stageMin`, pestana-inspeccionar D1: la red no baja de 600 px).
 */
export function stageLimits(panel, windowWidth, spec = {}) {
  if (netInCenter(spec)) return netStageRange(spec, freeWidth(windowWidth), panel);
  const p = hasPanel(spec) ? panel : 0; // sin panel, el ancho del panel guardado no cuenta
  const min = stageMinFor(spec, windowWidth, p);
  return { min, max: Math.max(min, freeWidth(windowWidth, spec) - (spec.boardMin ?? ZONES.board.min) - p) };
}

/**
 * Anchos que se muestran para una ventana dada a partir de los elegidos: cede primero el tablero
 * (hasta 360), después el escenario (hasta 260) y por último el panel (hasta 300).
 * @param {{stage?:number|null, panel?:number|null}} preferred
 * @param {number} windowWidth
 * Sin panel (`spec.panel === false`, reglas-mesa-de-trabajo D1), el panel vale 0 y el ancho de panel
 * recibido no se usa ni se toca: escenario y tablero se reparten la ventana menos un borde.
 * @param {{panel?:false, stageMin?:number, stageDefault?:number|'rest', boardMin?:number}} [spec] zonas propias de una pestaña
 * @returns {{stage:number, board:number, panel:number}}
 */
export function fitZones({ stage, panel } = {}, windowWidth, spec = {}) {
  if (!hasPanel(spec)) {
    const F = freeWidth(windowWidth, spec);
    const min = spec.stageMin ?? ZONES.stage.min;
    const s = clamp(widthOr(stage, spec.stageDefault ?? ZONES.stage.default), min, F - (spec.boardMin ?? ZONES.board.min));
    return { stage: s, board: F - s, panel: 0 };
  }
  if (netInCenter(spec)) {
    const F = freeWidth(windowWidth);
    const half = Math.floor(windowWidth * ZONES.panel.maxFraction);
    const p = clamp(widthOr(panel, ZONES.panel.default), ZONES.panel.min, Math.min(half, F - spec.boardMin - spec.stageKeep));
    const { min, max } = netStageRange(spec, F, p);
    const s = clamp(widthOr(stage, spec.stageDefault), min, max);
    return { stage: s, board: F - s - p, panel: p };
  }
  // Una pestaña puede tener su propio mínimo y su propio ancho por defecto para la zona izquierda
  // (pestana-inspeccionar D1): 'rest' es todo lo que dejan el tablero en su mínimo y el panel.
  // Con su propio mínimo de tablero (spec.boardMin), el tablero cede antes que la zona izquierda y que
  // el panel; el ancho 'rest' se calcula con el tablero en su mínimo de siempre (360 px).
  const boardMin = spec.boardMin ?? ZONES.board.min;
  const F = freeWidth(windowWidth);
  const half = Math.floor(windowWidth * ZONES.panel.maxFraction);
  // El panel cede primero, como siempre; después, si la pestaña lo pide, la zona izquierda (D18).
  const p = clamp(widthOr(panel, ZONES.panel.default), ZONES.panel.min, Math.min(half, F - boardMin - (spec.stageMin ?? ZONES.stage.min)));
  const stageMin = stageMinFor(spec, windowWidth, p);
  const stageDefault = spec.stageDefault === 'rest' ? F - ZONES.board.min - p : (spec.stageDefault ?? ZONES.stage.default);
  const s = clamp(widthOr(stage, stageDefault), stageMin, F - boardMin - p);
  return { stage: s, board: F - s - p, panel: p };
}

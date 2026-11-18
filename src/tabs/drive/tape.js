// La cinta del manejo de El problema (manejo-amable D2), sin DOM: los últimos 10 s, un cuadro por columna, con lo que
// percibía el auto (una fila por sensor y la de la velocidad) y lo que se accionó (las cuatro acciones). Se prueba en
// Node. El dibujo (index.js) pide las columnas que entran en su ancho y el reparto del alto entre las filas.

/** Cuadros que guarda la cinta: 10 s a 60 por segundo. */
export const TAPE_FRAMES = 600;
/** Hasta cuántos sensores las filas llevan nombre. */
export const TAPE_NAMED_MAX = 12;
/** Alto mínimo de la cinta (px). */
export const TAPE_MIN_HEIGHT = 80;
const ACTIONS = Object.freeze(['forward', 'reverse', 'left', 'right']);

/**
 * Memoria circular de cuadros: { sensors: number[], speed: number, controls: {forward, reverse, left, right} }.
 * Al chocar se congela (`freeze`): no guarda más hasta vaciarla.
 */
export function createTape(capacity = TAPE_FRAMES) {
  let frames = [];
  let frozen = false;
  return {
    push(frame) {
      if (frozen) return false;
      frames.push({ sensors: [...frame.sensors], speed: frame.speed, controls: Object.fromEntries(ACTIONS.map((a) => [a, Boolean(frame.controls?.[a])])) });
      if (frames.length > capacity) frames.splice(0, frames.length - capacity);
      return true;
    },
    /** El auto chocó: la cinta deja de avanzar y la última columna lleva la marca. */
    freeze() { frozen = true; },
    /** Reiniciar: vacía la cinta. */
    clear() { frames = []; frozen = false; },
    get frames() { return frames; },
    get frozen() { return frozen; },
    get length() { return frames.length; },
    get capacity() { return capacity; },
  };
}

/**
 * Columnas para un ancho de `width` píxeles: con 600 cuadros o menos que píxeles, una columna por cuadro (alineadas a
 * la derecha, la más nueva en el borde); con más cuadros que píxeles, cada columna junta varios: la percepción toma el
 * promedio y cada acción se enciende si estuvo en "sí" en alguno.
 * @returns {{columns: {sensors:number[], speed:number, controls:object, from:number, to:number}[], perColumn:number}}
 */
export function tapeColumns(frames, width, capacity = TAPE_FRAMES) {
  const w = Math.max(1, Math.floor(width));
  const perColumn = Math.max(1, Math.ceil(capacity / w));
  const columns = [];
  // De derecha a izquierda, de a `perColumn` cuadros, así la columna más nueva siempre es la última.
  for (let end = frames.length; end > 0; end -= perColumn) {
    const from = Math.max(0, end - perColumn);
    const group = frames.slice(from, end);
    const n = group.length;
    const count = group[0].sensors.length;
    const sensors = Array.from({ length: count }, (_, i) => group.reduce((s, f) => s + (f.sensors[i] ?? 0), 0) / n);
    const speed = group.reduce((s, f) => s + f.speed, 0) / n;
    const controls = Object.fromEntries(ACTIONS.map((a) => [a, group.some((f) => f.controls[a])]));
    columns.unshift({ sensors, speed, controls, from, to: end - 1 });
  }
  return { columns, perColumn };
}

/**
 * Reparto del alto entre las filas: una por sensor y la de la velocidad, un renglón de separación y las cuatro
 * acciones. Las acciones conservan su alto (el 11 % del alto, entre 13 y 18 px cada una); los sensores se reparten
 * lo que queda. Con más de 12 sensores, las filas de percepción no llevan nombre.
 * @returns {{rows: {kind:'sensor'|'speed'|'gap'|'action', index:number, y:number, h:number}[], named:boolean}}
 */
export function tapeRows(sensorCount, height) {
  const H = Math.max(TAPE_MIN_HEIGHT, height);
  const actionH = Math.max(13, Math.min(18, Math.floor(H * 0.11)));
  const gap = 6;
  const percRows = sensorCount + 1;
  const percH = (H - gap - 4 * actionH) / percRows;
  const rows = [];
  let y = 0;
  for (let i = 0; i < sensorCount; i++) { rows.push({ kind: 'sensor', index: i, y, h: percH }); y += percH; }
  rows.push({ kind: 'speed', index: sensorCount, y, h: percH }); y += percH;
  rows.push({ kind: 'gap', index: -1, y, h: gap }); y += gap;
  ACTIONS.forEach((a, i) => { rows.push({ kind: 'action', index: i, action: a, y, h: actionH }); y += actionH; });
  return { rows, named: sensorCount <= TAPE_NAMED_MAX, height: H };
}

export const TAPE_ACTIONS = ACTIONS;

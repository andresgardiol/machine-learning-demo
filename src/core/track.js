// Pista: línea central (polilínea), ancho total y carriles de igual ancho.
// Sirve igual para la calle recta y para circuitos con curvas, abiertos o cerrados (design.md D1).
import { add, sub, scale, length as vlen, normalize, leftOf, dot, cross, distance } from './geometry.js';
import { ALLOWED_LANES, DEFAULT_LANES, LANE_WIDTH, STREET_LENGTH } from './constants.js';

/** Error de la pista con un código y datos para que la interfaz lo explique en su idioma. */
export class TrackError extends Error {
  constructor(code, details = {}) {
    super(`${code}: ${JSON.stringify(details)}`);
    this.name = 'TrackError';
    this.code = code;
    this.details = details;
  }
}

const SEARCH_WINDOW = 3;

// Grilla de los bordes (solo para pistas con muchos tramos): lado de cada celda, en metros.
const GRID_MIN_SEGMENTS = 16;
const GRID_CELL = 16;

/** Grilla de celdas cuadradas con los índices de los tramos de borde cuyo recuadro las toca. */
function buildGrid(borderSegments) {
  const cells = new Map();
  const key = (cx, cy) => `${cx},${cy}`;
  borderSegments.forEach(([a, b], i) => {
    const x0 = Math.floor(Math.min(a.x, b.x) / GRID_CELL);
    const x1 = Math.floor(Math.max(a.x, b.x) / GRID_CELL);
    const y0 = Math.floor(Math.min(a.y, b.y) / GRID_CELL);
    const y1 = Math.floor(Math.max(a.y, b.y) / GRID_CELL);
    for (let cx = x0; cx <= x1; cx++) {
      for (let cy = y0; cy <= y1; cy++) {
        const k = key(cx, cy);
        if (!cells.has(k)) cells.set(k, []);
        cells.get(k).push(i);
      }
    }
  });
  return {
    /** Índices, en orden y sin repetir, de los tramos de las celdas que toca el recuadro dado. */
    candidates(minX, minY, maxX, maxY) {
      const found = new Set();
      for (let cx = Math.floor(minX / GRID_CELL); cx <= Math.floor(maxX / GRID_CELL); cx++) {
        for (let cy = Math.floor(minY / GRID_CELL); cy <= Math.floor(maxY / GRID_CELL); cy++) {
          const list = cells.get(key(cx, cy));
          if (list) for (const i of list) found.add(i);
        }
      }
      return [...found].sort((x, y) => x - y);
    },
  };
}

/**
 * Crea una pista. Carril 0 = el más a la izquierda mirando hacia adelante.
 * Las distancias sobre la línea central (progreso, centro de carril) se miden desde la línea de
 * salida. `start` es la distancia del primer punto respecto de ella: 0 si la pista empieza en la
 * salida, negativa si continúa por detrás (como la calle recta, para que no se pueda salir de
 * ella retrocediendo).
 *
 * Con `closed: true` la pista es cerrada: el último punto se une con el primero con un tramo más
 * (si el último repite el primero, se descarta), la salida está en el primer punto (`start` es 0),
 * `length` es el largo de una vuelta y las distancias se reducen a una vuelta. Los bordes son
 * contornos cerrados: su último punto repite el primero.
 * @param {{centerline: {x:number,y:number}[], width: number, lanes: number, start?: number, closed?: boolean}} spec
 */
export function createTrack({ centerline, width, lanes, start = 0, closed = false }) {
  if (!Array.isArray(centerline) || centerline.length < 2) throw new TrackError('CENTERLINE_TOO_SHORT');
  if (!(width > 0)) throw new TrackError('INVALID_WIDTH', { width });
  if (!Number.isInteger(lanes) || lanes < 1) throw new TrackError('INVALID_LANE_COUNT', { lanes });
  if (!Number.isFinite(start)) throw new TrackError('INVALID_START', { start });
  if (closed && start !== 0) throw new TrackError('INVALID_START', { start });

  const points = centerline.map((p) => ({ x: p.x, y: p.y }));
  if (closed && points.length > 1 && distance(points[0], points[points.length - 1]) < 1e-9) points.pop();
  if (closed && points.length < 3) throw new TrackError('CENTERLINE_TOO_SHORT');
  const half = width / 2;
  const n = points.length;
  // Vértice siguiente del tramo i (en una pista cerrada, el último vuelve al primero).
  const next = (i) => points[(i + 1) % n];
  const segmentCount = closed ? n : n - 1;

  // Tramos: dirección, normal izquierda y distancia (desde la línea de salida) de su inicio.
  const segments = [];
  let total = 0;
  for (let i = 0; i < segmentCount; i++) {
    const delta = sub(next(i), points[i]);
    const len = vlen(delta);
    if (len === 0) throw new TrackError('ZERO_LENGTH_SEGMENT', { index: i });
    const dir = normalize(delta);
    segments.push({ a: points[i], b: next(i), dir, normal: leftOf(dir), len, start: start + total });
    total += len;
  }

  // Curvas demasiado cerradas: el borde interior se cruzaría consigo mismo.
  // En cada vértice el borde interior se recorta (half * tan(giro / 2)) sobre ambos tramos;
  // si la suma de recortes de un tramo supera su largo, los bordes se cruzan.
  // Tramo que llega al vértice i (null en el primero de una pista abierta) y el que sale de él.
  const incoming = (i) => (i > 0 ? segments[i - 1] : closed ? segments[segmentCount - 1] : null);
  const outgoing = (i) => (i < segmentCount ? segments[i] : null);
  const cuts = new Array(n).fill(0);
  for (let i = 0; i < n; i++) {
    const s0 = incoming(i);
    const s1 = outgoing(i);
    if (!s0 || !s1) continue;
    const turn = Math.atan2(cross(s0.dir, s1.dir), dot(s0.dir, s1.dir));
    if (Math.abs(turn) >= Math.PI - 1e-6) throw new TrackError('CURVE_TOO_TIGHT', { vertex: i });
    cuts[i] = half * Math.tan(Math.abs(turn) / 2);
  }
  segments.forEach((s, i) => {
    const j = (i + 1) % n;
    if (cuts[i] + cuts[j] > s.len + 1e-9) throw new TrackError('CURVE_TOO_TIGHT', { vertex: cuts[i] >= cuts[j] ? i : j });
  });

  /**
   * Puntos de la polilínea desplazada `offset` metros a la izquierda (negativo = derecha), con unión
   * en inglete en cada vértice. En una pista cerrada, el contorno termina repitiendo su primer punto.
   */
  function offsetPoints(offset) {
    const out = points.map((p, i) => {
      const s0 = incoming(i);
      const s1 = outgoing(i);
      if (!s0) return add(p, scale(s1.normal, offset));
      if (!s1) return add(p, scale(s0.normal, offset));
      const miter = normalize(add(s0.normal, s1.normal));
      const cosHalf = dot(miter, s0.normal);
      return add(p, scale(miter, offset / cosHalf));
    });
    if (closed) out.push({ ...out[0] });
    return out;
  }

  const leftBorder = offsetPoints(half);
  const rightBorder = offsetPoints(-half);
  const toSegments = (pts) => pts.slice(0, -1).map((p, i) => [p, pts[i + 1]]);
  const borderSegments = [...toSegments(leftBorder), ...toSegments(rightBorder)];

  const laneWidth = width / lanes;
  const laneIndexes = Array.from({ length: lanes }, (_, i) => i);

  /** Distancia reducida a la pista: en una cerrada, a una vuelta [0, length); en una abierta, a su tramo. */
  const reduce = (distanceOnLine) => {
    if (!closed) return Math.min(Math.max(distanceOnLine, start), start + total);
    const d = distanceOnLine % total;
    return d < 0 ? d + total : d;
  };

  const segmentAt = (distanceOnLine) => {
    const d = reduce(distanceOnLine);
    let lo = 0;
    let hi = segments.length - 1;
    while (lo < hi) {
      const mid = (lo + hi + 1) >> 1;
      if (segments[mid].start <= d) lo = mid;
      else hi = mid - 1;
    }
    return { seg: segments[lo], index: lo, d };
  };

  /** Posición y ángulo sobre la línea central a `distanceOnLine` metros de la línea de salida. */
  function pointAt(distanceOnLine) {
    const { seg, index, d } = segmentAt(distanceOnLine);
    return { position: add(seg.a, scale(seg.dir, d - seg.start)), angle: Math.atan2(seg.dir.y, seg.dir.x), segmentIndex: index };
  }

  /** Desplazamiento lateral (positivo a la izquierda) del centro del carril `lane`. */
  function laneOffset(lane) {
    if (!Number.isInteger(lane) || lane < 0 || lane >= lanes) throw new TrackError('INVALID_LANE', { lane, available: laneIndexes });
    return half - (lane + 0.5) * laneWidth;
  }

  /** Posición y orientación del centro del carril `lane` a `distanceOnLine` metros sobre la línea central. */
  function laneCenter(lane, distanceOnLine) {
    const offset = laneOffset(lane);
    const { seg, index, d } = segmentAt(distanceOnLine);
    const onLine = add(seg.a, scale(seg.dir, d - seg.start));
    return { position: add(onLine, scale(seg.normal, offset)), angle: Math.atan2(seg.dir.y, seg.dir.x), segmentIndex: index };
  }

  function project(p, seg) {
    const t = Math.min(Math.max(dot(sub(p, seg.a), seg.dir), 0), seg.len);
    const foot = add(seg.a, scale(seg.dir, t));
    return { t, dist: distance(p, foot), foot };
  }

  /**
   * Progreso de `position`: distancia sobre la línea central desde la línea de salida (negativa
   * por detrás de ella), sin contar
   * movimientos laterales. La búsqueda empieza en `hintSegment` (último tramo conocido).
   * Devuelve también el desplazamiento lateral (positivo a la izquierda) y el tramo hallado.
   */
  function progressOf(position, hintSegment = 0) {
    const hint = Math.min(Math.max(hintSegment, 0), segments.length - 1);
    let best = null;
    const consider = (i) => {
      const pr = project(position, segments[i]);
      if (best === null || pr.dist < best.dist) best = { ...pr, index: i };
    };
    if (closed) {
      // En una pista cerrada la ventana de búsqueda pasa por el tramo de cierre.
      const m = segments.length;
      for (let k = -SEARCH_WINDOW; k <= SEARCH_WINDOW; k++) consider((((hint + k) % m) + m) % m);
    } else {
      const from = Math.max(0, hint - SEARCH_WINDOW);
      const to = Math.min(segments.length - 1, hint + SEARCH_WINDOW);
      for (let i = from; i <= to; i++) consider(i);
    }
    if (best.dist > width) for (let i = 0; i < segments.length; i++) consider(i);
    const seg = segments[best.index];
    let progress = seg.start + best.t;
    if (closed && progress >= total) progress -= total;
    return {
      progress,
      lateral: dot(sub(position, best.foot), seg.normal),
      segmentIndex: best.index,
    };
  }

  const boxNear = ([a, b], p, radius) => (
    Math.max(a.x, b.x) >= p.x - radius && Math.min(a.x, b.x) <= p.x + radius
    && Math.max(a.y, b.y) >= p.y - radius && Math.min(a.y, b.y) <= p.y + radius
  );

  // Con muchos tramos de borde (un circuito), una grilla de celdas evita recorrerlos todos en cada
  // consulta. Devuelve exactamente los mismos tramos, en el mismo orden, que recorrerlos todos.
  const grid = borderSegments.length > GRID_MIN_SEGMENTS ? buildGrid(borderSegments) : null;

  /** Segmentos de borde cuyo recuadro queda a menos de `radius` de `p` (consulta "obstáculos cerca de"). */
  function bordersNear(p, radius) {
    if (!grid) return borderSegments.filter((s) => boxNear(s, p, radius));
    const indexes = grid.candidates(p.x - radius, p.y - radius, p.x + radius, p.y + radius);
    const out = [];
    for (const i of indexes) if (boxNear(borderSegments[i], p, radius)) out.push(borderSegments[i]);
    return out;
  }

  return Object.freeze({
    centerline: points, width, lanes, laneWidth, length: total, start, end: start + total, closed,
    leftBorder, rightBorder, borderSegments, segments,
    pointAt, laneCenter, progressOf, bordersNear,
  });
}

/**
 * Calle recta de 2, 3 o 4 carriles (3 por defecto) a lo largo de +x. La línea de salida está en
 * x = 0 y la calle sigue `length` metros hacia adelante y otros tantos hacia atrás, así retroceder
 * desde la salida no saca al auto de la calle.
 */
export function createStraightStreet({ lanes = DEFAULT_LANES, laneWidth = LANE_WIDTH, length = STREET_LENGTH } = {}) {
  if (!ALLOWED_LANES.includes(lanes)) throw new TrackError('INVALID_LANE_COUNT', { lanes, allowed: [...ALLOWED_LANES] });
  return createTrack({ centerline: [{ x: -length, y: 0 }, { x: length, y: 0 }], width: lanes * laneWidth, lanes, start: -length });
}

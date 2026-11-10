// Pista: línea central (polilínea), ancho total y carriles de igual ancho.
// Sirve igual para la calle recta y para circuitos abiertos con curvas.
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

/**
 * Crea una pista. Carril 0 = el más a la izquierda mirando hacia adelante.
 * @param {{centerline: {x:number,y:number}[], width: number, lanes: number}} spec
 */
export function createTrack({ centerline, width, lanes }) {
  if (!Array.isArray(centerline) || centerline.length < 2) throw new TrackError('CENTERLINE_TOO_SHORT');
  if (!(width > 0)) throw new TrackError('INVALID_WIDTH', { width });
  if (!Number.isInteger(lanes) || lanes < 1) throw new TrackError('INVALID_LANE_COUNT', { lanes });

  const points = centerline.map((p) => ({ x: p.x, y: p.y }));
  const half = width / 2;

  // Tramos: dirección, normal izquierda y distancia acumulada de inicio.
  const segments = [];
  let total = 0;
  for (let i = 0; i < points.length - 1; i++) {
    const delta = sub(points[i + 1], points[i]);
    const len = vlen(delta);
    if (len === 0) throw new TrackError('ZERO_LENGTH_SEGMENT', { index: i });
    const dir = normalize(delta);
    segments.push({ a: points[i], b: points[i + 1], dir, normal: leftOf(dir), len, start: total });
    total += len;
  }

  // Curvas demasiado cerradas: el borde interior se cruzaría consigo mismo.
  // En cada vértice el borde interior se recorta (half * tan(giro / 2)) sobre ambos tramos;
  // si la suma de recortes de un tramo supera su largo, los bordes se cruzan.
  const cuts = new Array(points.length).fill(0);
  for (let i = 1; i < points.length - 1; i++) {
    const turn = Math.atan2(cross(segments[i - 1].dir, segments[i].dir), dot(segments[i - 1].dir, segments[i].dir));
    if (Math.abs(turn) >= Math.PI - 1e-6) throw new TrackError('CURVE_TOO_TIGHT', { vertex: i });
    cuts[i] = half * Math.tan(Math.abs(turn) / 2);
  }
  segments.forEach((s, i) => {
    if (cuts[i] + cuts[i + 1] > s.len + 1e-9) throw new TrackError('CURVE_TOO_TIGHT', { vertex: cuts[i] >= cuts[i + 1] ? i : i + 1 });
  });

  /** Puntos de la polilínea desplazada `offset` metros a la izquierda (negativo = derecha), con unión en inglete. */
  function offsetPoints(offset) {
    return points.map((p, i) => {
      if (i === 0) return add(p, scale(segments[0].normal, offset));
      if (i === points.length - 1) return add(p, scale(segments[i - 1].normal, offset));
      const n0 = segments[i - 1].normal;
      const n1 = segments[i].normal;
      const miter = normalize(add(n0, n1));
      const cosHalf = dot(miter, n0);
      return add(p, scale(miter, offset / cosHalf));
    });
  }

  const leftBorder = offsetPoints(half);
  const rightBorder = offsetPoints(-half);
  const toSegments = (pts) => pts.slice(0, -1).map((p, i) => [p, pts[i + 1]]);
  const borderSegments = [...toSegments(leftBorder), ...toSegments(rightBorder)];

  const laneWidth = width / lanes;
  const laneIndexes = Array.from({ length: lanes }, (_, i) => i);

  const segmentAt = (distanceOnLine) => {
    const d = Math.min(Math.max(distanceOnLine, 0), total);
    let lo = 0;
    let hi = segments.length - 1;
    while (lo < hi) {
      const mid = (lo + hi + 1) >> 1;
      if (segments[mid].start <= d) lo = mid;
      else hi = mid - 1;
    }
    return { seg: segments[lo], index: lo, d };
  };

  /** Posición y ángulo sobre la línea central a `distanceOnLine` metros del inicio. */
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
   * Progreso de `position`: distancia sobre la línea central desde el inicio, sin contar
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
    const from = Math.max(0, hint - SEARCH_WINDOW);
    const to = Math.min(segments.length - 1, hint + SEARCH_WINDOW);
    for (let i = from; i <= to; i++) consider(i);
    if (best.dist > width) for (let i = 0; i < segments.length; i++) consider(i);
    const seg = segments[best.index];
    return {
      progress: seg.start + best.t,
      lateral: dot(sub(position, best.foot), seg.normal),
      segmentIndex: best.index,
    };
  }

  /** Segmentos de borde cuyo recuadro queda a menos de `radius` de `p` (consulta "obstáculos cerca de"). */
  function bordersNear(p, radius) {
    return borderSegments.filter(([a, b]) => (
      Math.max(a.x, b.x) >= p.x - radius && Math.min(a.x, b.x) <= p.x + radius
      && Math.max(a.y, b.y) >= p.y - radius && Math.min(a.y, b.y) <= p.y + radius
    ));
  }

  return Object.freeze({
    centerline: points, width, lanes, laneWidth, length: total,
    leftBorder, rightBorder, borderSegments, segments,
    pointAt, laneCenter, progressOf, bordersNear,
  });
}

/** Calle recta de 2, 3 o 4 carriles (3 por defecto) a lo largo de +x. */
export function createStraightStreet({ lanes = DEFAULT_LANES, laneWidth = LANE_WIDTH, length = STREET_LENGTH } = {}) {
  if (!ALLOWED_LANES.includes(lanes)) throw new TrackError('INVALID_LANE_COUNT', { lanes, allowed: [...ALLOWED_LANES] });
  return createTrack({ centerline: [{ x: 0, y: 0 }, { x: length, y: 0 }], width: lanes * laneWidth, lanes });
}

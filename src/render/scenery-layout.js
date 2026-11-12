// Distribución del paisaje (circuitos-y-paisaje D9): qué hay alrededor de la pista y dónde. Sin DOM,
// solo cálculo; scenery.js lo dibuja. Es parte del dibujo, no del núcleo: nada de lo que se genera
// acá llega a la simulación (no choca y los sensores no lo ven).
//
// Calle recta: por celdas de STREET_CELL metros a lo largo de la calle, cada una función de la
// semilla del mundo y de su número (como los bloques del tráfico): veredas pegadas a los bordes,
// árboles más allá de las veredas y sendas peatonales que cruzan la calzada cada 150 a 400 m.
//
// Circuitos: una sola vez por circuito, con una semilla fija propia: pianitos en los tramos de radio
// menor que KERB_MAX_RADIUS, tribunas fuera de la pista, la línea de largada a cuadros y árboles que
// no quedan a menos de TREE_CLEARANCE metros de ningún borde ni sobre una tribuna.
import { deriveSeed, randomFor } from '../core/random.js';

export const STREET_CELL = 100; // m
export const SIDEWALK_WIDTH = 3; // m
export const TREE_DISTANCE = Object.freeze({ min: 6, max: 40 }); // del borde de la calle al centro del árbol (m)
export const TREE_RADIUS = Object.freeze({ min: 1.5, max: 3.5 }); // m
export const CROSSWALK = Object.freeze({ length: 4, spacing: 275, jitter: 62.5 }); // 275 ± 62,5 por senda: entre 150 y 400 m de una a otra
export const KERB = Object.freeze({ width: 1, block: 2 }); // franja por fuera del borde y largo de cada bloque (m)
export const KERB_MAX_RADIUS = 80; // m
export const STAND = Object.freeze({ length: 60, depth: 10, gap: 8 }); // tribuna y distancia al borde (m)
export const TREE_CLEARANCE = 5; // distancia mínima de un árbol (su copa) a cualquier borde de un circuito (m)
export const CHECKER = 1; // lado de cada cuadro de la línea de largada (m)

// Flujos de azar propios del paisaje, distintos de los del tráfico.
const STREET_STREAM = 0x5ce7;
const CROSSWALK_STREAM = 0xc205;
const CIRCUIT_SEED = 0x71ee5;

const TREES_PER_SIDE = Object.freeze({ min: 4, max: 9 }); // por celda de la calle y por lado

// --- Calle recta -----------------------------------------------------------------------------------

/** Posición (x) de la senda peatonal número `j`: cada CROSSWALK.spacing ± CROSSWALK.jitter metros. */
export function crosswalkAt(seed, j) {
  const r = randomFor(deriveSeed(seed, CROSSWALK_STREAM), j)();
  return j * CROSSWALK.spacing + (r * 2 - 1) * CROSSWALK.jitter;
}

/**
 * Paisaje de la celda `k` de la calle recta (de x = k·STREET_CELL a (k+1)·STREET_CELL), para una
 * calle de ancho `width` a lo largo de +x centrada en y = 0.
 * @returns {{index:number, x0:number, x1:number, sidewalks:object[], trees:object[], crosswalks:object[]}}
 *   sidewalks: rectángulos { x0, x1, y0, y1 }; trees: { x, y, r, tone }; crosswalks: { x0, x1, y0, y1 }.
 */
export function streetCell({ seed, width, index: k }) {
  const half = width / 2;
  const x0 = k * STREET_CELL;
  const x1 = x0 + STREET_CELL;
  const sidewalks = [
    { x0, x1, y0: half, y1: half + SIDEWALK_WIDTH },
    { x0, x1, y0: -half - SIDEWALK_WIDTH, y1: -half },
  ];
  const rnd = randomFor(deriveSeed(seed, STREET_STREAM), k);
  const trees = [];
  for (const side of [1, -1]) {
    const count = TREES_PER_SIDE.min + Math.floor(rnd() * (TREES_PER_SIDE.max - TREES_PER_SIDE.min + 1));
    for (let i = 0; i < count; i++) {
      const x = x0 + rnd() * STREET_CELL;
      const r = TREE_RADIUS.min + rnd() * (TREE_RADIUS.max - TREE_RADIUS.min);
      // Entre 6 y 40 m del borde, con la copa siempre fuera de la vereda.
      const d = Math.max(TREE_DISTANCE.min + rnd() * (TREE_DISTANCE.max - TREE_DISTANCE.min), SIDEWALK_WIDTH + r + 0.5);
      trees.push({ x, y: side * (half + d), r, tone: rnd() < 0.5 ? 0 : 1 });
    }
  }
  const crosswalks = [];
  const reach = CROSSWALK.spacing + CROSSWALK.jitter;
  for (let j = Math.floor((x0 - reach) / CROSSWALK.spacing); j <= Math.ceil((x1 + reach) / CROSSWALK.spacing); j++) {
    const at = crosswalkAt(seed, j);
    // Cada senda pertenece a la celda donde empieza.
    if (at >= x0 && at < x1) crosswalks.push({ x0: at, x1: at + CROSSWALK.length, y0: -half, y1: half });
  }
  return { index: k, x0, x1, sidewalks, trees, crosswalks };
}

/** Índices de las celdas de la calle que cruzan el tramo [from, to] (en x). */
export function streetCellsIn(from, to) {
  const out = [];
  for (let k = Math.floor(from / STREET_CELL); k <= Math.floor(to / STREET_CELL); k++) out.push(k);
  return out;
}

// --- Circuitos -------------------------------------------------------------------------------------

/** Radio de la línea central en el tramo `i` (el giro entre su vértice inicial y final); Infinity en una recta. */
function segmentRadius(track, i) {
  const n = track.segments.length;
  const prev = track.segments[(i - 1 + n) % n];
  const seg = track.segments[i];
  const next = track.segments[(i + 1) % n];
  const turn = (a, b) => Math.abs(Math.atan2(a.dir.x * b.dir.y - a.dir.y * b.dir.x, a.dir.x * b.dir.x + a.dir.y * b.dir.y));
  // Giro promedio en los dos extremos del tramo, repartido en su largo.
  const angle = (turn(prev, seg) + turn(seg, next)) / 2;
  return angle < 1e-9 ? Infinity : seg.len / angle;
}

/** Distancia de un punto a la línea central de la pista (al tramo más cercano). */
export function distanceToCenterline(track, p) {
  let best = Infinity;
  for (const s of track.segments) {
    const t = Math.min(Math.max((p.x - s.a.x) * s.dir.x + (p.y - s.a.y) * s.dir.y, 0), s.len);
    const d = Math.hypot(p.x - (s.a.x + s.dir.x * t), p.y - (s.a.y + s.dir.y * t));
    if (d < best) best = d;
  }
  return best;
}

/** Signo del giro de la pista: 1 si va en sentido antihorario (el exterior está a la derecha), -1 si no. */
function windingOf(track) {
  const pts = track.centerline;
  let area = 0;
  for (let i = 0; i < pts.length; i++) {
    const a = pts[i];
    const b = pts[(i + 1) % pts.length];
    area += a.x * b.y - b.x * a.y;
  }
  return area >= 0 ? 1 : -1;
}

/** Punto a `offset` metros a la izquierda (negativo: derecha) del vértice `i`, con la unión en inglete de los bordes. */
function offsetVertex(track, i, offset) {
  const c = track.centerline[i];
  const l = track.leftBorder[i];
  const k = offset / (track.width / 2);
  return { x: c.x + (l.x - c.x) * k, y: c.y + (l.y - c.y) * k };
}

/** Esquinas de un rectángulo centrado en `center`, a lo largo de `dir` (largo `length`) y de ancho `depth`. */
function rectangle(center, dir, length, depth) {
  const n = { x: -dir.y, y: dir.x };
  const hl = length / 2;
  const hd = depth / 2;
  return [
    { x: center.x + dir.x * hl + n.x * hd, y: center.y + dir.y * hl + n.y * hd },
    { x: center.x + dir.x * hl - n.x * hd, y: center.y + dir.y * hl - n.y * hd },
    { x: center.x - dir.x * hl - n.x * hd, y: center.y - dir.y * hl - n.y * hd },
    { x: center.x - dir.x * hl + n.x * hd, y: center.y - dir.y * hl + n.y * hd },
  ];
}

/** ¿El punto está dentro del polígono convexo (vértices en orden)? */
function insideConvex(p, poly) {
  let sign = 0;
  for (let i = 0; i < poly.length; i++) {
    const a = poly[i];
    const b = poly[(i + 1) % poly.length];
    const s = (b.x - a.x) * (p.y - a.y) - (b.y - a.y) * (p.x - a.x);
    if (s !== 0) {
      if (sign === 0) sign = Math.sign(s);
      else if (Math.sign(s) !== sign) return false;
    }
  }
  return true;
}

/** Distancia mínima entre un rectángulo (sus lados, muestreados cada metro) y la línea central. */
function rectangleClearance(track, corners) {
  let best = Infinity;
  for (let i = 0; i < corners.length; i++) {
    const a = corners[i];
    const b = corners[(i + 1) % corners.length];
    const len = Math.hypot(b.x - a.x, b.y - a.y);
    for (let s = 0; s <= len; s += 1) {
      const p = { x: a.x + ((b.x - a.x) * s) / len, y: a.y + ((b.y - a.y) * s) / len };
      best = Math.min(best, distanceToCenterline(track, p));
    }
  }
  return best;
}

/**
 * Tramo recto que contiene la línea de salida: distancias [desde, hasta] sobre la línea central
 * (desde puede ser negativa: la parte de la recta que queda antes de la salida).
 */
function startStraight(track) {
  const n = track.segments.length;
  const same = (a, b) => Math.abs(a.dir.x * b.dir.y - a.dir.y * b.dir.x) < 1e-9 && a.dir.x * b.dir.x + a.dir.y * b.dir.y > 0;
  const first = track.segments[0];
  let end = first.len;
  for (let i = 1; i < n && same(track.segments[i], first); i++) end += track.segments[i].len;
  let begin = 0;
  for (let i = n - 1; i > 0 && same(track.segments[i], first); i--) begin -= track.segments[i].len;
  return { begin, end };
}

const circuitCache = new Map();

/**
 * Paisaje de un circuito (siempre el mismo para el mismo circuito).
 * @param {object} track pista cerrada (ver track.js)
 * @param {string} id id del circuito, para la caché
 * @returns {{kerbs:object[], stands:object[], checkers:object[], trees:object[], bounds:object}}
 *   kerbs: cuadriláteros { points: [4], tone: 0|1, radius }; stands: { points: [4] };
 *   checkers: cuadrados { points: [4], tone }; trees: { x, y, r, tone }.
 */
export function circuitScenery(track, id = null) {
  if (id && circuitCache.has(id)) return circuitCache.get(id);
  const half = track.width / 2;
  const n = track.segments.length;
  const outer = -windingOf(track); // lado de afuera: -1 = derecha (pista antihoraria)

  // Pianitos: franja de KERB.width por fuera de cada borde, en bloques de KERB.block de dos colores.
  const kerbs = [];
  for (const side of [1, -1]) {
    let along = 0;
    for (let i = 0; i < n; i++) {
      const seg = track.segments[i];
      const radius = segmentRadius(track, i);
      if (radius < KERB_MAX_RADIUS) {
        const j = (i + 1) % n;
        const a0 = offsetVertex(track, i, side * half);
        const a1 = offsetVertex(track, j, side * half);
        const b0 = offsetVertex(track, i, side * (half + KERB.width));
        const b1 = offsetVertex(track, j, side * (half + KERB.width));
        // Bloques de KERB.block metros a lo largo del tramo.
        const pieces = Math.max(1, Math.round(seg.len / KERB.block));
        for (let p = 0; p < pieces; p++) {
          const t0 = p / pieces;
          const t1 = (p + 1) / pieces;
          const lerp = (u, v, t) => ({ x: u.x + (v.x - u.x) * t, y: u.y + (v.y - u.y) * t });
          kerbs.push({
            points: [lerp(a0, a1, t0), lerp(a0, a1, t1), lerp(b0, b1, t1), lerp(b0, b1, t0)],
            tone: Math.floor((along + ((t0 + t1) / 2) * seg.len) / KERB.block) % 2,
            radius,
            segment: i,
          });
        }
      }
      along += seg.len;
    }
  }

  // Tribunas: una junto a la recta de salida, del lado de afuera, y hasta dos más en curvas.
  const stands = [];
  const standAt = (distanceOnLine, side) => {
    const { position, angle } = track.pointAt(distanceOnLine);
    const dir = { x: Math.cos(angle), y: Math.sin(angle) };
    const normal = { x: -dir.y, y: dir.x };
    const off = side * (half + STAND.gap + STAND.depth / 2);
    const center = { x: position.x + normal.x * off, y: position.y + normal.y * off };
    return rectangle(center, dir, STAND.length, STAND.depth);
  };
  const clearOf = (corners) => rectangleClearance(track, corners) >= half + STAND.gap - 0.5
    && stands.every((s) => !corners.some((c) => insideConvex(c, s.points)) && !s.points.some((c) => insideConvex(c, corners)));
  const straight = startStraight(track);
  const main = standAt((straight.begin + straight.end) / 2, outer);
  if (clearOf(main)) stands.push({ points: main });
  // Curvas: el vértice del medio de cada curva cerrada, del lado de afuera de la curva.
  const curves = [];
  let inCurve = null;
  for (let i = 0; i <= n; i++) {
    const seg = track.segments[i % n];
    const tight = i < n && segmentRadius(track, i) < KERB_MAX_RADIUS;
    if (tight && !inCurve) inCurve = { from: seg.start, to: seg.start + seg.len, turn: 0 };
    if (tight) {
      inCurve.to = seg.start + seg.len;
      const next = track.segments[(i + 1) % n];
      inCurve.turn += Math.atan2(seg.dir.x * next.dir.y - seg.dir.y * next.dir.x, seg.dir.x * next.dir.x + seg.dir.y * next.dir.y);
    } else if (inCurve) { curves.push(inCurve); inCurve = null; }
  }
  // Las curvas más largas primero; el lado de afuera de una curva a la izquierda es la derecha.
  curves.sort((a, b) => (b.to - b.from) - (a.to - a.from) || a.from - b.from);
  for (const c of curves) {
    if (stands.length >= 3) break;
    const corners = standAt((c.from + c.to) / 2, c.turn > 0 ? -1 : 1);
    if (clearOf(corners)) stands.push({ points: corners });
  }

  // Línea de largada a cuadros: dos filas de cuadros de CHECKER metros, de borde a borde.
  const checkers = [];
  const { position: s0, angle: a0 } = track.pointAt(0);
  const dir = { x: Math.cos(a0), y: Math.sin(a0) };
  const normal = { x: -dir.y, y: dir.x };
  const columns = Math.round(track.width / CHECKER);
  for (let row = 0; row < 2; row++) {
    for (let col = 0; col < columns; col++) {
      const along = (row - 1) * CHECKER;
      const across = -half + col * CHECKER;
      const at = (u, v) => ({ x: s0.x + dir.x * u + normal.x * v, y: s0.y + dir.y * u + normal.y * v });
      checkers.push({
        points: [at(along, across), at(along + CHECKER, across), at(along + CHECKER, across + CHECKER), at(along, across + CHECKER)],
        tone: (row + col) % 2,
      });
    }
  }

  // Árboles: al azar en el recuadro del circuito más un margen, lejos de los bordes y de las tribunas.
  const pts = [...track.leftBorder, ...track.rightBorder];
  const margin = 80;
  const bounds = {
    minX: Math.min(...pts.map((p) => p.x)) - margin, maxX: Math.max(...pts.map((p) => p.x)) + margin,
    minY: Math.min(...pts.map((p) => p.y)) - margin, maxY: Math.max(...pts.map((p) => p.y)) + margin,
  };
  const rnd = randomFor(CIRCUIT_SEED, track.segments.length);
  const area = (bounds.maxX - bounds.minX) * (bounds.maxY - bounds.minY);
  const attempts = Math.round(area / 250);
  const trees = [];
  for (let i = 0; i < attempts; i++) {
    const t = {
      x: bounds.minX + rnd() * (bounds.maxX - bounds.minX),
      y: bounds.minY + rnd() * (bounds.maxY - bounds.minY),
      r: TREE_RADIUS.min + rnd() * (TREE_RADIUS.max - TREE_RADIUS.min),
      tone: rnd() < 0.5 ? 0 : 1,
    };
    if (distanceToCenterline(track, t) < half + TREE_CLEARANCE + t.r) continue;
    const near = (s) => s.points.some((c) => Math.hypot(c.x - t.x, c.y - t.y) < t.r + 2) || insideConvex(t, s.points)
      || rectangleClearanceToPoint(s.points, t) < t.r + 2;
    if (stands.some(near)) continue;
    trees.push(t);
  }
  const out = Object.freeze({ kerbs, stands, checkers, trees, bounds });
  if (id) circuitCache.set(id, out);
  return out;
}

/** Distancia de un punto al contorno de un rectángulo. */
function rectangleClearanceToPoint(corners, p) {
  let best = Infinity;
  for (let i = 0; i < corners.length; i++) {
    const a = corners[i];
    const b = corners[(i + 1) % corners.length];
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const len2 = dx * dx + dy * dy;
    const t = Math.min(Math.max(((p.x - a.x) * dx + (p.y - a.y) * dy) / len2, 0), 1);
    best = Math.min(best, Math.hypot(p.x - (a.x + dx * t), p.y - (a.y + dy * t)));
  }
  return best;
}

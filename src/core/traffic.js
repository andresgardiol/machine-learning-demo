// Tráfico de la calle recta como función pura de (semilla, configuración, tiempo) (trafico-vivo D1).
//
// Cada carril es una corriente propia de vehículos que avanza a la velocidad del carril. El
// vehículo j del carril i tiene una distancia de base b_ij (la de su centro en el instante 0) y en
// el instante t está en b_ij + v_i·t. Nadie se choca dentro de un carril, porque todos van a la
// misma velocidad y entre dos consecutivos queda siempre el hueco mínimo.
//
// Cada carril se arma por bloques de TRAFFIC_BLOCK_VEHICLES vehículos, con su propio espacio de
// semillas. Un vehículo ocupa una casilla: su largo más el hueco que lo sigue. El hueco es el mínimo
// más una parte del sobrante, repartida con pesos que van de parejos (irregularidad 0) a
// exponenciales normalizados (100 %). El tipo, el zigzag y los pesos de cada vehículo salen solo de
// la semilla del bloque, así que no dependen de la densidad ni de la irregularidad. El largo de un
// bloque depende solo de los tipos de sus vehículos: los comienzos de bloque se acumulan una vez y
// se guardan, y cualquier vehículo sale de la semilla sin recorrer los vehículos anteriores.
//
// Las velocidades de los carriles dependen solo de la semilla y de la cantidad de carriles (D1, D2),
// en una sola función (laneSpeedsFor). Nada fuera de este archivo supone velocidades distintas:
// todo se pide a fastestSpeed, slowestSpeed, laneSpeeds y a la velocidad de cada vehículo (D11).
import { fromAngle, leftOf, add, scale, rectCorners } from './geometry.js';
import { deriveSeed, randomFor, createRandom } from './random.js';
import {
  CAR_LENGTH, MIN_LANE_GAP_CAR_LENGTHS, TRAFFIC_BLOCK_VEHICLES, TRAFFIC_FIRST_VEHICLE, TRAFFIC_LANE_STAGGER,
  TRAFFIC_MIN_SPACING, TRAFFIC_SPACING_RANGE, TRAFFIC_SPEEDS, VEHICLE_TYPES, ZIGZAG_MARGIN,
  ZIGZAG_MAX_TURN, ZIGZAG_PERIOD, TRAFFIC_PAINTS,
} from './constants.js';

export const DEFAULT_TRAFFIC = Object.freeze({ density: 50, irregularity: 50 });

/** Hueco mínimo entre dos vehículos consecutivos de un carril, de paragolpes a paragolpes (m). */
export const MIN_LANE_GAP = MIN_LANE_GAP_CAR_LENGTHS * CAR_LENGTH;
/** Largo del vehículo más largo (m). */
export const MAX_VEHICLE_LENGTH = Math.max(...VEHICLE_TYPES.map((t) => t.length));
/** Largo medio de un vehículo del tráfico, con las proporciones de cada tipo (m). */
export const MEAN_VEHICLE_LENGTH = VEHICLE_TYPES.reduce((a, t) => a + t.share * t.length, 0);

// Espacios de semillas: el de cada carril (LANE_STREAM + carril) y el de la permutación de velocidades.
const LANE_STREAM = 0x1a4e0;
const SPEED_STREAM = 0x5bed;
const PHASE_STREAM = 0x9a5e;
// Pintura de cada vehículo (vehiculos-ilustrados D8): un espacio propio por carril, así sumarla no cambia ningún
// otro sorteo (tipo, huecos, zigzag) de una semilla.
const PAINT_STREAM = 0x7a1c0;

/** Índice de pintura (0 a TRAFFIC_PAINTS − 1) del vehículo `index` del carril `lane` bajo `seed` (puro). */
export function paintFor(seed, lane, index) {
  return Math.floor(randomFor(deriveSeed(seed, PAINT_STREAM + lane), index)() * TRAFFIC_PAINTS);
}

const percent = (value, fallback) => {
  const n = Number(value ?? fallback);
  return Number.isFinite(n) ? Math.min(Math.max(n, 0), 100) : fallback;
};

/** Separación entre grupos del tráfico en filas (centro a centro) para una densidad; infinita si es 0. */
export function groupSpacing(density) {
  if (density <= 0) return Infinity;
  const f = density / 100;
  return TRAFFIC_MIN_SPACING + TRAFFIC_SPACING_RANGE * (1 - f) ** 1.5;
}

/**
 * Casilla media de un carril (largo más hueco, m) para una densidad y una cantidad de carriles (D4):
 * pone más o menos la misma cantidad de vehículos por kilómetro que el tráfico en filas.
 */
export function meanSlot(density, lanes) {
  if (density <= 0) return Infinity;
  const perGroup = 1 + (density / 100) * (lanes - 2);
  return (lanes * groupSpacing(density)) / perGroup;
}

/** Velocidades de los carriles: repartidas parejas en [min, max] y asignadas con una permutación sembrada (D2). */
export function laneSpeedsFor(seed, lanes) {
  const { min, max } = TRAFFIC_SPEEDS;
  const even = Array.from({ length: lanes }, (_, k) => (lanes === 1 ? max : min + ((max - min) * k) / (lanes - 1)));
  const rnd = createRandom(deriveSeed(seed, SPEED_STREAM + lanes));
  for (let i = even.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [even[i], even[j]] = [even[j], even[i]];
  }
  return even;
}

/** Tipo de vehículo para un número en [0, 1), con las proporciones de VEHICLE_TYPES. */
function typeFor(u) {
  let acc = 0;
  for (const t of VEHICLE_TYPES) {
    acc += t.share;
    if (u < acc) return t;
  }
  return VEHICLE_TYPES[VEHICLE_TYPES.length - 1];
}

/**
 * Amplitud máxima del zigzag (m) de un vehículo con irregularidad 100 %: la que deja su contorno,
 * girado ZIGZAG_MAX_TURN, a ZIGZAG_MARGIN del borde del carril (D5).
 */
export function zigzagAmplitude(laneWidth, length, width) {
  return Math.max(0, laneWidth / 2 - ZIGZAG_MARGIN - (width / 2) * Math.cos(ZIGZAG_MAX_TURN) - (length / 2) * Math.sin(ZIGZAG_MAX_TURN));
}

/**
 * Crea el tráfico de una pista.
 * @param {{seed:number, track:object, density?:number, irregularity?:number}} spec densidad e irregularidad en % (0 a 100)
 */
export function createTraffic({ seed, track, density = DEFAULT_TRAFFIC.density, irregularity = DEFAULT_TRAFFIC.irregularity }) {
  const d = percent(density, DEFAULT_TRAFFIC.density);
  const irr = percent(irregularity, DEFAULT_TRAFFIC.irregularity);
  const r = irr / 100;
  const lanes = track.lanes;
  const K = TRAFFIC_BLOCK_VEHICLES;
  const slot = meanSlot(d, lanes);
  // Sobrante medio por vehículo, después de su largo y del hueco mínimo. Nunca negativo: si la
  // densidad pidiera menos, el hueco mínimo manda y la densidad satura (D4).
  const spare = Number.isFinite(slot) ? Math.max(0, slot - MEAN_VEHICLE_LENGTH - MIN_LANE_GAP) : 0;
  const laneSpeeds = Object.freeze(laneSpeedsFor(seed, lanes));
  const fastestSpeed = Math.max(...laneSpeeds);
  const slowestSpeed = Math.min(...laneSpeeds);
  // Orden sorteado en que arrancan los carriles, escalonados de a TRAFFIC_LANE_STAGGER.
  const phaseRnd = createRandom(deriveSeed(seed, PHASE_STREAM + lanes));
  const order = laneSpeeds.map((_, i) => i);
  for (let i = order.length - 1; i > 0; i--) { const j = Math.floor(phaseRnd() * (i + 1)); [order[i], order[j]] = [order[j], order[i]]; }
  const laneStart = order.map((k) => TRAFFIC_FIRST_VEHICLE + k * TRAFFIC_LANE_STAGGER);
  const laneSeeds = laneSpeeds.map((_, i) => deriveSeed(seed, LANE_STREAM + i));
  const amplitudes = new Map(VEHICLE_TYPES.map((t) => [t.type, r * zigzagAmplitude(track.laneWidth, t.length, t.width)]));

  // Vehículos de un bloque en su orden: tipo, pesos y zigzag. Solo de la semilla (no de densidad ni irregularidad).
  const rawCache = new Map();
  function rawBlock(lane, b) {
    const key = lane * 1e7 + b;
    let raw = rawCache.get(key);
    if (raw) return raw;
    const rnd = randomFor(laneSeeds[lane], b);
    const types = Array.from({ length: K }, () => typeFor(rnd()));
    const periods = Array.from({ length: K }, () => ZIGZAG_PERIOD.min + rnd() * (ZIGZAG_PERIOD.max - ZIGZAG_PERIOD.min));
    const phases = Array.from({ length: K }, () => rnd() * 2 * Math.PI);
    const e = Array.from({ length: K }, () => -Math.log(1 - rnd()));
    const total = e.reduce((a, x) => a + x, 0);
    const lengthSum = types.reduce((a, t) => a + t.length, 0);
    raw = { types, periods, phases, e, total, lengthSum };
    if (rawCache.size >= 64) rawCache.delete(rawCache.keys().next().value);
    rawCache.set(key, raw);
    return raw;
  }

  // Comienzo (en el instante 0) de cada bloque de cada carril: se acumulan los largos una vez.
  const blockStarts = laneSpeeds.map((_, i) => [laneStart[i]]);
  const blockLength = (raw) => raw.lengthSum + K * (MIN_LANE_GAP + spare);
  function blockStart(lane, b) {
    const starts = blockStarts[lane];
    while (starts.length <= b) {
      const c = starts.length - 1;
      starts.push(starts[c] + blockLength(rawBlock(lane, c)));
    }
    return starts[b];
  }
  /** Primer bloque del carril cuyo final queda después de `base` (búsqueda en los comienzos guardados). */
  function blockAt(lane, base) {
    if (base < laneStart[lane]) return 0;
    const starts = blockStarts[lane];
    // Extiende hasta pasar `base` (el largo de un bloque es al menos K · hueco mínimo).
    while (starts[starts.length - 1] <= base) blockStart(lane, starts.length);
    let lo = 0;
    let hi = starts.length - 1;
    while (lo < hi) {
      const mid = (lo + hi + 1) >> 1;
      if (starts[mid] <= base) lo = mid; else hi = mid - 1;
    }
    return lo;
  }

  // Bases (centro en el instante 0) de los vehículos de un bloque.
  const blockCache = new Map();
  function block(lane, b) {
    const key = lane * 1e7 + b;
    let out = blockCache.get(key);
    if (out) return out;
    const raw = rawBlock(lane, b);
    out = new Array(K);
    let at = blockStart(lane, b);
    for (let k = 0; k < K; k++) {
      const t = raw.types[k];
      const w = (1 - r) + r * K * (raw.e[k] / raw.total);
      out[k] = {
        index: b * K + k, lane, base: at + t.length / 2, type: t.type, length: t.length, width: t.width,
        period: raw.periods[k], phase: raw.phases[k], paint: paintFor(seed, lane, b * K + k),
      };
      at += t.length + MIN_LANE_GAP + spare * w;
    }
    if (blockCache.size >= 16 * lanes) blockCache.delete(blockCache.keys().next().value);
    blockCache.set(key, out);
    return out;
  }

  /**
   * Vehículos del carril `lane` cuya base (centro en el instante 0) cae en [from, to], en orden.
   * Es el marco propio del carril: en el instante t, cada uno está en su base + laneSpeeds[lane]·t.
   */
  function laneBases(lane, from, to) {
    // Más allá del final de la pista no hay vehículos: acota consultas abiertas (to = Infinity).
    to = Math.min(to, track.end);
    if (d <= 0 || to < from) return [];
    const out = [];
    for (let b = blockAt(lane, from); ; b++) {
      if (blockStart(lane, b) - MAX_VEHICLE_LENGTH > to) break;
      for (const v of block(lane, b)) if (v.base >= from && v.base <= to) out.push(v);
    }
    return out;
  }

  /** Desvío lateral, velocidad lateral y giro de un vehículo en el instante t (D5). */
  function zigzag(v, t) {
    const A = amplitudes.get(v.type);
    if (A === 0) return { lateral: 0, turn: 0 };
    const w = (2 * Math.PI) / v.period;
    const phase = w * t + v.phase;
    const lateral = A * Math.sin(phase);
    const turn = Math.atan((A * w * Math.cos(phase)) / laneSpeeds[v.lane]);
    return { lateral, turn: Math.min(Math.max(turn, -ZIGZAG_MAX_TURN), ZIGZAG_MAX_TURN) };
  }

  /** Vehículo `v` (de laneBases) en el instante t, listo para dibujar, chocar y sensar. */
  function place(v, t) {
    const speed = laneSpeeds[v.lane];
    const distance = v.base + speed * t;
    const c = track.laneCenter(v.lane, distance);
    const { lateral, turn } = zigzag(v, t);
    const position = lateral === 0 ? c.position : add(c.position, scale(leftOf(fromAngle(c.angle)), lateral));
    const angle = c.angle + turn;
    return {
      id: `${v.lane}:${v.index}`, lane: v.lane, index: v.index, distance, base: v.base, lateral, turn,
      position, angle, speed, type: v.type, length: v.length, width: v.width, paint: v.paint,
      contour: rectCorners(position, angle, v.length, v.width),
    };
  }

  /** Vehículos en el instante `t` (s) cuya posición sobre la línea central cae en [from, to]. */
  function vehicles(t, from, to) {
    if (d <= 0) return [];
    const out = [];
    for (let lane = 0; lane < lanes; lane++) {
      const shift = laneSpeeds[lane] * t;
      for (const v of laneBases(lane, from - shift, to - shift)) {
        if (v.base + shift > track.end) continue;
        out.push(place(v, t));
      }
    }
    return out;
  }

  return Object.freeze({
    seed, density: d, irregularity: irr, lanes, slot, spare,
    laneSpeeds, fastestSpeed, slowestSpeed, maxLength: MAX_VEHICLE_LENGTH,
    laneBases, vehicles, place,
  });
}

/**
 * Cambia la configuración del tráfico en marcha, sin reiniciar (trafico-vivo D8).
 *
 * Cada carril se corta en su propio marco: el tráfico que ya existe se conserva por detrás de la
 * frontera de ese carril y el nuevo empieza MIN_LANE_GAP + MAX_VEHICLE_LENGTH más adelante, así en la
 * unión queda al menos el hueco mínimo con vehículos de cualquier largo. Las fronteras se miden en
 * el marco de cada carril (la base: la distancia en el instante 0), que avanza con él. Las
 * velocidades de los carriles no dependen de la densidad ni de la irregularidad, así que las dos
 * capas de un carril comparten marco. Cada cambio agrega una capa; las capas que ya no tienen tramo
 * propio en ningún carril se descartan.
 * @param {object} current tráfico actual (simple o ya cambiado)
 * @param {object} next tráfico con la configuración nueva (de createTraffic), con la misma semilla y carriles
 * @param {number[]|number} boundary por carril (o la misma para todos), base desde la que manda la configuración nueva
 */
export function changeTraffic(current, next, boundary) {
  const lanes = next.lanes;
  const bounds = Array.isArray(boundary) ? boundary : Array.from({ length: lanes }, () => boundary);
  const all = () => Array.from({ length: lanes });
  const previous = current.layers ?? [{ traffic: current, from: all().map(() => -Infinity), to: all().map(() => Infinity), prefix: '' }];
  const generation = (current.generation ?? 0) + 1;
  const layers = previous
    .map((l) => ({ ...l, to: l.to.map((x, i) => Math.min(x, bounds[i])) }))
    .filter((l) => l.from.some((x, i) => x < l.to[i]));
  layers.push({ traffic: next, from: bounds.map((x) => x + MIN_LANE_GAP + MAX_VEHICLE_LENGTH), to: all().map(() => Infinity), prefix: `${generation}~` });

  function vehicles(t, from, to) {
    const out = [];
    for (const l of layers) {
      for (const v of l.traffic.vehicles(t, from, to)) {
        if (v.base < l.from[v.lane] || v.base >= l.to[v.lane]) continue;
        out.push(l.prefix ? { ...v, id: l.prefix + v.id } : v);
      }
    }
    return out;
  }

  function laneBases(lane, from, to) {
    const out = [];
    for (const l of layers) {
      for (const v of l.traffic.laneBases(lane, Math.max(from, l.from[lane]), Math.min(to, l.to[lane]))) {
        if (v.base < l.to[lane]) out.push(l.prefix ? { ...v, layer: l.prefix } : v);
      }
    }
    return out;
  }

  return Object.freeze({
    seed: next.seed, density: next.density, irregularity: next.irregularity, lanes,
    slot: next.slot, spare: next.spare, laneSpeeds: next.laneSpeeds,
    fastestSpeed: next.fastestSpeed, slowestSpeed: next.slowestSpeed, maxLength: next.maxLength,
    generation, layers: Object.freeze(layers.map(Object.freeze)), vehicles, laneBases,
    place: (v, t) => {
      const l = layers.find((x) => x.prefix === (v.layer ?? '')) ?? layers[0];
      const p = l.traffic.place(v, t);
      return l.prefix ? { ...p, id: l.prefix + p.id } : p;
    },
  });
}

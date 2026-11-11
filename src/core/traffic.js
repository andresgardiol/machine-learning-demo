// Tráfico de la calle recta como función pura de (semilla, número de grupo, tiempo).
// Cada grupo se calcula solo a partir de la semilla y de su número, de modo que la
// disposición no depende de cómo maneje la persona (design.md D3).
//
// Las separaciones entre grupos se sortean por bloques de TRAFFIC_BLOCK_GROUPS grupos: cada
// bloque reparte su largo fijo en huecos al azar, todos por encima del mínimo. Así la distancia
// de cualquier grupo sale de la semilla sin recorrer los anteriores, y el promedio de las
// separaciones sigue siendo el que pide la densidad.
import { fromAngle, leftOf, add, scale, rectCorners } from './geometry.js';
import { deriveSeed, randomFor } from './random.js';
import {
  CAR_LENGTH, CAR_WIDTH, MIN_GROUP_GAP_CAR_LENGTHS, TRAFFIC_BLOCK_GROUPS, TRAFFIC_FIRST_GROUP,
  TRAFFIC_MAX_STAGGER, TRAFFIC_MIN_SPACING, TRAFFIC_SPACING_RANGE, TRAFFIC_SPEED,
} from './constants.js';

export const DEFAULT_TRAFFIC = Object.freeze({ density: 50, irregularity: 50 });

/** Separación mínima entre grupos consecutivos, centro a centro: el hueco exigido más el largo de un auto. */
export const MIN_GROUP_SPACING = (MIN_GROUP_GAP_CAR_LENGTHS + 1) * CAR_LENGTH;

// Espacio de semillas propio de los bloques, distinto del de los grupos.
const BLOCK_STREAM = 0xb10c;

const percent = (value, fallback) => {
  const n = Number(value ?? fallback);
  return Number.isFinite(n) ? Math.min(Math.max(n, 0), 100) : fallback;
};

/** Distancia promedio entre grupos (centro a centro) para una densidad en porcentaje; infinita si es 0. */
export function groupSpacing(density) {
  if (density <= 0) return Infinity;
  const f = density / 100;
  return TRAFFIC_MIN_SPACING + TRAFFIC_SPACING_RANGE * (1 - f) ** 1.5;
}

/**
 * Adelanto o atraso máximo (m) de un vehículo respecto de su grupo. Crece con la irregularidad y
 * se acota para que el mínimo entre grupos (que lo descuenta dos veces) quede por debajo del promedio.
 */
export function maxStagger(spacing, irregularity) {
  if (!Number.isFinite(spacing)) return 0;
  return (irregularity / 100) * Math.min(TRAFFIC_MAX_STAGGER, (spacing - MIN_GROUP_SPACING) / 6);
}

/**
 * Crea el tráfico de una pista.
 * @param {{seed:number, track:object, density?:number, irregularity?:number}} spec densidad e irregularidad en % (0 a 100)
 */
export function createTraffic({ seed, track, density = DEFAULT_TRAFFIC.density, irregularity = DEFAULT_TRAFFIC.irregularity }) {
  const d = percent(density, DEFAULT_TRAFFIC.density);
  const irr = percent(irregularity, DEFAULT_TRAFFIC.irregularity);
  const f = d / 100;
  const r = irr / 100;
  const spacing = groupSpacing(d);
  const lanes = track.lanes;
  const stagger = maxStagger(spacing, irr);
  // Hueco mínimo entre centros de grupos: con los adelantos, los vehículos más cercanos de dos
  // grupos consecutivos siguen quedando a MIN_GROUP_SPACING o más.
  const minGap = MIN_GROUP_SPACING + 2 * stagger;
  const blockLength = TRAFFIC_BLOCK_GROUPS * spacing;
  // Desvío lateral máximo dentro del carril sin sobresalir de él (con un 10 % de margen).
  const maxLateral = (r * (track.laneWidth - CAR_WIDTH) / 2) * 0.9;
  const blockSeed = deriveSeed(seed, BLOCK_STREAM);

  // Distancias (en el instante 0) de los grupos de un bloque. Se guardan los últimos bloques usados.
  const cache = new Map();
  function blockOffsets(b) {
    let offsets = cache.get(b);
    if (offsets) return offsets;
    const rnd = randomFor(blockSeed, b);
    const e = Array.from({ length: TRAFFIC_BLOCK_GROUPS }, () => -Math.log(1 - rnd()));
    const total = e.reduce((a, x) => a + x, 0);
    offsets = new Array(TRAFFIC_BLOCK_GROUPS);
    let at = TRAFFIC_FIRST_GROUP + b * blockLength;
    for (let i = 0; i < TRAFFIC_BLOCK_GROUPS; i++) {
      offsets[i] = at;
      const w = (1 - r) + r * TRAFFIC_BLOCK_GROUPS * (e[i] / total);
      at += minGap + (spacing - minGap) * w;
    }
    if (cache.size >= 8) cache.delete(cache.keys().next().value);
    cache.set(b, offsets);
    return offsets;
  }

  /** Grupo k en el instante 0: distancia sobre la línea central y vehículos (carril, adelanto y desvío lateral). */
  function groupAt(k) {
    if (d <= 0) return { index: k, distance: TRAFFIC_FIRST_GROUP + k * blockLength / TRAFFIC_BLOCK_GROUPS, vehicles: [] };
    const b = Math.floor(k / TRAFFIC_BLOCK_GROUPS);
    const distance = blockOffsets(b)[k - b * TRAFFIC_BLOCK_GROUPS];
    const rnd = randomFor(seed, k);
    // Cantidad de vehículos: entre 1 y lanes - 1, creciente con la densidad.
    const expected = 1 + f * (lanes - 2);
    const base = Math.floor(expected);
    const count = Math.min(lanes - 1, base + (rnd() < expected - base ? 1 : 0));
    // Carriles ocupados: sorteo sin reposición; siempre queda al menos uno libre.
    const free = Array.from({ length: lanes }, (_, i) => i);
    const chosen = [];
    for (let i = 0; i < count; i++) chosen.push(free.splice(Math.floor(rnd() * free.length), 1)[0]);
    chosen.sort((a, b2) => a - b2);
    const vehicles = chosen.map((lane) => {
      const lateral = (rnd() * 2 - 1) * maxLateral;
      const offset = (rnd() * 2 - 1) * stagger;
      return { lane, lateral: maxLateral === 0 ? 0 : lateral, offset: stagger === 0 ? 0 : offset };
    });
    return { index: k, distance, vehicles };
  }

  /** Vehículos en el instante `t` (s) cuya posición sobre la línea central cae en [from, to]. */
  function vehicles(t, from, to) {
    if (d <= 0) return [];
    const shift = TRAFFIC_SPEED * t;
    const reach = stagger + CAR_LENGTH;
    const bMin = Math.max(0, Math.floor((from - shift - TRAFFIC_FIRST_GROUP - reach) / blockLength));
    const bMax = Math.floor((to - shift - TRAFFIC_FIRST_GROUP + reach) / blockLength);
    const out = [];
    for (let b = bMin; b <= bMax; b++) {
      const offsets = blockOffsets(b);
      for (let i = 0; i < TRAFFIC_BLOCK_GROUPS; i++) {
        const center = offsets[i] + shift;
        if (center + reach < from || center - reach > to) continue;
        const g = groupAt(b * TRAFFIC_BLOCK_GROUPS + i);
        for (const v of g.vehicles) {
          const distance = center + v.offset;
          if (distance < from || distance > to || distance > track.end) continue;
          const c = track.laneCenter(v.lane, distance);
          const position = add(c.position, scale(leftOf(fromAngle(c.angle)), v.lateral));
          out.push({
            id: `${g.index}:${v.lane}`, group: g.index, lane: v.lane, distance, lateral: v.lateral, offset: v.offset,
            position, angle: c.angle, speed: TRAFFIC_SPEED,
            contour: rectCorners(position, c.angle, CAR_LENGTH, CAR_WIDTH),
          });
        }
      }
    }
    return out;
  }

  return Object.freeze({ seed, density: d, irregularity: irr, spacing, stagger, minGap, groupAt, vehicles });
}

/**
 * Cambia la configuración del tráfico en marcha, sin reiniciar (design.md D3).
 *
 * El tráfico que ya existe se conserva por detrás de `boundary` y el nuevo empieza recién
 * MIN_GROUP_SPACING más adelante, así en la unión también quedan cuatro largos de hueco. Las
 * distancias se miden en el marco del tráfico (la distancia en el instante 0), que avanza con él.
 * Cada cambio agrega una capa; las capas que ya no tienen tramo propio se descartan.
 * @param {object} current tráfico actual (simple o ya cambiado)
 * @param {object} next tráfico con la configuración nueva (de createTraffic)
 * @param {number} boundary distancia, en el marco del tráfico, desde la que manda la configuración nueva
 */
export function changeTraffic(current, next, boundary) {
  const previous = current.layers ?? [{ traffic: current, from: -Infinity, to: Infinity, prefix: '' }];
  const generation = (current.generation ?? 0) + 1;
  const layers = previous
    .map((l) => ({ ...l, to: Math.min(l.to, boundary) }))
    .filter((l) => l.from < l.to);
  layers.push({ traffic: next, from: boundary + MIN_GROUP_SPACING, to: Infinity, prefix: `${generation}~` });

  function vehicles(t, from, to) {
    const shift = TRAFFIC_SPEED * t;
    const out = [];
    for (const l of layers) {
      if (l.from + shift > to + CAR_LENGTH || l.to + shift < from - CAR_LENGTH) continue;
      for (const v of l.traffic.vehicles(t, from, to)) {
        const base = v.distance - shift;
        if (base < l.from || base >= l.to) continue;
        out.push(l.prefix ? { ...v, id: l.prefix + v.id } : v);
      }
    }
    return out;
  }

  return Object.freeze({
    seed: next.seed, density: next.density, irregularity: next.irregularity,
    spacing: next.spacing, stagger: next.stagger, minGap: next.minGap,
    generation, layers: Object.freeze(layers.map(Object.freeze)), vehicles,
  });
}

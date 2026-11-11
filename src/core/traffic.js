// Tráfico de la calle recta como función pura de (semilla, número de grupo, tiempo).
// Cada grupo se calcula solo a partir de la semilla y de su número, de modo que la
// disposición no depende de cómo maneje la persona.
import { fromAngle, leftOf, add, scale, rectCorners } from './geometry.js';
import { randomFor } from './random.js';
import {
  CAR_LENGTH, CAR_WIDTH, MIN_GROUP_GAP_CAR_LENGTHS, TRAFFIC_FIRST_GROUP, TRAFFIC_MIN_SPACING,
  TRAFFIC_SPACING_RANGE, TRAFFIC_SPEED,
} from './constants.js';

export const DEFAULT_TRAFFIC = Object.freeze({ density: 50, irregularity: 50 });

/** Separación mínima entre grupos consecutivos, centro a centro: el hueco exigido más el largo de un auto. */
export const MIN_GROUP_SPACING = (MIN_GROUP_GAP_CAR_LENGTHS + 1) * CAR_LENGTH;

const percent = (value, fallback) => {
  const n = Number(value ?? fallback);
  return Number.isFinite(n) ? Math.min(Math.max(n, 0), 100) : fallback;
};

/** Distancia entre grupos (centro a centro) para una densidad en porcentaje; infinita si es 0. */
export function groupSpacing(density) {
  if (density <= 0) return Infinity;
  const f = density / 100;
  return TRAFFIC_MIN_SPACING + TRAFFIC_SPACING_RANGE * (1 - f) ** 1.5;
}

/**
 * Crea el tráfico de una pista.
 * @param {{seed:number, track:object, density?:number, irregularity?:number}} spec densidad e irregularidad en % (0 a 100)
 */
export function createTraffic({ seed, track, density = DEFAULT_TRAFFIC.density, irregularity = DEFAULT_TRAFFIC.irregularity }) {
  const d = percent(density, DEFAULT_TRAFFIC.density);
  const irr = percent(irregularity, DEFAULT_TRAFFIC.irregularity);
  const f = d / 100;
  const spacing = groupSpacing(d);
  const lanes = track.lanes;
  // Amplitud máxima del desvío longitudinal: nunca acerca dos grupos por debajo del mínimo.
  const maxDeviation = Number.isFinite(spacing) ? ((irr / 100) * (spacing - MIN_GROUP_SPACING)) / 2 : 0;
  // Desvío lateral máximo dentro del carril sin sobresalir de él (con un 10 % de margen).
  const maxLateral = ((irr / 100) * (track.laneWidth - CAR_WIDTH) / 2) * 0.9;

  /** Grupo k en el instante 0: distancia sobre la línea central y vehículos (carril y desvío lateral). */
  function groupAt(k) {
    if (d <= 0) return { index: k, distance: TRAFFIC_FIRST_GROUP + k * spacing, vehicles: [] };
    const rnd = randomFor(seed, k);
    const distance = TRAFFIC_FIRST_GROUP + k * spacing + (rnd() * 2 - 1) * maxDeviation;
    // Cantidad de vehículos: entre 1 y lanes - 1, creciente con la densidad.
    const expected = 1 + f * (lanes - 2);
    const base = Math.floor(expected);
    const count = Math.min(lanes - 1, base + (rnd() < expected - base ? 1 : 0));
    // Carriles ocupados: sorteo sin reposición; siempre queda al menos uno libre.
    const free = Array.from({ length: lanes }, (_, i) => i);
    const chosen = [];
    for (let i = 0; i < count; i++) chosen.push(free.splice(Math.floor(rnd() * free.length), 1)[0]);
    chosen.sort((a, b) => a - b);
    const vehicles = chosen.map((lane) => ({ lane, lateral: maxLateral === 0 ? (rnd(), 0) : (rnd() * 2 - 1) * maxLateral }));
    return { index: k, distance, vehicles };
  }

  /** Vehículos en el instante `t` (s) cuya posición sobre la línea central cae en [from, to]. */
  function vehicles(t, from, to) {
    if (d <= 0) return [];
    const shift = TRAFFIC_SPEED * t;
    const kMin = Math.max(0, Math.ceil((from - shift - TRAFFIC_FIRST_GROUP - maxDeviation - CAR_LENGTH) / spacing));
    const kMax = Math.floor((to - shift - TRAFFIC_FIRST_GROUP + maxDeviation + CAR_LENGTH) / spacing);
    const out = [];
    for (let k = kMin; k <= kMax; k++) {
      const g = groupAt(k);
      const distance = g.distance + shift;
      if (distance < from || distance > to || distance > track.end) continue;
      for (const v of g.vehicles) {
        const c = track.laneCenter(v.lane, distance);
        const position = add(c.position, scale(leftOf(fromAngle(c.angle)), v.lateral));
        out.push({
          id: `${k}:${v.lane}`, group: k, lane: v.lane, distance, lateral: v.lateral,
          position, angle: c.angle, speed: TRAFFIC_SPEED,
          contour: rectCorners(position, c.angle, CAR_LENGTH, CAR_WIDTH),
        });
      }
    }
    return out;
  }

  return Object.freeze({ seed, density: d, irregularity: irr, spacing, groupAt, vehicles });
}

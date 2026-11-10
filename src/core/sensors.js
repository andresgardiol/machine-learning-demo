// Sensores: abanico de rayos que miden la distancia al obstáculo más cercano.
import { add, scale, fromAngle, distance, segmentIntersection } from './geometry.js';
import { CAR_LENGTH } from './constants.js';

export const SENSOR_LIMITS = Object.freeze({
  count: Object.freeze({ min: 1, max: 30 }),
  range: Object.freeze({ min: 1, max: 10 }), // largos de auto
  spread: Object.freeze({ min: 10, max: 360 }), // grados
});

export const DEFAULT_SENSORS = Object.freeze({ count: 5, range: 3, spread: 90 });

const clamp = (value, { min, max }, fallback) => {
  const n = Number(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(Math.max(n, min), max);
};

/** Configuración válida a partir de valores parciales: lo que falta usa el valor por defecto y lo que se sale de rango se ajusta al límite. */
export function sensorConfig(partial = {}) {
  const p = partial ?? {};
  return {
    count: Math.round(clamp(p.count ?? DEFAULT_SENSORS.count, SENSOR_LIMITS.count, DEFAULT_SENSORS.count)),
    range: clamp(p.range ?? DEFAULT_SENSORS.range, SENSOR_LIMITS.range, DEFAULT_SENSORS.range),
    spread: clamp(p.spread ?? DEFAULT_SENSORS.spread, SENSOR_LIMITS.spread, DEFAULT_SENSORS.spread),
  };
}

/**
 * Ángulos de los rayos respecto de la dirección del auto, de izquierda (positivo) a derecha (negativo).
 * Con un solo rayo apunta exactamente hacia adelante.
 */
export function rayOffsets(count, spreadDegrees) {
  if (count === 1) return [0];
  const spread = (spreadDegrees * Math.PI) / 180;
  return Array.from({ length: count }, (_, i) => spread / 2 - (i * spread) / (count - 1));
}

/** Alcance de los rayos en metros. */
export const rangeMeters = (config) => config.range * CAR_LENGTH;

/**
 * Lee los sensores de un auto.
 * @param {{position, angle}} car
 * @param {{count, range, spread}} config configuración válida (ver sensorConfig)
 * @param {Array<[{x,y},{x,y}]>} obstacles segmentos que los rayos pueden tocar (el propio auto no va incluido)
 * @returns {{reading:number, origin, end, hit:(null|{x,y}), distance:(null|number)}[]} un elemento por rayo, de izquierda a derecha
 */
export function readSensors(car, config, obstacles) {
  const range = rangeMeters(config);
  const origin = car.position;
  return rayOffsets(config.count, config.spread).map((offset) => {
    const dir = fromAngle(car.angle + offset);
    const end = add(origin, scale(dir, range));
    let bestT = null;
    let hit = null;
    for (const [a, b] of obstacles) {
      const x = segmentIntersection(origin, end, a, b);
      if (x && (bestT === null || x.t < bestT)) {
        bestT = x.t;
        hit = x.point;
      }
    }
    const dist = hit === null ? null : distance(origin, hit);
    return { reading: bestT === null ? 0 : 1 - bestT, origin, end, hit, distance: dist };
  });
}

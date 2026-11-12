// Ajustes de calle y sensores compartidos por las pestañas 1 y 2 (design.md D5), sin DOM: valores
// por defecto, rangos de los ajustes y cómo se traducen en la especificación del mundo.
import { DEFAULT_LANES, ALLOWED_LANES, MAX_SPEED, SPEED_LIMITS } from '../../core/constants.js';
import { DEFAULT_TRAFFIC } from '../../core/traffic.js';
import { DEFAULT_SENSORS, SENSOR_LIMITS } from '../../core/sensors.js';
import { DEFAULT_TRACK, isCircuit, isTrackId } from '../../core/circuits.js';

export const LANE_OPTIONS = ALLOWED_LANES;

export const DEFAULT_SETTINGS = Object.freeze({
  track: DEFAULT_TRACK, // pista del catálogo (circuitos-y-paisaje D6): la calle recta por defecto
  maxSpeed: MAX_SPEED, // compartida por todas las pestañas (la guarda la app)
  lanes: DEFAULT_LANES,
  density: DEFAULT_TRAFFIC.density,
  irregularity: DEFAULT_TRAFFIC.irregularity,
  sensorCount: DEFAULT_SENSORS.count,
  sensorRange: DEFAULT_SENSORS.range,
  sensorSpread: DEFAULT_SENSORS.spread,
});

/** Deslizadores: clave del ajuste, rango, paso y formato del valor (clave de texto). */
export const SLIDERS = Object.freeze([
  { key: 'maxSpeed', min: SPEED_LIMITS.min, max: SPEED_LIMITS.max, step: 1, format: 'drive.value.speed' },
  { key: 'density', min: 0, max: 100, step: 5, format: 'drive.value.percent' },
  { key: 'irregularity', min: 0, max: 100, step: 5, format: 'drive.value.percent' },
  { key: 'sensorCount', min: SENSOR_LIMITS.count.min, max: SENSOR_LIMITS.count.max, step: 1, format: 'drive.value.rays' },
  { key: 'sensorRange', min: SENSOR_LIMITS.range.min, max: SENSOR_LIMITS.range.max, step: 0.5, format: 'drive.value.carLengths' },
  { key: 'sensorSpread', min: SENSOR_LIMITS.spread.min, max: SENSOR_LIMITS.spread.max, step: 5, format: 'drive.value.degrees' },
].map(Object.freeze));

/** Ajustes válidos: lo que falta usa el valor por defecto y lo que se sale de rango se ajusta al límite. */
export function normalizeSettings(partial = {}) {
  const s = { ...DEFAULT_SETTINGS, ...partial };
  const lanes = LANE_OPTIONS.includes(Number(s.lanes)) ? Number(s.lanes) : DEFAULT_SETTINGS.lanes;
  const track = isTrackId(s.track) ? s.track : DEFAULT_SETTINGS.track;
  const out = { track, lanes };
  for (const { key, min, max } of SLIDERS) {
    const n = Number(s[key]);
    out[key] = Number.isFinite(n) ? Math.min(Math.max(n, min), max) : DEFAULT_SETTINGS[key];
  }
  return out;
}

/** Ajustes que cambian la calle o el auto y por eso reinician el intento; el resto se aplica en marcha. */
export const RESTART_KEYS = Object.freeze(['track', 'lanes', 'sensorCount', 'sensorRange', 'sensorSpread']);

/**
 * Ajustes del tráfico, que en un circuito no se usan (no hay tráfico): se ven deshabilitados y
 * conservan sus valores para cuando se vuelva a la calle (circuitos-y-paisaje D6).
 */
export const TRAFFIC_KEYS = Object.freeze(['lanes', 'density', 'irregularity']);

/** ¿Los ajustes eligen un circuito (y no la calle recta)? */
export const onCircuit = (settings) => isCircuit(normalizeSettings(settings).track);

/**
 * Vueltas que muestra el indicador en un circuito: la distancia del intento sobre el largo de una
 * vuelta, con un decimal redondeado hacia abajo.
 */
export const lapsShown = (distance, lapLength) => Math.floor((10 * Math.max(0, distance)) / lapLength + 1e-9) / 10;

/** ¿Pasar de `before` a `after` obliga a reiniciar el intento? */
export function needsRestart(before, after) {
  const a = normalizeSettings(before);
  const b = normalizeSettings(after);
  return RESTART_KEYS.some((key) => a[key] !== b[key]);
}

/** Especificación para createWorld a partir de los ajustes y la semilla. */
export function worldSpec(settings, seed) {
  const s = normalizeSettings(settings);
  return {
    seed,
    track: s.track,
    lanes: s.lanes,
    maxSpeed: s.maxSpeed,
    density: s.density,
    irregularity: s.irregularity,
    sensors: { count: s.sensorCount, range: s.sensorRange, spread: s.sensorSpread },
  };
}

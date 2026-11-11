// Configuración avanzada de la pestaña 1, sin DOM: valores por defecto, rangos de los
// ajustes y cómo se traducen en la especificación del mundo.
import { DEFAULT_LANES, ALLOWED_LANES } from '../../core/constants.js';
import { DEFAULT_TRAFFIC } from '../../core/traffic.js';
import { DEFAULT_SENSORS, SENSOR_LIMITS } from '../../core/sensors.js';

export const LANE_OPTIONS = ALLOWED_LANES;

export const DEFAULT_SETTINGS = Object.freeze({
  lanes: DEFAULT_LANES,
  density: DEFAULT_TRAFFIC.density,
  irregularity: DEFAULT_TRAFFIC.irregularity,
  sensorCount: DEFAULT_SENSORS.count,
  sensorRange: DEFAULT_SENSORS.range,
  sensorSpread: DEFAULT_SENSORS.spread,
});

/** Deslizadores: clave del ajuste, rango, paso y formato del valor (clave de texto). */
export const SLIDERS = Object.freeze([
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
  const out = { lanes };
  for (const { key, min, max } of SLIDERS) {
    const n = Number(s[key]);
    out[key] = Number.isFinite(n) ? Math.min(Math.max(n, min), max) : DEFAULT_SETTINGS[key];
  }
  return out;
}

/** Especificación para createWorld a partir de los ajustes y la semilla. */
export function worldSpec(settings, seed) {
  const s = normalizeSettings(settings);
  return {
    seed,
    lanes: s.lanes,
    density: s.density,
    irregularity: s.irregularity,
    sensors: { count: s.sensorCount, range: s.sensorRange, spread: s.sensorSpread },
  };
}

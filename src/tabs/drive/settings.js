// Configuración de la pestaña 1 (conducir-sin-ajustes-de-sensores D2): los ajustes de calle y auto
// compartidos con Reglas a mano (tabs/shared/street-settings.js), sin los de sensores. Acá maneja una
// persona con el teclado: el auto lleva siempre los sensores por defecto, para mostrar qué recibiría
// una máquina, y ni la barra ni «Restablecer» los tocan.
import * as street from '../shared/street-settings.js';
import { DEFAULT_SENSORS } from '../../core/sensors.js';

export { LANE_OPTIONS, TRAFFIC_KEYS, lapsShown } from '../shared/street-settings.js';

const SENSOR_KEYS = Object.freeze(['sensorCount', 'sensorRange', 'sensorSpread']);
const withoutSensors = (s) => Object.fromEntries(Object.entries(s).filter(([k]) => !SENSOR_KEYS.includes(k)));

export const DEFAULT_SETTINGS = Object.freeze(withoutSensors(street.DEFAULT_SETTINGS));

/** Deslizadores de la pestaña: velocidad, densidad e irregularidad. */
export const SLIDERS = Object.freeze(street.SLIDERS.filter((s) => !SENSOR_KEYS.includes(s.key)));

/** Ajustes válidos, sin claves de sensores. */
export const normalizeSettings = (partial = {}) => withoutSensors(street.normalizeSettings(withoutSensors(partial)));

/** Ajustes que cambian la calle y por eso reinician el intento; el resto se aplica en marcha. */
export const RESTART_KEYS = Object.freeze(['track', 'lanes']);

export const onCircuit = (settings) => street.onCircuit(settings);

/** ¿Pasar de `before` a `after` obliga a reiniciar el intento? */
export function needsRestart(before, after) {
  const a = normalizeSettings(before);
  const b = normalizeSettings(after);
  return RESTART_KEYS.some((key) => a[key] !== b[key]);
}

/** Especificación para createWorld: siempre con los sensores por defecto. */
export function worldSpec(settings, seed) {
  return { ...street.worldSpec(normalizeSettings(settings), seed), sensors: { ...DEFAULT_SENSORS } };
}

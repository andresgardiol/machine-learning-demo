// Programa inicial y programas de ejemplo de la pestaña Reglas a mano (design.md D10), y los sensores
// con que abre un programa recordado (panel-de-entrenar-por-vistas D15), sin DOM.
import { tokenize } from '../../core/rules.js';
//
// Cada programa es un texto de los diccionarios (en los dos idiomas) más los sensores del auto para
// el que está escrito. Cargar un ejemplo cambia el programa y los sensores.

/** Tráfico inicial de esta pestaña: con la semilla 2 el programa inicial muestra algo en segundos. */
export const DEFAULT_SEED = 2;

const freeze = (p) => Object.freeze({ ...p, sensors: Object.freeze(p.sensors) });

/** Programa con el que abre la pestaña (y al que vuelve restablecer). */
export const INITIAL_PROGRAM = freeze({
  id: 'initial', textKey: 'rules.program.initial', sensors: { count: 5, range: 3, spread: 90 },
});

/** Ejemplos, en el orden del panel. */
export const EXAMPLES = Object.freeze([
  freeze({ id: 'three', textKey: 'rules.example.three', nameKey: 'rules.example.three.name', sensors: { count: 3, range: 2, spread: 60 } }),
  freeze({ id: 'seven', textKey: 'rules.example.seven', nameKey: 'rules.example.seven.name', sensors: { count: 7, range: 3, spread: 90 } }),
  freeze({ id: 'twenty', textKey: 'rules.example.twenty', nameKey: 'rules.example.twenty.name', sensors: { count: 20, range: 3, spread: 120 } }),
]);

/** El programa inicial y los ejemplos. */
export const PROGRAMS = Object.freeze([INITIAL_PROGRAM, ...EXAMPLES]);

/** Textos de todos los programas conocidos en todos los idiomas (para saber si un texto es propio). */
export function knownTexts(dictionaries) {
  const out = [];
  for (const dict of Object.values(dictionaries)) for (const p of PROGRAMS) if (typeof dict[p.textKey] === 'string') out.push(dict[p.textKey]);
  return out;
}

/** Ajustes de sensores de un programa, con las claves de los ajustes de la calle. */
export const sensorSettings = (p) => ({ sensorCount: p.sensors.count, sensorRange: p.sensors.range, sensorSpread: p.sensors.spread });

/**
 * Ajustes con que se carga un programa conocido (un ejemplo o el inicial): los sensores para los que
 * está escrito y la calle recta, porque los ejemplos son para la calle (circuitos-y-paisaje D6).
 * Lo demás (velocidad y tráfico) no cambia.
 */
export const settingsForProgram = (settings, p) => ({ ...settings, ...sensorSettings(p), track: 'straight' });

/** Sensor más alto que nombra el código de un programa (los comentarios no cuentan); 0 si no nombra ninguno. */
export function highestSensor(text) {
  let max = 0;
  for (const line of String(text ?? '').split(/\r\n?|\n/)) {
    for (const t of tokenize(line)) if (t.type === 'sensor' && t.index > max) max = t.index;
  }
  return max;
}

/**
 * Sensores con que abre la pestaña (panel-de-entrenar-por-vistas D15), con las claves de los ajustes
 * de la calle:
 *   - con sensores recordados, esos (la pestaña los ajusta a sus rangos);
 *   - con un programa recordado sin sus sensores (lo guardó una versión anterior), la cantidad es la
 *     mayor entre la del programa inicial y el sensor más alto que el programa nombra; alcance y
 *     apertura, los del programa inicial;
 *   - sin programa recordado, los del programa inicial.
 * Así el programa recordado siempre puede manejar al abrir.
 * @param {{program: string|null, sensors: {count:number, range:number, spread:number}|null}} remembered
 */
export function rememberedSensors({ program = null, sensors = null } = {}) {
  const initial = sensorSettings(INITIAL_PROGRAM);
  if (program === null) return initial;
  if (sensors) return { sensorCount: sensors.count, sensorRange: sensors.range, sensorSpread: sensors.spread };
  return { ...initial, sensorCount: Math.max(initial.sensorCount, highestSensor(program)) };
}

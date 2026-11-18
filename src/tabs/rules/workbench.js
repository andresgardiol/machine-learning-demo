// Mesa de trabajo de Reglas a mano (reglas-mesa-de-trabajo), sin DOM: la barra de escenario sin el grupo
// de sensores (que va en la cabecera del programa, D4), su "Restablecer" que no toca los sensores, y la
// comparación que escribe una barra de la percepción en el editor (D5). Se prueba con node --test.
import es from '../../i18n/es.js';
import en from '../../i18n/en.js';
import { DEFAULT_SETTINGS } from '../shared/street-settings.js';

/** Configuración de la barra de escenario en Reglas a mano: los sensores se arman aparte (D4). */
export const RULES_BAR = Object.freeze({ omit: Object.freeze([]), aside: Object.freeze(['sensors']) });

const SENSOR_KEYS = Object.freeze(['sensorCount', 'sensorRange', 'sensorSpread']);

/**
 * Ajustes después del "Restablecer" de la barra en Reglas a mano: la pista, el tráfico y la velocidad
 * vuelven a sus valores por defecto; los sensores quedan como estaban (los devuelve Restablecer del
 * programa).
 * @param {object} settings ajustes actuales
 * @returns {object}
 */
export function scenarioReset(settings) {
  const kept = Object.fromEntries(SENSOR_KEYS.map((k) => [k, settings[k]]));
  return { ...DEFAULT_SETTINGS, ...kept };
}

const DICTIONARIES = Object.freeze({ es, en });

/** Separador decimal de cada idioma (el mismo que usa el lenguaje de reglas y formatFixed). */
const DECIMAL = Object.freeze({ es: ',', en: '.' });

/**
 * Comparación que inserta una barra: `sensor3 > 0,49`, con el valor a dos decimales, el separador del
 * idioma y el nombre del dato en el idioma activo. El operador es siempre `>`.
 * @param {string|{sensor:number}|'speed'} datum `'speed'` (o `'velocidad'`), `'sensor3'` o `{ sensor: 3 }`
 * @param {number} value lectura que muestra la barra
 * @param {'es'|'en'} language
 * @returns {string}
 */
export function comparisonFor(datum, value, language) {
  const dict = DICTIONARIES[language] ?? es;
  let name;
  if (datum === 'speed' || datum === es['rules.data.speed'] || datum === en['rules.data.speed']) {
    name = dict['rules.data.speed'];
  } else {
    const n = typeof datum === 'object' && datum !== null ? datum.sensor : Number(String(datum).replace(/^\D+/, ''));
    if (!Number.isInteger(n) || n < 1) throw new Error(`Dato desconocido: ${String(datum)}`);
    name = dict['rules.data.sensor'].replace('{n}', String(n));
  }
  const v = Math.round((Number(value) || 0) * 100) / 100 || 0; // sin "-0,00"
  const text = v.toFixed(2).replace('.', DECIMAL[language] ?? ',');
  return `${name} > ${text}`;
}

/**
 * Inserta `fragment` en `text` en la posición `cursor` (o reemplaza de `cursor` a `end`): con un espacio
 * antes si el carácter anterior no es un espacio ni el comienzo de un renglón, y uno después si el
 * siguiente no es ya un espacio. El cursor queda después del espacio final.
 * @param {string} text
 * @param {number} cursor
 * @param {string} fragment
 * @param {number} [end] fin de la selección que se reemplaza (por defecto, `cursor`)
 * @returns {{text:string, cursor:number, insert:string, from:number, to:number}} `insert` es lo que se
 *   escribe entre `from` y `to`, para hacerlo por el camino del editor que conserva el deshacer
 */
export function insertAt(text, cursor, fragment, end = cursor) {
  const from = Math.max(0, Math.min(cursor, text.length));
  const to = Math.max(from, Math.min(end, text.length));
  const before = text.slice(0, from);
  const after = text.slice(to);
  const lead = before.length === 0 || /[ \t\n]$/.test(before) ? '' : ' ';
  const followedBySpace = /^[ \t]/.test(after);
  const insert = `${lead}${fragment}${followedBySpace ? '' : ' '}`;
  const next = before + insert + after;
  // Si ya había un espacio después, el cursor lo salta: queda igual después del espacio final.
  const at = from + insert.length + (followedBySpace ? 1 : 0);
  return { text: next, cursor: at, insert, from, to };
}

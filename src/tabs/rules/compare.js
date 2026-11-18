// Comparación con los ejemplos de Reglas a mano (reglas-el-choque-ensena D4), sin DOM: corre cada
// programa en un mundo nuevo, con la misma semilla de tráfico, la misma velocidad y la calle recta (los
// ejemplos se escribieron para ella), con los sensores de cada programa, hasta chocar o hasta el tope.
//
// Es un generador por tramos: avanza `chunkSteps` pasos de simulación y cede, así la pestaña lo llama
// entre cuadros y la escena sigue animándose. Partirlo en tramos de otro tamaño da lo mismo: cada mundo
// es determinista y los tramos solo deciden cuándo se cede. Se prueba con node --test.
import { createWorld } from '../../core/world.js';
import { createRulesController, parseProgram } from '../../core/rules.js';
import { STEP } from '../../core/constants.js';
import { createAttempt } from '../shared/attempt.js';
import { normalizeSettings, worldSpec } from '../shared/street-settings.js';
import { settingsForProgram } from './examples.js';

/** Tope de la comparación, en segundos de simulación: dos minutos. */
export const COMPARE_LIMIT_SECONDS = 120;
/** Pasos de simulación por tramo (10 s a 60 por segundo). */
export const COMPARE_CHUNK_STEPS = 600;
/** Velocidad máxima (m/s) para la que se escribieron los ejemplos. */
export const EXAMPLES_SPEED = 20;

/**
 * Corre los programas y cede después de cada tramo.
 * @param {object} spec
 * @param {number} spec.seed semilla del tráfico del intento
 * @param {object} spec.settings ajustes de la pestaña (se usan la velocidad, el tráfico y los carriles;
 *   la pista pasa a ser la calle recta y los sensores, los de cada programa)
 * @param {{id:string, text:string, sensors:{count:number, range:number, spread:number}}[]} spec.programs
 * @param {number} [spec.limitSeconds] tope de cada corrida (2 minutos)
 * @param {number} [spec.chunkSteps] pasos por tramo
 * @yields {{done:number, total:number}} programas terminados y total, después de cada tramo
 * @returns {object[]} una fila por programa, en el orden pedido:
 *   { id, sensors, rules, ok, distance, passed, crashed, cause, seconds }; con un programa que no se
 *   puede correr (con errores), ok es false y no hay cifras.
 */
export function* compareRuns({
  seed, settings, programs, limitSeconds = COMPARE_LIMIT_SECONDS, chunkSteps = COMPARE_CHUNK_STEPS,
}) {
  const maxSteps = Math.round(limitSeconds / STEP);
  const chunk = Math.max(1, Math.floor(chunkSteps));
  const rows = [];
  let budget = chunk;
  for (const p of programs) {
    const parsed = parseProgram(p.text, { sensors: p.sensors.count });
    const sensors = { ...p.sensors };
    if (!parsed.ok) {
      rows.push({ id: p.id, sensors, rules: null, ok: false, distance: null, passed: null, crashed: null, cause: null, seconds: null });
      continue;
    }
    const s = normalizeSettings(settingsForProgram(settings, p));
    const world = createWorld({ ...worldSpec(s, seed), controller: createRulesController({ program: parsed.program }) });
    const attempt = createAttempt();
    while (world.steps < maxSteps && !world.crashed) {
      if (budget === 0) {
        yield { done: rows.length, total: programs.length };
        budget = chunk;
      }
      world.step();
      attempt.observe(world);
      budget -= 1;
    }
    rows.push({
      id: p.id, sensors, rules: parsed.rules, ok: true,
      distance: attempt.distance, passed: attempt.passed,
      crashed: world.crashed, cause: world.crashCause, seconds: world.time,
    });
  }
  return rows;
}

/** Corre la comparación de una vez (para pruebas y herramientas). */
export function compareNow(spec) {
  const it = compareRuns(spec);
  for (;;) {
    const r = it.next();
    if (r.done) return r.value;
  }
}

/**
 * Avisos de la comparación: si la pestaña está en un circuito (la comparación corre en la calle recta)
 * y si la velocidad no es la de los ejemplos.
 * @param {{track:string, maxSpeed:number}} settings
 * @param {boolean} onCircuit
 * @returns {{circuit:boolean, speed:boolean}}
 */
export const compareNotes = (settings, onCircuit) => ({
  circuit: Boolean(onCircuit),
  speed: normalizeSettings(settings).maxSpeed !== EXAMPLES_SPEED,
});

/**
 * Texto del resultado de una fila (D4, "Qué columna manda"): "chocó a los X m"; sin chocar y sin superar
 * a nadie, "frena detrás del primero" (no se ve como el mejor resultado); sin chocar y superando,
 * "no chocó en 2 min"; con errores, "tiene errores".
 * @param {{ok:boolean, crashed:boolean|null, passed:number|null, distance:number|null}} row
 * @returns {{key:string, params?:object}}
 */
export function compareResult(row) {
  if (!row.ok) return { key: 'rules.compare.invalid' };
  if (row.crashed) return { key: 'rules.compare.crashed', params: { value: Math.floor(row.distance) } };
  if (row.passed === 0) return { key: 'rules.compare.brakes' };
  return { key: 'rules.compare.notCrashed' };
}

// Quién puede correr en Competir (pestana-competir, design.md D4), sin DOM: los candidatos con su
// disponibilidad y su motivo, la selección de uno a seis con su casilla (número y color) y cómo se
// arma cada competidor para la carrera.
//
//   clave            qué es                                   controlador y sensores
//   human            Vos                                      el teclado, sensores por defecto
//   program:seven    programa de ejemplo de 7 sensores        sus reglas en el idioma activo, sus 7 sensores
//   program          tu programa (el actual de Reglas a mano) el recordado, o el inicial; sus sensores
//   brain:<id>       cerebros guardados y autoguardados       su red y sus sensores
//   example:<id>     cerebros de ejemplo                      su red y sus sensores
import { parseProgram, createRulesController } from '../../core/rules.js';
import { carForBrain, validateBrain } from '../../core/brain.js';
import { DEFAULT_SENSORS } from '../../core/sensors.js';
import { MAX_COMPETITORS } from '../../core/race.js';
import { EXAMPLES, INITIAL_PROGRAM, rememberedSensors } from '../rules/examples.js';

export { MAX_COMPETITORS };

/** Selección por defecto (D4): vos, el programa de 7 sensores y el cerebro de la calle con tráfico nuevo. */
export const DEFAULT_SELECTION = Object.freeze(['human', 'program:seven', 'example:street-new']);

/** Programa de ejemplo que compite: el de 7 sensores de Reglas a mano. */
export const SEVEN = EXAMPLES.find((p) => p.id === 'seven');

const sensorsOf = (s) => ({ count: s.count, range: s.range, spread: s.spread });

/**
 * Programa de la persona (D4): el recordado con sus sensores; sin programa recordado, el inicial de
 * Reglas a mano. Devuelve { text, sensors, ok, errors }.
 * @param {{program: string|null, sensors: object|null}} remembered
 * @param {(key:string) => string} t
 */
export function ownProgram({ program = null, sensors = null } = {}, t) {
  const text = program ?? t(INITIAL_PROGRAM.textKey);
  const s = rememberedSensors({ program, sensors: program === null ? null : sensors });
  const sensorConfig = { count: s.sensorCount, range: s.sensorRange, spread: s.sensorSpread };
  const parsed = parseProgram(text, { sensors: sensorConfig.count });
  return { text, sensors: sensorConfig, ok: parsed.ok, program: parsed.ok ? parsed.program : null, errors: parsed.ok ? [] : parsed.errors };
}

/**
 * Candidatos, en el orden de la lista (D4). Cada uno:
 *   { key, kind: 'human'|'program'|'brain'|'example', available, reason, sensors, signature, ... }
 * `reason` (si no está disponible): 'programErrors' o 'invalidBrain'. `signature` cambia cuando el
 * competidor deja de ser el mismo (D8): el texto del programa o la fecha de actualización del cerebro.
 * @param {object} spec
 * @param {{origin:string, brain:object, slot?:string}[]} [spec.library] lo que da library.list()
 * @param {object[]} [spec.examples] los cerebros de ejemplo
 * @param {{program:string|null, sensors:object|null}} [spec.remembered] programa recordado de Reglas a mano
 * @param {(key:string) => string} spec.t
 */
export function listCandidates({ library = [], examples = [], remembered = {}, t }) {
  const out = [];
  out.push({ key: 'human', kind: 'human', available: true, reason: null, sensors: { ...DEFAULT_SENSORS }, signature: 'human' });
  out.push({
    key: 'program:seven', kind: 'program', example: true, available: true, reason: null,
    sensors: sensorsOf(SEVEN.sensors), signature: 'program:seven', nameKey: SEVEN.nameKey,
  });
  const own = ownProgram(remembered, t);
  out.push({
    key: 'program', kind: 'program', example: false, available: own.ok, reason: own.ok ? null : 'programErrors',
    sensors: own.sensors, signature: `program:${own.text}`, text: own.text, program: own.program,
  });
  for (const e of library) {
    const problem = validateBrain(e.brain);
    out.push({
      key: `brain:${e.brain.id}`, kind: 'brain', origin: e.origin, slot: e.slot ?? null, brain: e.brain, name: e.brain.name,
      available: problem === null, reason: problem === null ? null : 'invalidBrain',
      sensors: problem === null ? sensorsOf(e.brain.sensors) : null, signature: `brain:${e.brain.id}:${e.brain.updatedAt}`,
    });
  }
  for (const b of examples) {
    const problem = validateBrain(b);
    out.push({
      key: `example:${b.id}`, kind: 'example', brain: b, nameKey: `compete.example.${b.id}`,
      available: problem === null, reason: problem === null ? null : 'invalidBrain',
      sensors: problem === null ? sensorsOf(b.sensors) : null, signature: `example:${b.id}`,
    });
  }
  return out;
}

/**
 * Arma el competidor de un candidato disponible para createRace: { id, controller, sensors }.
 * @param {object} candidate de listCandidates
 * @param {object} spec
 * @param {(key:string) => string} spec.t textos del idioma activo (el programa de ejemplo se toma en ese idioma)
 * @param {() => object} [spec.keyboard] crea el controlador del teclado (lo da la interfaz)
 */
export function buildCompetitor(candidate, { t, keyboard } = {}) {
  const { key } = candidate;
  if (!candidate.available) throw new Error(`competitorUnavailable: ${key}`);
  if (candidate.kind === 'human') return { id: key, controller: keyboard ? keyboard() : { control: () => ({}) }, sensors: { ...DEFAULT_SENSORS } };
  if (key === 'program:seven') {
    const parsed = parseProgram(t(SEVEN.textKey), { sensors: SEVEN.sensors.count });
    return { id: key, controller: createRulesController({ program: parsed.ok ? parsed.program : null }), sensors: sensorsOf(SEVEN.sensors) };
  }
  if (key === 'program') return { id: key, controller: createRulesController({ program: candidate.program }), sensors: { ...candidate.sensors } };
  const car = carForBrain(candidate.brain);
  return { id: key, controller: car.controller, sensors: car.sensors };
}

/**
 * Selección de competidores (D4): de 1 a MAX_COMPETITORS, cada uno con su casilla del 1 al 6, la
 * más baja libre al marcarlo; la conserva mientras siga marcado. Pueden quedar huecos.
 * @param {string[]} [initial]
 */
export function createSelection(initial = DEFAULT_SELECTION) {
  const slots = new Map(); // clave -> casilla (1 a 6)
  const lowestFree = () => {
    const taken = new Set(slots.values());
    for (let s = 1; s <= MAX_COMPETITORS; s++) if (!taken.has(s)) return s;
    return null;
  };
  for (const key of initial) if (slots.size < MAX_COMPETITORS && !slots.has(key)) slots.set(key, lowestFree());

  const selection = {
    /** Claves marcadas, en el orden de sus casillas. */
    get keys() { return [...slots.entries()].sort((a, b) => a[1] - b[1]).map(([k]) => k); },
    get size() { return slots.size; },
    has: (key) => slots.has(key),
    slotOf: (key) => slots.get(key) ?? null,
    /** ¿Se puede marcar? Devuelve null si sí, o el motivo: 'max'. */
    whyNotSelect: (key) => (slots.has(key) || slots.size < MAX_COMPETITORS ? null : 'max'),
    /** ¿Se puede desmarcar? Devuelve null si sí, o el motivo: 'min'. */
    whyNotUnselect: (key) => (slots.has(key) && slots.size <= 1 ? 'min' : null),
    /** Marca o desmarca; devuelve si cambió algo. */
    toggle(key) {
      if (slots.has(key)) {
        if (selection.whyNotUnselect(key)) return false;
        slots.delete(key);
        return true;
      }
      if (selection.whyNotSelect(key)) return false;
      slots.set(key, lowestFree());
      return true;
    },
    /**
     * Quita de la selección lo que ya no puede correr (un cerebro eliminado, un programa con errores).
     * Si no queda nadie, vuelve a la selección por defecto (o a lo que de ella siga disponible).
     * Devuelve las claves quitadas.
     */
    prune(availableKeys) {
      const ok = new Set(availableKeys);
      const removed = [...slots.keys()].filter((k) => !ok.has(k));
      for (const k of removed) slots.delete(k);
      if (slots.size === 0) for (const k of DEFAULT_SELECTION) if (ok.has(k) && !slots.has(k)) slots.set(k, lowestFree());
      return removed;
    },
  };
  return selection;
}

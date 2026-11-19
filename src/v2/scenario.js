// Escenario compartido de la V2 (design.md D7), sin DOM: pista, carriles, densidad, irregularidad y
// velocidad máxima son los mismos en todas las etapas con auto, salvo los valores que una etapa fija
// para su concepto, que la interfaz rotula "de esta etapa". Con los valores de la V1:
//   - El problema y Reglas a mano usan el escenario común (los valores por defecto de la V1);
//   - Aprender por evolución y Evaluar fijan la irregularidad en 0 (TRAINING_IRREGULARITY, como la V1);
//   - Entender fija el escenario del cerebro que mira (como la V1), salvo la velocidad.
import { normalizeSettings as normalizeStreet } from '../tabs/shared/street-settings.js';
import { TRAINING_IRREGULARITY } from '../core/training.js';

export const SCENARIO_KEYS = Object.freeze(['track', 'lanes', 'density', 'irregularity', 'maxSpeed']);

/** Escenario común por defecto: el de El problema de la V1. */
export const DEFAULT_SCENARIO = Object.freeze(pick(normalizeStreet({})));

/** Valores que fija cada etapa por defecto (las claves que la etapa maneja como propias). */
export const STAGE_FIXED = Object.freeze({
  evolucion: Object.freeze({ irregularity: TRAINING_IRREGULARITY }),
  evaluar: Object.freeze({ irregularity: TRAINING_IRREGULARITY }),
});

function pick(s) { return Object.fromEntries(SCENARIO_KEYS.map((k) => [k, s[k]])); }

/** Un escenario válido: lo que falta toma el valor por defecto y lo que se sale de rango se ajusta. */
export function normalizeScenario(partial = {}) {
  return pick(normalizeStreet({ ...DEFAULT_SCENARIO, ...pick({ ...DEFAULT_SCENARIO, ...partial }) }));
}

/** Escenario guardado como texto JSON; si no se puede leer, el de fábrica. */
export function parseScenario(text) {
  if (typeof text !== 'string') return { ...DEFAULT_SCENARIO };
  try {
    const v = JSON.parse(text);
    return v && typeof v === 'object' ? normalizeScenario(v) : { ...DEFAULT_SCENARIO };
  } catch {
    return { ...DEFAULT_SCENARIO };
  }
}

/**
 * @param {{ initial?: object, save?: (json: string) => void }} [spec]
 */
export function createScenario({ initial = DEFAULT_SCENARIO, save = () => {} } = {}) {
  let common = normalizeScenario(initial);
  /** Valores fijados por etapa: { stage: { key: value } }. */
  const fixed = Object.fromEntries(Object.entries(STAGE_FIXED).map(([s, v]) => [s, { ...v }]));
  const listeners = new Set();
  const notify = (stage) => { for (const fn of listeners) fn({ stage, common: { ...common } }); };

  return {
    get common() { return { ...common }; },
    /** Claves que la etapa fija ("de esta etapa"). */
    fixedKeys(stage) { return Object.keys(fixed[stage] ?? {}); },
    isFixed(stage, key) { return key in (fixed[stage] ?? {}); },
    /** El escenario con que corre una etapa: el común con los valores de la etapa encima. */
    forStage(stage) { return normalizeScenario({ ...common, ...(fixed[stage] ?? {}) }); },
    /**
     * Cambia un valor desde una etapa: si la etapa lo fija, cambia el de la etapa; si no, el común
     * (y se ve en todas las etapas que no lo fijan).
     */
    set(stage, key, value) {
      if (!SCENARIO_KEYS.includes(key)) return false;
      if (stage && key in (fixed[stage] ?? {})) {
        fixed[stage][key] = normalizeScenario({ ...common, [key]: value })[key];
      } else {
        common = normalizeScenario({ ...common, [key]: value });
        save(JSON.stringify(common));
      }
      notify(stage);
      return true;
    },
    /** Fija los valores de una etapa (por ejemplo, el escenario en que entrenó un cerebro). */
    fix(stage, values) {
      const given = Object.fromEntries(Object.entries(values ?? {}).filter(([k]) => SCENARIO_KEYS.includes(k)));
      const clean = normalizeScenario({ ...common, ...given });
      fixed[stage] = { ...(STAGE_FIXED[stage] ?? {}), ...Object.fromEntries(Object.keys(given).map((k) => [k, clean[k]])) };
      notify(stage);
    },
    /** Vuelve una etapa a sus valores fijos de fábrica (sin tocar el común). */
    resetStage(stage) { fixed[stage] = { ...(STAGE_FIXED[stage] ?? {}) }; notify(stage); },
    /** Vuelve el escenario común al de fábrica. */
    resetCommon() { common = { ...DEFAULT_SCENARIO }; save(JSON.stringify(common)); notify(null); },
    subscribe(fn) { listeners.add(fn); return () => listeners.delete(fn); },
  };
}

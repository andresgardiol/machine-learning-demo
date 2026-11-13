// Preferencias recordadas en el navegador (idioma, guía, ancho del panel y del escenario, velocidad del auto, programa
// de la pestaña Reglas a mano y paisaje). Toda lectura y escritura
// va dentro de un bloque que tolera que el almacenamiento no exista o falle.

const KEYS = Object.freeze({ language: 'mlLab.language', guide: 'mlLab.guide', panelWidth: 'mlLab.panelWidth', stageWidth: 'mlLab.stageWidth', carSpeed: 'mlLab.carSpeed', rulesProgram: 'mlLab.rules.program', rulesSensors: 'mlLab.rules.sensors', scenery: 'mlLab.scenery', shortcuts: 'mlLab.shortcuts' });

/** Atajos de una tecla encendidos por defecto (panel-de-entrenar-por-vistas D9). */
export const DEFAULT_SHORTCUTS = true;

/** Largo máximo del programa recordado de la pestaña Reglas a mano (design.md D8). */
export const RULES_PROGRAM_MAX = 20000;

export const DEFAULT_PREFERENCES = Object.freeze({ language: null, guide: true, panelWidth: null, carSpeed: null, scenery: true });

const defaultStorage = () => globalThis.localStorage;

/**
 * @param {() => Storage} [getStorage] función que devuelve el almacenamiento; puede lanzar
 */
export function createPreferences(getStorage = defaultStorage) {
  function read(key) {
    try {
      return getStorage()?.getItem(key) ?? null;
    } catch {
      return null;
    }
  }

  function write(key, value) {
    try {
      getStorage()?.setItem(key, value);
      return true;
    } catch {
      return false;
    }
  }

  return {
    /** Idioma guardado ('es' | 'en') o null si no hay uno válido. */
    get language() {
      const v = read(KEYS.language);
      return v === 'es' || v === 'en' ? v : DEFAULT_PREFERENCES.language;
    },
    set language(value) { write(KEYS.language, String(value)); },
    /** Estado del interruptor de guía; visible por defecto. */
    get guide() {
      const v = read(KEYS.guide);
      return v === 'off' ? false : v === 'on' ? true : DEFAULT_PREFERENCES.guide;
    },
    set guide(value) { write(KEYS.guide, value ? 'on' : 'off'); },
    /** Interruptor del paisaje alrededor de la pista (circuitos-y-paisaje D9); encendido por defecto. */
    get scenery() {
      const v = read(KEYS.scenery);
      return v === 'off' ? false : v === 'on' ? true : DEFAULT_PREFERENCES.scenery;
    },
    set scenery(value) { write(KEYS.scenery, value ? 'on' : 'off'); },
    /** Interruptor "Atajos": atajos de una tecla encendidos o apagados; encendido por defecto. */
    get shortcuts() {
      const v = read(KEYS.shortcuts);
      return v === 'off' ? false : v === 'on' ? true : DEFAULT_SHORTCUTS;
    },
    set shortcuts(value) { write(KEYS.shortcuts, value ? 'on' : 'off'); },
    /** Ancho del panel derecho en píxeles, o null si no se guardó uno válido. */
    get panelWidth() {
      const v = Number.parseInt(read(KEYS.panelWidth) ?? '', 10);
      return Number.isFinite(v) && v > 0 ? v : DEFAULT_PREFERENCES.panelWidth;
    },
    set panelWidth(value) { write(KEYS.panelWidth, String(Math.round(value))); },
    /** Ancho del escenario en píxeles (con el tablero a la vista), o null si no se guardó uno válido. */
    get stageWidth() {
      const v = Number.parseInt(read(KEYS.stageWidth) ?? '', 10);
      return Number.isFinite(v) && v > 0 ? v : null;
    },
    set stageWidth(value) { write(KEYS.stageWidth, String(Math.round(value))); },
    /** Velocidad máxima del auto elegida (m/s), compartida por todas las pestañas, o null si no se guardó una válida. */
    get carSpeed() {
      const v = Number.parseFloat(read(KEYS.carSpeed) ?? '');
      return Number.isFinite(v) && v > 0 ? v : DEFAULT_PREFERENCES.carSpeed;
    },
    set carSpeed(value) { write(KEYS.carSpeed, String(value)); },
    /** Texto del programa de la pestaña Reglas a mano, o null si no hay uno (o es más largo que el máximo). */
    get rulesProgram() {
      const v = read(KEYS.rulesProgram);
      return typeof v === 'string' && v.length <= RULES_PROGRAM_MAX ? v : null;
    },
    set rulesProgram(value) { write(KEYS.rulesProgram, String(value ?? '')); },
    /**
     * Sensores del auto para el que está escrito el programa recordado (panel-de-entrenar-por-vistas
     * D15): { count, range, spread } con números, o null si no hay (o no se pueden leer). La pestaña
     * los ajusta a sus rangos.
     */
    get rulesSensors() {
      try {
        const v = JSON.parse(read(KEYS.rulesSensors) ?? 'null');
        const ok = v && ['count', 'range', 'spread'].every((k) => Number.isFinite(v[k]));
        return ok ? { count: v.count, range: v.range, spread: v.spread } : null;
      } catch {
        return null;
      }
    },
    set rulesSensors(value) {
      write(KEYS.rulesSensors, JSON.stringify({ count: value.count, range: value.range, spread: value.spread }));
    },
  };
}

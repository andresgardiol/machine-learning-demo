// Preferencias recordadas en el navegador (idioma, guía y ancho del panel). Toda lectura y escritura
// va dentro de un bloque que tolera que el almacenamiento no exista o falle.

const KEYS = Object.freeze({ language: 'mlLab.language', guide: 'mlLab.guide', panelWidth: 'mlLab.panelWidth' });

export const DEFAULT_PREFERENCES = Object.freeze({ language: null, guide: true, panelWidth: null });

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
    /** Ancho del panel derecho en píxeles, o null si no se guardó uno válido. */
    get panelWidth() {
      const v = Number.parseInt(read(KEYS.panelWidth) ?? '', 10);
      return Number.isFinite(v) && v > 0 ? v : DEFAULT_PREFERENCES.panelWidth;
    },
    set panelWidth(value) { write(KEYS.panelWidth, String(Math.round(value))); },
  };
}

// Preferencias de la V2 (interfaz-v2, design.md D6), sin DOM. Claves propias `mlLab.v2.*`, así la V2 no
// cambia las de la V1; el idioma (`mlLab.language`) se comparte para conservarlo al cambiar de versión.
// Toda lectura y escritura tolera que el almacenamiento no exista o falle: la V2 sigue en memoria.

export const V2_PREFIX = 'mlLab.v2.';
export const SHARED_LANGUAGE_KEY = 'mlLab.language';
export const STAGES = Object.freeze(['problema', 'reglas', 'evolucion', 'gradiente', 'evaluar', 'entender']);

const defaultStorage = () => globalThis.localStorage;

/**
 * @param {() => Storage} [getStorage] devuelve el almacenamiento; puede lanzar o devolver null
 */
export function createV2Preferences(getStorage = defaultStorage) {
  const memory = new Map(); // respaldo en memoria si el almacenamiento falla
  let storageWorks = true;

  function read(key) {
    try {
      const v = getStorage()?.getItem(key);
      if (v !== null && v !== undefined) return v;
    } catch {
      storageWorks = false;
    }
    return memory.has(key) ? memory.get(key) : null;
  }
  function write(key, value) {
    memory.set(key, value);
    try {
      const s = getStorage();
      if (!s) { storageWorks = false; return false; }
      s.setItem(key, value);
      return true;
    } catch {
      storageWorks = false;
      return false;
    }
  }
  const flag = (key, fallback) => {
    const v = read(V2_PREFIX + key);
    return v === 'on' ? true : v === 'off' ? false : fallback;
  };
  const setFlag = (key, value) => write(V2_PREFIX + key, value ? 'on' : 'off');

  return {
    /** false si alguna lectura o escritura falló: la V2 lo informa en lenguaje llano. */
    get storageWorks() { return storageWorks; },
    get language() {
      const v = read(SHARED_LANGUAGE_KEY);
      return v === 'es' || v === 'en' ? v : null;
    },
    set language(value) { write(SHARED_LANGUAGE_KEY, String(value)); },
    get guide() { return flag('guide', true); },
    set guide(v) { setFlag('guide', v); },
    get hints() { return flag('hints', true); },
    set hints(v) { setFlag('hints', v); },
    get shortcuts() { return flag('shortcuts', true); },
    set shortcuts(v) { setFlag('shortcuts', v); },
    /** Si el cuaderno quedó plegado (spec *Cuaderno plegable*). */
    get notebookFolded() { return flag('notebookFolded', false); },
    set notebookFolded(v) { setFlag('notebookFolded', v); },
    /** Última etapa abierta. */
    get stage() {
      const v = read(V2_PREFIX + 'stage');
      return STAGES.includes(v) ? v : null;
    },
    set stage(v) { if (STAGES.includes(v)) write(V2_PREFIX + 'stage', v); },
    /** Hoja abierta del cuaderno en una etapa (spec *El mentor vuelve a su hoja*). */
    sheet(stage) {
      const v = read(`${V2_PREFIX}sheet.${stage}`);
      return typeof v === 'string' && /^[a-z0-9-]{1,40}$/.test(v) ? v : null;
    },
    setSheet(stage, sheet) {
      if (!STAGES.includes(stage) || !/^[a-z0-9-]{1,40}$/.test(sheet)) return false;
      return write(`${V2_PREFIX}sheet.${stage}`, sheet);
    },
    /** Escenario compartido (design.md D7), como texto JSON; lo valida scenario.js. */
    get scenario() { return read(V2_PREFIX + 'scenario'); },
    set scenario(json) { write(V2_PREFIX + 'scenario', String(json)); },
    /** Programa recordado de Reglas a mano (como en la V1, pero con clave propia). */
    get rulesProgram() { return read(V2_PREFIX + 'rules.program'); },
    set rulesProgram(text) { write(V2_PREFIX + 'rules.program', String(text).slice(0, 20000)); },
  };
}

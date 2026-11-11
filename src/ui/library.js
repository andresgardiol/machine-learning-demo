// Biblioteca de cerebros, común a toda la app (design.md D8). No toca el DOM: recibe el
// almacenamiento, el reloj y el generador de identificadores, así se prueba en Node con unos falsos.
//
//   mlLab.brains             cerebros guardados (lista JSON)
//   mlLab.autosave.current   autoguardado del entrenamiento en curso   { session, brain }
//   mlLab.autosave.previous  autoguardado del entrenamiento anterior   { session, brain }
//
// Cada operación devuelve { ok: true, brain } o { ok: false, code } con un código que la vista
// traduce (protected, notFound, emptyName, notABrain, unsupportedVersion, shapeMismatch, notFinite,
// sensorMismatch). Si el almacenamiento falla, la biblioteca sigue en memoria y lo informa en
// `status` (`unavailable` si el navegador no permite guardar, `quota` si no queda espacio).
import { validateBrain, copyBrain } from '../core/brain.js';

export const STORAGE_KEYS = Object.freeze({
  brains: 'mlLab.brains',
  current: 'mlLab.autosave.current',
  previous: 'mlLab.autosave.previous',
});

export const NAME_MAX = 40;
export const AUTOSAVE_INTERVAL_MS = 1000;

/** Nombre limpio: sin espacios al principio ni al final y de 40 caracteres como máximo. */
export function cleanName(name) {
  return String(name ?? '').trim().slice(0, NAME_MAX).trim();
}

/**
 * Nombre que no choca con los de `taken`: si ya existe, se agrega un número entre paréntesis
 * ("Rayo (2)"), recortando el nombre si hace falta para no pasar de 40 caracteres.
 */
export function uniqueName(name, taken) {
  const used = new Set(taken);
  if (!used.has(name)) return name;
  for (let n = 2; ; n++) {
    const suffix = ` (${n})`;
    const candidate = `${name.slice(0, NAME_MAX - suffix.length).trim()}${suffix}`;
    if (!used.has(candidate)) return candidate;
  }
}

/** Nombre sugerido: la base ("Cerebro") con el menor número libre ("Cerebro 2" si ya existe "Cerebro 1"). */
export function suggestName(base, taken) {
  const used = new Set(taken);
  for (let n = 1; ; n++) {
    const candidate = `${cleanName(base)} ${n}`;
    if (!used.has(candidate)) return candidate;
  }
}

/** Nombre de archivo para exportar un cerebro, derivado de su nombre ("Prudente" → "prudente.json"). */
export function exportFileName(name) {
  const slug = String(name ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '')
    .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  return `${slug || 'brain'}.json`;
}

const fail = (code, details = {}) => ({ ok: false, code, details });

/** Almacenamiento seguro: cualquier falla se convierte en un código y nunca llega a quien llama. */
function safeStorage(storage) {
  let available = Boolean(storage);
  if (available) {
    try {
      const probe = '__mlLab.probe';
      storage.setItem(probe, '1');
      storage.removeItem(probe);
    } catch {
      available = false;
    }
  }
  const isQuota = (err) => Boolean(err) && (err.name === 'QuotaExceededError' || err.code === 22 || err.code === 1014
    || err.name === 'NS_ERROR_DOM_QUOTA_REACHED');
  return {
    get available() { return available; },
    read(key) {
      if (!available) return null;
      try { return storage.getItem(key); } catch { return null; }
    },
    /** Escribe; devuelve null o el problema ('quota' | 'unavailable'). */
    write(key, value) {
      if (!available) return 'unavailable';
      try {
        if (value === null) storage.removeItem(key);
        else storage.setItem(key, value);
        return null;
      } catch (err) {
        return isQuota(err) ? 'quota' : 'unavailable';
      }
    },
  };
}

const parse = (text) => { try { return JSON.parse(text); } catch { return undefined; } };

/**
 * @param {object} spec
 * @param {Storage|null} [spec.storage] almacenamiento del navegador (o uno falso); null si no hay
 * @param {() => number} spec.clock milisegundos desde la época (para las fechas y el límite de escritura)
 * @param {() => string} spec.newId identificador único para cada cerebro nuevo
 * @param {(fn:Function, ms:number) => any} [spec.schedule] para escribir más tarde un autoguardado demorado
 */
export function createLibrary({ storage = null, clock, newId, schedule = (fn, ms) => setTimeout(fn, ms) }) {
  const store = safeStorage(storage);
  const listeners = new Set();
  let problem = store.available ? null : 'unavailable';

  const iso = () => new Date(clock()).toISOString();

  // --- Estado en memoria, cargado del almacenamiento -------------------------------------------
  let saved = [];
  const loaded = parse(store.read(STORAGE_KEYS.brains));
  if (Array.isArray(loaded)) saved = loaded.filter((b) => validateBrain(b) === null);
  const loadSlot = (key) => {
    const v = parse(store.read(key));
    return v && typeof v === 'object' && typeof v.session === 'string' && validateBrain(v.brain) === null ? v : null;
  };
  const autosaves = { current: loadSlot(STORAGE_KEYS.current), previous: loadSlot(STORAGE_KEYS.previous) };

  // Autoguardado: como máximo una escritura por segundo.
  let lastAutosaveWrite = -Infinity;
  let autosaveDirty = false;
  let autosaveTimer = null;

  function notify() { for (const fn of [...listeners]) fn(); }

  function writeSaved() {
    const result = store.write(STORAGE_KEYS.brains, JSON.stringify(saved));
    problem = result ?? (store.available ? null : 'unavailable');
    return result;
  }

  function writeAutosaves() {
    autosaveDirty = false;
    lastAutosaveWrite = clock();
    const a = store.write(STORAGE_KEYS.current, autosaves.current ? JSON.stringify(autosaves.current) : null);
    const b = store.write(STORAGE_KEYS.previous, autosaves.previous ? JSON.stringify(autosaves.previous) : null);
    const result = a ?? b;
    if (result) problem = result;
    return result;
  }

  const savedNames = (exceptId) => saved.filter((b) => b.id !== exceptId).map((b) => b.name);
  const findSaved = (id) => saved.find((b) => b.id === id);
  const isAutosave = (id) => [autosaves.current, autosaves.previous].some((s) => s?.brain.id === id);

  const byRecent = (a, b) => (a.updatedAt < b.updatedAt ? 1 : a.updatedAt > b.updatedAt ? -1 : 0);

  /** Agrega un cerebro guardado con un nombre válido y único; nunca reemplaza otro. */
  function add(brain, { name, baseName, keepCreatedAt = false }) {
    const problemCode = validateBrain(brain);
    if (problemCode) return fail(problemCode.code, problemCode.details);
    const taken = savedNames();
    const clean = cleanName(name);
    const finalName = clean === '' ? suggestName(baseName ?? 'Brain', taken) : uniqueName(clean, taken);
    const now = iso();
    const entry = { ...copyBrain(brain), id: newId(), name: finalName, createdAt: keepCreatedAt ? brain.createdAt : now, updatedAt: now };
    saved = [entry, ...saved];
    const result = writeSaved();
    notify();
    return { ok: true, brain: copyBrain(entry), warning: result };
  }

  const library = {
    /**
     * Todos los cerebros: autoguardados (en curso y anterior) y guardados, estos del más reciente al
     * más antiguo. Cada elemento: { origin: 'autosave'|'saved', brain, slot? }.
     */
    list() {
      const out = [];
      for (const slot of ['current', 'previous']) {
        if (autosaves[slot]) out.push({ origin: 'autosave', slot, brain: autosaves[slot].brain });
      }
      for (const b of [...saved].sort(byRecent)) out.push({ origin: 'saved', brain: b });
      return out;
    },

    /** Cerebro por identificador, o null. */
    get(id) { return library.list().find((e) => e.brain.id === id) ?? null; },

    /** Nombre que se sugeriría al guardar sin escribir uno. */
    suggestName: (baseName) => suggestName(baseName, savedNames()),

    /** Guarda un cerebro nuevo con el nombre escrito (o el sugerido a partir de `baseName`). */
    save(brain, { name = '', baseName } = {}) { return add(brain, { name, baseName }); },

    /** Actualiza un cerebro guardado con la red y los datos de `brain`, conservando nombre, identificador y creación. */
    update(id, brain) {
      const old = findSaved(id);
      if (!old) return fail('notFound');
      const problemCode = validateBrain(brain);
      if (problemCode) return fail(problemCode.code, problemCode.details);
      const entry = { ...copyBrain(brain), id: old.id, name: old.name, createdAt: old.createdAt, updatedAt: iso() };
      saved = saved.map((b) => (b.id === id ? entry : b));
      const result = writeSaved();
      notify();
      return { ok: true, brain: copyBrain(entry), warning: result };
    },

    /** Cambia el nombre de un cerebro guardado con las mismas reglas que al guardar. */
    rename(id, name) {
      const old = findSaved(id);
      if (!old) return fail('notFound');
      const clean = cleanName(name);
      if (clean === '') return fail('emptyName');
      if (clean === old.name) return { ok: true, brain: copyBrain(old) };
      const entry = { ...old, name: uniqueName(clean, savedNames(id)) };
      saved = saved.map((b) => (b.id === id ? entry : b));
      const result = writeSaved();
      notify();
      return { ok: true, brain: copyBrain(entry), warning: result };
    },

    /** Elimina un cerebro guardado (la confirmación la pide la vista antes de llamar). */
    remove(id) {
      if (!findSaved(id)) return fail(isAutosave(id) ? 'protected' : 'notFound');
      saved = saved.filter((b) => b.id !== id);
      const result = writeSaved();
      notify();
      return { ok: true, warning: result };
    },

    /** Texto JSON con todo el cerebro, para descargarlo como archivo. */
    exportText(id) {
      const entry = library.get(id);
      if (!entry) return null;
      return JSON.stringify(entry.brain, null, 2);
    },

    /**
     * Agrega un cerebro desde el texto de un archivo exportado. Valida, nunca reemplaza otro (si el
     * nombre existe, agrega un número entre paréntesis) y, ante un archivo inválido, no cambia nada.
     */
    importText(text, { baseName } = {}) {
      const data = parse(text);
      if (data === undefined) return fail('notABrain');
      const problemCode = validateBrain(data);
      if (problemCode) return fail(problemCode.code, problemCode.details);
      return add(data, { name: data.name, baseName, keepCreatedAt: true });
    },

    /**
     * Autoguardado del campeón al terminar una generación. `session` identifica al entrenamiento: el
     * primer autoguardado de un entrenamiento nuevo pasa el del anterior a "entrenamiento anterior"
     * (así solo se rota si el que se abandona terminó al menos una generación). Se escribe como máximo
     * una vez por segundo; lo demorado se escribe después o con flush().
     */
    autosave(brain, { session }) {
      const problemCode = validateBrain(brain);
      if (problemCode) return fail(problemCode.code, problemCode.details);
      if (autosaves.current && autosaves.current.session !== session) autosaves.previous = autosaves.current;
      autosaves.current = { session, brain: copyBrain(brain) };
      autosaveDirty = true;
      const wait = lastAutosaveWrite + AUTOSAVE_INTERVAL_MS - clock();
      if (wait <= 0) writeAutosaves();
      else if (autosaveTimer === null) {
        autosaveTimer = schedule(() => {
          autosaveTimer = null;
          if (autosaveDirty) { writeAutosaves(); notify(); }
        }, wait);
      }
      notify();
      return { ok: true };
    },

    /** Escribe ya el autoguardado pendiente (al pausar, salir de la pestaña u ocultarse la página). */
    flush() {
      if (autosaveDirty) { writeAutosaves(); notify(); }
    },

    /** Avisa cada vez que la biblioteca cambia; devuelve la función para dejar de escuchar. */
    subscribe(fn) { listeners.add(fn); return () => listeners.delete(fn); },

    /** Estado del almacenamiento: { persistent, problem: null | 'unavailable' | 'quota' }. */
    get status() { return { persistent: store.available, problem }; },
  };
  return library;
}

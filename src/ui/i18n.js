// Sistema de idiomas: diccionarios de claves planas, traducción con parámetros,
// reescritura en vivo del DOM y elección del idioma inicial.
//
// Los elementos declaran su texto con atributos:
//   data-i18n="clave"                 -> textContent
//   data-i18n-attr="aria-label:clave"  -> atributos (varios separados por ";")
//   data-i18n-params='{"n": 3}'        -> parámetros para {n} en el texto
// Los textos con valores que cambian se suscriben con onChange.

export const LANGUAGES = Object.freeze(['es', 'en']);

/** Idioma inicial: la preferencia recordada manda; si no, español si el navegador prefiere español, inglés en cualquier otro caso. */
export function pickInitialLanguage({ stored = null, browserLanguages = [] } = {}) {
  if (LANGUAGES.includes(stored)) return stored;
  const first = String(browserLanguages[0] ?? '').toLowerCase();
  return first === 'es' || first.startsWith('es-') ? 'es' : 'en';
}

/** Reemplaza {nombre} por params.nombre. Los marcadores sin valor quedan como están. */
export function format(text, params) {
  if (!params) return text;
  return text.replace(/\{(\w+)\}/g, (whole, name) => (name in params ? String(params[name]) : whole));
}

// Números según el idioma (design.md D16): coma decimal en español, punto en inglés, sin separador
// de miles y hasta 2 decimales. El redondeo lo decide quien llama.
const numberFormats = new Map();

/** Número escrito según el idioma `language`. */
export function formatNumber(value, language) {
  let nf = numberFormats.get(language);
  if (!nf) {
    nf = new Intl.NumberFormat(language, { useGrouping: false, maximumFractionDigits: 2 });
    numberFormats.set(language, nf);
  }
  return nf.format(value);
}

const fixedFormats = new Map();

/** Número con exactamente `digits` decimales según el idioma `language`, sin separador de miles ("0,40" / "0.40"). */
export function formatFixed(value, digits, language) {
  const key = `${language}:${digits}`;
  let nf = fixedFormats.get(key);
  if (!nf) {
    nf = new Intl.NumberFormat(language, { useGrouping: false, minimumFractionDigits: digits, maximumFractionDigits: digits });
    fixedFormats.set(key, nf);
  }
  return nf.format(value);
}

/** Copia de los parámetros con cada número ya escrito según el idioma; el resto queda igual. */
export function localizeParams(params, language) {
  if (!params) return params;
  const out = {};
  for (const [k, v] of Object.entries(params)) out[k] = typeof v === 'number' && Number.isFinite(v) ? formatNumber(v, language) : v;
  return out;
}

/**
 * @param {{dictionaries: Record<string, Record<string,string>>, language?: string}} spec
 */
export function createI18n({ dictionaries, language = 'es' }) {
  let current = LANGUAGES.includes(language) ? language : 'es';
  const listeners = new Set();
  // Rótulos con su atajo: con los atajos de una tecla apagados, un texto que tiene la variante
  // `<clave>.plain` usa esa, sin la tecla ("Pausar" en lugar de "Pausar (espacio)").
  let shortcutLabels = true;

  const other = (lang) => LANGUAGES.find((l) => l !== lang);

  const has = (key) => LANGUAGES.some((l) => typeof dictionaries[l]?.[key] === 'string');

  /**
   * Texto de `key` en el idioma activo; si falta, el del otro idioma; si falta en ambos, la clave.
   * Singular: si params.value es 1 y existe `<key>.one`, se usa esa variante ("1 rayo", no "1 rayos").
   * Los parámetros numéricos se escriben según el idioma activo ("1,5" en español, "1.5" en inglés).
   */
  function t(key, params) {
    const variant = singularKey(plainKey(key), params);
    const own = dictionaries[current]?.[variant];
    const text = own ?? dictionaries[other(current)]?.[variant] ?? key;
    return format(text, localizeParams(params, current));
  }

  function plainKey(key) {
    return !shortcutLabels && has(`${key}.plain`) ? `${key}.plain` : key;
  }

  /** Muestra u oculta las teclas de atajo en los rótulos; avisa como un cambio de idioma. */
  function setShortcutLabels(on) {
    if (Boolean(on) === shortcutLabels) return;
    shortcutLabels = Boolean(on);
    for (const fn of [...listeners]) fn(current);
  }

  function singularKey(key, params) {
    if (params && Number(params.value) === 1 && has(`${key}.one`)) return `${key}.one`;
    return key;
  }

  function setLanguage(next) {
    if (!LANGUAGES.includes(next) || next === current) return;
    current = next;
    for (const fn of [...listeners]) fn(current);
  }

  function onChange(fn) {
    listeners.add(fn);
    return () => listeners.delete(fn);
  }

  /** Reescribe los textos declarados con data-i18n dentro de `root` (incluido root). */
  function translateTree(root) {
    if (!root || typeof root.querySelectorAll !== 'function') return;
    const nodes = [root, ...root.querySelectorAll('[data-i18n], [data-i18n-attr]')];
    for (const el of nodes) {
      if (!el.getAttribute) continue;
      let params;
      const raw = el.getAttribute('data-i18n-params');
      if (raw) { try { params = JSON.parse(raw); } catch { params = undefined; } }
      const key = el.getAttribute('data-i18n');
      if (key) el.textContent = t(key, params);
      const attrs = el.getAttribute('data-i18n-attr');
      if (attrs) {
        for (const pair of attrs.split(';')) {
          const [name, k] = pair.split(':').map((s) => s.trim());
          if (name && k) el.setAttribute(name, t(k, params));
        }
      }
    }
  }

  return {
    t, has, setLanguage, onChange, translateTree, setShortcutLabels,
    get shortcutLabels() { return shortcutLabels; },
    get language() { return current; },
    get dictionaries() { return dictionaries; },
  };
}

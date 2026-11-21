// Idioma de la teoría (seccion-teoria D6), sin DOM: el mismo valor guardado que la app
// ('mlLab.language', por src/ui/preferences.js) y la misma regla de idioma inicial (pickInitialLanguage
// de src/ui/i18n.js): el guardado si es válido; si no, español cuando el navegador prefiere español, e
// inglés en otro caso. Elegir idioma acá lo cambia también en la app.

import { createPreferences } from '../ui/preferences.js';
import { pickInitialLanguage } from '../ui/i18n.js';

export const IDIOMAS = Object.freeze(['es', 'en']);

const navegador = () => {
  const n = globalThis.navigator;
  return n ? (n.languages?.length ? n.languages : [n.language]) : [];
};

/**
 * @param {{getStorage?: () => Storage, idiomasDelNavegador?: readonly string[]}} [opciones]
 * @returns {'es'|'en'}
 */
export function idiomaInicial({ getStorage, idiomasDelNavegador = navegador() } = {}) {
  const guardado = createPreferences(getStorage).language;
  return pickInitialLanguage({ stored: guardado, browserLanguages: idiomasDelNavegador });
}

/** Guarda el idioma elegido, con la misma clave que la app. Sin almacenamiento, no hace nada. */
export function guardarIdioma(idioma, { getStorage } = {}) {
  if (!IDIOMAS.includes(idioma)) throw new RangeError(`idioma desconocido: ${idioma}`);
  createPreferences(getStorage).language = idioma;
}

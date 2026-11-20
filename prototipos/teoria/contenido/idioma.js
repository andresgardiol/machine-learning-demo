// Idioma de los prototipos de teoría (teoria-prototipos D7): el mismo valor que guarda la app en el
// navegador ('mlLab.language', ver src/ui/preferences.js y src/v2/preferences.js), y español si no hay
// uno válido. No se importa de src/ui: los prototipos solo importan de src/core y src/render (D1); una
// prueba comprueba que la clave sigue siendo la de la app.

export const CLAVE_IDIOMA = 'mlLab.language';
export const IDIOMAS = Object.freeze(['es', 'en']);
export const IDIOMA_POR_DEFECTO = 'es';

/**
 * Idioma a mostrar: 'es' o 'en'.
 * @param {() => Storage} [getStorage] devuelve el almacenamiento; puede no existir o lanzar
 */
export function elegirIdioma(getStorage = () => globalThis.localStorage) {
  let guardado = null;
  try {
    guardado = getStorage()?.getItem(CLAVE_IDIOMA) ?? null;
  } catch {
    guardado = null;
  }
  return IDIOMAS.includes(guardado) ? guardado : IDIOMA_POR_DEFECTO;
}

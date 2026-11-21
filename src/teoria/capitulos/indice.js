// El temario de la teoría (seccion-teoria D2, D7 y D9), sin DOM y sin idioma: qué capítulos hay, en qué
// orden, cuáles se pueden abrir y en qué pestaña de la práctica se toca lo que explican. Los títulos y
// las frases van en contenido/<idioma>/comun.js, por id.
//
// Un capítulo `disponible` tiene guion (capitulos/<id>/guion.js), figura (capitulos/<id>/figura.js) y
// contenido en los dos idiomas (contenido/<idioma>/<id>.js); una prueba lo comprueba. Los que no lo
// están se ven como "próximamente" y no se abren.
//
// pestanas: ids de pestaña de la app (los nombres están en comun.js, `pestanas`); ejercicio: un ejercicio
// dentro de la pestaña, o null. En los capítulos 3 a 9 son propuestos: los confirma el cambio que los
// escriba.

const congelar = (o) => {
  for (const v of Object.values(o)) if (v && typeof v === 'object') congelar(v);
  return Object.freeze(o);
};

export const CAPITULOS = congelar([
  { id: 'programar', numero: 0, disponible: true, pestanas: ['drive', 'rules'], ejercicio: null },
  { id: 'neurona', numero: 1, disponible: true, pestanas: ['lab'], ejercicio: 'gates' },
  { id: 'xor', numero: 2, disponible: true, pestanas: ['lab'], ejercicio: 'xor' },
  { id: 'adelante', numero: 3, disponible: true, pestanas: ['inspect'], ejercicio: null },
  { id: 'error', numero: 4, disponible: true, pestanas: ['lab'], ejercicio: null },
  { id: 'corregir', numero: 5, disponible: true, pestanas: ['lab'], ejercicio: null },
  { id: 'culpa', numero: 6, disponible: true, pestanas: ['lab'], ejercicio: null },
  { id: 'evolucion', numero: 7, disponible: true, pestanas: ['train'], ejercicio: null },
  { id: 'generalizar', numero: 8, disponible: true, pestanas: ['compete', 'lab'], ejercicio: null },
  { id: 'adentro', numero: 9, disponible: true, pestanas: ['inspect'], ejercicio: null },
]);

/** Ids de los capítulos que se pueden abrir. */
export const DISPONIBLES = Object.freeze(CAPITULOS.filter((c) => c.disponible).map((c) => c.id));

/** El capítulo con ese id, o null. */
export const capituloDe = (id) => CAPITULOS.find((c) => c.id === id) ?? null;

/**
 * Lo que sigue en el temario después de leer algo: desde la historia ('historia'), el primer capítulo que
 * se puede abrir; desde un capítulo, el siguiente que se puede abrir. null si no queda ninguno (o si el
 * id no es del temario).
 * @param {string} desde 'historia' o el id de un capítulo
 */
export function siguienteDe(desde) {
  const i = desde === 'historia' ? -1 : CAPITULOS.findIndex((c) => c.id === desde);
  if (desde !== 'historia' && i === -1) return null;
  return CAPITULOS.slice(i + 1).find((c) => c.disponible) ?? null;
}

/**
 * A dónde llevan "Ir a la app" y el enlace del cierre de cada capítulo, desde /teoria/ (D7): la raíz de
 * la app, la V1. Cuando se decida entre V1 y V2 se cambia solo esto.
 */
export const DESTINO_APP = '../';

// Carga de contenido de la teoría (seccion-teoria D2), sin DOM: el de cada capítulo y el de la historia
// se piden con import() al abrirlos, en el idioma activo. La portada no descarga ninguno.

/** El contenido de un capítulo o de la historia en un idioma: contenido/<idioma>/<id>.js. */
export const cargarContenido = async (id, idioma) => (await import(`./contenido/${idioma}/${id}.js`)).default;

/** El guion y la figura de un capítulo: capitulos/<id>/guion.js y capitulos/<id>/figura.js. */
export async function cargarCapitulo(id) {
  const [guion, figura] = await Promise.all([import(`./capitulos/${id}/guion.js`), import(`./capitulos/${id}/figura.js`)]);
  return { guion: guion.TRAMOS, crearFigura: figura.crearFigura };
}

/** Solo el guion de un capítulo (sin la figura, que usa el DOM). */
export const cargarGuion = async (id) => (await import(`./capitulos/${id}/guion.js`)).TRAMOS;

/** Une el guion con la prosa de un idioma: cada tramo queda con su estado y sus textos. */
export function armarTramos(guion, textos) {
  return guion.map((item) => {
    const texto = textos[item.id];
    if (!texto) throw new Error(`falta el texto del tramo "${item.id}"`);
    return { ...item, ...texto };
  });
}

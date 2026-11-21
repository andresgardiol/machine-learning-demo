// Los hitos de la historia (seccion-teoria D8), sin idioma y sin DOM: su id, dónde va su marca en la
// línea de tiempo y el capítulo al que apuntan (o null). Si ese capítulo se puede abrir lo dice
// capitulos/indice.js. Los textos de cada hito van en contenido/<idioma>/historia.js, por id.
//
// marca: el año donde se dibuja la marca. Los dos inviernos son épocas, no años: el primero (1974 a 1980,
//   aproximado) se marca en 1974 y el segundo (1987 a 1993, según se lo suele fechar) en 1990.
// pausa: un invierno sin vínculo con la práctica (el primero). El segundo sí nombra una pestaña.
// arriba: en la línea de un solo renglón, su rótulo va arriba del riel para no pisar al de al lado.
//
// Los vínculos de 1997 a 2022 son los que confirmó la revisión de contenido
// (openspec/changes/archive/2026-11-20-seccion-teoria/revision-contenido-historia.md): 2012 quedó sin capítulo.

const congelar = (lista) => Object.freeze(lista.map(Object.freeze));

export const HITOS = congelar([
  { id: 'h1943', marca: 1943, capitulo: 'neurona' },
  { id: 'h1958', marca: 1958, capitulo: 'neurona' },
  { id: 'h1969', marca: 1969, capitulo: 'xor' },
  { id: 'h1970', marca: 1974, capitulo: null, pausa: true, arriba: true },
  { id: 'h1986', marca: 1986, capitulo: 'culpa' },
  { id: 'h1987', marca: 1990, capitulo: null, arriba: true },
  { id: 'h1997', marca: 1997, capitulo: 'programar' },
  { id: 'h1998', marca: 1998, capitulo: 'culpa', arriba: true },
  { id: 'h2012', marca: 2012, capitulo: null },
  { id: 'h2016', marca: 2016, capitulo: null },
  { id: 'h2017', marca: 2017, capitulo: null, arriba: true },
  { id: 'h2022', marca: 2022, capitulo: null },
]);

/**
 * La línea de tiempo va a escala por tramos (D8): con doce marcas, una sola escala amontona el final.
 * Dentro de cada tramo los años van a escala; entre un tramo y el siguiente hay un corte, que se dibuja.
 */
export const TRAMOS_DE_LA_LINEA = congelar([
  { desde: 1943, hasta: 1990 },
  { desde: 1997, hasta: 2022 },
]);

/**
 * Dónde cae un año en la línea: en qué tramo y a qué fracción de ese tramo (0 = su comienzo, 1 = su
 * final). Un año que cae en un corte queda en el borde del tramo más cercano.
 * @returns {{tramo: number, lugar: number}}
 */
export function lugarEnLaLinea(anio, tramos = TRAMOS_DE_LA_LINEA) {
  if (!Number.isFinite(anio)) throw new TypeError('el año tiene que ser un número');
  let tramo = 0;
  for (let i = 0; i < tramos.length; i++) {
    if (anio >= tramos[i].desde) tramo = i;
  }
  const { desde, hasta } = tramos[tramo];
  if (anio > hasta && tramo + 1 < tramos.length && tramos[tramo + 1].desde - anio < anio - hasta) {
    return { tramo: tramo + 1, lugar: 0 };
  }
  return { tramo, lugar: Math.max(0, Math.min(1, (anio - desde) / (hasta - desde))) };
}

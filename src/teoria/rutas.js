// Direcciones de la teoría (seccion-teoria D1), sin DOM. Una sola página; lo que se ve lo dice lo que va
// después del #:
//
//   /teoria/              portada
//   /teoria/#historia     la historia (#historia/3: el tercer hito)
//   /teoria/#neurona      un capítulo, en su primer tramo
//   /teoria/#neurona/3    un capítulo, en su tramo 3 (se cuenta desde 1)
//
// Cualquier otra cosa, un capítulo que no existe o uno que todavía no se puede abrir, es la portada. Un
// tramo más alto que los que tiene el capítulo no se resuelve acá (el guion se carga después): la
// película lo lleva al último.

import { DISPONIBLES } from './capitulos/indice.js';

export const PORTADA = Object.freeze({ vista: 'portada' });

const TRAMO = /^[1-9]\d{0,2}$/;

/**
 * @param {string} hash lo de `location.hash`, con o sin el #
 * @param {{disponibles?: readonly string[]}} [opciones] ids de los capítulos que se pueden abrir
 * @returns {{vista: 'portada'} | {vista: 'historia', tramo: number} | {vista: 'capitulo', id: string, tramo: number}}
 */
export function leerRuta(hash, { disponibles = DISPONIBLES } = {}) {
  let texto = String(hash ?? '').replace(/^#/, '');
  try { texto = decodeURIComponent(texto); } catch { return PORTADA; }
  if (texto === '') return PORTADA;
  const partes = texto.split('/');
  if (partes.length > 2) return PORTADA;
  const [id, tramoTexto] = partes;
  let tramo = 1;
  if (partes.length === 2) {
    if (!TRAMO.test(tramoTexto)) return PORTADA;
    tramo = Number(tramoTexto);
  }
  if (id === 'historia') return { vista: 'historia', tramo };
  if (disponibles.includes(id)) return { vista: 'capitulo', id, tramo };
  return PORTADA;
}

/**
 * La dirección (lo que va en `location.hash`) de una ruta. El tramo 1 no se escribe: `#neurona` y
 * `#neurona/1` son lo mismo.
 * @returns {string} '' para la portada; si no, empieza con #
 */
export function direccionDe(ruta) {
  if (!ruta || ruta.vista === 'portada') return '';
  const base = ruta.vista === 'historia' ? 'historia' : ruta.id;
  const tramo = Number.isInteger(ruta.tramo) && ruta.tramo > 1 ? `/${ruta.tramo}` : '';
  return `#${base}${tramo}`;
}

/** ¿Las dos rutas muestran la misma vista (la misma página, aunque en otro tramo)? */
export function mismaVista(a, b) {
  return a.vista === b.vista && (a.vista !== 'capitulo' || a.id === b.id);
}

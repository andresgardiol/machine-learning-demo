// Guion de "Programar o aprender" (seccion-teoria D9, capítulo 0): lo que NO cambia con el idioma. Seis
// tramos, cada uno con el estado de la figura al llegar. La prosa va en contenido/<idioma>/programar.js,
// por id de tramo. Lo que la persona cambia en un tramo queda en ese tramo (estado-figura.js).
//
// Un estado es { vista, umbrales: [izquierdo, derecho], elegida }:
//   umbrales  el número de cada regla ("si el sensor pasa de X, doblar")
//   elegida   qué situación muestra el auto al llegar (índice en SITUACIONES); elegir otra no cuenta
//             como un cambio de la persona
//
// vista: qué deja ver y tocar la figura.
//   fija        seis situaciones y una regla, sin perilla
//   umbral      + la perilla de la regla
//   ocho        las ocho situaciones, una regla con su perilla
//   prediccion  la segunda regla a la vista pero todavía sin contar; sin perillas
//   dos         las dos reglas, con sus perillas (lo que queda al resolver la predicción)
//   buscar      + "Buscar"
//   desafio     como "buscar"; la figura informa el avance del desafío

import { SITUACIONES, contarAciertos } from './cuenta.js';

const congelar = (o) => {
  for (const v of Object.values(o)) if (v && typeof v === 'object') congelar(v);
  return Object.freeze(o);
};

export const VISTAS = Object.freeze(['fija', 'umbral', 'ocho', 'prediccion', 'dos', 'buscar', 'desafio']);

/** Qué muestra cada vista: cuántas situaciones, cuántas reglas cuentan y qué se puede tocar. */
export const DE_LA_VISTA = congelar({
  fija: { situaciones: 6, reglas: 1, perillas: 0, pendiente: false, buscar: false },
  umbral: { situaciones: 6, reglas: 1, perillas: 1, pendiente: false, buscar: false },
  ocho: { situaciones: 8, reglas: 1, perillas: 1, pendiente: false, buscar: false },
  prediccion: { situaciones: 8, reglas: 1, perillas: 0, pendiente: true, buscar: false },
  dos: { situaciones: 8, reglas: 2, perillas: 2, pendiente: false, buscar: false },
  buscar: { situaciones: 8, reglas: 2, perillas: 2, pendiente: false, buscar: true },
  desafio: { situaciones: 8, reglas: 2, perillas: 2, pendiente: false, buscar: true },
});

/** Las reglas que cuentan con unos umbrales: una (sensor izquierdo) o las dos. */
export const reglasDe = ([izquierdo, derecho], cuantas) => [
  { sensor: 'izquierdo', umbral: izquierdo },
  { sensor: 'derecho', umbral: derecho },
].slice(0, cuantas);

/** Las situaciones que muestra una vista y cuántas da bien con esos umbrales. */
export function aciertosDelEstado({ vista, umbrales }, { reglas = DE_LA_VISTA[vista].reglas } = {}) {
  return contarAciertos(reglasDe(umbrales, reglas), SITUACIONES.slice(0, DE_LA_VISTA[vista].situaciones));
}

/** La respuesta de la predicción: cuántas quedan mal con las dos reglas. Sale de hacer la cuenta. */
export const OPCIONES_DE_LA_PREDICCION = Object.freeze(['ninguna', 'una', 'dos']);
export function respuestaDeLaPrediccion(despues) {
  const { aciertos, total } = aciertosDelEstado(despues);
  return OPCIONES_DE_LA_PREDICCION[total - aciertos] ?? null;
}

const DESPUES = { vista: 'dos', umbrales: [0.5, 0.3], elegida: 7 };

export const TRAMOS = congelar([
  { id: 'regla', estado: { vista: 'fija', umbrales: [0.5, 0.5], elegida: 0 } },
  { id: 'umbral', estado: { vista: 'umbral', umbrales: [0.1, 0.5], elegida: 3 } },
  { id: 'otra', estado: { vista: 'ocho', umbrales: [0.5, 0.5], elegida: 6 } },
  {
    id: 'prediccion',
    estado: { vista: 'prediccion', umbrales: [0.5, 0.3], elegida: 6 },
    // Al resolver, la segunda regla empieza a contar. La respuesta correcta sale de la cuenta.
    prediccion: { despues: DESPUES, correcta: respuestaDeLaPrediccion(DESPUES) },
  },
  { id: 'buscar', estado: { vista: 'buscar', umbrales: [0.9, 0.1], elegida: 0 } },
  { id: 'desafio', estado: { vista: 'desafio', umbrales: [0.2, 0.2], elegida: 0 } },
]);

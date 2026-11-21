// Guion de "Una recta no alcanza" (seccion-teoria D9, capítulo 2): lo que NO cambia con el idioma. Seis
// tramos, cada uno con el estado de la figura al llegar. La prosa va en contenido/<idioma>/xor.js, por id
// de tramo. Lo que la persona cambia en un tramo queda en ese tramo (estado-figura.js).
//
// Un estado es { vista, a, b, c, elegido }: las tres neuronas de la red, cada una { pesos: [w1, w2],
// sesgo }, estén o no a la vista. A y B reciben las dos entradas; C recibe lo que responden A y B.
// `elegido` es el punto del XOR cuya cuenta se muestra al llegar (índice en TABLA_XOR); elegir otro no
// cuenta como un cambio de la persona.
//
// vista: qué deja ver y tocar la figura.
//   una         una neurona (A) y su recta; sus tres perillas
//   dos         A y B, cada una con su recta; se elige cuál mover
//   prediccion  A y B, sin perillas hasta que se elige
//   entre       como "dos", con la franja entre las dos rectas marcada (lo que queda al resolver)
//   tres        la red entera: C junta lo que responden A y B; sin perillas
//   desafio     la red entera, con las perillas de C; la figura informa el avance del desafío

import { TABLA_XOR, crearRed, respuestasOcultas } from './cuenta.js';

const congelar = (o) => {
  for (const v of Object.values(o)) if (v && typeof v === 'object') congelar(v);
  return Object.freeze(o);
};

export const VISTAS = Object.freeze(['una', 'dos', 'prediccion', 'entre', 'tres', 'desafio']);

/** Qué muestra cada vista: cuántas neuronas, cuáles se pueden mover y si se marca la franja. */
export const DE_LA_VISTA = congelar({
  una: { neuronas: 1, edita: ['a'], franja: false },
  dos: { neuronas: 2, edita: ['a', 'b'], franja: false },
  prediccion: { neuronas: 2, edita: [], franja: false },
  entre: { neuronas: 2, edita: ['a', 'b'], franja: true },
  tres: { neuronas: 3, edita: [], franja: false },
  desafio: { neuronas: 3, edita: ['c'], franja: false },
});

const neurona = (w1, w2, sesgo) => ({ pesos: [w1, w2], sesgo });
const ALGUNA = neurona(1, 1, -0.5); // se enciende si alguna entrada vale 1
const LAS_DOS = neurona(1, 1, -1.5); // solo si las dos valen 1 (el AND de "Una neurona")
const LEJOS = neurona(1, 1, -2.4); // su recta queda más allá de los cuatro puntos

/** Los valores de la red como los recibe cuenta.js. */
export const redDe = ({ a, b, c }) => ({ ocultas: [a, b], salida: c });

/** Los puntos que quedan entre las dos rectas: donde A se enciende y B no. */
export function puntosEntre(estado) {
  return respuestasOcultas(crearRed(redDe(estado))).filter((p) => p.ocultas[0] === 1 && p.ocultas[1] === 0).map((p) => p.entradas);
}

/** La respuesta de la predicción: qué puntos quedan entre las dos rectas. Sale de hacer la cuenta. */
export function respuestaDeLaPrediccion(despues) {
  const entre = puntosEntre(despues).map((e) => e.join()).sort().join(' ');
  const de = (salida) => TABLA_XOR.filter((p) => p.salida === salida).map((p) => p.entradas.join()).sort().join(' ');
  if (entre === de(1)) return 'circulos';
  if (entre === '1,1') return 'cuadrado';
  if (entre === ['0,1', '1,0', '1,1'].join(' ')) return 'tres';
  return null;
}

const DESPUES = { vista: 'entre', a: ALGUNA, b: LAS_DOS, c: ALGUNA, elegido: 3 };

export const TRAMOS = congelar([
  { id: 'distintas', estado: { vista: 'una', a: LAS_DOS, b: LEJOS, c: ALGUNA, elegido: 1 } },
  { id: 'tope', estado: { vista: 'una', a: ALGUNA, b: LEJOS, c: ALGUNA, elegido: 3 } },
  { id: 'dos', estado: { vista: 'dos', a: ALGUNA, b: neurona(0, 1, -0.5), c: ALGUNA, elegido: 1 } },
  {
    id: 'prediccion',
    estado: { vista: 'prediccion', a: ALGUNA, b: LEJOS, c: ALGUNA, elegido: 3 },
    // Al resolver, el sesgo de B pasa de −2,4 a −1,5: su recta se corre hacia el medio.
    prediccion: { despues: DESPUES, correcta: respuestaDeLaPrediccion(DESPUES) },
  },
  { id: 'junta', estado: { vista: 'tres', a: ALGUNA, b: LAS_DOS, c: ALGUNA, elegido: 3 } },
  { id: 'desafio', estado: { vista: 'desafio', a: ALGUNA, b: LAS_DOS, c: ALGUNA, elegido: 3 } },
]);

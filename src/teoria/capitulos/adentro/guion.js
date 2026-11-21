// Guion de "Qué quedó adentro" (seccion-teoria D12, capítulo 9): lo que NO cambia con el idioma. Seis
// tramos, cada uno con el estado de la figura al llegar. La prosa va en contenido/<idioma>/adentro.js.
//
// Un estado es { vista, mapa, apagadas, peso }: `mapa` es de qué neurona se pinta el mapa ('a', 'b' o
// 'c'; c es la salida: dónde la red da 1); `apagadas`, las ocultas apagadas (0 es A, 1 es B); `peso`, el
// que va de B a la salida, que en la red del XOR vale −1.
//
// vista: qué deja ver y tocar la figura.
//   red         la red con sus números y los cuatro casos; nada que tocar
//   mapa        se elige una neurona: el mapa de dónde se enciende
//   apagar      se apaga y se prende cada oculta
//   prediccion  la red entera, hasta que se elige
//   apagada     la red con la oculta apagada (lo que queda al resolver)
//   peso        se mueve un peso
//   desafio     se apaga y se prende cada oculta; la figura informa el avance del desafío

import { ESCENAS, respuestas, casosQueFallan, redConPeso } from './cuenta.js';
import { RED_XOR, TABLA_XOR } from '../xor/cuenta.js';

const congelar = (o) => {
  for (const v of Object.values(o)) if (v && typeof v === 'object') congelar(v);
  return Object.freeze(o);
};

export const VISTAS = Object.freeze(['red', 'mapa', 'apagar', 'prediccion', 'apagada', 'peso', 'desafio']);
export const NEURONAS = Object.freeze(['a', 'b', 'c']);

/**
 * Qué muestra cada vista: si deja elegir el mapa, qué ocultas deja apagar (0 es A, 1 es B) y si deja
 * mover el peso. En el tramo 3 solo se apaga B: qué pasa sin A es la predicción del tramo 4.
 */
export const DE_LA_VISTA = congelar({
  red: { elegirMapa: false, apagar: [], peso: false },
  mapa: { elegirMapa: true, apagar: [], peso: false },
  apagar: { elegirMapa: false, apagar: [1], peso: false },
  prediccion: { elegirMapa: false, apagar: [], peso: false },
  apagada: { elegirMapa: false, apagar: [], peso: false },
  peso: { elegirMapa: false, apagar: [], peso: true },
  desafio: { elegirMapa: false, apagar: [0, 1], peso: false },
});

/** Entre qué valores se mueve el peso del tramo 5. */
export const RANGO_PESO = Object.freeze({ desde: -2, hasta: 2, paso: 0.1 });
/** El peso de B a la salida en la red del XOR. */
export const PESO = RED_XOR.salida.pesos[1];

/** La red del estado: la del XOR con el peso de B a la salida que diga el estado. */
export const redDe = (estado) => redConPeso(estado.peso);

/** Lo que contesta la red del estado en cada caso, con sus ocultas apagadas. */
export const casosDe = (estado) => respuestas(estado.apagadas, redDe(estado));

/**
 * La respuesta de la predicción: qué casos falla la red con las ocultas apagadas del estado. 'distintas':
 * los dos de entradas distintas; 'iguales': solo el de las dos entradas en 1; 'ninguno'. Sale de hacer
 * la cuenta.
 */
export function respuestaDeLaPrediccion(estado) {
  const fallan = casosQueFallan(estado.apagadas, redDe(estado)).map((e) => e.join()).sort().join(' ');
  if (fallan === '') return 'ninguno';
  if (fallan === '0,1 1,0') return 'distintas';
  if (fallan === '1,1') return 'iguales';
  return null;
}

/**
 * El avance del desafío: cuántos de los cuatro casos quedan como pide (el caso de ESCENAS.desafio mal y
 * los otros tres bien).
 * @returns {{bien: number, total: number}}
 */
export function avanceDelDesafio(estado) {
  const pedido = ESCENAS.desafio.caso.join();
  const bien = casosDe(estado).filter((k) => k.bien === (k.entradas.join() !== pedido)).length;
  return { bien, total: TABLA_XOR.length };
}

const estado = (vista, mas = {}) => ({ vista, mapa: 'c', apagadas: [], peso: PESO, ...mas });
const DESPUES = estado('apagada', { apagadas: [...ESCENAS.prediccion.apagar] });

export const TRAMOS = congelar([
  { id: 'aprendio', estado: estado('red') },
  { id: 'mira', estado: estado('mapa', { mapa: 'a' }) },
  { id: 'apago', estado: estado('apagar') },
  { id: 'prediccion', estado: estado('prediccion'), prediccion: { despues: DESPUES, correcta: respuestaDeLaPrediccion(DESPUES) } },
  { id: 'reglas', estado: estado('peso') },
  { id: 'desafio', estado: estado('desafio') },
]);

// Guion de "Repartir la culpa" (seccion-teoria D12, capítulo 6): lo que NO cambia con el idioma. Seis
// tramos, cada uno con el estado de la figura al llegar. La prosa va en contenido/<idioma>/culpa.js.
//
// Un estado es { vista, pasos, peso, epocas }: `pasos` es cuánto de la vuelta ya se ve (0: nada; 1: la
// culpa de la salida; 2: la de las ocultas; 3: cuánto cambia cada peso); `peso` es el valor del peso del
// desafío (el que va de la oculta A a la salida); `epocas`, cuántas pasadas por los cuatro ejemplos se
// dieron. El ejemplo que se sigue es siempre el mismo: entradas 1 y 0, respuesta correcta 1.
//
// vista: qué deja ver y tocar la figura.
//   ejemplo     la ida hecha y el error del ejemplo; nada que tocar
//   vuelta      "Paso" muestra la culpa de la salida
//   atras       "Paso" lleva la culpa a las ocultas
//   prediccion  las culpas a la vista, sin los cambios, hasta que se elige
//   cambios     cuánto cambia cada peso (lo que queda al resolver)
//   epocas      "Una época" y "100 épocas" corrigen la red; la curva del error
//   desafio     se mueve un peso a mano; la figura informa el avance del desafío

import { RED_INICIAL, DESAFIO, crearRedSuave, idaYVuelta, pesoQueMasCambia, avanceDelDesafio as avance } from './cuenta.js';

const congelar = (o) => {
  for (const v of Object.values(o)) if (v && typeof v === 'object') congelar(v);
  return Object.freeze(o);
};

export const VISTAS = Object.freeze(['ejemplo', 'vuelta', 'atras', 'prediccion', 'cambios', 'epocas', 'desafio']);

/** Qué muestra cada vista: hasta qué paso deja avanzar "Paso", y si deja correr épocas o mover el peso. */
export const DE_LA_VISTA = congelar({
  ejemplo: { paso: false, tope: 0, epocas: false, peso: false },
  vuelta: { paso: true, tope: 1, epocas: false, peso: false },
  atras: { paso: true, tope: 2, epocas: false, peso: false },
  prediccion: { paso: false, tope: 2, epocas: false, peso: false },
  cambios: { paso: false, tope: 3, epocas: false, peso: false },
  epocas: { paso: false, tope: 0, epocas: true, peso: false },
  desafio: { paso: false, tope: 1, epocas: false, peso: true },
});

/** Hasta cuántas épocas deja correr la figura. */
export const TOPE_EPOCAS = 1000;
/** Las neuronas, en el orden de la red: las dos ocultas y la salida. */
export const NEURONAS = Object.freeze(['A', 'B', 'C']);
/** El ejemplo que sigue todo el capítulo. */
export const EJEMPLO = DESAFIO.ejemplo;
/** El peso del desafío y los tres pesos entre los que elige la predicción (capa, neurona, entrada). */
export const PESO_DEL_DESAFIO = congelar({ capa: DESAFIO.solucion.capa, neurona: DESAFIO.solucion.neurona, entrada: DESAFIO.solucion.entrada });
export const OPCIONES = congelar({
  salida: { capa: 2, neurona: 0, entrada: 0 }, // de la oculta A a la salida
  entrada: { capa: 1, neurona: 0, entrada: 0 }, // de la entrada izquierda a A
  apagada: { capa: 1, neurona: 0, entrada: 1 }, // de la entrada derecha (que vale 0) a A
});

const esElPeso = (c, { capa, neurona, entrada }) => c.tipo === 'peso' && c.capa === capa && c.neurona === neurona && c.entrada === entrada;

/**
 * La respuesta de la predicción: cuál de los tres pesos de OPCIONES es el que más cambia de toda la red
 * con este ejemplo (null si el que más cambia no es ninguno de los tres). Sale de hacer la cuenta.
 */
export function respuestaDeLaPrediccion() {
  const mas = pesoQueMasCambia(idaYVuelta(crearRedSuave(), EJEMPLO).correcciones);
  return Object.keys(OPCIONES).find((id) => esElPeso(mas, OPCIONES[id])) ?? null;
}

/** El avance del desafío: cuántos pasos de 0,1 subió el peso, en el sentido que indica su corrección. */
export const avanceDelDesafio = (estado) => avance(estado.peso);

const PESO = RED_INICIAL.salida.pesos[PESO_DEL_DESAFIO.entrada];
const estado = (vista, pasos) => ({ vista, pasos, peso: PESO, epocas: 0 });
const DESPUES = estado('cambios', 3);

export const TRAMOS = congelar([
  { id: 'quien', estado: estado('ejemplo', 0) },
  { id: 'salida', estado: estado('vuelta', 0) },
  { id: 'atras', estado: estado('atras', 1) },
  { id: 'prediccion', estado: estado('prediccion', 2), prediccion: { despues: DESPUES, correcta: respuestaDeLaPrediccion() } },
  { id: 'epocas', estado: estado('epocas', 0) },
  { id: 'desafio', estado: estado('desafio', 1) },
]);

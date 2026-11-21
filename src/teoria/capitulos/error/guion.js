// Guion de "Medir el error" (seccion-teoria D12, capítulo 4): lo que NO cambia con el idioma. Seis tramos,
// cada uno con el estado de la figura al llegar. La prosa va en contenido/<idioma>/error.js.
//
// Un estado es { vista, pesos: [w1, w2], sesgo, suave, elegido, par }: la neurona de dos entradas de
// cuenta.js; `suave` dice si responde con la salida suave (entre 0 y 1) o con el escalón (0 o 1);
// `elegido` es el ejemplo cuya cuenta se escribe al llegar (elegir otro no cuenta como un cambio de la
// persona); `par` son los dos ejemplos de la predicción.
//
// vista: qué deja ver y tocar la figura.
//   lista       los ocho ejemplos y lo que responde la neurona; nada que tocar
//   suave       lo mismo, con el selector que pasa del escalón a la salida suave
//   uno         salida suave; cada ejemplo muestra su error, y se elige cuál leer
//   prediccion  dos ejemplos a la vista, sin su error, hasta que se elige
//   par         esos dos ejemplos con su error (lo que queda al resolver)
//   curva       se mueve un peso; el error de todos juntos dibuja una curva
//   desafio     se mueven los dos pesos y el sesgo; la figura informa el avance del desafío

import { EJEMPLOS, DESAFIO, errorMedio, errorDeUnEjemplo, avanceHacia } from './cuenta.js';

const congelar = (o) => {
  for (const v of Object.values(o)) if (v && typeof v === 'object') congelar(v);
  return Object.freeze(o);
};

export const VISTAS = Object.freeze(['lista', 'suave', 'uno', 'prediccion', 'par', 'curva', 'desafio']);

/**
 * Qué muestra cada vista: si deja pasar de escalón a suave, si escribe el error de cada ejemplo, si
 * muestra solo el par, si dibuja la curva del error y qué perillas deja mover.
 */
export const DE_LA_VISTA = congelar({
  lista: { selector: false, errores: false, soloPar: false, curva: false, perillas: [], elegir: true },
  suave: { selector: true, errores: false, soloPar: false, curva: false, perillas: [], elegir: true },
  uno: { selector: false, errores: true, soloPar: false, curva: false, perillas: [], elegir: true },
  prediccion: { selector: false, errores: false, soloPar: true, curva: false, perillas: [], elegir: false },
  par: { selector: false, errores: true, soloPar: true, curva: false, perillas: [], elegir: false },
  curva: { selector: false, errores: true, soloPar: false, curva: true, perillas: ['w1'], elegir: true },
  desafio: { selector: false, errores: true, soloPar: false, curva: true, perillas: ['w1', 'w2', 'b'], elegir: true },
});

/** Los valores de la neurona como los recibe cuenta.js. */
export const neuronaDe = ({ pesos, sesgo }) => ({ pesos: [...pesos], sesgo });

/**
 * La respuesta de la predicción: cuál de los dos ejemplos del par tiene menos error ('a' el primero, 'b'
 * el segundo, 'igual' si miden lo mismo). Sale de hacer la cuenta.
 */
export function respuestaDeLaPrediccion(estado) {
  const [a, b] = estado.par.map((i) => errorDeUnEjemplo(neuronaDe(estado), EJEMPLOS[i]).error);
  return a === b ? 'igual' : a < b ? 'a' : 'b';
}

/** El avance del desafío: cuánto del camino entre el error de partida y la meta ya se bajó. */
export function avanceDelDesafio(estado) {
  return avanceHacia(errorMedio(neuronaDe(estado)).medio, { inicio: errorMedio(DESAFIO.inicio).medio, meta: DESAFIO.meta });
}

const A_FAVOR = { pesos: [2, -2], sesgo: 0 }; // acierta seis de ocho
const AL_REVES = { pesos: [-2, 2], sesgo: 0 }; // los mismos pesos con el signo cambiado: acierta dos
const PAR = [0, 2]; // dos ejemplos que tenían que dar 1 y quedaron del lado del 0

const estado = (vista, neurona, mas = {}) => ({ vista, pesos: [...neurona.pesos], sesgo: neurona.sesgo, suave: true, elegido: 0, par: PAR, ...mas });
const DESPUES = estado('par', AL_REVES);

export const TRAMOS = congelar([
  { id: 'saber', estado: estado('lista', A_FAVOR, { suave: false, elegido: 6 }) },
  { id: 'cuanto', estado: estado('suave', A_FAVOR, { suave: false, elegido: 6 }) },
  { id: 'vale', estado: estado('uno', A_FAVOR, { elegido: 0 }) },
  {
    id: 'prediccion',
    estado: estado('prediccion', AL_REVES),
    prediccion: { despues: DESPUES, correcta: respuestaDeLaPrediccion(DESPUES) },
  },
  { id: 'todos', estado: estado('curva', { pesos: [-2, -2], sesgo: 0 }) },
  { id: 'desafio', estado: estado('desafio', DESAFIO.inicio) },
]);

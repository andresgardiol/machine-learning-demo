// La cuenta de "Qué quedó adentro" (seccion-teoria D12, capítulo 9), sin DOM. La red del XOR del capítulo
// 2 (xor/cuenta.js: una oculta es un OR, la otra un AND), con escalón en las ocultas, mirada por dentro:
// el mapa de lo que enciende a cada oculta y qué casos del XOR falla si se apaga una. Las partes apagadas
// usan forwardValues y neuronGrid de src/core/backprop.js con su parámetro `off`, el mismo de la pestaña
// Inspeccionar: una neurona apagada vale cero.
//
// forwardValues pone la sigmoide en la salida; como la sigmoide pasa de 0,5 justo cuando la suma pasa
// de 0, la red decide igual que con el escalón: salida 1 si la respuesta suave pasa de 0,5.

import { forwardValues, neuronGrid } from '../../../core/backprop.js';
import { crearRed, leerRed, RED_XOR, TABLA_XOR } from '../xor/cuenta.js';

const congelar = (o) => {
  for (const v of Object.values(o)) if (v && typeof v === 'object') congelar(v);
  return Object.freeze(o);
};

/** La red del capítulo: la del XOR del capítulo 2. */
export const red = () => crearRed(RED_XOR);

/** El rango del plano de los mapas: el de las compuertas en la app. */
export const RANGO = Object.freeze([-0.5, 1.5]);

/**
 * Lo apagado, en la forma de la app ({ offNeurons[col][j] }), con estas ocultas apagadas (0, 1 o las
 * dos). Columna 0: entradas; 1: ocultas; 2: salida. Las salidas no se apagan.
 */
export function apagar(ocultas = []) {
  if (!Array.isArray(ocultas) || ocultas.some((j) => j !== 0 && j !== 1)) throw new RangeError('las ocultas son la 0 y la 1');
  return { offNeurons: [[false, false], [0, 1].map((j) => ocultas.includes(j)), [false]] };
}

/**
 * Lo que contesta la red en cada caso del XOR, con estas ocultas apagadas: el valor de cada oculta, la
 * respuesta suave, la decisión (0 o 1) y si está bien.
 */
export function respuestas(apagadas = [], r = red()) {
  const off = apagadas.length ? apagar(apagadas) : null;
  return TABLA_XOR.map(({ entradas, salida: esperada }) => {
    const { values, outputs } = forwardValues(r, [...entradas], off);
    const salida = outputs[0] > 0.5 ? 1 : 0;
    return { entradas: [...entradas], ocultas: [...values[1]], suave: outputs[0], salida, esperada, bien: salida === esperada };
  });
}

/** Las entradas de los casos que falla la red con estas ocultas apagadas. */
export const casosQueFallan = (apagadas = [], r = red()) => respuestas(apagadas, r).filter((x) => !x.bien).map((x) => x.entradas);

/**
 * El mapa de una oculta: su valor (0 o 1) sobre una grilla de n × n del plano de las entradas, en el
 * rango RANGO, fila 0 arriba (neuronGrid de la app).
 * @returns {number[][]}
 */
export function mapaDeOculta(j, { n = 24, apagadas = [], r = red() } = {}) {
  if (j !== 0 && j !== 1) throw new RangeError('las ocultas son la 0 y la 1');
  const { layers } = neuronGrid(r, n, apagadas.length ? apagar(apagadas) : null, [...RANGO]);
  const plano = layers[1][j];
  return Array.from({ length: n }, (_, f) => Array.from(plano.subarray(f * n, (f + 1) * n)));
}

/**
 * El mapa de la salida: dónde la red entera da 1 (su respuesta suave pasa de 0,5), sobre la misma grilla
 * que mapaDeOculta, con estas ocultas apagadas.
 * @returns {number[][]} 0 o 1 en cada celda
 */
export function mapaDeSalida({ n = 24, apagadas = [], r = red() } = {}) {
  const { layers } = neuronGrid(r, n, apagadas.length ? apagar(apagadas) : null, [...RANGO]);
  const plano = layers[2][0];
  return Array.from({ length: n }, (_, f) => Array.from(plano.subarray(f * n, (f + 1) * n), (v) => (v > 0.5 ? 1 : 0)));
}

/**
 * La red del capítulo con un solo número cambiado: el peso que va de la segunda oculta (el AND) a la
 * salida, que en la red del XOR vale −1 (tramo 5: mover un peso cambia lo que la red hace).
 */
export function redConPeso(peso) {
  if (!Number.isFinite(peso)) throw new TypeError('el peso tiene que ser un número finito');
  return crearRed({ ocultas: RED_XOR.ocultas, salida: { pesos: [RED_XOR.salida.pesos[0], peso], sesgo: RED_XOR.salida.sesgo } });
}

/** Los números de la red (tramo 5: no hay reglas, hay números): los pesos y sesgos de cada neurona. */
export const numeros = (r = red()) => leerRed(r);

/**
 * La predicción del tramo 4 y el desafío del tramo 6.
 * prediccion: si se apaga la oculta 0 (el OR), la salida queda siempre apagada: fallan los dos casos de
 *   entradas distintas.
 * desafio: apagar la oculta que hace fallar solo el caso [1, 1]: la 1 (el AND). Sin ella, la red es un OR.
 */
export const ESCENAS = congelar({
  prediccion: { apagar: [0], fallan: [[0, 1], [1, 0]] },
  desafio: { caso: [1, 1], solucion: [1] },
});

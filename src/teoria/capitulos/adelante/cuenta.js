// La cuenta de "La cuenta hacia adelante" (seccion-teoria D12, capítulo 3), sin DOM. La red 2-2-1 del
// capítulo 2 (xor/cuenta.js) recorrida de a una neurona, en el orden en que la calcula computeDetailed de
// src/core/network.js: primero las de la capa oculta, de arriba abajo, y después la de salida, que
// recibe lo que dieron las ocultas. Al final, la red del auto (5 entradas, 4 salidas), solo para mirar.

import { createNetwork, computeDetailed } from '../../../core/network.js';
import { createRandom } from '../../../core/random.js';
import { crearRed, RED_XOR } from '../xor/cuenta.js';

const congelar = (o) => {
  for (const v of Object.values(o)) if (v && typeof v === 'object') congelar(v);
  return Object.freeze(o);
};

/**
 * Cada neurona de la red en el orden en que se calcula, con lo que recibe, cada producto peso × entrada,
 * el sesgo, la suma y lo que da. `capa` cuenta como la traza de la app: 1 la primera capa con pesos.
 * La suma y la salida son las de computeDetailed (la misma cuenta que usa la app al manejar).
 * @returns {Array<{orden: number, capa: number, neurona: number, salidaDeLaRed: boolean, recibe: number[],
 *   pesos: number[], productos: number[], sesgo: number, suma: number, salida: number}>}
 */
export function recorrido(red, entradas) {
  const { values, sums } = computeDetailed(red, [...entradas]);
  const pasos = [];
  red.layers.forEach((capa, l) => {
    capa.biases.forEach((sesgo, j) => {
      const pesos = [...capa.weights[j]];
      const recibe = [...values[l]];
      pasos.push({
        orden: pasos.length, capa: l + 1, neurona: j, salidaDeLaRed: l === red.layers.length - 1,
        recibe, pesos, productos: pesos.map((w, i) => w * recibe[i]), sesgo, suma: sums[l][j], salida: values[l + 1][j],
      });
    });
  });
  return pasos;
}

/**
 * Lo que se ve después de `n` pasos (el botón "Paso"): las neuronas ya calculadas, con su salida, y
 * las que faltan, todavía sin valor (null). Con n = 0 no se calculó ninguna.
 * @returns {{hechas: number, total: number, salidas: Array<number|null>, siguiente: object|null}}
 */
export function despuesDePasos(red, entradas, n) {
  const todos = recorrido(red, entradas);
  if (!Number.isInteger(n) || n < 0) throw new RangeError('los pasos son un entero no negativo');
  const hechas = Math.min(n, todos.length);
  return {
    hechas, total: todos.length,
    salidas: todos.map((p, k) => (k < hechas ? p.salida : null)),
    siguiente: todos[hechas] ?? null,
  };
}

/** La red de los tramos 1 a 4 y 6: la del XOR del capítulo 2, con escalón. */
export const redXor = () => crearRed(RED_XOR);

/** Lo que da la red con estas entradas (0 o 1). */
export const salidaDe = (red, entradas) => computeDetailed(red, [...entradas]).outputs[0];

/**
 * La red del auto del tramo 5: cinco entradas (los sensores), una capa oculta de seis y cuatro salidas
 * (las teclas: adelante, izquierda, derecha y atrás, como DRIVING_OUTPUTS de datasets.js). Pesos fijos,
 * sacados con semilla del mismo createNetwork de la app: solo para mirar la cuenta más ancha.
 */
export const SEMILLA_AUTO = 20261120;
export const LECTURAS_AUTO = Object.freeze([0.2, 0.7, 0.1, 0.4, 0.9]);
export const redDelAuto = () => createNetwork({ inputs: 5, hidden: [6], outputs: 4, activation: 'step', random: createRandom(SEMILLA_AUTO) });

/**
 * La predicción del tramo 4 y el desafío del tramo 6, sobre la red del XOR.
 * prediccion: con las dos entradas en 1 las dos ocultas se encienden, y la salida se apaga (da 0).
 * desafio: elegir entradas (de 0 a 1) para que la red se encienda; una solución conocida es [1, 0].
 */
export const ESCENAS = congelar({
  prediccion: { entradas: [1, 1], salida: 0 },
  desafio: { inicio: [0, 0], solucion: [1, 0] },
});

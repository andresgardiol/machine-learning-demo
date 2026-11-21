// La cuenta de las figuras de "Una neurona" (seccion-teoria; viene de teoria-prototipos D3), sin DOM. Una red real de dos
// entradas y una salida con activación escalón, calculada con el mismo núcleo que usa la app: lo que se
// ve en la figura es lo que se calcula. La recta del plano sale de los mismos pesos y el mismo sesgo.
//
//   suma = w1·x1 + w2·x2 + sesgo        salida = 1 si suma > 0, 0 si no
//   recta del plano: w1·x + w2·y + sesgo = 0 (de un lado la salida es 1, del otro 0)

import { createNetwork, computeDetailed } from '../../../core/network.js';

/** Tabla de verdad del AND: entradas y salida esperada. */
export const TABLA_AND = Object.freeze([
  Object.freeze({ entradas: Object.freeze([0, 0]), salida: 0 }),
  Object.freeze({ entradas: Object.freeze([0, 1]), salida: 0 }),
  Object.freeze({ entradas: Object.freeze([1, 0]), salida: 0 }),
  Object.freeze({ entradas: Object.freeze([1, 1]), salida: 1 }),
]);

const comprobarNumero = (v, nombre) => {
  if (!Number.isFinite(v)) throw new TypeError(`${nombre} tiene que ser un número finito`);
};

/**
 * Neurona nueva de dos entradas y una salida (escalón), con los pesos y el sesgo dados (0 por defecto).
 * @param {{pesos?: [number, number], sesgo?: number}} [valores]
 */
export function crearNeurona({ pesos = [0, 0], sesgo = 0 } = {}) {
  // El azar de createNetwork no importa: los valores se fijan enseguida.
  const red = createNetwork({ inputs: 2, outputs: 1, activation: 'step', random: () => 0.5 });
  fijarPesos(red, pesos);
  fijarSesgo(red, sesgo);
  return red;
}

/** Fija los dos pesos de la neurona (cambia la red que recibe y la devuelve). */
export function fijarPesos(red, [w1, w2]) {
  comprobarNumero(w1, 'w1');
  comprobarNumero(w2, 'w2');
  red.layers[0].weights[0][0] = w1;
  red.layers[0].weights[0][1] = w2;
  return red;
}

/** Fija el sesgo de la neurona (cambia la red que recibe y la devuelve). */
export function fijarSesgo(red, sesgo) {
  comprobarNumero(sesgo, 'sesgo');
  red.layers[0].biases[0] = sesgo;
  return red;
}

/** Pesos y sesgo actuales de la neurona. */
export function leerNeurona(red) {
  const [w1, w2] = red.layers[0].weights[0];
  return { pesos: [w1, w2], sesgo: red.layers[0].biases[0] };
}

/**
 * La cuenta completa para unas entradas, hecha por computeDetailed: cada producto peso × entrada, el
 * sesgo, la suma y la salida (0 o 1).
 * @returns {{entradas: number[], productos: number[], sesgo: number, suma: number, salida: number}}
 */
export function calcular(red, entradas) {
  const { sums, outputs } = computeDetailed(red, entradas);
  const { pesos, sesgo } = leerNeurona(red);
  return {
    entradas: entradas.slice(),
    productos: pesos.map((w, i) => w * entradas[i]),
    sesgo,
    suma: sums[0][0],
    salida: outputs[0],
  };
}

// La recta del plano y su tramo dentro de una caja viven en figuras/recta.js: las usan también otros
// capítulos. Se reexportan para quien ya las tomaba de acá.
export { rectaDelPlano, tramoEnCaja } from '../../figuras/recta.js';

// La cuenta de "Una recta no alcanza" (seccion-teoria D9, capítulo 2), sin DOM. La red que crece de una
// neurona a tres, calculada con el mismo núcleo que usa la app (createNetwork, escalón):
//
//   una neurona:  2 entradas -> 1 salida                       (la de "Una neurona": una recta)
//   dos y tres:   2 entradas -> 2 ocultas -> 1 salida          (cada oculta, una recta; la salida las junta)
//
// En la etapa de dos neuronas la salida todavía no está: se ven las dos ocultas y sus rectas. La de tres
// es la red entera. Toda neurona hace lo mismo: suma = w1·a + w2·b + sesgo, y da 1 si la suma pasa de 0.

import { createNetwork, computeDetailed } from '../../../core/network.js';
import { rectaDelPlano } from '../../figuras/recta.js';
import { recortar, cajaComoPoligono } from '../../figuras/zona.js';
import { crearNeurona, fijarPesos, fijarSesgo, calcular } from '../neurona/cuenta.js';

/** Tabla de verdad del XOR: da 1 solo cuando las entradas son distintas. */
export const TABLA_XOR = Object.freeze([
  Object.freeze({ entradas: Object.freeze([0, 0]), salida: 0 }),
  Object.freeze({ entradas: Object.freeze([0, 1]), salida: 1 }),
  Object.freeze({ entradas: Object.freeze([1, 0]), salida: 1 }),
  Object.freeze({ entradas: Object.freeze([1, 1]), salida: 0 }),
]);

const comprobar = (v, nombre) => {
  if (!Number.isFinite(v)) throw new TypeError(`${nombre} tiene que ser un número finito`);
};
const comprobarNeurona = ({ pesos, sesgo }, nombre) => {
  comprobar(pesos?.[0], `${nombre}.w1`);
  comprobar(pesos?.[1], `${nombre}.w2`);
  comprobar(sesgo, `${nombre}.sesgo`);
};

/**
 * Red 2-2-1 con escalón. `ocultas`: las dos neuronas ocultas; `salida`: la que recibe sus dos
 * respuestas. Cada una, { pesos: [w1, w2], sesgo }.
 */
export function crearRed({ ocultas, salida }) {
  // El azar de createNetwork no importa: los valores se fijan enseguida.
  const red = createNetwork({ inputs: 2, hidden: [2], outputs: 1, activation: 'step', random: () => 0.5 });
  return fijarRed(red, { ocultas, salida });
}

/** Fija los valores de una red 2-2-1 (cambia la red que recibe y la devuelve). */
export function fijarRed(red, { ocultas, salida }) {
  if (!Array.isArray(ocultas) || ocultas.length !== 2) throw new TypeError('hacen falta dos neuronas ocultas');
  ocultas.forEach((n, j) => comprobarNeurona(n, `oculta${j + 1}`));
  comprobarNeurona(salida, 'salida');
  ocultas.forEach((n, j) => {
    red.layers[0].weights[j] = [n.pesos[0], n.pesos[1]];
    red.layers[0].biases[j] = n.sesgo;
  });
  red.layers[1].weights[0] = [salida.pesos[0], salida.pesos[1]];
  red.layers[1].biases[0] = salida.sesgo;
  return red;
}

/** Los valores de una red 2-2-1, en la misma forma que recibe crearRed. */
export function leerRed(red) {
  const [l0, l1] = red.layers;
  return {
    ocultas: [0, 1].map((j) => ({ pesos: [...l0.weights[j]], sesgo: l0.biases[j] })),
    salida: { pesos: [...l1.weights[0]], sesgo: l1.biases[0] },
  };
}

/**
 * La cuenta de la red entera para unas entradas, hecha por computeDetailed.
 * @returns {{entradas: number[], sumasOcultas: number[], ocultas: number[], suma: number, salida: number}}
 */
export function calcularRed(red, entradas) {
  const { values, sums, outputs } = computeDetailed(red, [...entradas]);
  return { entradas: [...entradas], sumasOcultas: sums[0], ocultas: values[1], suma: sums[1][0], salida: outputs[0] };
}

/** Las rectas de las dos neuronas ocultas en el plano de las entradas (ver figuras/recta.js). */
export function rectasOcultas(red) {
  return leerRed(red).ocultas.map((n) => rectaDelPlano(n));
}

/**
 * Cuántos puntos del XOR da bien una función de las entradas (que devuelve 0 o 1), y cuáles.
 * @returns {{bien: number, total: number, puntos: Array<{entradas: number[], esperada: number, salida: number, bien: boolean}>}}
 */
export function aciertosXor(salidaDe) {
  const puntos = TABLA_XOR.map(({ entradas, salida: esperada }) => {
    const salida = salidaDe([...entradas]);
    return { entradas: [...entradas], esperada, salida, bien: salida === esperada };
  });
  return { bien: puntos.filter((p) => p.bien).length, total: puntos.length, puntos };
}

/** Etapa de una neurona: cuántos puntos del XOR da bien una sola neurona con estos valores. */
export function aciertosDeUnaNeurona({ pesos, sesgo }) {
  const red = crearNeurona({ pesos: [...pesos], sesgo });
  return aciertosXor((e) => calcular(red, e).salida);
}

/** Etapa de tres neuronas: cuántos puntos del XOR da bien la red entera. */
export function aciertosDeLaRed(red) {
  return aciertosXor((e) => calcularRed(red, e).salida);
}

/**
 * Etapa de dos neuronas: qué responde cada oculta en cada punto del XOR ([h1, h2]), para ver qué zona
 * queda entre las dos rectas. Todavía no hay salida.
 */
export function respuestasOcultas(red) {
  return TABLA_XOR.map(({ entradas }) => ({ entradas: [...entradas], ocultas: calcularRed(red, entradas).ocultas }));
}

/**
 * Una red que da el XOR, para las pruebas: la primera oculta es un OR (se enciende si alguna entrada
 * vale 1), la segunda un AND (solo si las dos), y la salida enciende con el OR y apaga con el AND.
 */
export const RED_XOR = Object.freeze({
  ocultas: Object.freeze([
    Object.freeze({ pesos: Object.freeze([1, 1]), sesgo: -0.5 }),
    Object.freeze({ pesos: Object.freeze([1, 1]), sesgo: -1.5 }),
  ]),
  salida: Object.freeze({ pesos: Object.freeze([1, -1]), sesgo: -0.5 }),
});

// Reexportados para la figura del capítulo: la neurona sola es la misma de "Una neurona".
export { crearNeurona, fijarPesos, fijarSesgo, calcular };

/**
 * Las zonas del plano donde la red de tres neuronas da 1, como polígonos. Las dos ocultas parten el plano
 * en hasta cuatro pedazos (cada una encendida o apagada); la salida da lo mismo en todo un pedazo, porque
 * solo recibe esas dos respuestas. Se devuelven los pedazos donde da 1.
 * @param {{ocultas: Array<{pesos: number[], sesgo: number}>, salida: {pesos: number[], sesgo: number}}} valores
 * @param {{xMin: number, xMax: number, yMin: number, yMax: number}} caja
 * @returns {Array<{ocultas: [number, number], poligono: Array<[number, number]>}>}
 */
export function zonasDeLaRed({ ocultas, salida }, caja) {
  const neurona = crearNeurona({ pesos: [...salida.pesos], sesgo: salida.sesgo });
  const zonas = [];
  for (const ha of [0, 1]) {
    for (const hb of [0, 1]) {
      if (calcular(neurona, [ha, hb]).salida !== 1) continue;
      const poligono = recortar(recortar(cajaComoPoligono(caja), ocultas[0], ha === 1), ocultas[1], hb === 1);
      if (poligono.length) zonas.push({ ocultas: [ha, hb], poligono });
    }
  }
  return zonas;
}

/** La franja entre las dos rectas: donde la primera oculta se enciende y la segunda no. */
export function zonaEntre({ ocultas }, caja) {
  return recortar(recortar(cajaComoPoligono(caja), ocultas[0], true), ocultas[1], false);
}

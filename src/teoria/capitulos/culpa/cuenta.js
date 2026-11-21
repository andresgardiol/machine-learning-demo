// La cuenta de "Repartir la culpa" (seccion-teoria D12, capítulo 6), sin DOM. Backpropagation sobre la red
// 2-2-1 con salida suave, con las funciones de src/core/backprop.js sin modificar: forwardSoft (la ida),
// exampleError (el error), backward (la culpa de cada neurona, de la salida hacia atrás), corrections
// (cuánto cambia cada peso) y applyCorrections (la red corregida). Una pasada por todos los ejemplos es
// trainEpoch, lo mismo que hace la app de corrido.
//
// Culpa de la salida = respuesta − correcta. Culpa de una oculta = (culpa de la salida × peso que las
// une) × pendiente de la oculta. Cambio de un peso = −tasa × culpa de la neurona × lo que traía.

import { createNetwork, copyNetwork } from '../../../core/network.js';
import { forwardSoft, exampleError, backward, corrections, applyCorrections, trainEpoch, evaluate } from '../../../core/backprop.js';
import { TABLA_XOR } from '../xor/cuenta.js';

const congelar = (o) => {
  for (const v of Object.values(o)) if (v && typeof v === 'object') congelar(v);
  return Object.freeze(o);
};

/** Los ejemplos del capítulo: los cuatro casos del XOR, en el formato de la app. */
export const EJEMPLOS = congelar(TABLA_XOR.map(({ entradas, salida }) => ({ inputs: [...entradas], targets: [salida] })));

/**
 * La red de partida: 2-2-1 con sigmoide en las ocultas (la escalón no tiene pendiente: no puede
 * repartir culpa). Valores fijos y redondos (múltiplos de 0,5), elegidos entre candidatos al azar con dos
 * condiciones: que la red empiece equivocándose (acierta uno de los cuatro casos) y que, con el ejemplo
 * del capítulo, el peso que más cambie sea el que va de la primera oculta a la salida. Con la primera
 * tanda de valores (0,5 y −0,4; −0,3 y 0,8; 0,7 y −0,6) la corrección se frenaba acertando tres de cuatro.
 */
export const RED_INICIAL = congelar({
  ocultas: [
    { pesos: [-1.5, 0.5], sesgo: 2 },
    { pesos: [0.5, -2], sesgo: -0.5 },
  ],
  salida: { pesos: [1, -1], sesgo: -0.5 },
});

/** La tasa de los tramos 2 a 5. */
export const TASA = 0.5;

/** Red 2-2-1 de la app con estos valores, con sigmoide en las ocultas. */
export function crearRedSuave({ ocultas, salida } = RED_INICIAL) {
  const red = createNetwork({ inputs: 2, hidden: [2], outputs: 1, activation: 'sigmoid', random: () => 0.5 });
  ocultas.forEach((n, j) => { red.layers[0].weights[j] = [...n.pesos]; red.layers[0].biases[j] = n.sesgo; });
  red.layers[1].weights[0] = [...salida.pesos];
  red.layers[1].biases[0] = salida.sesgo;
  return red;
}

/** Los valores de una red 2-2-1, en la forma de RED_INICIAL. */
export function valoresDe(red) {
  const [l0, l1] = red.layers;
  return {
    ocultas: [0, 1].map((j) => ({ pesos: [...l0.weights[j]], sesgo: l0.biases[j] })),
    salida: { pesos: [...l1.weights[0]], sesgo: l1.biases[0] },
  };
}

/**
 * La ida y la vuelta de un ejemplo, paso por paso, con todo lo que muestra la figura.
 * - ida: la salida de cada oculta y de la salida (con su suma).
 * - error: respuesta − correcta y la medida del error (entropía cruzada).
 * - culpaSalida: la culpa de la salida.
 * - culpaOcultas: por oculta, la culpa que le llega por su conexión (culpa × peso), la pendiente y su culpa.
 * - correcciones: cada peso y sesgo con su valor, su cambio y su valor nuevo, en el orden de la red.
 * - redCorregida: la red con las correcciones aplicadas (la de entrada no cambia).
 */
export function idaYVuelta(red, ejemplo, tasa = TASA) {
  const ida = forwardSoft(red, [...ejemplo.inputs]);
  const err = exampleError(ida.outputs, ejemplo.targets);
  const { deltas, terms } = backward(red, ida, [...ejemplo.targets]);
  const corr = corrections(red, ida, deltas, tasa);
  const lista = [];
  for (let l = 1; l < red.sizes.length; l++) {
    corr.weights[l].forEach((fila, j) => {
      fila.forEach((c, i) => lista.push({ tipo: 'peso', capa: l, neurona: j, entrada: i, antes: c.before, cambio: c.change, despues: c.after, traia: c.input }));
      const b = corr.biases[l][j];
      lista.push({ tipo: 'sesgo', capa: l, neurona: j, entrada: null, antes: b.before, cambio: b.change, despues: b.after });
    });
  }
  return {
    ida: {
      entradas: [...ejemplo.inputs],
      ocultas: ida.values[1].map((v, j) => ({ suma: ida.totals[1][j], salida: v })),
      salida: { suma: ida.totals[2][0], salida: ida.outputs[0] },
    },
    error: { correcta: ejemplo.targets[0], diferencia: err.errors[0], medida: err.loss },
    culpaSalida: deltas[2][0],
    culpaOcultas: terms[1].map((t) => ({ llega: t.sum, pesoQueLasUne: t.parts[0].weight, pendiente: t.slope, culpa: t.delta })),
    correcciones: lista,
    redCorregida: applyCorrections(red, corr),
  };
}

/** El peso (no sesgo) que más cambia en valor absoluto con estas correcciones: la predicción del tramo 4. */
export function pesoQueMasCambia(correcciones) {
  return correcciones.filter((c) => c.tipo === 'peso').reduce((a, b) => (Math.abs(b.cambio) > Math.abs(a.cambio) ? b : a));
}

/** El error medio de la red sobre los ejemplos (la medida de la app). */
export const errorMedio = (red, ejemplos = EJEMPLOS) => evaluate(red, ejemplos).loss;

/**
 * Una época: una pasada por todos los ejemplos, en orden, corrigiendo después de cada uno (trainEpoch de
 * la app). Devuelve la red nueva y el error medio antes y después; la red de entrada no cambia.
 */
export function unaEpoca(red, tasa = TASA, ejemplos = EJEMPLOS) {
  const despues = trainEpoch(red, ejemplos, ejemplos.map((_, i) => i), tasa);
  return { red: despues, antes: errorMedio(red, ejemplos), despues: errorMedio(despues, ejemplos) };
}

/** El error medio después de cada una de `n` épocas, empezando por el de partida: la curva del tramo 5. */
export function curvaDeEpocas(red, n, tasa = TASA, ejemplos = EJEMPLOS) {
  if (!Number.isInteger(n) || n < 0) throw new RangeError('las épocas son un entero no negativo');
  const curva = [errorMedio(red, ejemplos)];
  let actual = copyNetwork(red);
  for (let k = 0; k < n; k++) {
    const e = unaEpoca(actual, tasa, ejemplos);
    actual = e.red;
    curva.push(e.despues);
  }
  return curva;
}

/**
 * Desafío del tramo 6: con el ejemplo [1, 0] → 1, corregir a mano un peso en el sentido que indica su
 * culpa hasta bajar el error de ese ejemplo. La solución conocida mueve el peso que más cambia (el
 * que va de la primera oculta a la salida; su cambio es positivo) `paso` hacia arriba.
 */
export const DESAFIO = congelar({
  ejemplo: { inputs: [1, 0], targets: [1] },
  solucion: { capa: 2, neurona: 0, entrada: 0, paso: 0.5 },
});

/** Una red igual a otra con un solo peso cambiado (para el desafío). No modifica la de entrada. */
export function conPeso(red, { capa, neurona, entrada }, valor) {
  const out = copyNetwork(red);
  out.layers[capa - 1].weights[neurona][entrada] = valor;
  return out;
}

/** Cuántos de los ejemplos acierta la red (su salida queda del lado correcto de 0,5, como cuenta la app). */
export function aciertos(red, ejemplos = EJEMPLOS) {
  const { correct, count } = evaluate(red, ejemplos);
  return { bien: correct, total: count };
}

/**
 * El avance del desafío del tramo 6: cuántos pasos de 0,1 se movió el peso de DESAFIO.solucion, desde su
 * valor de partida, en el sentido que indica su corrección (hacia arriba, porque su cambio es positivo).
 * Moverlo en contra no avanza. El total es DESAFIO.solucion.paso, en pasos de 0,1.
 * @returns {{bien: number, total: number}}
 */
export function avanceDelDesafio(peso) {
  if (!Number.isFinite(peso)) throw new TypeError('el peso tiene que ser un número finito');
  const { solucion, ejemplo } = DESAFIO;
  const c = idaYVuelta(crearRedSuave(), ejemplo).correcciones
    .find((x) => x.tipo === 'peso' && x.capa === solucion.capa && x.neurona === solucion.neurona && x.entrada === solucion.entrada);
  const total = Math.round(solucion.paso / 0.1);
  const dados = Math.round(((peso - c.antes) * Math.sign(c.cambio)) / 0.1);
  return { bien: Math.max(0, Math.min(total, dados)), total };
}

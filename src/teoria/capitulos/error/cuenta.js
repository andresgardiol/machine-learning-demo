// La cuenta de "Medir el error" (seccion-teoria D12, capítulo 4), sin DOM. Una neurona de dos entradas
// con salida suave (la sigmoide de la app) y una lista de ejemplos con su respuesta correcta. La medida
// del error es la de la app, la entropía cruzada: softOutput, outputLoss y exampleError de
// src/core/backprop.js, sobre una red de createNetwork.
//
//   suma = sesgo + w1·x1 + w2·x2      salida suave = sigmoide(suma), entre 0 y 1
//   error de un ejemplo = −log(salida) si la correcta es 1; −log(1 − salida) si es 0
//   error medio = promedio de los errores de todos los ejemplos
//
// Los mismos ejemplos y la misma neurona los usan "Corregir un poco cada vez" (capítulo 5) y "Aprender
// por evolución" (capítulo 7), para que el mapa del error sea el mismo en los tres.

import { createNetwork } from '../../../core/network.js';
import { forwardSoft, exampleError, outputLoss, softOutput, isCorrect } from '../../../core/backprop.js';

const congelar = (o) => {
  for (const v of Object.values(o)) if (v && typeof v === 'object') congelar(v);
  return Object.freeze(o);
};

/**
 * Ocho ejemplos: lo que leen los dos sensores y si hay que doblar (1) o no (0). Los seis primeros se
 * separan con una recta; los dos últimos la contradicen (datos con ruido). Así el error medio tiene un
 * fondo en un lugar finito, dentro del mapa (MAPA): con bias 0, cerca de w1 = 4,3 y w2 = −4,65.
 */
export const EJEMPLOS = congelar([
  { inputs: [0.9, 0.2], targets: [1] },
  { inputs: [0.7, 0.4], targets: [1] },
  { inputs: [0.5, 0.3], targets: [1] },
  { inputs: [0.4, 0.5], targets: [0] },
  { inputs: [0.2, 0.7], targets: [0] },
  { inputs: [0.3, 0.4], targets: [0] },
  { inputs: [0.6, 0.4], targets: [0] },
  { inputs: [0.4, 0.6], targets: [1] },
]);

/** El rango de los pesos que muestran las figuras de los capítulos 4, 5 y 7 (los dos ejes). */
export const MAPA = Object.freeze({ desde: -6, hasta: 6 });

/** El sesgo fijo de los capítulos 5 y 7, donde se mueven solo los dos pesos. */
export const SESGO_FIJO = 0;

const comprobar = (v, nombre) => {
  if (!Number.isFinite(v)) throw new TypeError(`${nombre} tiene que ser un número finito`);
};

/**
 * Red de una neurona (2 entradas, 1 salida) con estos valores. La activación 'sigmoid' es la que pide
 * backprop.js para poder aprender; con una sola capa no hay ocultas, y la salida es la sigmoide.
 */
export function crearNeuronaSuave({ pesos, sesgo }) {
  comprobar(pesos?.[0], 'w1');
  comprobar(pesos?.[1], 'w2');
  comprobar(sesgo, 'sesgo');
  const red = createNetwork({ inputs: 2, outputs: 1, activation: 'sigmoid', random: () => 0.5 });
  red.layers[0].weights[0] = [pesos[0], pesos[1]];
  red.layers[0].biases[0] = sesgo;
  return red;
}

/** Pesos y sesgo de una red de una neurona. */
export const valoresDe = (red) => ({ pesos: [...red.layers[0].weights[0]], sesgo: red.layers[0].biases[0] });

/**
 * La respuesta de la neurona a unas entradas: la suma, la salida suave y lo que diría el escalón.
 * @returns {{entradas: number[], productos: number[], suma: number, salida: number, escalon: number}}
 */
export function responder(valores, entradas) {
  const f = forwardSoft(crearNeuronaSuave(valores), [...entradas]);
  const n = f.trace.layers[1].neurons[0];
  return { entradas: [...entradas], productos: [...n.products], suma: n.total, salida: f.outputs[0], escalon: n.total > 0 ? 1 : 0 };
}

/** El error de una salida suave contra la correcta (0 o 1): la medida de la app. */
export const errorDeUnaSalida = (salida, correcta) => outputLoss(salida, correcta);

/**
 * El error de un ejemplo: la respuesta, la correcta, la diferencia (respuesta − correcta) y el error.
 * `acierta`: la salida queda del lado correcto de 0,5 (como cuenta los aciertos la app).
 */
export function errorDeUnEjemplo(valores, ejemplo) {
  const r = responder(valores, ejemplo.inputs);
  const { errors, loss } = exampleError([r.salida], ejemplo.targets);
  return {
    entradas: [...ejemplo.inputs], salida: r.salida, correcta: ejemplo.targets[0], diferencia: errors[0], error: loss,
    acierta: isCorrect([r.salida], ejemplo.targets),
  };
}

/**
 * El error medio de la neurona sobre una lista de ejemplos, con el de cada uno y cuántos acierta.
 * @returns {{medio: number, aciertos: number, total: number, porEjemplo: ReturnType<typeof errorDeUnEjemplo>[]}}
 */
export function errorMedio(valores, ejemplos = EJEMPLOS) {
  if (ejemplos.length === 0) throw new RangeError('hace falta al menos un ejemplo');
  const porEjemplo = ejemplos.map((e) => errorDeUnEjemplo(valores, e));
  const medio = porEjemplo.reduce((s, e) => s + e.error, 0) / porEjemplo.length;
  return { medio, aciertos: porEjemplo.filter((e) => e.acierta).length, total: porEjemplo.length, porEjemplo };
}

/** Valores de un barrido, contados con enteros y redondeados a milésimos (sin error de redondeo). */
export function barrido({ desde, hasta, paso }) {
  if (![desde, hasta, paso].every(Number.isFinite) || paso <= 0 || hasta < desde) throw new RangeError('barrido inválido');
  const n = Math.round((hasta - desde) / paso);
  return Array.from({ length: n + 1 }, (_, k) => Math.round((desde + k * paso) * 1000) / 1000);
}

/**
 * La curva del error medio cuando se mueve un solo peso (`indice` 0 o 1) y lo demás queda como está:
 * una lista de puntos { peso, error }, en orden.
 */
export function curvaDelError(valores, { indice = 0, desde = MAPA.desde, hasta = MAPA.hasta, paso = 0.1, ejemplos = EJEMPLOS } = {}) {
  if (indice !== 0 && indice !== 1) throw new RangeError('el peso es el 0 o el 1');
  return barrido({ desde, hasta, paso }).map((peso) => {
    const pesos = [...valores.pesos];
    pesos[indice] = peso;
    return { peso, error: errorMedio({ pesos, sesgo: valores.sesgo }, ejemplos).medio };
  });
}

/**
 * Desafío del capítulo (tramo 6): bajar el error medio a mano, de donde arranca a menos de `meta`.
 * `solucion` es una respuesta conocida (la prueba lo comprueba); hay muchas otras.
 */
export const DESAFIO = congelar({
  inicio: { pesos: [-2, 2], sesgo: 0 },
  meta: 0.6,
  solucion: { pesos: [3, -3], sesgo: 0 },
});

/**
 * El avance de un desafío de bajar el error (capítulos 4 y 5): el camino desde el error de partida hasta
 * la meta, partido en `marcas` tramos iguales; devuelve cuántos ya se bajaron. Llega a `marcas` solo
 * cuando el error queda por debajo de la meta; si el error sube por encima del de partida, da 0.
 * @returns {{bien: number, total: number}}
 */
export function avanceHacia(error, { inicio, meta, marcas = 4 }) {
  if (![error, inicio, meta].every(Number.isFinite) || !(inicio > meta) || !Number.isInteger(marcas) || marcas < 1) throw new RangeError('avance inválido');
  if (error < meta) return { bien: marcas, total: marcas };
  const hecho = Math.floor(((inicio - error) / (inicio - meta)) * marcas);
  return { bien: Math.max(0, Math.min(marcas - 1, hecho)), total: marcas };
}

export { softOutput };

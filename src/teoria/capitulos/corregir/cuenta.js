// La cuenta de "Corregir un poco cada vez" (seccion-teoria D12, capítulo 5), sin DOM. La neurona y los
// ejemplos del capítulo 4 (error/cuenta.js), con el sesgo fijo: el error medio depende de dos pesos y se
// puede dibujar como una curva (un peso) o como un mapa (los dos).
//
// La pendiente sale de backward y corrections de src/core/backprop.js: para cada ejemplo, corrections con
// tasa 1 da el cambio −culpa × entrada de cada peso, que es menos la pendiente del error de ese ejemplo.
// La pendiente del error medio es el promedio. Un paso de corrección es moverse en contra de la
// pendiente, multiplicada por la tasa:
//
//   peso nuevo = peso − tasa × pendiente          (descenso por gradiente, con todos los ejemplos juntos)
//
// La app corrige ejemplo por ejemplo (learnExample); acá se promedian los ejemplos para que la bolita
// siga exactamente la pendiente de la curva que se dibuja. Es la misma cuenta por ejemplo.

import { forwardSoft, backward, corrections } from '../../../core/backprop.js';
import { EJEMPLOS, MAPA, SESGO_FIJO, crearNeuronaSuave, errorMedio, barrido } from '../error/cuenta.js';

const congelar = (o) => {
  for (const v of Object.values(o)) if (v && typeof v === 'object') congelar(v);
  return Object.freeze(o);
};

/**
 * La pendiente del error medio respecto de cada peso y del sesgo, en estos valores.
 * @returns {{pesos: [number, number], sesgo: number}}
 */
export function pendiente(valores, ejemplos = EJEMPLOS) {
  const red = crearNeuronaSuave(valores);
  const suma = { pesos: [0, 0], sesgo: 0 };
  for (const e of ejemplos) {
    const ida = forwardSoft(red, [...e.inputs]);
    const { deltas } = backward(red, ida, [...e.targets]);
    const c = corrections(red, ida, deltas, 1);
    // Con tasa 1, el cambio de cada peso es menos su pendiente.
    suma.pesos[0] -= c.weights[1][0][0].change;
    suma.pesos[1] -= c.weights[1][0][1].change;
    suma.sesgo -= c.biases[1][0].change;
  }
  const n = ejemplos.length;
  return { pesos: [suma.pesos[0] / n, suma.pesos[1] / n], sesgo: suma.sesgo / n };
}

/**
 * Un paso de corrección: cada peso que se mueve va en contra de su pendiente, por la tasa. `mover`
 * dice cuáles: [0] solo el primero (la curva), [0, 1] los dos (el mapa). El sesgo no se mueve.
 * @returns {{antes: object, pendiente: object, despues: object, error: {antes: number, despues: number}}}
 */
export function unPaso(valores, tasa, { mover = [0, 1], ejemplos = EJEMPLOS } = {}) {
  if (!Number.isFinite(tasa) || tasa < 0) throw new RangeError('la tasa tiene que ser un número no negativo');
  const p = pendiente(valores, ejemplos);
  const pesos = valores.pesos.map((w, i) => (mover.includes(i) ? w - tasa * p.pesos[i] : w));
  const despues = { pesos, sesgo: valores.sesgo };
  return {
    antes: { pesos: [...valores.pesos], sesgo: valores.sesgo }, pendiente: p, despues,
    error: { antes: errorMedio(valores, ejemplos).medio, despues: errorMedio(despues, ejemplos).medio },
  };
}

/**
 * N pasos seguidos desde un punto de partida: la lista de puntos que recorre la bolita, con el error
 * en cada uno (el primero es la partida). Determinista: mismos datos, mismo camino.
 * @returns {Array<{pesos: number[], sesgo: number, error: number}>}
 */
export function trayectoria(inicio, tasa, pasos, opciones = {}) {
  if (!Number.isInteger(pasos) || pasos < 0) throw new RangeError('los pasos son un entero no negativo');
  const ejemplos = opciones.ejemplos ?? EJEMPLOS;
  const puntos = [{ pesos: [...inicio.pesos], sesgo: inicio.sesgo, error: errorMedio(inicio, ejemplos).medio }];
  let actual = inicio;
  for (let k = 0; k < pasos; k++) {
    const p = unPaso(actual, tasa, opciones);
    actual = p.despues;
    puntos.push({ pesos: [...actual.pesos], sesgo: actual.sesgo, error: p.error.despues });
  }
  return puntos;
}

/**
 * El mapa del error medio sobre los dos pesos, con el sesgo fijo: una grilla de `n` × `n` valores.
 * `valores[f][c]` es el error en w1 = ejes[c] y w2 = ejes[n − 1 − f] (fila 0 arriba, como se dibuja).
 * @returns {{ejes: number[], valores: number[][], minimo: {pesos: number[], error: number}}}
 */
export function mapaDelError({ sesgo = SESGO_FIJO, desde = MAPA.desde, hasta = MAPA.hasta, n = 25, ejemplos = EJEMPLOS } = {}) {
  if (!Number.isInteger(n) || n < 2) throw new RangeError('la grilla necesita al menos 2 × 2');
  const ejes = barrido({ desde, hasta, paso: (hasta - desde) / (n - 1) }).slice(0, n);
  let minimo = { pesos: [ejes[0], ejes[0]], error: Infinity };
  const valores = ejes.map((_, f) => ejes.map((w1) => {
    const w2 = ejes[n - 1 - f];
    const error = errorMedio({ pesos: [w1, w2], sesgo }, ejemplos).medio;
    if (error < minimo.error) minimo = { pesos: [w1, w2], error };
    return error;
  }));
  return { ejes, valores, minimo };
}

/**
 * Lo que muestran los tramos 3 y 4 (la curva de un peso) y el desafío del tramo 6 (el mapa). Las
 * pruebas comprueban cada afirmación de los comentarios con estos números.
 *
 * curva: se mueve solo w1, con w2 = −4,65 (cerca del fondo del mapa) y el sesgo en 0.
 *   El fondo de esa curva está en w1 = 4,3. Cerca del fondo la curva es muy plana: las tasas son altas.
 *   tasa chica (4): baja de a poco, siempre del mismo lado, sin pasarse.
 *   tasa alta (40): el primer paso se pasa del fondo de largo (a 9,47) y después vuelve.
 *   tasa muy alta (60): rebota de un lado al otro del fondo, cada vez más lejos: el error sube.
 * desafio: desde (−2, 2), llegar en 10 pasos a un error medio menor que `meta` (moviendo los dos
 *   pesos). Con la tasa de la solución (8) se llega; con 6 o menos, no.
 */
export const ESCENAS = congelar({
  curva: {
    inicio: { pesos: [-2, -4.65], sesgo: SESGO_FIJO },
    mover: [0],
    tasas: { chica: 4, alta: 40, muyAlta: 60 },
  },
  desafio: {
    inicio: { pesos: [-2, 2], sesgo: SESGO_FIJO },
    pasos: 10,
    meta: 0.6,
    solucion: { tasa: 8 },
  },
});

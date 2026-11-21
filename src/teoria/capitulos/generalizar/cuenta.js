// La cuenta de "Generalizar o memorizar" (seccion-teoria D12, capítulo 8), sin DOM. Puntos de dos clases
// con ruido (pointsDataset de src/core/datasets.js) separados en vistos (práctica) y apartados
// (splitDataset), y dos formas de contestar:
//
//   la recta: de un conjunto chico de rectas candidatas (todas pasan por el centro, una cada 15°), la
//     que más acierta en lo visto. Es lo que haría una neurona sola.
//   el memorizador: contesta como el punto visto más cercano (vecino más cercano). Acierta todo lo visto
//     y aprende hasta el ruido. No es una red: es una forma de contestar que la práctica no tiene.
//
// Funciones puras propias (el núcleo no tiene ni rectas candidatas ni vecino más cercano); los puntos y la
// separación salen del núcleo, sin modificarlo.

import { pointsDataset, splitDataset, HOLDOUT_LIMITS } from '../../../core/datasets.js';

/**
 * Los datos del capítulo: dos manchas (blobs) con ruido, 80 puntos, la mitad apartados. Elegidos para
 * que la diferencia se vea: el memorizador acierta 40 de 40 vistos y 31 de 40 apartados; la recta, 35 de
 * 40 vistos y 38 de 40 apartados (las pruebas comprueban estos números).
 */
export const DATOS = Object.freeze({ shape: 'blobs', count: 80, noise: 35, seed: 9, holdout: 50 });

/** Ángulos de las rectas candidatas: cada 15°, en las dos orientaciones (24 rectas). */
export const ANGULOS = Object.freeze(Array.from({ length: 24 }, (_, k) => k * 15));

/** Los puntos del capítulo, separados. `held[i]` dice si el punto i quedó apartado. */
export function puntos({ holdout = DATOS.holdout } = {}) {
  const datos = pointsDataset({ shape: DATOS.shape, count: DATOS.count, noise: DATOS.noise, seed: DATOS.seed });
  const { practice, heldOut, held } = splitDataset(datos, { holdout, seed: DATOS.seed });
  return { todos: datos.examples, vistos: practice, apartados: heldOut, held };
}

/**
 * La recta que pasa por el centro con la normal en `angulo` grados: contesta 1 del lado al que apunta
 * la normal (cos·x + sen·y > 0) y 0 del otro.
 */
export function recta(angulo) {
  const r = (angulo * Math.PI) / 180;
  const c = Math.cos(r);
  const s = Math.sin(r);
  return { angulo, normal: [c, s], contestar: ([x, y]) => (c * x + s * y > 0 ? 1 : 0) };
}

/** Cuántos de unos ejemplos ({ inputs, targets }) contesta bien una forma de contestar. */
export function aciertos(contestar, ejemplos) {
  return ejemplos.filter((e) => contestar(e.inputs) === e.targets[0]).length;
}

/** La recta candidata que más acierta en lo visto; ante un empate, la de menor ángulo. */
export function mejorRecta(vistos) {
  let mejor = null;
  for (const a of ANGULOS) {
    const r = recta(a);
    const n = aciertos(r.contestar, vistos);
    if (!mejor || n > mejor.aciertos) mejor = { ...r, aciertos: n };
  }
  return mejor;
}

/** El memorizador: contesta como el punto visto más cercano (ante un empate, el primero de la lista). */
export function memorizador(vistos) {
  if (vistos.length === 0) throw new RangeError('el memorizador necesita al menos un punto visto');
  return {
    contestar([x, y]) {
      let elegido = vistos[0];
      let menor = Infinity;
      for (const e of vistos) {
        const d = (e.inputs[0] - x) ** 2 + (e.inputs[1] - y) ** 2;
        if (d < menor) { menor = d; elegido = e; }
      }
      return elegido.targets[0];
    },
  };
}

/**
 * Las dos formas de contestar, con sus aciertos en lo visto y en lo apartado, para una parte apartada
 * (en %, de 10 a 50 de a 5, como la app). `mejorEnApartados`: la que acierta más en lo apartado ('recta',
 * 'memorizador' o 'empate').
 */
export function comparar({ holdout = DATOS.holdout } = {}) {
  const { vistos, apartados } = puntos({ holdout });
  const r = mejorRecta(vistos);
  const m = memorizador(vistos);
  const res = {
    holdout, vistos: vistos.length, apartados: apartados.length,
    recta: { angulo: r.angulo, vistos: aciertos(r.contestar, vistos), apartados: aciertos(r.contestar, apartados) },
    memorizador: { vistos: aciertos(m.contestar, vistos), apartados: aciertos(m.contestar, apartados) },
  };
  const d = res.recta.apartados - res.memorizador.apartados;
  return { ...res, mejorEnApartados: d > 0 ? 'recta' : d < 0 ? 'memorizador' : 'empate' };
}

/** Las partes apartadas que se pueden elegir en el desafío (las de la app). */
export const PARTES_APARTADAS = Object.freeze(Array.from(
  { length: Math.round((HOLDOUT_LIMITS.max - HOLDOUT_LIMITS.min) / HOLDOUT_LIMITS.step) + 1 },
  (_, k) => HOLDOUT_LIMITS.min + k * HOLDOUT_LIMITS.step));

/**
 * La zona de cada respuesta sobre una grilla de n × n del plano de −1 a 1 (fila 0 arriba), para pintar
 * de qué lado contesta 1 cada forma.
 * @returns {number[][]} 0 o 1 en el centro de cada celda
 */
export function zona(contestar, n = 40) {
  if (!Number.isInteger(n) || n < 2) throw new RangeError('la grilla necesita al menos 2 × 2');
  return Array.from({ length: n }, (_, f) => Array.from({ length: n }, (__, c) =>
    contestar([-1 + ((c + 0.5) / n) * 2, 1 - ((f + 0.5) / n) * 2])));
}

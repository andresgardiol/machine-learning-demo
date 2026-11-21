// La cuenta de "Aprender por evolución" (seccion-teoria D12, capítulo 7), sin DOM. Una población de doce
// neuronas: la neurona y los ejemplos del capítulo 4 (error/cuenta.js), con el sesgo fijo, así cada una
// es un punto (w1, w2) sobre el mapa del error del capítulo 5. Su puntaje (fitness) es menos su error
// medio: más alto, mejor. La siguiente generación sale de nextGeneration de src/core/evolution.js, la de
// la pestaña Entrenar (selección, élite y mutación con mutate), sin modificarla. Todo azar, con semilla.
//
// Escala: mutate acerca cada valor a uno al azar entre −1 y 1 (w + (r − w) × fuerza). Para que la
// población recorra todo el mapa (de −6 a 6), cada individuo guarda sus pesos en esa escala de −1 a 1
// (`unidades`) y la neurona usa unidades × ESCALA. El sesgo queda en SESGO_FIJO: después de mutar se
// vuelve a poner (mutate también lo toca).

import { createNetwork, copyNetwork } from '../../../core/network.js';
import { randomFor } from '../../../core/random.js';
import { rankPopulation, nextGeneration } from '../../../core/evolution.js';
import { EJEMPLOS, MAPA, SESGO_FIJO, errorMedio } from '../error/cuenta.js';

/** Cuántas neuronas tiene la población. */
export const POBLACION = 12;
/** Pesos de la neurona = unidades × ESCALA: las unidades de −1 a 1 cubren el mapa de −6 a 6. */
export const ESCALA = MAPA.hasta;
/** Semilla de la primera tanda (y de cada "Otra tanda", con su número). */
export const SEMILLA = 7;

const sinSesgo = (red) => { red.layers[0].biases[0] = SESGO_FIJO / ESCALA; return red; };

/** Los pesos de la neurona que representa un individuo (una red de 2 entradas y 1 salida). */
export const pesosDe = (individuo) => individuo.layers[0].weights[0].map((u) => u * ESCALA);

/** Un individuo con estos pesos de la neurona (para armar casos a mano). */
export function individuo(pesos) {
  const red = createNetwork({ inputs: 2, outputs: 1, activation: 'sigmoid', random: () => 0.5 });
  red.layers[0].weights[0] = pesos.map((w) => w / ESCALA);
  return sinSesgo(red);
}

/**
 * Doce neuronas al azar ("Otra tanda"): cada valor, uniforme entre −1 y 1 (createNetwork de la app),
 * con la semilla y el número de tanda. La misma tanda da siempre las mismas doce.
 */
export function poblacionAlAzar({ semilla = SEMILLA, tanda = 0 } = {}) {
  return Array.from({ length: POBLACION }, (_, i) => sinSesgo(createNetwork({
    inputs: 2, outputs: 1, activation: 'sigmoid', random: randomFor(semilla, tanda * POBLACION + i),
  })));
}

/**
 * El puntaje de cada individuo y el orden de mejor a peor (rankPopulation de la app; los empates, por
 * su lugar en la población).
 * @returns {{puntajes: Array<{indice: number, pesos: number[], error: number, aciertos: number, fitness: number}>, orden: number[]}}
 */
export function puntuar(poblacion, ejemplos = EJEMPLOS) {
  const puntajes = poblacion.map((ind, indice) => {
    const e = errorMedio({ pesos: pesosDe(ind), sesgo: SESGO_FIJO }, ejemplos);
    return { indice, pesos: pesosDe(ind), error: e.medio, aciertos: e.aciertos, fitness: -e.medio };
  });
  return { puntajes, orden: rankPopulation(puntajes.map((p) => p.fitness)) };
}

/**
 * La generación siguiente. Los padres son los `padres` mejores, o los que eligió la persona
 * (`elegidos`: índices en la población, de 1 a 6). La élite pasa sin cambios; el resto son hijos
 * mutados de un padre al azar. `fuerza` es la de la app, en % (0 = los hijos son copias).
 * @returns {{poblacion: object[], padres: number[], elite: number[]}}
 */
export function siguienteGeneracion(poblacion, { padres = 3, elegidos = null, elite = 1, fuerza = 30, semilla = SEMILLA, generacion = 1, ejemplos = EJEMPLOS } = {}) {
  let fitnesses;
  let cuantos;
  if (elegidos) {
    if (!Array.isArray(elegidos) || elegidos.length < 1 || elegidos.length > 6) throw new RangeError('se eligen de 1 a 6 padres');
    if (new Set(elegidos).size !== elegidos.length || elegidos.some((i) => !Number.isInteger(i) || i < 0 || i >= poblacion.length)) {
      throw new RangeError('padres inválidos');
    }
    // Los elegidos quedan primeros (en el orden en que se eligieron) y los demás, después.
    fitnesses = poblacion.map((_, i) => (elegidos.includes(i) ? elegidos.length - elegidos.indexOf(i) : 0));
    cuantos = elegidos.length;
  } else {
    if (!Number.isInteger(padres) || padres < 1 || padres > 6) throw new RangeError('se eligen de 1 a 6 padres');
    fitnesses = puntuar(poblacion, ejemplos).puntajes.map((p) => p.fitness);
    cuantos = padres;
  }
  // selection es un % de la población: el menor que da exactamente `cuantos` padres.
  const selection = Math.ceil((cuantos * 100) / poblacion.length);
  const r = nextGeneration({
    networks: poblacion, fitnesses,
    config: { population: poblacion.length, elite, selection, mutationStrength: fuerza, mutationRate: 100, crossover: false },
    random: randomFor(semilla, 1000 + generacion),
  });
  return { poblacion: r.networks.map((n) => sinSesgo(copyNetwork(n))), padres: r.parents, elite: r.elite };
}

/**
 * Desafío del tramo 6: elegir los padres tres generaciones seguidas, desde la primera tanda, hasta que
 * la mejor de la población tenga un error medio menor que `meta`. La solución conocida elige cada vez las
 * tres de mejor puntaje, con la fuerza de la solución (la prueba lo comprueba).
 */
export const DESAFIO = Object.freeze({
  generaciones: 3,
  meta: 0.6,
  solucion: Object.freeze({ padres: 3, fuerza: 30, elite: 1 }),
});

// Operadores de neuroevolución, sin estado (design.md D4): estadísticas por agente, funciones de
// fitness, orden de la población, selección de padres, élite, mutación, cruce y armado de la
// generación siguiente. Todo el azar llega como un generador (ver random.js).
import { copyNetwork, mapValues } from './network.js';
import { STEP } from './constants.js';

/** Funciones de fitness, en el orden del selector (la primera es la de por defecto). */
export const FITNESS_KINDS = Object.freeze(['lead', 'distance', 'survival', 'speed']);

/** Unidad de cada función de fitness (para mostrarla). */
export const FITNESS_UNITS = Object.freeze({
  lead: 'metersAhead', distance: 'meters', survival: 'seconds', speed: 'metersPerSecond',
});

/** Rangos y valores por defecto de la configuración de evolución. */
export const EVOLUTION_LIMITS = Object.freeze({
  population: Object.freeze({ min: 2, max: 500, default: 400 }),
  elite: Object.freeze({ min: 0, max: 20, default: 10 }), // nunca más que la mitad de la población
  selection: Object.freeze({ min: 1, max: 50, default: 10 }), // % de la población
  mutationStrength: Object.freeze({ min: 0, max: 100, default: 10 }), // %
  mutationRate: Object.freeze({ min: 1, max: 100, default: 100 }), // %
  maxDuration: Object.freeze({ min: 10, max: 300, default: 60 }), // segundos simulados
});

export const DEFAULT_EVOLUTION = Object.freeze({
  population: EVOLUTION_LIMITS.population.default,
  elite: EVOLUTION_LIMITS.elite.default,
  selection: EVOLUTION_LIMITS.selection.default,
  mutationStrength: EVOLUTION_LIMITS.mutationStrength.default,
  mutationRate: EVOLUTION_LIMITS.mutationRate.default,
  crossover: false,
  fitness: 'lead',
  maxDuration: EVOLUTION_LIMITS.maxDuration.default,
});

/** Error de evolución con un código y datos para que la interfaz lo explique en su idioma. */
export class EvolutionError extends Error {
  constructor(code, details = {}) {
    super(`${code}: ${JSON.stringify(details)}`);
    this.name = 'EvolutionError';
    this.code = code;
    this.details = details;
  }
}

const INTEGER_KEYS = new Set(['population', 'elite']);

/**
 * Configuración de evolución válida: lo que falta usa el valor por defecto y lo que se sale de
 * rango se ajusta al límite válido más cercano. La élite nunca supera la mitad de la población,
 * redondeada hacia abajo.
 */
export function normalizeEvolution(partial = {}) {
  const p = partial ?? {};
  const out = {};
  for (const [key, { min, max, default: fallback }] of Object.entries(EVOLUTION_LIMITS)) {
    let n = Number(p[key] ?? fallback);
    if (!Number.isFinite(n)) n = fallback;
    if (INTEGER_KEYS.has(key)) n = Math.round(n);
    out[key] = Math.min(Math.max(n, min), max);
  }
  out.elite = Math.min(out.elite, Math.floor(out.population / 2));
  out.crossover = p.crossover === undefined ? DEFAULT_EVOLUTION.crossover : Boolean(p.crossover);
  out.fitness = FITNESS_KINDS.includes(p.fitness) ? p.fitness : DEFAULT_EVOLUTION.fitness;
  return {
    population: out.population, elite: out.elite, selection: out.selection,
    mutationStrength: out.mutationStrength, mutationRate: out.mutationRate,
    crossover: out.crossover, fitness: out.fitness, maxDuration: out.maxDuration,
  };
}

// --- Estadísticas y fitness ---------------------------------------------------------------

/**
 * Estadísticas de un agente al empezar: mayor progreso, pasos en carrera, si chocó y mayor ventaja
 * sobre el tráfico (lo que avanzó menos lo que avanzó el tráfico en el mismo tiempo).
 */
export const createStats = () => ({ best: 0, steps: 0, crashed: false, lead: 0 });

/**
 * Actualiza las estadísticas de un agente después de un paso del mundo en el que participó (estaba
 * en carrera al empezar el paso). El mayor progreso nunca es menor que 0.
 * @param {{best:number, steps:number, crashed:boolean, lead:number}} stats
 * @param {{progress:number, crashed:boolean}} agent
 * @param {number} [trafficAdvance] cuánto avanzó el tráfico desde que empezó la generación (m)
 */
export function recordStep(stats, agent, trafficAdvance = 0) {
  if (stats.crashed) return stats;
  stats.steps += 1;
  if (agent.progress > stats.best) stats.best = agent.progress;
  const lead = agent.progress - trafficAdvance;
  if (lead > stats.lead) stats.lead = lead;
  if (agent.crashed) stats.crashed = true;
  return stats;
}

/** Segundos en carrera. */
export const secondsAlive = (stats) => stats.steps * STEP;

/**
 * Fitness de un agente según la función elegida:
 *   lead      mayor ventaja sobre el tráfico alcanzada (m); nunca menor que 0
 *   distance  mayor distancia alcanzada (m)
 *   survival  segundos en carrera
 *   speed     distancia sobre tiempo en carrera (m/s); 0 si el tiempo es 0
 */
export function fitnessOf(kind, stats) {
  const best = Math.max(0, stats.best);
  switch (kind) {
    case 'lead': return Math.max(0, stats.lead ?? 0);
    case 'distance': return best;
    case 'survival': return secondsAlive(stats);
    case 'speed': {
      const t = secondsAlive(stats);
      return t > 0 ? best / t : 0;
    }
    default: throw new EvolutionError('unknownFitness', { fitness: kind, allowed: [...FITNESS_KINDS] });
  }
}

// --- Orden, selección y élite --------------------------------------------------------------

/** Índices de la población de mayor a menor fitness; los empates, por su posición en la población. */
export function rankPopulation(fitnesses) {
  return fitnesses.map((f, i) => i).sort((a, b) => (fitnesses[b] - fitnesses[a]) || (a - b));
}

/** Cantidad de padres: el porcentaje de la población (redondeado hacia abajo), nunca menos de uno. */
export const parentCount = (population, selection) => Math.max(1, Math.floor((population * selection) / 100));

/**
 * Cantidad de individuos de élite: la pedida, nunca más que la mitad de la población (redondeada
 * hacia abajo), para que siempre haya al menos tantos hijos nuevos como individuos de élite.
 */
export const eliteCount = (population, elite) => Math.max(0, Math.min(elite, Math.floor(population / 2)));

// --- Mutación y cruce ----------------------------------------------------------------------

/**
 * Hijo mutado: cada valor, con probabilidad `rate` %, se acerca a un valor al azar r entre -1 y 1
 * en la proporción `strength` %: w + (r - w) × fuerza. No modifica al padre.
 * Consumo del azar por valor, en el orden canónico: un número para decidir si muta y, si muta, otro
 * para r.
 */
export function mutate(net, { strength, rate }, random) {
  const s = strength / 100;
  const p = rate / 100;
  return mapValues(net, (w) => {
    if (random() >= p) return w;
    const r = random() * 2 - 1;
    return w + (r - w) * s;
  });
}

/** Cruce uniforme: cada valor se toma de uno u otro padre al azar (un número por valor). */
export function crossover(a, b, random) {
  const child = copyNetwork(a);
  child.layers.forEach((layer, l) => {
    const other = b.layers[l];
    layer.weights.forEach((row, j) => {
      for (let i = 0; i < row.length; i++) if (random() >= 0.5) row[i] = other.weights[j][i];
    });
    for (let j = 0; j < layer.biases.length; j++) if (random() >= 0.5) layer.biases[j] = other.biases[j];
  });
  return child;
}

// --- Enfriamiento de la mutación (fitness-que-premia-superar D9) ---------------------------------

/** La fuerza empieza en `start` % y se multiplica por `factor` en cada generación, sin bajar de `floor` %. */
export const MUTATION_COOLING = Object.freeze({ start: 30, factor: 0.95, floor: 3 });

/**
 * Fuerza de mutación (%) con que se arma la generación que sigue a la número `generation`, con el
 * enfriamiento encendido: max(piso, inicio × factor^generación).
 */
export function cooledStrength(generation) {
  const { start, factor, floor } = MUTATION_COOLING;
  return Math.max(floor, start * factor ** generation);
}

// --- Generación siguiente -------------------------------------------------------------------

/**
 * Arma la generación siguiente (design.md D5).
 * Primero la élite, sin cambios (los mejores, en orden); el resto son hijos de padres elegidos al
 * azar, con igual probabilidad, entre los seleccionados. El azar se consume en orden fijo: hijo por
 * hijo, primero la elección de padres y después cada valor en el orden de las capas (cruce y
 * mutación).
 * @param {{networks:object[], fitnesses:number[], config:object, random:()=>number}} spec
 *   config: configuración de evolución (se normaliza); su `population` es el tamaño de la nueva.
 * @returns {{networks:object[], elite:number[], parents:number[]}} elite: posiciones de la élite en
 *   la nueva población; parents: índices (en la anterior) de los padres seleccionados, del mejor al peor.
 */
export function nextGeneration({ networks, fitnesses, config, random }) {
  const c = normalizeEvolution(config);
  const size = c.population;
  const ranked = rankPopulation(fitnesses);
  const parents = ranked.slice(0, Math.min(ranked.length, parentCount(networks.length, c.selection)));
  const eliteN = Math.min(eliteCount(size, c.elite), ranked.length);
  const out = [];
  for (let e = 0; e < eliteN; e++) out.push(copyNetwork(networks[ranked[e]]));
  const k = parents.length;
  while (out.length < size) {
    const a = Math.floor(random() * k);
    let base;
    if (c.crossover && k >= 2) {
      let b = Math.floor(random() * (k - 1));
      if (b >= a) b += 1;
      base = crossover(networks[parents[a]], networks[parents[b]], random);
    } else {
      base = networks[parents[a]];
    }
    out.push(mutate(base, { strength: c.mutationStrength, rate: c.mutationRate }, random));
  }
  return { networks: out, elite: Array.from({ length: eliteN }, (_, i) => i), parents };
}

/**
 * Generación que sale de un solo padre (design.md D3), para la selección manual: una copia exacta
 * del padre en la posición 0 y `population − 1` hijos mutados de él. No usa selección, élite ni
 * cruce. El azar se consume hijo por hijo, en orden, cada uno en el orden canónico de mutate().
 * @param {object} parent red del padre; no se modifica
 * @param {{population:number, mutationStrength:number, mutationRate:number}} config se normaliza
 * @param {() => number} random
 * @returns {object[]} las redes de la generación nueva
 */
export function childrenOf(parent, { population, mutationStrength, mutationRate }, random) {
  const c = normalizeEvolution({ population, mutationStrength, mutationRate });
  const out = [copyNetwork(parent)];
  while (out.length < c.population) out.push(mutate(parent, { strength: c.mutationStrength, rate: c.mutationRate }, random));
  return out;
}

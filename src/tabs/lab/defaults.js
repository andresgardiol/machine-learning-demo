// Valores por defecto del Laboratorio (pestana-laboratorio, design.md D4, D6 y D9; medidos en las
// tareas 2.1 y 2.3), sin DOM. La prueba tests/lab-defaults.test.js comprueba que con ellos la red
// aprende el círculo y que la receta de la misión 2 dispara el aviso de sobreajuste.
import { DEFAULT_POINTS, HOLDOUT_LIMITS } from '../../core/datasets.js';

/** La red y el aprendizaje por defecto: una capa de 4 con tanh y tasa 0,1. */
export const NETWORK_DEFAULTS = Object.freeze({ hidden: Object.freeze([4]), activation: 'tanh', rate: 0.1 });
/** Neuronas de una capa nueva. */
export const NEW_LAYER_NEURONS = 4;
/** Límites de la red del Laboratorio: de 0 a 3 capas ocultas, de 1 a 8 neuronas. */
export const LAB_NETWORK_LIMITS = Object.freeze({ layers: Object.freeze({ min: 0, max: 3 }), neurons: Object.freeze({ min: 1, max: 8 }) });
/** Tasa de aprendizaje: escala logarítmica de 0,001 a 3. */
export const RATE_LIMITS = Object.freeze({ min: 0.001, max: 3 });
export const LAB_ACTIVATIONS = Object.freeze(['tanh', 'sigmoid', 'relu']);

/** Datos de puntos por defecto: puntos en círculo, 200, ruido 10 %, 30 % apartados. */
export const DATA_DEFAULTS = Object.freeze({ kind: 'points', points: DEFAULT_POINTS, holdout: HOLDOUT_LIMITS.default });

/** Semilla de los datos (puntos y separación) y de la primera red: la misma para todos. */
export const DATA_SEED = 1;
export const FIRST_WEIGHT_SEED = 1;

/** Receta de la misión 2 (medida en 2.3): pocos puntos, mucho ruido y una red grande. */
export const OVERFIT_RECIPE = Object.freeze({ shape: 'circle', count: 40, noise: 30, hidden: Object.freeze([8, 8, 8]), rate: 0.1 });

/** Ritmo por defecto: 10 épocas por segundo. */
export const DEFAULT_EPOCH_RATE = 10;

// --- Por clase de datos (laboratorio-empieza-por-compuertas D3, D4 y D7) ---------------------------
/** Las tres clases de datos, en el orden de la barra. La primera es la que abre. */
export const DATA_KINDS = Object.freeze(['gates', 'points', 'driving']);
/**
 * Tasa por defecto de las compuertas (D7, medida en la tarea 5.2): con 0,3, XOR 2 → 2 → 1 tanh llegó a
 * 4 de 4 en 6 de las primeras 10 redes de la serie (0,5: 4 de 10; 1: 1 de 10). Las demás quedan
 * trabadas en un mínimo local con cualquier tasa.
 */
export const GATES_RATE = 0.3;
/**
 * Arranque fijo de las compuertas con capas ocultas (D7): pasar de cero capas a una, o cambiar la forma o
 * la activación, arma la red con esta semilla, con la que XOR 2 → 2 → 1 tanh a tasa 0,3 llega a 4 de 4
 * en 68 épocas (6,8 s a 10 épocas por segundo). "Reiniciar pesos" sigue la serie desde ahí.
 */
export const GATES_HIDDEN_SEED = 1;
/** Trabada en un mínimo local (D8): XOR con capa oculta, 50 épocas sin 4 de 4 y el error bajó menos de esto en esas 50. */
export const STUCK = Object.freeze({ epochs: 50, drop: 0.01 });
/**
 * Valores por defecto de cada clase: capas ocultas, neuronas de una capa nueva, activación, tasa,
 * pesos en cero sin capas ocultas (solo compuertas) y el paso y el ritmo con que arranca la barra.
 */
export const KIND_DEFAULTS = Object.freeze({
  gates: Object.freeze({ hidden: Object.freeze([]), newLayer: 2, activation: 'tanh', rate: GATES_RATE, zeroWeights: true, size: 'neuron', pace: 1 }),
  points: Object.freeze({ hidden: NETWORK_DEFAULTS.hidden, newLayer: NEW_LAYER_NEURONS, activation: NETWORK_DEFAULTS.activation, rate: NETWORK_DEFAULTS.rate, zeroWeights: false, size: 'epoch', pace: DEFAULT_EPOCH_RATE }),
  driving: Object.freeze({ hidden: NETWORK_DEFAULTS.hidden, newLayer: NEW_LAYER_NEURONS, activation: NETWORK_DEFAULTS.activation, rate: NETWORK_DEFAULTS.rate, zeroWeights: false, size: 'epoch', pace: DEFAULT_EPOCH_RATE }),
});
/** Compuerta con que abre el Laboratorio. */
export const DEFAULT_GATE = 'and';
/** XOR sin capas ocultas (D8): con tantos cambios a mano o épocas sin 4 de 4, la guía explica. */
export const XOR_EXPLAIN = Object.freeze({ changes: 5, epochs: 50 });
/** Rango del plano de cada clase (D2): con compuertas, de −0,5 a 1,5 en los dos ejes. */
export const PLANE_RANGES = Object.freeze({ gates: Object.freeze([-0.5, 1.5]), points: Object.freeze([-1, 1]), driving: Object.freeze([-1, 1]) });

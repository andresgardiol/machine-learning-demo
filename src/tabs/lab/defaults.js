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

/** Datos por defecto: puntos en círculo, 200, ruido 10 %, 30 % apartados. */
export const DATA_DEFAULTS = Object.freeze({ kind: 'points', points: DEFAULT_POINTS, holdout: HOLDOUT_LIMITS.default });

/** Semilla de los datos (puntos y separación) y de la primera red: la misma para todos. */
export const DATA_SEED = 1;
export const FIRST_WEIGHT_SEED = 1;

/** Receta de la misión 2 (medida en 2.3): pocos puntos, mucho ruido y una red grande. */
export const OVERFIT_RECIPE = Object.freeze({ shape: 'circle', count: 40, noise: 30, hidden: Object.freeze([8, 8, 8]), rate: 0.1 });

/** Ritmo por defecto: 10 épocas por segundo. */
export const DEFAULT_EPOCH_RATE = 10;

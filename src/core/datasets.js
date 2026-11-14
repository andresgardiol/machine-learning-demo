// Datos de ejemplo del Laboratorio (pestana-laboratorio, design.md D4), sin DOM.
//
//   pointsDataset({ shape, count, noise, seed })          → { kind: 'points', examples, ... }
//   drivingExamples({ controller, sensors, track, ... })  → { kind: 'driving', examples, ... }
//   createRecorder({ sensors })                           → junta ejemplos de un mundo en marcha
//   splitDataset(data, { holdout, seed })                 → { practice, heldOut, held }
//   summary(data, split?)                                 → cuántos hay y qué parte es de cada clase
//
// Un ejemplo es { inputs: number[], targets: number[] } (las respuestas, 0 o 1). En los de manejo,
// además `attempt` (el intento) y `step` (el paso dentro del intento), para apartar tramos seguidos.
import { createRandom, deriveSeed } from './random.js';
import { createWorld } from './world.js';
import { sensorConfig, DEFAULT_SENSORS } from './sensors.js';
import { STEP } from './constants.js';

export const POINT_SHAPES = Object.freeze(['blobs', 'circle', 'xor', 'spiral']);
export const POINT_LIMITS = Object.freeze({
  count: Object.freeze({ min: 20, max: 500, step: 10 }),
  noise: Object.freeze({ min: 0, max: 50, step: 5 }),
});
export const DEFAULT_POINTS = Object.freeze({ shape: 'circle', count: 200, noise: 10 });
/** Parte apartada: de 10 % a 50 %, 30 % por defecto. */
export const HOLDOUT_LIMITS = Object.freeze({ min: 10, max: 50, step: 5, default: 30 });
/** Largo de un tramo apartado de manejo (s). */
export const HOLDOUT_CHUNK_SECONDS = 2;
/** Desvío del ruido de los puntos: con ruido r %, cada coordenada se corre al azar con desvío r/100 × esto. */
export const NOISE_SPREAD = 0.5;
/** Los cuatro controles de un ejemplo de manejo, en el orden de las salidas de la red. */
export const DRIVING_OUTPUTS = Object.freeze(['forward', 'left', 'right', 'reverse']);

const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
const clampUnit = (v) => clamp(v, -1, 1);

/** Ajustes de puntos válidos: forma conocida y cantidad y ruido en sus límites y en su paso. */
export function normalizePoints(partial = {}) {
  const shape = POINT_SHAPES.includes(partial.shape) ? partial.shape : DEFAULT_POINTS.shape;
  const round = (v, { min, max, step }, d) => {
    const n = Number(v ?? d);
    if (!Number.isFinite(n)) return d;
    return clamp(Math.round(n / step) * step, min, max);
  };
  return {
    shape,
    count: round(partial.count, POINT_LIMITS.count, DEFAULT_POINTS.count),
    noise: round(partial.noise, POINT_LIMITS.noise, DEFAULT_POINTS.noise),
  };
}

/** Normal estándar (Box-Muller) a partir de un generador uniforme. */
function gaussian(random) {
  let u = 0;
  while (u === 0) u = random();
  const v = random();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

/**
 * Punto sin ruido de la forma `shape` para la clase `label` (0 o 1), con `k` su número dentro de la
 * clase de `n` puntos de esa clase.
 */
function cleanPoint(shape, label, k, n, random) {
  if (shape === 'blobs') {
    // Dos grupos a los lados de la recta y = x.
    const c = label === 1 ? { x: -0.35, y: 0.35 } : { x: 0.35, y: -0.35 };
    const r = 0.4 * Math.sqrt(random());
    const a = random() * 2 * Math.PI;
    return { x: c.x + r * Math.cos(a), y: c.y + r * Math.sin(a) };
  }
  if (shape === 'circle') {
    // Clase 1 en el centro (radio hasta 0,45); clase 0 alrededor (radio de 0,65 a 0,95).
    const r = label === 1 ? 0.45 * Math.sqrt(random()) : 0.65 + 0.3 * random();
    const a = random() * 2 * Math.PI;
    return { x: r * Math.cos(a), y: r * Math.sin(a) };
  }
  if (shape === 'xor') {
    // Clase 1 en los cuadrantes donde x e y tienen el mismo signo; con un margen de 0,08 en los ejes.
    const mag = () => 0.08 + 0.87 * random();
    const sx = random() < 0.5 ? -1 : 1;
    const sy = label === 1 ? sx : -sx;
    return { x: sx * mag(), y: sy * mag() };
  }
  // Espiral: dos brazos, el de la clase 0 girado media vuelta.
  const t = n <= 1 ? 0 : k / (n - 1);
  const r = 0.08 + 0.85 * t;
  const a = 1.75 * t * 2 * Math.PI + (label === 1 ? 0 : Math.PI);
  return { x: r * Math.sin(a), y: r * Math.cos(a) };
}

/** ¿De qué clase es un punto según la forma pura (sin ruido)? Sirve para medir el ruido. */
export function idealLabel(shape, { x, y }) {
  if (shape === 'blobs') return y > x ? 1 : 0;
  if (shape === 'circle') return Math.hypot(x, y) < 0.55 ? 1 : 0;
  if (shape === 'xor') return x * y > 0 ? 1 : 0;
  return null; // la espiral no tiene una regla simple
}

/**
 * Puntos de dos colores en el plano, entre −1 y 1. La mitad de cada color (uno de diferencia como
 * mucho), alternados. El ruido corre cada punto al azar: con más ruido, más puntos del lado del otro color.
 * @param {{shape?:string, count?:number, noise?:number, seed?:number}} spec  noise en %
 */
export function pointsDataset(spec = {}) {
  const { shape, count, noise } = normalizePoints(spec);
  const seed = spec.seed ?? 1;
  const random = createRandom(deriveSeed(seed, POINT_SHAPES.indexOf(shape) + 1));
  const perClass = [Math.ceil(count / 2), Math.floor(count / 2)];
  const seen = [0, 0];
  const sd = (noise / 100) * NOISE_SPREAD;
  const examples = [];
  for (let i = 0; i < count; i++) {
    const label = i % 2 === 0 ? 1 : 0;
    const which = label === 1 ? 0 : 1;
    const p = cleanPoint(shape, label, seen[which]++, perClass[which], random);
    const x = clampUnit(p.x + (sd > 0 ? sd * gaussian(random) : 0));
    const y = clampUnit(p.y + (sd > 0 ? sd * gaussian(random) : 0));
    examples.push({ inputs: [x, y], targets: [label] });
  }
  return { kind: 'points', shape, count, noise, seed, inputs: 2, outputs: 1, examples };
}

/** Un ejemplo de manejo: lo que percibía el auto y los cuatro controles. */
export function drivingExample(perception, controls, attempt = 0, step = 0) {
  return {
    inputs: [...perception.sensors, perception.speed],
    targets: DRIVING_OUTPUTS.map((k) => (controls[k] ? 1 : 0)),
    attempt,
    step,
  };
}

/**
 * Ejemplos de manejo de un controlador: lo hace manejar y toma un ejemplo por paso, en orden. Si
 * choca, vuelve a empezar con otro tráfico hasta completar la duración. No toma ejemplos del auto chocado.
 * @param {object} spec
 * @param {object} spec.controller cumple el contrato de controller.js
 * @param {object} [spec.sensors] los del controlador (por defecto, los de siempre)
 * @param {number} [spec.seconds] duración total de lo tomado (s)
 * @param {number} [spec.seed] semilla del primer tráfico; cada intento usa otra derivada
 * @param {number} [spec.maxAttempts] tope de intentos (para un maestro que choca enseguida)
 */
export function drivingExamples({
  controller, sensors = DEFAULT_SENSORS, track = 'straight', lanes, density, irregularity, maxSpeed,
  seconds = 60, seed = 1, maxAttempts = 200,
} = {}) {
  const total = Math.round(seconds / STEP);
  const config = sensorConfig(sensors);
  const examples = [];
  let attempt = 0;
  let crashes = 0;
  while (examples.length < total && attempt < maxAttempts) {
    let last = null;
    const recording = {
      control(perception) {
        const c = controller.control(perception);
        last = { perception: { sensors: [...perception.sensors], speed: perception.speed }, controls: c };
        return c;
      },
    };
    const world = createWorld({
      seed: attempt === 0 ? seed : deriveSeed(seed, attempt), track, lanes, density, irregularity, maxSpeed,
      sensors: config, controller: recording,
    });
    let step = 0;
    while (examples.length < total) {
      world.step();
      examples.push(drivingExample(last.perception, last.controls, attempt, step));
      step += 1;
      if (world.crashed) { crashes += 1; break; }
    }
    attempt += 1;
  }
  return {
    kind: 'driving', track, lanes, density, irregularity, maxSpeed, seed,
    sensors: config, inputs: config.count + 1, outputs: DRIVING_OUTPUTS.length,
    attempts: attempt, crashes, examples,
  };
}

/**
 * Grabador: junta ejemplos de un mundo en marcha (el manejo de una persona). Se le pasa lo que
 * percibía el auto y lo que se apretó en cada paso; un choque cierra el intento.
 */
export function createRecorder({ sensors = DEFAULT_SENSORS } = {}) {
  const config = sensorConfig(sensors);
  let examples = [];
  let attempt = 0;
  let step = 0;
  return {
    /** Un paso: lo que se percibía antes de mover el auto y los controles con que se movió. */
    add(perception, controls) { examples.push(drivingExample(perception, controls, attempt, step)); step += 1; },
    /** El auto chocó o el intento volvió a empezar: lo que siga es otro intento. */
    newAttempt() { if (step > 0) { attempt += 1; step = 0; } },
    clear() { examples = []; attempt = 0; step = 0; },
    get count() { return examples.length; },
    get seconds() { return examples.length * STEP; },
    get sensors() { return { ...config }; },
    /** Los ejemplos grabados como datos de manejo. */
    dataset(extra = {}) {
      return { kind: 'driving', ...extra, sensors: { ...config }, inputs: config.count + 1, outputs: DRIVING_OUTPUTS.length, attempts: attempt + (step > 0 ? 1 : 0), examples: examples.slice() };
    },
  };
}

/**
 * Separa los datos en práctica y apartados con una semilla. En puntos, aparta la misma parte de cada
 * color; en manejo, tramos seguidos de HOLDOUT_CHUNK_SECONDS.
 * @param {{kind:string, examples:object[]}} data
 * @param {{holdout?:number, seed?:number}} [options] holdout en % (10 a 50)
 * @returns {{practice:object[], heldOut:object[], held:boolean[]}}
 */
export function splitDataset(data, { holdout = HOLDOUT_LIMITS.default, seed = 1 } = {}) {
  const share = clamp(Number(holdout) || HOLDOUT_LIMITS.default, HOLDOUT_LIMITS.min, HOLDOUT_LIMITS.max) / 100;
  const n = data.examples.length;
  const held = new Array(n).fill(false);
  const random = createRandom(deriveSeed(seed, 7919));
  if (data.kind === 'points') {
    for (const label of [1, 0]) {
      const idx = [];
      data.examples.forEach((ex, i) => { if (ex.targets[0] === label) idx.push(i); });
      shuffle(idx, random);
      const take = Math.round(idx.length * share);
      for (let k = 0; k < take; k++) held[idx[k]] = true;
    }
  } else {
    const chunk = Math.round(HOLDOUT_CHUNK_SECONDS / STEP);
    const blocks = Math.floor(n / chunk);
    const take = Math.min(blocks, Math.round((n * share) / chunk));
    const order = Array.from({ length: blocks }, (_, b) => b);
    shuffle(order, random);
    for (let k = 0; k < take; k++) {
      const b = order[k];
      for (let i = b * chunk; i < (b + 1) * chunk; i++) held[i] = true;
    }
  }
  const practice = [];
  const heldOut = [];
  data.examples.forEach((ex, i) => (held[i] ? heldOut : practice).push(ex));
  return { practice, heldOut, held };
}

function shuffle(arr, random) {
  for (let i = arr.length - 1; i > 0; i--) {
    const k = Math.floor(random() * (i + 1));
    const tmp = arr[i]; arr[i] = arr[k]; arr[k] = tmp;
  }
  return arr;
}

/**
 * Resumen: cuántos ejemplos hay (y, con la separación, cuántos de práctica y apartados), y qué parte
 * tiene cada salida en 1: en puntos, el color 1; en manejo, cada control.
 */
export function summary(data, split = null) {
  const n = data.examples.length;
  const outputs = data.outputs ?? data.examples[0]?.targets.length ?? 0;
  const shares = Array.from({ length: outputs }, (_, k) => (n === 0 ? 0 : data.examples.reduce((s, ex) => s + (ex.targets[k] >= 0.5 ? 1 : 0), 0) / n));
  const out = {
    count: n,
    practice: split ? split.practice.length : null,
    heldOut: split ? split.heldOut.length : null,
    seconds: data.kind === 'driving' ? n * STEP : null,
    shares,
  };
  if (data.kind === 'driving') out.controls = Object.fromEntries(DRIVING_OUTPUTS.map((k, i) => [k, shares[i]]));
  return out;
}

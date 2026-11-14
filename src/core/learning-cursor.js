// Recorrido paso a paso del aprendizaje (pestana-laboratorio, design.md D3), sin DOM.
//
// Un ejemplo se aprende en cuatro fases, en orden: la ida ('forward', de la primera capa a la
// última), el error ('error', una salida por vez), la vuelta ('backward', la culpa de cada neurona,
// de las salidas hacia la primera capa) y la corrección ('update', los pesos que llegan a cada
// neurona, también de la última capa a la primera). Cada fase se recorre capa por capa y neurona por
// neurona: una "unidad" es una neurona de una fase.
//
//   createExampleCursor(sizes) → posición dentro de un ejemplo: no calcula nada.
//   createLearningRun({ network, practice, heldOut, rate, seed }) → el aprendizaje entero: épocas,
//     ejemplos y el ejemplo en curso, con advance(size) para size = epoch | example | phase | layer | neuron.
//
// Como en Inspeccionar, el cursor no calcula: dice hasta dónde se muestra. La cuenta de un ejemplo se
// hace entera al empezarlo (forwardSoft, backward, corrections) y la corrección se aplica a la red
// recién cuando el ejemplo termina. Así, recorrer una época paso a paso deja la red idéntica a hacerla
// de corrido (trainEpoch / learnExample hacen las mismas operaciones en el mismo orden).
import {
  forwardSoft, exampleError, backward, corrections, applyCorrections, learnExample, evaluate, shuffledOrder,
  assertLearnable,
} from './backprop.js';
import { copyNetwork } from './network.js';
import { randomFor } from './random.js';
import { trackWarning } from './overfitting.js';

export const PHASES = Object.freeze(['forward', 'error', 'backward', 'update']);
export const LEARNING_STEP_SIZES = Object.freeze(['epoch', 'example', 'phase', 'layer', 'neuron']);

/** Las unidades de un ejemplo, en orden: { phase, layer, neuron }. */
export function exampleUnits(sizes) {
  const L = sizes.length - 1;
  const units = [];
  for (let l = 1; l <= L; l++) for (let j = 0; j < sizes[l]; j++) units.push({ phase: 'forward', layer: l, neuron: j });
  for (let j = 0; j < sizes[L]; j++) units.push({ phase: 'error', layer: L, neuron: j });
  for (const phase of ['backward', 'update']) {
    for (let l = L; l >= 1; l--) for (let j = 0; j < sizes[l]; j++) units.push({ phase, layer: l, neuron: j });
  }
  return units;
}

/** Posición dentro de un ejemplo. */
export function createExampleCursor(shape) {
  const sizes = Array.isArray(shape) ? shape.slice() : shape.sizes.slice();
  const units = exampleUnits(sizes);
  const total = units.length;
  // Índice de cada unidad, para preguntar rápido si está hecha.
  const index = new Map(units.map((u, k) => [`${u.phase}:${u.layer}:${u.neuron}`, k]));
  let count = 0;

  function targetFor(size) {
    if (count >= total) return total;
    const next = units[count];
    if (size === 'neuron') return count + 1;
    let k = count;
    if (size === 'layer') { while (k < total && units[k].phase === next.phase && units[k].layer === next.layer) k++; return k; }
    if (size === 'phase') { while (k < total && units[k].phase === next.phase) k++; return k; }
    if (size === 'example' || size === 'epoch') return total;
    throw new Error(`unknownStepSize: ${size}`);
  }

  const cursor = {
    /** Avanza un paso: las unidades hechas son las de índice from a to − 1. */
    advance(size) {
      const from = count;
      count = targetFor(size);
      return { from, to: count, done: count >= total };
    },
    reset() { count = 0; },
    complete() { count = total; },
    /** ¿Está hecha esa unidad? */
    isDone(phase, layer, neuron) {
      const k = index.get(`${phase}:${layer}:${neuron}`);
      return k !== undefined && k < count;
    },
    /** ¿Está hecha toda la fase? */
    phaseDone(phase) {
      const last = units.findLastIndex((u) => u.phase === phase);
      return last < count;
    },
    at: (k) => units[k] ?? null,
    get units() { return units; },
    get count() { return count; },
    get total() { return total; },
    get done() { return count >= total; },
    get started() { return count > 0; },
    /** La última unidad hecha, o null. */
    get position() { return units[count - 1] ?? null; },
    /** La próxima unidad, o null si el ejemplo está completo. */
    get next() { return units[count] ?? null; },
    /** Fase de la próxima unidad (o 'done'). */
    get phase() { return units[count]?.phase ?? 'done'; },
    get sizes() { return sizes.slice(); },
  };
  return cursor;
}

/** La cuenta entera de un ejemplo: ida, error, vuelta y corrección (sin aplicarla). */
export function exampleDetail(net, example, rate) {
  const forward = forwardSoft(net, example.inputs);
  const error = exampleError(forward.outputs, example.targets);
  const back = backward(net, forward, example.targets);
  const corr = corrections(net, forward, back.deltas, rate);
  return { forward, error, backward: back, corrections: corr, rate };
}

/**
 * El aprendizaje entero sobre unos datos.
 * @param {object} spec
 * @param {object} spec.network red inicial (se copia)
 * @param {object[]} spec.practice ejemplos con los que aprende
 * @param {object[]} [spec.heldOut] ejemplos apartados: nunca corrigen la red
 * @param {number} spec.rate tasa de aprendizaje
 * @param {number} [spec.seed] semilla del orden de cada época
 */
export function createLearningRun({ network, practice, heldOut = [], rate, seed = 1 }) {
  assertLearnable(network);
  let net = copyNetwork(network);
  let currentRate = rate;
  let epoch = 0; // épocas completas
  let order = null; // orden de la época en curso
  let nextIndex = 0; // próximo ejemplo del orden a empezar
  let active = null; // { index, example, detail, cursor, done, original }
  const history = [];
  let warn = { active: false, since: null, appearances: 0 }; // aviso de sobreajuste (no es fijo)
  const events = []; // { epoch, kind: 'appeared' | 'retired' }
  const size = practice.length;

  const ensureOrder = () => { if (!order) order = shuffledOrder(size, randomFor(seed, epoch + 1)); };

  function finishEpoch() {
    epoch += 1;
    const p = evaluate(net, practice);
    const h = evaluate(net, heldOut);
    history.push({ epoch, practice: p, heldOut: h });
    const w = trackWarning(warn, history);
    warn = w.state;
    if (w.appeared) events.push({ epoch, kind: 'appeared' });
    if (w.retired) events.push({ epoch, kind: 'retired' });
    order = null;
    nextIndex = 0;
  }

  /** Termina el ejemplo activo (aplica su corrección) y, si era el último, la época. */
  function finishActive() {
    active.cursor.complete();
    net = applyCorrections(active.original, active.detail.corrections);
    active.done = true;
    if (nextIndex >= size) finishEpoch();
  }

  function startExample() {
    ensureOrder();
    const index = order[nextIndex];
    nextIndex += 1;
    const example = practice[index];
    active = { index, order: nextIndex - 1, epoch: epoch + 1, example, detail: exampleDetail(net, example, currentRate), cursor: createExampleCursor(net.sizes), done: false, original: net };
  }

  /** De corrido: aprende con los ejemplos que faltan de la época, en el lugar (sin la cuenta desglosada). */
  function runRestOfEpoch() {
    ensureOrder();
    const work = copyNetwork(net);
    for (let k = nextIndex; k < size; k++) {
      const ex = practice[order[k]];
      learnExample(work, ex.inputs, ex.targets, currentRate);
    }
    net = work;
    nextIndex = size;
    finishEpoch();
  }

  const run = {
    /**
     * Avanza un paso del tamaño `size`. Devuelve { size, units: [{phase, layer, neuron}] hechas en
     * este paso, exampleDone, epochDone }.
     */
    advance(stepSize) {
      if (size === 0) return { size: stepSize, units: [], exampleDone: false, epochDone: false };
      const epochBefore = epoch;
      if (stepSize === 'epoch') {
        if (active && !active.done) finishActive();
        if (epoch === epochBefore) runRestOfEpoch();
        active = null;
        return { size: stepSize, units: [], exampleDone: true, epochDone: true };
      }
      if (!active || active.done) startExample();
      const r = active.cursor.advance(stepSize);
      const units = [];
      for (let k = r.from; k < r.to; k++) units.push(active.cursor.at(k));
      if (r.done && !active.done) finishActive();
      return { size: stepSize, units, exampleDone: active.done, epochDone: epoch > epochBefore };
    },
    /** Varias épocas de corrido (para medir y para reproducir rápido). */
    runEpochs(n) { for (let k = 0; k < n; k++) run.advance('epoch'); },
    /** Deja de mostrar el ejemplo terminado (al pasar a reproducir de a épocas). */
    clearActive() { if (active && active.done) active = null; },
    /** La red con lo aprendido hasta ahora (sin el ejemplo a medio hacer). */
    get network() { return net; },
    /**
     * La red que se ve: durante la corrección de un ejemplo, con los pesos nuevos de las neuronas ya
     * corregidas; si no, la de siempre.
     */
    shownNetwork() {
      if (!active || active.done) return net;
      const c = active.cursor;
      if (!c.started || c.phase === 'forward' || c.phase === 'error' || c.phase === 'backward') return active.original;
      const out = copyNetwork(active.original);
      const corr = active.detail.corrections;
      for (let l = 1; l < out.sizes.length; l++) {
        for (let j = 0; j < out.sizes[l]; j++) {
          if (!c.isDone('update', l, j)) continue;
          const layer = out.layers[l - 1];
          for (let i = 0; i < layer.weights[j].length; i++) layer.weights[j][i] = corr.weights[l][j][i].after;
          layer.biases[j] = corr.biases[l][j].after;
        }
      }
      return out;
    },
    get active() { return active; },
    get epoch() { return epoch; },
    /** Ejemplos de la época en curso ya empezados (0 a size). */
    get exampleInEpoch() { return nextIndex; },
    get size() { return size; },
    get history() { return history; },
    /** El aviso de sobreajuste a la vista ({ epoch: desde cuándo }), o null. */
    get warning() { return warn.active ? { epoch: warn.since } : null; },
    /** Cuántas veces apareció el aviso desde que empezó el aprendizaje. */
    get warningAppearances() { return warn.appearances; },
    /** Apariciones y retiros del aviso, en orden. */
    get warningEvents() { return events; },
    get rate() { return currentRate; },
    /** La tasa se aplica desde el ejemplo siguiente: el que está a medio hacer termina con la suya. */
    set rate(v) { currentRate = v; },
    get seed() { return seed; },
  };
  return run;
}

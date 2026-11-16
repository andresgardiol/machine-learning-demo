// Sesión del Laboratorio (pestana-laboratorio, design.md D4 a D9), sin DOM: los datos, la red y el
// aprendizaje, y qué empieza de nuevo con cada cambio. La pestaña (index.js) la dibuja.
//
//   kind        'points' | 'driving'
//   points      { shape, count, noise }            (D5)
//   driving     { track, lanes, density, irregularity, maxSpeed }
//   holdout     % apartado (10 a 50)
//   hidden      neuronas por capa oculta (0 a 3 capas de 1 a 8)
//   activation  tanh | sigmoid | relu
//   rate        tasa de aprendizaje (se aplica en marcha)
//   source      con tu manejo: 'teacher' (un cerebro) o 'recorded' (lo grabado)
//
// Qué empieza de nuevo (D6): la forma de la red, la activación, los datos y la parte apartada arman
// todo de cero, con pesos al azar de la semilla vigente. "Reiniciar pesos" pasa a la semilla siguiente:
// la serie es la misma para todos. La tasa se aplica desde el ejemplo siguiente.
import { createNetwork } from '../../core/network.js';
import { createRandom } from '../../core/random.js';
import { createLearningRun } from '../../core/learning-cursor.js';
import { pointsDataset, splitDataset, drivingExamples, normalizePoints, DEFAULT_POINTS, HOLDOUT_LIMITS } from '../../core/datasets.js';
import { carForBrain } from '../../core/brain.js';
import { DEFAULT_SENSORS } from '../../core/sensors.js';
import { normalizeSettings as normalizeStreet, DEFAULT_SETTINGS as STREET_DEFAULTS } from '../shared/street-settings.js';
import { NETWORK_DEFAULTS, LAB_NETWORK_LIMITS, RATE_LIMITS, LAB_ACTIVATIONS, DATA_SEED, FIRST_WEIGHT_SEED, NEW_LAYER_NEURONS } from './defaults.js';

/** Segundos de manejo que se toman del maestro (D8). */
export const TEACHER_SECONDS = 60;
/** Con menos de esto grabado, un aviso dice que son pocos (D8). */
export const FEW_RECORDED_SECONDS = 10;
/** Maestro por defecto. */
export const DEFAULT_TEACHER = 'example:street-new';

/** Escenario de manejo por defecto: la calle recta con el tráfico de siempre. */
export const DRIVING_DEFAULTS = Object.freeze({
  track: STREET_DEFAULTS.track, lanes: STREET_DEFAULTS.lanes, density: STREET_DEFAULTS.density,
  irregularity: STREET_DEFAULTS.irregularity, maxSpeed: STREET_DEFAULTS.maxSpeed,
});

const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));

/** Tasa válida: entre 0,001 y 3. */
export const rateOf = (v) => clamp(Number.isFinite(Number(v)) ? Number(v) : NETWORK_DEFAULTS.rate, RATE_LIMITS.min, RATE_LIMITS.max);

/** Posición (0 a 1) de una tasa en el deslizador logarítmico, y al revés. */
export const rateToSlider = (rate) => Math.log(rateOf(rate) / RATE_LIMITS.min) / Math.log(RATE_LIMITS.max / RATE_LIMITS.min);
export function sliderToRate(p) {
  const raw = RATE_LIMITS.min * (RATE_LIMITS.max / RATE_LIMITS.min) ** clamp(p, 0, 1);
  // Redondeo a dos cifras significativas: 0,001 · 0,0015 · … · 0,1 · 0,15 · … · 3.
  const mag = 10 ** Math.floor(Math.log10(raw));
  return rateOf(Math.round((raw / mag) * 10) / 10 * mag);
}

/** Capas ocultas válidas: de 0 a 3, cada una de 1 a 8 neuronas. */
export function normalizeHidden(hidden) {
  const list = Array.isArray(hidden) ? hidden.slice(0, LAB_NETWORK_LIMITS.layers.max) : [...NETWORK_DEFAULTS.hidden];
  return list.map((n) => clamp(Math.round(Number(n) || NEW_LAYER_NEURONS), LAB_NETWORK_LIMITS.neurons.min, LAB_NETWORK_LIMITS.neurons.max));
}

/** Holdout válido (%). */
export const holdoutOf = (v) => {
  const n = Math.round(Number(v) / HOLDOUT_LIMITS.step) * HOLDOUT_LIMITS.step;
  return Number.isFinite(n) ? clamp(n, HOLDOUT_LIMITS.min, HOLDOUT_LIMITS.max) : HOLDOUT_LIMITS.default;
};

/**
 * @param {object} [spec]
 * @param {(key:string) => object|null} [spec.brainFor] el cerebro de una clave ('example:<id>' o 'brain:<id>')
 */
export function createLabSession({ brainFor = () => null } = {}) {
  const s = {
    kind: 'points',
    points: { ...DEFAULT_POINTS },
    driving: { ...DRIVING_DEFAULTS },
    holdout: HOLDOUT_LIMITS.default,
    hidden: [...NETWORK_DEFAULTS.hidden],
    activation: NETWORK_DEFAULTS.activation,
    rate: NETWORK_DEFAULTS.rate,
    weightSeed: FIRST_WEIGHT_SEED,
    source: 'teacher',
    teacher: DEFAULT_TEACHER,
  };
  let data = null;
  let split = null;
  let run = null;
  let recorded = null; // datos grabados (se conservan al volver al maestro)
  let version = 0; // cambia cada vez que el aprendizaje empieza de nuevo
  // Punto de prueba (punto-de-prueba D6): dónde lo dejó la persona. Ningún cambio de datos, de red ni
  // de pesos lo mueve; la red no aprende de él.
  let probe = { x: 0, y: 0 };

  function teacherBrain() { return brainFor(s.teacher) ?? brainFor(DEFAULT_TEACHER); }

  function makeData() {
    if (s.kind === 'points') return pointsDataset({ ...s.points, seed: DATA_SEED });
    if (s.source === 'recorded' && recorded && recorded.examples.length > 0) return recorded;
    const brain = teacherBrain();
    const car = carForBrain(brain, { maxSpeed: s.driving.maxSpeed });
    return { ...drivingExamples({ controller: car.controller, sensors: car.sensors, ...s.driving, seconds: TEACHER_SECONDS, seed: DATA_SEED }), teacher: s.teacher };
  }

  function makeRun() {
    const network = createNetwork({ inputs: data.inputs, hidden: [...s.hidden], outputs: data.outputs, activation: s.activation, random: createRandom(s.weightSeed) });
    run = createLearningRun({ network, practice: split.practice, heldOut: split.heldOut, rate: s.rate, seed: s.weightSeed });
    version += 1;
  }

  /** Datos nuevos, separación nueva y aprendizaje desde cero. */
  function rebuildData() {
    data = makeData();
    split = splitDataset(data, { holdout: s.holdout, seed: DATA_SEED });
    makeRun();
  }
  function resplit() {
    split = splitDataset(data, { holdout: s.holdout, seed: DATA_SEED });
    makeRun();
  }

  rebuildData();

  const session = {
    get settings() { return { ...s, points: { ...s.points }, driving: { ...s.driving }, hidden: [...s.hidden] }; },
    get kind() { return s.kind; },
    get data() { return data; },
    get split() { return split; },
    get run() { return run; },
    get version() { return version; },
    /** Punto de prueba del plano: { x, y } entre −1 y 1. Empieza en el centro. */
    get probe() { return { ...probe }; },
    setProbe(p) {
      const c = (v) => Math.max(-1, Math.min(1, Number.isFinite(v) ? v : 0));
      const next = { x: c(p.x), y: c(p.y) };
      if (next.x === probe.x && next.y === probe.y) return false;
      probe = next;
      return true;
    },
    get recorded() { return recorded; },
    /** Sensores de los ejemplos de manejo (los del maestro, o los de siempre si son grabados). */
    get sensors() { return data.sensors ?? { ...DEFAULT_SENSORS }; },
    get teacherKey() { return s.teacher; },
    get source() { return s.source; },

    setKind(kind) {
      if (kind !== 'points' && kind !== 'driving') return false;
      if (kind === s.kind) return false;
      s.kind = kind;
      rebuildData();
      return true;
    },
    setPoints(partial) {
      const next = normalizePoints({ ...s.points, ...partial });
      if (JSON.stringify(next) === JSON.stringify(s.points)) return false;
      s.points = next;
      if (s.kind === 'points') rebuildData();
      return true;
    },
    resetPoints() { s.points = { ...DEFAULT_POINTS }; if (s.kind === 'points') rebuildData(); },
    setDriving(partial) {
      const merged = normalizeStreet({ ...STREET_DEFAULTS, ...s.driving, ...partial });
      const next = { track: merged.track, lanes: merged.lanes, density: merged.density, irregularity: merged.irregularity, maxSpeed: merged.maxSpeed };
      if (JSON.stringify(next) === JSON.stringify(s.driving)) return false;
      s.driving = next;
      if (s.kind === 'driving') rebuildData();
      return true;
    },
    resetDriving(maxSpeed = DRIVING_DEFAULTS.maxSpeed) { s.driving = { ...DRIVING_DEFAULTS, maxSpeed }; if (s.kind === 'driving') rebuildData(); },
    setHoldout(v) {
      const h = holdoutOf(v);
      if (h === s.holdout) return false;
      s.holdout = h;
      resplit();
      return true;
    },
    /** Cantidad de capas ocultas: las que quedan conservan sus neuronas; las nuevas, 4. */
    setLayers(count) {
      const n = clamp(Math.round(count), LAB_NETWORK_LIMITS.layers.min, LAB_NETWORK_LIMITS.layers.max);
      if (n === s.hidden.length) return false;
      const next = s.hidden.slice(0, n);
      while (next.length < n) next.push(NEW_LAYER_NEURONS);
      s.hidden = next;
      makeRun();
      return true;
    },
    setNeurons(layer, count) {
      if (layer < 0 || layer >= s.hidden.length) return false;
      const n = clamp(Math.round(count), LAB_NETWORK_LIMITS.neurons.min, LAB_NETWORK_LIMITS.neurons.max);
      if (n === s.hidden[layer]) return false;
      s.hidden = s.hidden.map((v, i) => (i === layer ? n : v));
      makeRun();
      return true;
    },
    setActivation(a) {
      if (!LAB_ACTIVATIONS.includes(a) || a === s.activation) return false;
      s.activation = a;
      makeRun();
      return true;
    },
    /** La tasa se aplica en marcha, desde el ejemplo siguiente. */
    setRate(v) {
      const r = rateOf(v);
      if (r === s.rate) return false;
      s.rate = r;
      run.rate = r;
      return true;
    },
    /** Reiniciar pesos: la semilla siguiente, con los mismos datos y la misma forma. */
    resetWeights() { s.weightSeed += 1; makeRun(); },
    /** Restablecer la red: una capa de 4 con tanh y la tasa por defecto (y la primera semilla). */
    resetNetwork() {
      s.hidden = [...NETWORK_DEFAULTS.hidden];
      s.activation = NETWORK_DEFAULTS.activation;
      s.rate = NETWORK_DEFAULTS.rate;
      makeRun();
    },
    /** Otro maestro: sus ejemplos, con sus sensores, y aprendizaje desde cero. */
    setTeacher(key) {
      if (!brainFor(key)) return false;
      const changed = key !== s.teacher || s.source !== 'teacher';
      s.teacher = key;
      s.source = 'teacher';
      if (changed && s.kind === 'driving') rebuildData();
      return changed;
    },
    /** Lo grabado pasa a ser los ejemplos (se acumula con lo anterior si se grabó antes). */
    useRecorded(dataset) {
      recorded = dataset;
      s.source = 'recorded';
      if (s.kind === 'driving') rebuildData();
    },
    /** Volver a lo grabado sin grabar de nuevo. */
    chooseRecorded() {
      if (!recorded || recorded.examples.length === 0 || s.source === 'recorded') return false;
      s.source = 'recorded';
      if (s.kind === 'driving') rebuildData();
      return true;
    },
    /** Borrar lo grabado: los ejemplos vuelven a ser los del maestro. */
    clearRecorded() {
      recorded = null;
      const was = s.source;
      s.source = 'teacher';
      if (s.kind === 'driving' && was === 'recorded') rebuildData();
    },
    /** ¿Lo grabado son pocos segundos para aprender? */
    get fewRecorded() { return Boolean(recorded) && recorded.examples.length * (1 / 60) < FEW_RECORDED_SECONDS; },
  };
  return session;
}

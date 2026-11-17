// Sesión del Laboratorio (pestana-laboratorio, design.md D4 a D9), sin DOM: los datos, la red y el
// aprendizaje, y qué empieza de nuevo con cada cambio. La pestaña (index.js) la dibuja.
//
// Cada clase de datos guarda lo suyo (laboratorio-empieza-por-compuertas D3): la forma de la red, la
// activación, la tasa, la semilla, el aprendizaje (red, curvas, ejemplo en curso), los cambios a mano,
// el punto de prueba y el paso y el ritmo de la barra. Cambiar de clase guarda el registro vigente y
// trae el de la otra, o lo crea con los valores por defecto de esa clase (KIND_DEFAULTS).
//
//   kind        'gates' | 'points' | 'driving'
//   gates       { gate: 'and' | 'or' | 'xor' }
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
import { pointsDataset, gatesDataset, splitDataset, drivingExamples, normalizePoints, gateOf, GATES, DEFAULT_POINTS, HOLDOUT_LIMITS } from '../../core/datasets.js';
import { evaluate } from '../../core/backprop.js';
import { createManualChanges } from './manual-changes.js';
import { carForBrain } from '../../core/brain.js';
import { DEFAULT_SENSORS } from '../../core/sensors.js';
import { normalizeSettings as normalizeStreet, DEFAULT_SETTINGS as STREET_DEFAULTS } from '../shared/street-settings.js';
import {
  NETWORK_DEFAULTS, LAB_NETWORK_LIMITS, RATE_LIMITS, LAB_ACTIVATIONS, DATA_SEED, FIRST_WEIGHT_SEED, NEW_LAYER_NEURONS,
  DATA_KINDS, KIND_DEFAULTS, DEFAULT_GATE, XOR_EXPLAIN, PLANE_RANGES,
} from './defaults.js';

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
 * @param {string} [spec.kind] la clase con que abre (por defecto, compuertas)
 */
export function createLabSession({ brainFor = () => null, kind: firstKind = DATA_KINDS[0] } = {}) {
  // Lo que comparten las clases: los ajustes de los datos de cada una y de quién son los ejemplos.
  const s = {
    kind: DATA_KINDS.includes(firstKind) ? firstKind : DATA_KINDS[0],
    gates: { gate: DEFAULT_GATE },
    points: { ...DEFAULT_POINTS },
    driving: { ...DRIVING_DEFAULTS },
    holdout: HOLDOUT_LIMITS.default,
    source: 'teacher',
    teacher: DEFAULT_TEACHER,
  };
  let recorded = null; // datos grabados (se conservan al volver al maestro)
  let version = 0; // cambia cada vez que el aprendizaje empieza de nuevo o cambia la clase
  const records = {}; // por clase: el registro de D3
  let rec = null; // el de la clase elegida

  function teacherBrain() { return brainFor(s.teacher) ?? brainFor(DEFAULT_TEACHER); }
  const defaultsOf = (k) => KIND_DEFAULTS[k];

  function makeData() {
    if (s.kind === 'gates') return gatesDataset({ gate: s.gates.gate });
    if (s.kind === 'points') return pointsDataset({ ...s.points, seed: DATA_SEED });
    if (s.source === 'recorded' && recorded && recorded.examples.length > 0) return recorded;
    const brain = teacherBrain();
    const car = carForBrain(brain, { maxSpeed: s.driving.maxSpeed });
    return { ...drivingExamples({ controller: car.controller, sensors: car.sensors, ...s.driving, seconds: TEACHER_SECONDS, seed: DATA_SEED }), teacher: s.teacher };
  }

  /** Pesos nuevos: en cero sin capas ocultas con compuertas (D3); si no, al azar de la serie. */
  function newNetwork() {
    const network = createNetwork({ inputs: rec.data.inputs, hidden: [...rec.hidden], outputs: rec.data.outputs, activation: rec.activation, random: createRandom(rec.weightSeed) });
    if (defaultsOf(rec.kind).zeroWeights && rec.hidden.length === 0) {
      for (const layer of network.layers) { layer.weights = layer.weights.map((r) => r.map(() => 0)); layer.biases = layer.biases.map(() => 0); }
    }
    return network;
  }

  /** Aprendizaje desde cero con `network` (o pesos nuevos). `keepChanges`: los cambios a mano siguen. */
  function makeRun({ network = null, keepChanges = false } = {}) {
    rec.run = createLearningRun({ network: network ?? newNetwork(), practice: rec.split.practice, heldOut: rec.split.heldOut, rate: rec.rate, seed: rec.weightSeed });
    if (!keepChanges) rec.manual.clear();
    version += 1;
    if (rec.kind === 'gates') xorReset();
  }

  /** Datos nuevos, separación nueva y aprendizaje desde cero. */
  function rebuildData() {
    rec.data = makeData();
    rec.split = splitDataset(rec.data, { holdout: s.holdout, seed: DATA_SEED });
    makeRun();
  }

  function createRecord(k) {
    const d = defaultsOf(k);
    rec = {
      kind: k, hidden: [...d.hidden], activation: d.activation, rate: d.rate, weightSeed: FIRST_WEIGHT_SEED,
      data: null, split: null, run: null, manual: createManualChanges(), probe: { x: 0, y: 0 }, playback: null,
      // Con compuertas (D8 y D10): los contadores de XOR sin capas ocultas y, por compuerta, si sigue "a mano".
      xor: { changes: 0, epochBase: 0 }, hand: Object.fromEntries(GATES.map((g) => [g, true])),
    };
    records[k] = rec;
    rebuildData();
  }

  // --- XOR sin capas ocultas (D8) y "a mano" (D10) ---------------------------------------------------
  function xorReset() { rec.xor = { changes: 0, epochBase: rec.run.epoch }; }

  createRecord(s.kind);

  const range = () => PLANE_RANGES[s.kind];

  const session = {
    get settings() {
      return { ...s, gates: { ...s.gates }, points: { ...s.points }, driving: { ...s.driving }, hidden: [...rec.hidden], activation: rec.activation, rate: rec.rate, weightSeed: rec.weightSeed };
    },
    get kind() { return s.kind; },
    get gate() { return s.gates.gate; },
    get data() { return rec.data; },
    get split() { return rec.split; },
    get run() { return rec.run; },
    get version() { return version; },
    /** Los cambios a mano de la clase elegida (manual-changes.js). */
    get manual() { return rec.manual; },
    /** ¿Ya hay un registro de esa clase (se eligió alguna vez)? */
    visited: (k) => Boolean(records[k]),
    /** Rango del plano de la clase elegida: [mínimo, máximo] en los dos ejes (D2). */
    get range() { return range(); },
    /** Punto de prueba del plano: { x, y } dentro del rango. Empieza en (0, 0). */
    get probe() { return { ...rec.probe }; },
    setProbe(p) {
      const [lo, hi] = range();
      const c = (v) => Math.max(lo, Math.min(hi, Number.isFinite(v) ? v : 0));
      const next = { x: c(p.x), y: c(p.y) };
      if (next.x === rec.probe.x && next.y === rec.probe.y) return false;
      rec.probe = next;
      return true;
    },
    /** Paso y ritmo de la barra guardados con la clase (los pone la pestaña), o null la primera vez. */
    get playbackConfig() { return rec.playback; },
    set playbackConfig(v) { rec.playback = v; },
    get recorded() { return recorded; },
    /** Sensores de los ejemplos de manejo (los del maestro, o los de siempre si son grabados). */
    get sensors() { return rec.data.sensors ?? { ...DEFAULT_SENSORS }; },
    get teacherKey() { return s.teacher; },
    get source() { return s.source; },

    /** Otra clase de datos: trae su registro tal como quedó, o lo crea con sus valores por defecto. */
    setKind(kind) {
      if (!DATA_KINDS.includes(kind) || kind === s.kind) return false;
      s.kind = kind;
      // Los ajustes de los datos de una clase solo se cambian con esa clase elegida: su registro sigue al día.
      if (records[kind]) { rec = records[kind]; version += 1; } else createRecord(kind);
      return true;
    },
    /** Otra compuerta (D1): datos, tabla y curvas nuevos; la red, sus pesos y sus cambios a mano siguen. */
    setGate(gate) {
      const g = gateOf(gate);
      if (g === s.gates.gate) return false;
      s.gates.gate = g;
      if (s.kind !== 'gates') return true;
      const snap = rec.run.snapshot();
      rec.data = makeData();
      rec.split = splitDataset(rec.data, { holdout: s.holdout, seed: DATA_SEED });
      makeRun({ network: snap.network, keepChanges: true });
      rec.run.restore(snap);
      return true;
    },
    /** Restablecer los datos de compuertas: AND, con la misma red. */
    resetGates() { return session.setGate(DEFAULT_GATE); },
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
      if (s.kind === 'gates') return true; // con compuertas no se aparta nada
      rec.split = splitDataset(rec.data, { holdout: s.holdout, seed: DATA_SEED });
      makeRun();
      return true;
    },
    /** Cantidad de capas ocultas: las que quedan conservan sus neuronas; las nuevas, las de la clase (2 o 4). */
    setLayers(count) {
      const n = clamp(Math.round(count), LAB_NETWORK_LIMITS.layers.min, LAB_NETWORK_LIMITS.layers.max);
      if (n === rec.hidden.length) return false;
      const next = rec.hidden.slice(0, n);
      while (next.length < n) next.push(defaultsOf(s.kind).newLayer);
      rec.hidden = next;
      makeRun();
      return true;
    },
    setNeurons(layer, count) {
      if (layer < 0 || layer >= rec.hidden.length) return false;
      const n = clamp(Math.round(count), LAB_NETWORK_LIMITS.neurons.min, LAB_NETWORK_LIMITS.neurons.max);
      if (n === rec.hidden[layer]) return false;
      rec.hidden = rec.hidden.map((v, i) => (i === layer ? n : v));
      makeRun();
      return true;
    },
    setActivation(a) {
      if (!LAB_ACTIVATIONS.includes(a) || a === rec.activation) return false;
      rec.activation = a;
      makeRun();
      return true;
    },
    /** La tasa se aplica en marcha, desde el ejemplo siguiente. */
    setRate(v) {
      const r = rateOf(v);
      if (r === rec.rate) return false;
      rec.rate = r;
      rec.run.rate = r;
      return true;
    },
    /** Reiniciar pesos: la semilla siguiente, con los mismos datos y la misma forma (en cero, sin capas, con compuertas). */
    resetWeights() { rec.weightSeed += 1; makeRun(); handBack(); },
    /** Red de siempre: la forma, la activación y la tasa por defecto de la clase, con la primera semilla. */
    resetNetwork() {
      const d = defaultsOf(s.kind);
      rec.hidden = [...d.hidden];
      rec.activation = d.activation;
      rec.rate = d.rate;
      makeRun();
      handBack();
    },

    // --- Pasos del aprendizaje y cambios a mano, con lo que cuentan (D8 y D10) ------------------------
    /** Un paso del aprendizaje (lo mismo que run.advance): con compuertas, la compuerta deja de estar "a mano". */
    advance(size) {
      const r = rec.run.advance(size);
      if (s.kind === 'gates' && (r.units.length > 0 || r.epochDone)) rec.hand[s.gates.gate] = false;
      return r;
    },
    /** Un cambio a mano (manual-changes.record), que cuenta para XOR. Devuelve si es un cambio nuevo. */
    recordManual(snap, opts) {
      const fresh = rec.manual.record(snap, opts);
      if (fresh && s.kind === 'gates') rec.xor.changes += 1;
      return fresh;
    },
    /** ¿La compuerta elegida sigue resuelta solo a mano? (nada aprendió desde que se eligió o se reinició). */
    get handOnly() { return s.kind === 'gates' && rec.hand[s.gates.gate]; },
    /** Aciertos de la red de ahora sobre los ejemplos de práctica. */
    get score() { return evaluate(rec.run.network, rec.split.practice, rec.run.off); },
    /**
     * XOR sin capas ocultas (D8): { changes, epochs, explain }. `explain` se enciende con 5 cambios a mano
     * o 50 épocas sin 4 de 4. Con otra compuerta o con capas ocultas, null.
     */
    get xor() {
      if (s.kind !== 'gates' || s.gates.gate !== 'xor' || rec.hidden.length > 0) return null;
      const epochs = rec.run.epoch - rec.xor.epochBase;
      const solved = session.score.correct === rec.split.practice.length;
      return { changes: rec.xor.changes, epochs, explain: !solved && (rec.xor.changes >= XOR_EXPLAIN.changes || epochs >= XOR_EXPLAIN.epochs) };
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

  /** Reiniciar pesos o "Red de siempre": las compuertas vuelven a estar "a mano" (D10). */
  function handBack() { if (s.kind === 'gates') rec.hand = Object.fromEntries(GATES.map((g) => [g, true])); }
  return session;
}

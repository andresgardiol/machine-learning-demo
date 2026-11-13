// Ajustes de la pestaña 3, sin DOM: valores por defecto, rangos y a qué grupo pertenece cada uno
// (design.md D6):
//
//   instant         se aplican al instante (velocidad de la simulación, sensores visibles, secciones)
//   nextGeneration  quedan pendientes hasta la próxima generación (evolución y escenario)
//   newTraining     piden un entrenamiento nuevo (forma de la red, activación y sensores)
//
// Los de escenario (pista, carriles, densidad, irregularidad y velocidad) están en la barra de
// escenario y la pestaña no los deja esperando: el núcleo los aplica al volver a empezar la
// generación en curso (panel-de-entrenar-por-vistas D12, RESTART_GENERATION_KEYS).
import { DEFAULT_TRAINING_CONFIG, normalizeTrainingConfig, normalizeTracks, SELECTION_MODES } from '../../core/training.js';
import { TRACK_IDS } from '../../core/circuits.js';
import { EVOLUTION_LIMITS, FITNESS_KINDS } from '../../core/evolution.js';
import { ACTIVATIONS, NETWORK_LIMITS } from '../../core/network.js';
import { SENSOR_LIMITS } from '../../core/sensors.js';
import { TRAFFIC_MODES } from '../../core/brain.js';
import { ALLOWED_LANES, SPEED_LIMITS } from '../../core/constants.js';
import { SPEEDS } from '../../ui/loop.js';

export const GROUPS = Object.freeze(['instant', 'nextGeneration', 'newTraining']);

/** Neuronas por defecto de cada capa oculta posible (hasta 3); se usan las primeras `hiddenLayers`. */
const DEFAULT_NEURONS = 6;

/**
 * Ajustes con su grupo y su rango. `kind`: range (con min, max y step), choice (con options),
 * toggle o set (varias opciones marcadas a la vez, al menos una: las pistas del entrenamiento). Las neuronas se configuran por capa: neurons1, neurons2 y neurons3.
 */
export const SETTINGS = Object.freeze([
  // Al instante
  { key: 'speed', group: 'instant', kind: 'choice', options: SPEEDS, default: 1 },
  { key: 'showSensors', group: 'instant', kind: 'toggle', default: true },
  { key: 'showNetwork', group: 'instant', kind: 'toggle', default: true },
  { key: 'showChart', group: 'instant', kind: 'toggle', default: true },
  // Próxima generación: evolución
  { key: 'population', group: 'nextGeneration', kind: 'range', ...rangeOf(EVOLUTION_LIMITS.population), step: 1 },
  { key: 'mutationStrength', group: 'nextGeneration', kind: 'range', ...rangeOf(EVOLUTION_LIMITS.mutationStrength), step: 1 },
  { key: 'mutationCooling', group: 'nextGeneration', kind: 'toggle', default: DEFAULT_TRAINING_CONFIG.mutationCooling },
  { key: 'selectionMode', group: 'nextGeneration', kind: 'choice', options: SELECTION_MODES, default: DEFAULT_TRAINING_CONFIG.selectionMode },
  { key: 'elite', group: 'nextGeneration', kind: 'range', ...rangeOf(EVOLUTION_LIMITS.elite), step: 1 },
  { key: 'selection', group: 'nextGeneration', kind: 'range', ...rangeOf(EVOLUTION_LIMITS.selection), step: 1 },
  { key: 'mutationRate', group: 'nextGeneration', kind: 'range', ...rangeOf(EVOLUTION_LIMITS.mutationRate), step: 1 },
  { key: 'crossover', group: 'nextGeneration', kind: 'toggle', default: DEFAULT_TRAINING_CONFIG.crossover },
  { key: 'fitness', group: 'nextGeneration', kind: 'choice', options: FITNESS_KINDS, default: DEFAULT_TRAINING_CONFIG.fitness },
  { key: 'maxDuration', group: 'nextGeneration', kind: 'range', ...rangeOf(EVOLUTION_LIMITS.maxDuration), step: 10 },
  { key: 'slowRule', group: 'nextGeneration', kind: 'toggle', default: DEFAULT_TRAINING_CONFIG.slowRule },
  { key: 'trafficMode', group: 'nextGeneration', kind: 'choice', options: TRAFFIC_MODES, default: DEFAULT_TRAINING_CONFIG.trafficMode },
  // Próxima generación: escenario
  { key: 'tracks', group: 'nextGeneration', kind: 'set', options: TRACK_IDS, default: DEFAULT_TRAINING_CONFIG.tracks },
  { key: 'lanes', group: 'nextGeneration', kind: 'choice', options: ALLOWED_LANES, default: DEFAULT_TRAINING_CONFIG.lanes },
  { key: 'density', group: 'nextGeneration', kind: 'range', min: 0, max: 100, step: 5, default: DEFAULT_TRAINING_CONFIG.density },
  { key: 'irregularity', group: 'nextGeneration', kind: 'range', min: 0, max: 100, step: 5, default: DEFAULT_TRAINING_CONFIG.irregularity },
  { key: 'maxSpeed', group: 'nextGeneration', kind: 'range', min: SPEED_LIMITS.min, max: SPEED_LIMITS.max, step: 1, default: DEFAULT_TRAINING_CONFIG.maxSpeed },
  // Entrenamiento nuevo: red y sensores
  { key: 'hiddenLayers', group: 'newTraining', kind: 'range', min: NETWORK_LIMITS.hiddenLayers.min, max: NETWORK_LIMITS.hiddenLayers.max, step: 1, default: DEFAULT_TRAINING_CONFIG.hidden.length },
  ...[1, 2, 3].map((n) => ({ key: `neurons${n}`, group: 'newTraining', kind: 'range', min: NETWORK_LIMITS.neurons.min, max: NETWORK_LIMITS.neurons.max, step: 1, default: DEFAULT_TRAINING_CONFIG.hidden[n - 1] ?? DEFAULT_NEURONS })),
  { key: 'activation', group: 'newTraining', kind: 'choice', options: ACTIVATIONS, default: DEFAULT_TRAINING_CONFIG.activation },
  { key: 'sensorCount', group: 'newTraining', kind: 'range', min: SENSOR_LIMITS.count.min, max: SENSOR_LIMITS.count.max, step: 1, default: DEFAULT_TRAINING_CONFIG.sensors.count },
  { key: 'sensorRange', group: 'newTraining', kind: 'range', min: SENSOR_LIMITS.range.min, max: SENSOR_LIMITS.range.max, step: 0.5, default: DEFAULT_TRAINING_CONFIG.sensors.range },
  { key: 'sensorSpread', group: 'newTraining', kind: 'range', min: SENSOR_LIMITS.spread.min, max: SENSOR_LIMITS.spread.max, step: 5, default: DEFAULT_TRAINING_CONFIG.sensors.spread },
].map(Object.freeze));

function rangeOf({ min, max, default: value }) {
  return { min, max, default: value };
}

const BY_KEY = new Map(SETTINGS.map((s) => [s.key, s]));

export const DEFAULT_SETTINGS = Object.freeze(Object.fromEntries(SETTINGS.map((s) => [s.key, s.default])));

/** Grupo de un ajuste: 'instant', 'nextGeneration' o 'newTraining' (null si no existe). */
export const groupOf = (key) => BY_KEY.get(key)?.group ?? null;

/** Valor válido de un ajuste: fuera de rango se ajusta al límite más cercano; lo inválido usa el valor por defecto. */
function normalizeValue(spec, value) {
  if (value === undefined) return spec.default;
  switch (spec.kind) {
    case 'toggle': return Boolean(value);
    case 'choice': return spec.options.includes(value) ? value : spec.default;
    case 'set': return Object.freeze(normalizeTracks(value));
    default: {
      const n = Number(value);
      if (!Number.isFinite(n)) return spec.default;
      const stepped = Number.isInteger(spec.step) ? Math.round(n) : n;
      return Math.min(Math.max(stepped, spec.min), spec.max);
    }
  }
}

/** Ajustes válidos a partir de valores parciales. */
export function normalizeSettings(partial = {}) {
  const p = partial ?? {};
  return Object.fromEntries(SETTINGS.map((s) => [s.key, normalizeValue(s, p[s.key])]));
}

/** Claves cuyo valor difiere entre dos ajustes, agrupadas por grupo. */
export function classifyChanges(before, after) {
  const a = normalizeSettings(before);
  const b = normalizeSettings(after);
  const out = { instant: [], nextGeneration: [], newTraining: [] };
  for (const s of SETTINGS) {
    if (a[s.key] === b[s.key] || (s.kind === 'set' && a[s.key].join() === b[s.key].join())) continue;
    // Las neuronas de una capa que no se usa no cambian la red.
    const layer = /^neurons(\d)$/.exec(s.key);
    if (layer && Number(layer[1]) > Math.max(a.hiddenLayers, b.hiddenLayers)) continue;
    out[s.group].push(s.key);
  }
  return out;
}

/** ¿Pasar de `before` a `after` pide un entrenamiento nuevo? */
export const needsNewTraining = (before, after) => classifyChanges(before, after).newTraining.length > 0;

/** Capas ocultas que describen los ajustes. */
export const hiddenOf = (settings) => [settings.neurons1, settings.neurons2, settings.neurons3].slice(0, settings.hiddenLayers);

/** Configuración del entrenamiento (core/training.js) a partir de los ajustes. */
export function trainingConfig(settings) {
  const s = normalizeSettings(settings);
  return normalizeTrainingConfig({
    population: s.population, elite: s.elite, selection: s.selection,
    mutationStrength: s.mutationStrength, mutationCooling: s.mutationCooling, mutationRate: s.mutationRate, crossover: s.crossover,
    fitness: s.fitness, maxDuration: s.maxDuration, selectionMode: s.selectionMode, slowRule: s.slowRule, trafficMode: s.trafficMode,
    lanes: s.lanes, density: s.density, irregularity: s.irregularity, maxSpeed: s.maxSpeed, tracks: s.tracks,
    hidden: hiddenOf(s), activation: s.activation,
    sensors: { count: s.sensorCount, range: s.sensorRange, spread: s.sensorSpread },
  });
}

/**
 * Ajustes que adoptan la red y los sensores de un cerebro (al seguir entrenándolo); el resto queda igual.
 * Las capas que el cerebro no usa conservan sus neuronas.
 */
export function adoptBrain(settings, brain) {
  const hidden = brain.network.sizes.slice(1, -1);
  const next = { ...normalizeSettings(settings), hiddenLayers: hidden.length, activation: brain.network.activation };
  hidden.forEach((n, i) => { next[`neurons${i + 1}`] = n; });
  next.sensorCount = brain.sensors.count;
  next.sensorRange = brain.sensors.range;
  next.sensorSpread = brain.sensors.spread;
  return normalizeSettings(next);
}

/**
 * Marca o desmarca una pista del entrenamiento (circuitos-y-paisaje D10). La última marcada no se
 * puede desmarcar: hace falta al menos una. Devuelve la lista nueva, en el orden del catálogo.
 */
export function toggleTrack(tracks, id) {
  const current = normalizeTracks(tracks);
  if (!TRACK_IDS.includes(id)) return current;
  if (current.includes(id)) return current.length === 1 ? current : current.filter((t) => t !== id);
  return normalizeTracks([...current, id]);
}

/** ¿Ninguna pista marcada es la calle recta? Entonces los ajustes de tráfico no aplican. */
export const onlyCircuits = (tracks) => !normalizeTracks(tracks).includes('straight');

/** Ajustes del tráfico, deshabilitados cuando solo hay circuitos marcados. */
export const TRAFFIC_SETTINGS = Object.freeze(['lanes', 'density', 'irregularity', 'trafficMode']);

/**
 * Ajustes que esperan a la próxima generación y encienden la marca de la pestaña de ajustes
 * (panel-de-entrenar-por-vistas D3 y D12): población, mutación, enfriamiento y evolución. El modo de
 * selección tiene su propio aviso en la vista de entrenamiento, y lo de la barra de escenario rige en
 * el momento.
 */
export const WAITING_KEYS = Object.freeze(['population', 'mutationStrength', 'mutationCooling', 'elite', 'selection', 'mutationRate',
  'crossover', 'fitness', 'maxDuration', 'slowRule', 'trafficMode']);

/**
 * ¿Hay ajustes esperando a la próxima generación que marcar en la pestaña de ajustes?
 * @param {object|null} pending cambios pendientes del entrenamiento (`training.pending`)
 */
export const settingsWaiting = (pending) => Object.keys(pending ?? {}).some((k) => WAITING_KEYS.includes(k));

/**
 * Ajustes que vuelve a sus valores por defecto "Restablecer ajustes": los del panel (población,
 * mutación, enfriamiento, red y evolución). Lo de la barra de escenario tiene su propio botón, y los
 * de la vista (velocidad, interruptores) no cambian.
 */
export const PANEL_RESET_KEYS = Object.freeze([...WAITING_KEYS, 'hiddenLayers', 'neurons1', 'neurons2', 'neurons3', 'activation']);

/** Ajustes después de "Restablecer ajustes": los del panel por defecto y el resto como estaban. */
export function resetPanelSettings(settings) {
  const s = normalizeSettings(settings);
  return normalizeSettings({ ...s, ...Object.fromEntries(PANEL_RESET_KEYS.map((k) => [k, DEFAULT_SETTINGS[k]])) });
}

/**
 * Ajustes de escenario que, en esta pestaña, vuelven a empezar la generación en curso en lugar de
 * esperar a la siguiente (panel-de-entrenar-por-vistas D12). Son los de la barra de escenario menos
 * los sensores, que piden un entrenamiento nuevo.
 */
export const RESTART_GENERATION_KEYS = Object.freeze(['tracks', 'lanes', 'density', 'irregularity', 'maxSpeed']);

/** Ajustes de la barra de escenario (con las claves de street-settings.js) a partir de los de la pestaña. */
export function barSettings(settings) {
  const s = normalizeSettings(settings);
  return {
    track: s.tracks[0], lanes: s.lanes, density: s.density, irregularity: s.irregularity, maxSpeed: s.maxSpeed,
    sensorCount: s.sensorCount, sensorRange: s.sensorRange, sensorSpread: s.sensorSpread,
  };
}

/** Cambio de la pestaña que corresponde a un cambio de la barra: la pista elegida es la única. */
export const barPatch = (key, value) => (key === 'track' ? { tracks: [value] } : { [key]: value });

/** Valores por defecto de lo que muestra la barra de escenario en esta pestaña. */
export const BAR_DEFAULTS = Object.freeze({
  tracks: DEFAULT_SETTINGS.tracks, lanes: DEFAULT_SETTINGS.lanes, density: DEFAULT_SETTINGS.density,
  irregularity: DEFAULT_SETTINGS.irregularity, maxSpeed: DEFAULT_SETTINGS.maxSpeed,
  sensorCount: DEFAULT_SETTINGS.sensorCount, sensorRange: DEFAULT_SETTINGS.sensorRange, sensorSpread: DEFAULT_SETTINGS.sensorSpread,
});

/**
 * Cerebro que sigue el entrenamiento después de un cambio (panel-de-entrenar-por-vistas D16): un
 * cambio de red o de sensores empieza un entrenamiento nuevo con una población al azar, así que se
 * deja de seguir al cerebro (y de ofrecer actualizarlo). Cualquier otro cambio lo conserva.
 * @param {{brain:object|null, brainSource:string|null}} following
 * @param {{newTraining:string[]}} changes resultado de classifyChanges
 */
export function followingAfter(following, changes) {
  return changes.newTraining.length > 0 ? { brain: null, brainSource: null } : { brain: following.brain, brainSource: following.brainSource };
}

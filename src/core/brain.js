// Cerebros (design.md D7): una red junto con los sensores para los que fue entrenada y los datos de
// su entrenamiento. Formato versión 1:
//
//   { format: 'ml-lab-brain', version: 1, id, name, createdAt, updatedAt,
//     network: { sizes, activation, layers },          // ver network.js
//     sensors: { count, range, spread },
//     inputs: ['sensors', 'speed'],                    // una entrada por sensor y la velocidad, al final
//     outputs: ['forward', 'left', 'right', 'reverse'],
//     training: { generations, seed, maxSpeed,
//                 fitness: { kind, best },
//                 evolution: { population, elite, selection, mutationStrength, mutationRate, crossover, maxDuration,
//                              selectionMode?, mutationCooling? },   // opcionales; sin el dato, selección automática y sin enfriamiento
//                 scenarios: [{ track, lanes, density, irregularity, trafficMode, generations }] } }
//
// `track` es un id del catálogo de pistas (circuits.js) o varios unidos con '+' cuando las
// generaciones alternaron pistas (circuitos-y-paisaje D5). Los cerebros de antes dicen 'straight'.
//
// El núcleo no usa reloj ni identificadores al azar: `id` y las fechas llegan como parámetros.
// La validación devuelve códigos (notABrain, unsupportedVersion, shapeMismatch, notFinite,
// sensorMismatch) que la interfaz traduce.
import { computeNetwork, copyNetwork, validateNetwork, shapeOf } from './network.js';
import { sensorConfig, SENSOR_LIMITS } from './sensors.js';
import { isTrackId } from './circuits.js';

export const BRAIN_FORMAT = 'ml-lab-brain';
export const BRAIN_VERSION = 1;
export const BRAIN_INPUTS = Object.freeze(['sensors', 'speed']);
export const BRAIN_OUTPUTS = Object.freeze(['forward', 'left', 'right', 'reverse']);
export const TRAFFIC_MODES = Object.freeze(['same', 'new']);

/** Error de un cerebro con un código y datos para que la interfaz lo explique en su idioma. */
export class BrainError extends Error {
  constructor(code, details = {}) {
    super(`${code}: ${JSON.stringify(details)}`);
    this.name = 'BrainError';
    this.code = code;
    this.details = details;
  }
}

const isObject = (v) => v !== null && typeof v === 'object' && !Array.isArray(v);
const isFiniteNumber = (v) => typeof v === 'number' && Number.isFinite(v);
const copyScenario = (s) => ({
  track: s.track, lanes: s.lanes, density: s.density, irregularity: s.irregularity,
  trafficMode: s.trafficMode, generations: s.generations,
});

/** Copia independiente de los datos de entrenamiento. */
export function copyTraining(t) {
  return {
    generations: t.generations,
    seed: t.seed,
    maxSpeed: t.maxSpeed,
    fitness: { kind: t.fitness.kind, best: t.fitness.best },
    evolution: { ...t.evolution },
    scenarios: t.scenarios.map(copyScenario),
  };
}

/**
 * Crea un cerebro. La red se copia: cambiar después la original no cambia el cerebro.
 * @param {{id:string, name:string, now:string, network:object, sensors:object, training:object, createdAt?:string}} spec
 *   now: fecha en ISO 8601 (la pone la interfaz); createdAt, si se conserva la de un cerebro anterior.
 */
export function createBrain({ id, name, now, createdAt = now, network, sensors, training }) {
  return {
    format: BRAIN_FORMAT,
    version: BRAIN_VERSION,
    id,
    name,
    createdAt,
    updatedAt: now,
    network: copyNetwork(network),
    sensors: sensorConfig(sensors),
    inputs: [...BRAIN_INPUTS],
    outputs: [...BRAIN_OUTPUTS],
    training: copyTraining(training),
  };
}

/** Copia independiente de un cerebro. */
export function copyBrain(brain) {
  return { ...brain, network: copyNetwork(brain.network), sensors: { ...brain.sensors }, inputs: [...brain.inputs], outputs: [...brain.outputs], training: copyTraining(brain.training) };
}

function validSensors(s) {
  if (!isObject(s)) return false;
  const inRange = (v, { min, max }) => isFiniteNumber(v) && v >= min && v <= max;
  return Number.isInteger(s.count) && inRange(s.count, SENSOR_LIMITS.count)
    && inRange(s.range, SENSOR_LIMITS.range) && inRange(s.spread, SENSOR_LIMITS.spread);
}

/** Pistas de un escenario: un id del catálogo o varios, distintos, unidos con '+'. */
export function scenarioTracks(track) {
  return typeof track === 'string' ? track.split('+') : [];
}

function validScenarioTrack(track) {
  const ids = scenarioTracks(track);
  return ids.length > 0 && ids.every(isTrackId) && new Set(ids).size === ids.length;
}

function validTraining(t) {
  if (!isObject(t) || !Number.isInteger(t.generations) || t.generations < 0) return false;
  if (!isFiniteNumber(t.seed) || !isFiniteNumber(t.maxSpeed)) return false;
  if (!isObject(t.fitness) || typeof t.fitness.kind !== 'string' || !(t.fitness.best === null || isFiniteNumber(t.fitness.best))) return false;
  if (!isObject(t.evolution) || !Array.isArray(t.scenarios)) return false;
  return t.scenarios.every((s) => isObject(s) && validScenarioTrack(s.track) && Number.isInteger(s.generations) && Number.isInteger(s.lanes)
    && isFiniteNumber(s.density) && isFiniteNumber(s.irregularity) && TRAFFIC_MODES.includes(s.trafficMode));
}

/**
 * Valida un cerebro recibido como dato. No lanza: devuelve null si es válido o { code, details }:
 *   notABrain           no es un objeto con el formato del laboratorio
 *   unsupportedVersion  su versión de formato no es la admitida (details.newer si es más nueva)
 *   shapeMismatch       le faltan partes o la cantidad de pesos o sesgos no corresponde a su forma
 *   notFinite           tiene valores que no son números finitos
 *   sensorMismatch      sus entradas no son sus sensores más uno, o sus salidas no son cuatro
 */
export function validateBrain(data) {
  if (!isObject(data) || data.format !== BRAIN_FORMAT) return { code: 'notABrain', details: {} };
  if (data.version !== BRAIN_VERSION) {
    return { code: 'unsupportedVersion', details: { version: data.version, supported: BRAIN_VERSION, newer: isFiniteNumber(data.version) && data.version > BRAIN_VERSION } };
  }
  for (const key of ['id', 'name', 'createdAt', 'updatedAt']) {
    if (typeof data[key] !== 'string' || data[key] === '') return { code: 'shapeMismatch', details: { missing: key } };
  }
  const netProblem = validateNetwork(data.network);
  if (netProblem) {
    const code = netProblem.code === 'notFinite' ? 'notFinite' : 'shapeMismatch';
    return { code, details: netProblem.details };
  }
  if (!validSensors(data.sensors)) return { code: 'shapeMismatch', details: { missing: 'sensors' } };
  if (!Array.isArray(data.inputs) || data.inputs.join() !== BRAIN_INPUTS.join()) return { code: 'shapeMismatch', details: { missing: 'inputs' } };
  if (!Array.isArray(data.outputs) || data.outputs.join() !== BRAIN_OUTPUTS.join()) return { code: 'shapeMismatch', details: { missing: 'outputs' } };
  if (!validTraining(data.training)) return { code: 'shapeMismatch', details: { missing: 'training' } };
  const { inputs, outputs } = shapeOf(data.network);
  if (inputs !== data.sensors.count + 1 || outputs !== BRAIN_OUTPUTS.length) {
    return { code: 'sensorMismatch', details: { inputs, outputs, sensors: data.sensors.count } };
  }
  return null;
}

/** Valida y lanza BrainError si el cerebro no es válido. */
export function assertBrain(data) {
  const problem = validateBrain(data);
  if (problem) throw new BrainError(problem.code, problem.details);
  return data;
}

// --- Controlador de red neuronal ---------------------------------------------------------------

/**
 * Controlador que maneja con una red (cumple el contrato de controller.js): entrega a la red las
 * lecturas de los sensores en su orden y la velocidad como última entrada, y convierte las cuatro
 * salidas en avanzar, izquierda, derecha y retroceder. Se verifica al crearse, nunca a mitad de
 * una simulación: la red debe tener una entrada por sensor más una y cuatro salidas.
 * @param {object} network red (ver network.js); no se copia ni se modifica
 * @param {number} sensorCount cantidad de sensores del auto que va a manejar
 */
export function createNetworkController(network, sensorCount) {
  const problem = validateNetwork(network);
  if (problem) throw new BrainError(problem.code === 'notFinite' ? 'notFinite' : 'shapeMismatch', problem.details);
  const { inputs, outputs } = shapeOf(network);
  if (inputs !== sensorCount + 1 || outputs !== BRAIN_OUTPUTS.length) {
    throw new BrainError('sensorMismatch', { expected: inputs - 1, actual: sensorCount, inputs, outputs });
  }
  const input = new Array(inputs);
  return {
    network,
    control(perception) {
      const { sensors, speed } = perception;
      for (let i = 0; i < sensorCount; i++) input[i] = sensors[i];
      input[sensorCount] = speed;
      const [forward, left, right, reverse] = computeNetwork(network, input);
      return { forward: forward === 1, left: left === 1, right: right === 1, reverse: reverse === 1 };
    },
  };
}

/**
 * Auto manejado por un cerebro, listo para createWorld({ cars: [...] }): el cerebro maneja siempre
 * con su propia configuración de sensores. Lanza BrainError si el cerebro no es válido.
 */
export function carForBrain(brain, { maxSpeed } = {}) {
  assertBrain(brain);
  return {
    controller: createNetworkController(brain.network, brain.sensors.count),
    sensors: { ...brain.sensors },
    maxSpeed: maxSpeed ?? brain.training.maxSpeed,
  };
}

// --- Datos de entrenamiento --------------------------------------------------------------------

/** ¿Son el mismo escenario (pista, carriles, densidad, irregularidad y modo de tráfico)? */
export const sameScenario = (a, b) => Boolean(a) && Boolean(b) && a.track === b.track && a.lanes === b.lanes
  && a.density === b.density && a.irregularity === b.irregularity && a.trafficMode === b.trafficMode;

/**
 * Suma `count` generaciones entrenadas en `scenario` a una lista de escenarios: si el último es el
 * mismo, se acumulan en él; si no, se agrega uno nuevo. Devuelve una lista nueva.
 */
export function addScenarioGenerations(scenarios, scenario, count = 1) {
  const out = scenarios.map(copyScenario);
  const last = out[out.length - 1];
  if (sameScenario(last, scenario)) last.generations += count;
  else out.push({ ...copyScenario({ ...scenario, generations: 0 }), generations: count });
  return out;
}

/** Total de generaciones de una lista de escenarios. */
export const totalGenerations = (scenarios) => scenarios.reduce((n, s) => n + s.generations, 0);

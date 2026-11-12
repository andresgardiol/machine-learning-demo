import test from 'node:test';
import assert from 'node:assert/strict';
import {
  DEFAULT_SETTINGS, SETTINGS, groupOf, normalizeSettings, classifyChanges, needsNewTraining, trainingConfig, adoptBrain, hiddenOf,
} from '../src/tabs/train/settings.js';
import { DEFAULT_TRAINING_CONFIG } from '../src/core/training.js';
import { createBrain } from '../src/core/brain.js';
import { createNetwork } from '../src/core/network.js';
import { createRandom } from '../src/core/random.js';

test('valores por defecto: 100 autos, mutación 10 %, red 6-6-4 con escalón, 5 sensores, velocidad normal', () => {
  assert.deepEqual(DEFAULT_SETTINGS, {
    speed: 1, showSensors: true, showNetwork: true, showChart: true,
    population: 100, mutationStrength: 10, mutationCooling: true, selectionMode: 'auto', elite: 10, selection: 10, mutationRate: 100, crossover: false,
    fitness: 'lead', maxDuration: 60, slowRule: true, trafficMode: 'new',
    lanes: 3, density: 50, irregularity: 0, maxSpeed: 20,
    hiddenLayers: 1, neurons1: 6, neurons2: 6, neurons3: 6, activation: 'step',
    sensorCount: 5, sensorRange: 3, sensorSpread: 90,
  });
  assert.deepEqual(trainingConfig(DEFAULT_SETTINGS), defaultConfig());
});

function defaultConfig() { return { ...DEFAULT_TRAINING_CONFIG, hidden: [...DEFAULT_TRAINING_CONFIG.hidden], sensors: { ...DEFAULT_TRAINING_CONFIG.sensors } }; }

test('normalización: los valores fuera de rango se ajustan al límite más cercano', () => {
  const s = normalizeSettings({
    population: 1, mutationStrength: 150, elite: 25, selection: 0, mutationRate: 0, maxDuration: 1000,
    density: -5, irregularity: 120, maxSpeed: 99, hiddenLayers: 7, neurons1: 0, neurons2: 40,
    sensorCount: 150, sensorRange: 0, sensorSpread: 500,
  });
  assert.deepEqual(
    [s.population, s.mutationStrength, s.elite, s.selection, s.mutationRate, s.maxDuration, s.density, s.irregularity, s.maxSpeed,
      s.hiddenLayers, s.neurons1, s.neurons2, s.sensorCount, s.sensorRange, s.sensorSpread],
    [2, 100, 20, 1, 1, 300, 0, 100, 40, 3, 1, 16, 100, 1, 360],
  );
});

test('normalización: opciones inválidas vuelven al valor por defecto y los enteros se redondean', () => {
  const s = normalizeSettings({ speed: 3, fitness: 'overtakes', trafficMode: 'x', lanes: 5, activation: 'softmax', population: 150.6, crossover: 1, density: 'mucho' });
  assert.equal(s.speed, 1);
  assert.equal(s.fitness, 'lead');
  assert.equal(s.trafficMode, 'new');
  assert.equal(s.lanes, 3);
  assert.equal(s.activation, 'step');
  assert.equal(s.population, 151);
  assert.equal(s.crossover, true);
  assert.equal(s.density, 50);
  assert.equal(normalizeSettings({ speed: 'max' }).speed, 'max');
  assert.equal(normalizeSettings({ sensorRange: 2.5 }).sensorRange, 2.5);
});

test('clasificación: cada ajuste pertenece a su grupo', () => {
  const expected = {
    instant: ['speed', 'showSensors', 'showNetwork', 'showChart'],
    nextGeneration: ['population', 'mutationStrength', 'mutationCooling', 'selectionMode', 'elite', 'selection', 'mutationRate', 'crossover', 'fitness', 'maxDuration',
      'slowRule', 'trafficMode', 'lanes', 'density', 'irregularity', 'maxSpeed'],
    newTraining: ['hiddenLayers', 'neurons1', 'neurons2', 'neurons3', 'activation', 'sensorCount', 'sensorRange', 'sensorSpread'],
  };
  for (const [group, keys] of Object.entries(expected)) for (const k of keys) assert.equal(groupOf(k), group, k);
  assert.equal(SETTINGS.length, Object.values(expected).flat().length);
  assert.equal(groupOf('nada'), null);
});

test('clasificación de un cambio: al instante, próxima generación o entrenamiento nuevo', () => {
  const base = DEFAULT_SETTINGS;
  assert.deepEqual(classifyChanges(base, { ...base, speed: 8, showSensors: false }), { instant: ['speed', 'showSensors'], nextGeneration: [], newTraining: [] });
  assert.deepEqual(classifyChanges(base, { ...base, population: 200, fitness: 'survival', lanes: 4 }), { instant: [], nextGeneration: ['population', 'fitness', 'lanes'], newTraining: [] });
  assert.deepEqual(classifyChanges(base, { ...base, hiddenLayers: 2, sensorCount: 9 }).newTraining, ['hiddenLayers', 'sensorCount']);
  assert.equal(needsNewTraining(base, { ...base, mutationStrength: 50 }), false);
  assert.equal(needsNewTraining(base, { ...base, activation: 'relu' }), true);
  // Cambiar las neuronas de una capa que no se usa no pide un entrenamiento nuevo.
  assert.equal(needsNewTraining(base, { ...base, neurons3: 12 }), false);
  assert.equal(needsNewTraining({ ...base, hiddenLayers: 3 }, { ...base, hiddenLayers: 3, neurons3: 12 }), true);
  assert.equal(needsNewTraining(base, { ...base }), false);
});

test('configuración del entrenamiento: capas por las neuronas de cada capa usada', () => {
  const s = normalizeSettings({ hiddenLayers: 2, neurons1: 8, neurons2: 4, neurons3: 16, sensorCount: 9, maxSpeed: 25, slowRule: false });
  assert.deepEqual(hiddenOf(s), [8, 4]);
  const c = trainingConfig(s);
  assert.deepEqual(c.hidden, [8, 4]);
  assert.deepEqual(c.sensors, { count: 9, range: 3, spread: 90 });
  assert.equal(c.maxSpeed, 25);
  assert.equal(c.slowRule, false);
  assert.deepEqual(trainingConfig({ ...s, hiddenLayers: 0 }).hidden, []);
});

test('adoptar un cerebro: toma su red y sus sensores y conserva el resto', () => {
  const brain = createBrain({
    id: 'b', name: 'B', now: '2026-11-12T10:00:00.000Z',
    network: createNetwork({ inputs: 10, hidden: [12, 5], outputs: 4, activation: 'tanh', random: createRandom(1) }),
    sensors: { count: 9, range: 4, spread: 150 },
    training: { generations: 3, seed: 1, maxSpeed: 20, fitness: { kind: 'distance', best: 1 }, evolution: {}, scenarios: [] },
  });
  const s = adoptBrain({ ...DEFAULT_SETTINGS, population: 50 }, brain);
  assert.deepEqual([s.hiddenLayers, s.neurons1, s.neurons2, s.neurons3, s.activation], [2, 12, 5, 6, 'tanh']);
  assert.deepEqual([s.sensorCount, s.sensorRange, s.sensorSpread], [9, 4, 150]);
  assert.equal(s.population, 50);
  assert.deepEqual(trainingConfig(s).hidden, [12, 5]);
});

test('quién elige al padre: por defecto la fitness, lo inválido vuelve a ella y cambiarlo rige desde la próxima generación', () => {
  assert.equal(DEFAULT_SETTINGS.selectionMode, 'auto');
  assert.equal(groupOf('selectionMode'), 'nextGeneration');
  assert.deepEqual(SETTINGS.find((x) => x.key === 'selectionMode').options, ['auto', 'manual']);
  assert.equal(normalizeSettings({ selectionMode: 'persona' }).selectionMode, 'auto');
  assert.equal(normalizeSettings({ selectionMode: 'manual' }).selectionMode, 'manual');
  assert.deepEqual(classifyChanges(DEFAULT_SETTINGS, { ...DEFAULT_SETTINGS, selectionMode: 'manual' }), { instant: [], nextGeneration: ['selectionMode'], newTraining: [] });
  assert.equal(needsNewTraining(DEFAULT_SETTINGS, { ...DEFAULT_SETTINGS, selectionMode: 'manual' }), false);
  assert.equal(trainingConfig({ ...DEFAULT_SETTINGS, selectionMode: 'manual' }).selectionMode, 'manual');
  assert.equal(trainingConfig({ ...DEFAULT_SETTINGS, selectionMode: 'x' }).selectionMode, 'auto');
  assert.equal(trainingConfig(DEFAULT_SETTINGS).selectionMode, 'auto');
});

test('enfriar la mutación: encendido por defecto, rige desde la próxima generación y restablecer lo enciende', () => {
  assert.equal(DEFAULT_SETTINGS.mutationCooling, true);
  assert.equal(groupOf('mutationCooling'), 'nextGeneration');
  assert.equal(SETTINGS.find((x) => x.key === 'mutationCooling').kind, 'toggle');
  assert.equal(trainingConfig(DEFAULT_SETTINGS).mutationCooling, true);
  const off = normalizeSettings({ ...DEFAULT_SETTINGS, mutationCooling: false });
  assert.equal(trainingConfig(off).mutationCooling, false);
  assert.deepEqual(classifyChanges(DEFAULT_SETTINGS, off), { instant: [], nextGeneration: ['mutationCooling'], newTraining: [] });
  // Restablecer: los valores por defecto vuelven a encenderlo.
  assert.equal(normalizeSettings({ ...off, ...DEFAULT_SETTINGS }).mutationCooling, true);
  assert.equal(normalizeSettings({}).mutationCooling, true);
});

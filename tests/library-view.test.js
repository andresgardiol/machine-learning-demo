import test from 'node:test';
import assert from 'node:assert/strict';
import { brainSummary, brainDetail } from '../src/ui/library-view.js';
import { createBrain } from '../src/core/brain.js';
import { createNetwork } from '../src/core/network.js';
import { createRandom } from '../src/core/random.js';
import { createI18n } from '../src/ui/i18n.js';
import es from '../src/i18n/es.js';
import en from '../src/i18n/en.js';

function brain({ generations = 40, kind = 'distance', best = 412.87, scenarios } = {}) {
  return createBrain({
    id: 'b1', name: 'Prudente', now: '2026-11-12T10:00:00.000Z',
    network: createNetwork({ inputs: 6, hidden: [6], outputs: 4, random: createRandom(1) }),
    sensors: { count: 5, range: 3, spread: 90 },
    training: {
      generations, seed: 1, maxSpeed: 20, fitness: { kind, best },
      evolution: { population: 100, elite: 1, selection: 10, mutationStrength: 10, mutationRate: 100, crossover: false, maxDuration: 60, slowRule: true },
      scenarios: scenarios ?? [{ track: 'straight', lanes: 3, density: 50, irregularity: 50, trafficMode: 'same', generations }],
    },
  });
}

test('resumen de un cerebro de 5 sensores, una capa de 6 y 40 generaciones', () => {
  const s = brainSummary({ origin: 'saved', brain: brain() });
  assert.deepEqual(s, {
    id: 'b1', name: 'Prudente', origin: 'saved', generations: 40, sensors: 5, shape: '6-6-4',
    best: { key: 'train.value.meters', params: { value: 412 } }, editable: true,
  });
  const i18n = createI18n({ dictionaries: { es, en }, language: 'es' });
  assert.equal(i18n.t('library.value.generations', { value: s.generations }), '40 generaciones');
  assert.equal(i18n.t('drive.value.rays', { value: s.sensors }), '5 rayos');
  assert.equal(i18n.t(s.best.key, s.best.params), '412 m');
  assert.equal(i18n.t(`library.origin.${s.origin}`), 'Guardado');
  i18n.setLanguage('en');
  assert.equal(i18n.t('library.value.generations', { value: 1 }), '1 generation');
});

test('resumen: origen de los autoguardados y mejor fitness con la unidad de su función', () => {
  const current = brainSummary({ origin: 'autosave', slot: 'current', brain: brain({ kind: 'survival', best: 28.34 }) });
  assert.equal(current.origin, 'autosave');
  assert.equal(current.nameKey, 'library.autosave.current');
  assert.equal(current.editable, false);
  assert.deepEqual(current.best, { key: 'train.value.seconds', params: { value: 28.3 } });
  assert.equal(brainSummary({ origin: 'autosave', slot: 'previous', brain: brain() }).origin, 'autosave');
  assert.deepEqual(brainSummary({ origin: 'saved', brain: brain({ kind: 'speed', best: 15.06 }) }).best, { key: 'train.value.metersPerSecond', params: { value: 15.1 } });
});

test('detalle: función de fitness, evolución, velocidad máxima y cada escenario con sus generaciones', () => {
  const d = brainDetail(brain({ generations: 50, scenarios: [
    { track: 'straight', lanes: 3, density: 50, irregularity: 50, trafficMode: 'same', generations: 30 },
    { track: 'straight', lanes: 4, density: 70, irregularity: 20, trafficMode: 'new', generations: 20 },
  ] }));
  assert.equal(d.fitness, 'distance');
  assert.deepEqual(d.evolution, { population: 100, elite: 1, selection: 10, mutationStrength: 10, mutationRate: 100, crossover: false, maxDuration: 60, slowRule: true });
  assert.equal(d.maxSpeed, 20);
  assert.deepEqual(d.scenarios, [
    { lanes: 3, density: 50, irregularity: 50, trafficMode: 'same', generations: 30 },
    { lanes: 4, density: 70, irregularity: 20, trafficMode: 'new', generations: 20 },
  ]);
  const i18n = createI18n({ dictionaries: { es, en }, language: 'es' });
  assert.equal(i18n.t('library.value.scenario.new', d.scenarios[1]), '4 carriles, densidad 70 %, irregularidad 20 %, tráfico nuevo: {value} generaciones');
  assert.equal(i18n.t('library.value.scenario.new', { ...d.scenarios[1], value: 20 }), '4 carriles, densidad 70 %, irregularidad 20 %, tráfico nuevo: 20 generaciones');
});

test('autoguardado del entrenamiento anterior: se nombra "Entrenamiento anterior" con la etiqueta "Autoguardado"', () => {
  const previous = brainSummary({ origin: 'autosave', slot: 'previous', brain: brain() });
  assert.equal(previous.origin, 'autosave');
  assert.equal(previous.nameKey, 'library.autosave.previous');
  assert.equal(previous.name, 'Prudente'); // el nombre grabado en el cerebro no cambia
  const i18n = createI18n({ dictionaries: { es, en }, language: 'es' });
  assert.equal(i18n.t(previous.nameKey), 'Entrenamiento anterior');
  assert.equal(i18n.t(`library.origin.${previous.origin}`), 'Autoguardado');
  i18n.setLanguage('en');
  assert.equal(i18n.t(previous.nameKey), 'Previous training');
  assert.equal(i18n.t(`library.origin.${previous.origin}`), 'Autosaved');
});

test('autoguardado del entrenamiento en curso: "Entrenamiento en curso", sin repetir "Autoguardado" en el nombre', () => {
  const current = brainSummary({ origin: 'autosave', slot: 'current', brain: brain() });
  const i18n = createI18n({ dictionaries: { es, en }, language: 'es' });
  assert.equal(i18n.t(current.nameKey), 'Entrenamiento en curso');
  assert.doesNotMatch(i18n.t(current.nameKey), /Autoguardado/);
  i18n.setLanguage('en');
  assert.equal(i18n.t(current.nameKey), 'Training in progress');
});

test('un cerebro guardado no trae nameKey: se muestra con su nombre', () => {
  assert.equal('nameKey' in brainSummary({ origin: 'saved', brain: brain() }), false);
});

import test from 'node:test';
import assert from 'node:assert/strict';
import { createBrain, validateBrain, copyBrain, learnedByImitation, practicedTracks, carForBrain } from '../src/core/brain.js';
import { createNetwork } from '../src/core/network.js';
import { createRandom } from '../src/core/random.js';
import { createLibrary } from '../src/ui/library.js';
import { markFor } from '../src/tabs/compete/marks.js';
import { trainedScenario, trainedTracks } from '../src/tabs/inspect/brains.js';
import { brainSummary } from '../src/ui/library-view.js';
import { createTraining } from '../src/core/training.js';

function imitationBrain() {
  return createBrain({
    id: 'lab', name: 'Imitación 1', now: '2026-11-14T00:00:00.000Z',
    network: createNetwork({ inputs: 6, hidden: [4], outputs: 4, activation: 'tanh', random: createRandom(1) }),
    sensors: { count: 5, range: 3, spread: 90 },
    training: { generations: 0, seed: 1, maxSpeed: 20, fitness: { kind: 'imitation', best: null }, evolution: {}, scenarios: [] },
    imitation: { examples: 3600, epochs: 200, teacher: 'street-new', track: 'straight', lanes: 3, density: 50, irregularity: 50 },
  });
}

test('cerebro que aprendió imitando: datos verdaderos, válido, sin generaciones', () => {
  const b = imitationBrain();
  assert.equal(validateBrain(b), null);
  assert.equal(b.training.generations, 0);
  assert.deepEqual(b.imitation, { examples: 3600, epochs: 200, teacher: 'street-new', track: 'straight', lanes: 3, density: 50, irregularity: 50 });
  assert.ok(learnedByImitation(b));
  assert.deepEqual(copyBrain(b).imitation, b.imitation);
  // Maneja como cualquier otro.
  assert.equal(typeof carForBrain(b).controller.control({ sensors: [1, 1, 1, 1, 1], speed: 0 }).forward, 'boolean');
});

test('una versión anterior (que no conoce el bloque) lo valida igual, como un cerebro sin generaciones', () => {
  const { imitation, ...old } = imitationBrain();
  assert.equal(validateBrain(old), null);
  assert.equal(validateBrain(JSON.parse(JSON.stringify(imitationBrain()))), null);
});

test('se guarda, se exporta y se importa con su bloque', () => {
  const mem = new Map();
  const storage = { getItem: (k) => mem.get(k) ?? null, setItem: (k, v) => mem.set(k, v), removeItem: (k) => mem.delete(k) };
  let n = 0;
  const lib = createLibrary({ storage, clock: () => 0, newId: () => `id${++n}` });
  const r = lib.save(imitationBrain(), { baseName: 'Imitación' });
  assert.ok(r.ok);
  assert.equal(r.brain.name, 'Imitación 1');
  const text = lib.exportText(r.brain.id);
  const back = lib.importText(text);
  assert.ok(back.ok, JSON.stringify(back));
  assert.deepEqual(back.brain.imitation, imitationBrain().imitation);
  assert.deepEqual(brainSummary({ origin: 'saved', brain: back.brain }).imitation, { track: 'straight', epochs: 200 });
});

test('dónde practicó: la pista de sus ejemplos; en Competir, practicó ahí y no vio las demás', () => {
  const b = imitationBrain();
  assert.deepEqual(practicedTracks(b), ['straight']);
  assert.equal(markFor(b, 'straight'), 'trained');
  assert.equal(markFor(b, 'oval'), 'unseen');
  assert.deepEqual(trainedTracks(b), ['straight']);
  assert.deepEqual(trainedScenario(b), { track: 'straight', lanes: 3, density: 50, irregularity: 50 });
});

test('seguir entrenando: el entrenamiento arranca de su red', () => {
  const b = imitationBrain();
  const training = createTraining({ seed: 1, brain: b, config: { population: 10 } });
  assert.deepEqual(training.config.hidden, [4]);
});

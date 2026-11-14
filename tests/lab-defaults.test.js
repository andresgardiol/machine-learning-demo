import test from 'node:test';
import assert from 'node:assert/strict';
import { createNetwork } from '../src/core/network.js';
import { createRandom } from '../src/core/random.js';
import { createLearningRun } from '../src/core/learning-cursor.js';
import { pointsDataset, splitDataset } from '../src/core/datasets.js';
import { NETWORK_DEFAULTS, DATA_DEFAULTS, DATA_SEED, FIRST_WEIGHT_SEED, OVERFIT_RECIPE, DEFAULT_EPOCH_RATE } from '../src/tabs/lab/defaults.js';

function runFor({ shape, count, noise, hidden, rate, activation = 'tanh' }) {
  const data = pointsDataset({ shape, count, noise, seed: DATA_SEED });
  const split = splitDataset(data, { holdout: DATA_DEFAULTS.holdout, seed: DATA_SEED });
  const network = createNetwork({ inputs: 2, hidden: [...hidden], outputs: 1, activation, random: createRandom(FIRST_WEIGHT_SEED) });
  return createLearningRun({ network, practice: split.practice, heldOut: split.heldOut, rate, seed: FIRST_WEIGHT_SEED });
}

test('valores por defecto: en 30 s (300 épocas a 10 por segundo) el círculo llega al 90 % de los apartados, sin aviso', () => {
  const run = runFor({ ...DATA_DEFAULTS.points, ...NETWORK_DEFAULTS });
  run.runEpochs(30 * DEFAULT_EPOCH_RATE);
  assert.ok(run.history.at(-1).heldOut.accuracy >= 0.9, `${run.history.at(-1).heldOut.accuracy}`);
  assert.equal(run.warningAppearances, 0);
});

test('receta de la misión 2: el aviso de sobreajuste aparece', () => {
  const run = runFor(OVERFIT_RECIPE);
  run.runEpochs(600);
  assert.ok(run.warningAppearances >= 1);
  assert.equal(run.warningEvents[0].kind, 'appeared');
});

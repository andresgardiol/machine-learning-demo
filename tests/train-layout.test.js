// Disposición de Entrenar (entrenar-red-primero): la red antes que la curva y la cuenta de las misiones.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { boardOrder, missionsSummary } from '../src/tabs/train/layout.js';
import { DEFAULT_SETTINGS } from '../src/tabs/train/settings.js';
import { createTrainSession } from '../src/tabs/train/session.js';

test('tablero: indicadores, última generación, la red (train-network) y después la curva (train-chart)', () => {
  const card = (id) => ({ dataset: { card: id } });
  const nodes = boardOrder({ strip: 'strip', lastLine: 'last', chart: card('train-chart'), network: card('train-network') });
  assert.deepEqual(nodes.slice(0, 2), ['strip', 'last']);
  const ids = nodes.slice(2).map((n) => n.dataset.card);
  assert.deepEqual(ids, ['train-network', 'train-chart']);
  assert.ok(ids.indexOf('train-network') < ids.indexOf('train-chart'));
});

test('la pestaña arma el tablero con boardOrder, no con su propio orden', () => {
  const src = readFileSync(new URL('../src/tabs/train/index.js', import.meta.url), 'utf8');
  assert.match(src, /board\.append\(\.\.\.boardOrder\(/);
  assert.doesNotMatch(src, /board\.append\(strip\.node, lastLine, chartCard\.node, networkCard\.node\)/);
});

test('misiones: la lista va plegada por defecto', () => {
  assert.equal(DEFAULT_SETTINGS.showMissions, false);
});

test('renglón de misiones: cuenta las cumplidas de las cuatro, también tras guardar un cerebro', () => {
  const session = createTrainSession();
  assert.deepEqual(missionsSummary(session.missions), { done: 0, total: 4 });
  session.brainSaved();
  assert.deepEqual(missionsSummary(session.missions), { done: 1, total: 4 });
});

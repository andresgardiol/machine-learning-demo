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

// entrenar-mesa-de-trabajo: la marcha debajo de la escena y la función de fitness en "Probá esto" (D2 y D3).
const trainSource = () => readFileSync(new URL('../src/tabs/train/index.js', import.meta.url), 'utf8');
/** Los argumentos de la llamada `el(...)` que arma `name` (el texto entre `const name = el(` y su `);`). */
function builtWith(src, name) {
  const start = src.indexOf(`const ${name} = el(`);
  assert.ok(start >= 0, name);
  return src.slice(start, src.indexOf(');\n', start));
}

test('"Probá esto" lleva la función de fitness primero; la vista de ajustes ya no la tiene', () => {
  const src = trainSource();
  const basic = builtWith(src, 'basic');
  assert.match(basic, /i18n: 'train\.basic\.title'/);
  assert.ok(basic.indexOf('choices.fitness.row') >= 0, 'fitness en "Probá esto"');
  assert.ok(basic.indexOf('choices.fitness.row') < basic.indexOf("row('population')"), 'fitness antes que la población');
  assert.ok(basic.indexOf("row('population')") < basic.indexOf("row('mutationStrength')"));
  assert.ok(basic.indexOf("row('mutationStrength')") < basic.indexOf("sw('mutationCooling')"));
  assert.doesNotMatch(builtWith(src, 'settingsView'), /choices\.fitness\.row/);
  assert.match(builtWith(src, 'trainingView'), /basic/);
});

test('la marcha y los interruptores van en la barra de abajo de la escena, no en el panel ni en la tarjeta', () => {
  const src = trainSource();
  const runBar = builtWith(src, 'runBar');
  assert.ok(runBar.indexOf('run,') >= 0 && runBar.indexOf('run,') < runBar.indexOf('viewSwitches'), 'run y después los interruptores');
  assert.match(src, /stageZone\.append\(runBar\)/);
  const training = builtWith(src, 'trainingView');
  assert.doesNotMatch(training, /viewSwitches|\brun\b/);
  assert.match(src, /createConsignaCard\(\{ i18n, onReveal/);
});

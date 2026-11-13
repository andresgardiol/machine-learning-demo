// Vistas del panel con pestañas (panel-de-entrenar-por-vistas D1, D3 y D10): la lógica sin DOM del
// componente común y de las vistas de Entrenar.
import test from 'node:test';
import assert from 'node:assert/strict';
import es from '../src/i18n/es.js';
import en from '../src/i18n/en.js';
import { createI18n } from '../src/ui/i18n.js';
import { viewIndexForKey, initialView, viewTabName } from '../src/ui/panel-views.js';
import { createConfirmation } from '../src/ui/controls.js';
import { DEFAULT_SETTINGS, settingsWaiting, trainingConfig } from '../src/tabs/train/settings.js';
import { createTraining } from '../src/core/training.js';

const VIEWS = ['training', 'settings', 'brains'];
const t = (lang) => createI18n({ dictionaries: { es, en }, language: lang }).t;

test('vista por defecto: la de entrenamiento; una vista recordada se conserva', () => {
  assert.equal(initialView(VIEWS, undefined), 'training');
  assert.equal(initialView(VIEWS, null), 'training');
  assert.equal(initialView(VIEWS, 'brains'), 'brains');
  assert.equal(initialView(VIEWS, 'settings'), 'settings');
  assert.equal(initialView(VIEWS, 'missing'), 'training');
});

test('teclado: flechas con vuelta, Inicio y Fin; otras teclas no mueven el foco', () => {
  assert.equal(viewIndexForKey('ArrowRight', 0, 3), 1);
  assert.equal(viewIndexForKey('ArrowRight', 2, 3), 0);
  assert.equal(viewIndexForKey('ArrowLeft', 0, 3), 2);
  assert.equal(viewIndexForKey('ArrowLeft', 1, 3), 0);
  assert.equal(viewIndexForKey('Home', 2, 3), 0);
  assert.equal(viewIndexForKey('End', 0, 3), 2);
  assert.equal(viewIndexForKey('Tab', 0, 3), null);
  assert.equal(viewIndexForKey('Enter', 0, 3), null);
  assert.equal(viewIndexForKey('ArrowDown', 0, 3), null);
});

test('nombre accesible: la cantidad de cerebros y los cambios pendientes', () => {
  assert.equal(viewTabName({ t: t('es'), labelKey: 'train.view.training' }), 'Entrenamiento');
  assert.equal(viewTabName({ t: t('es'), labelKey: 'train.view.brains', count: 3 }), 'Cerebros, 3');
  assert.equal(viewTabName({ t: t('es'), labelKey: 'train.view.brains', count: 0 }), 'Cerebros, 0');
  assert.equal(viewTabName({ t: t('es'), labelKey: 'train.view.settings', pending: true }),
    'Ajustes, cambios esperando a la próxima generación');
  assert.equal(viewTabName({ t: t('es'), labelKey: 'train.view.settings', pending: false }), 'Ajustes');
  assert.equal(viewTabName({ t: t('en'), labelKey: 'train.view.brains', count: 12 }), 'Brains, 12');
  assert.equal(viewTabName({ t: t('en'), labelKey: 'train.view.settings', pending: true }),
    'Settings, changes waiting for the next generation');
});

test('marca de cambios pendientes: cualquier ajuste salvo el modo de selección', () => {
  assert.equal(settingsWaiting(null), false);
  assert.equal(settingsWaiting({}), false);
  assert.equal(settingsWaiting({ selectionMode: 'manual' }), false);
  assert.equal(settingsWaiting({ elite: 3 }), true);
  assert.equal(settingsWaiting({ selectionMode: 'manual', tracks: ['oval'] }), true);
});

test('marca de cambios pendientes: aparece con un cambio y desaparece al empezar la generación siguiente', () => {
  const training = createTraining({ seed: 3, config: { ...trainingConfig(DEFAULT_SETTINGS), population: 8, elite: 1 } });
  assert.equal(settingsWaiting(training.pending), false);
  training.configure({ elite: 2 });
  assert.equal(settingsWaiting(training.pending), true);
  training.finishGeneration();
  assert.equal(settingsWaiting(training.pending), false);
});

/**
 * Lo que hace la pestaña al cambiar de vista (D1): elige la vista y cancela las confirmaciones de la
 * que deja (sin ninguna abierta, no llama a nada). No toca el entrenamiento.
 */
function switchView(from, confirmations) {
  const next = viewIndexForKey('ArrowRight', VIEWS.indexOf(from), VIEWS.length);
  for (const c of confirmations[from]) if (c.isOpen) c.cancel();
  return VIEWS[next];
}

test('cambiar de vista no altera el entrenamiento: mismo historial con y sin cambios de vista', () => {
  const config = { ...trainingConfig(DEFAULT_SETTINGS), population: 12, elite: 2, maxDuration: 6 };
  const plain = createTraining({ seed: 7, config });
  const switching = createTraining({ seed: 7, config });
  const confirmations = Object.fromEntries(VIEWS.map((v) => [v, [createConfirmation()]]));
  let view = 'training';
  for (let g = 0; g < 4; g++) {
    for (let i = 0; i < 90; i++) { plain.step(); switching.step(); }
    plain.finishGeneration();
    view = switchView(view, confirmations);
    switching.finishGeneration();
    view = switchView(view, confirmations);
  }
  assert.deepEqual(switching.history, plain.history);
  assert.equal(switching.generation, plain.generation);
});

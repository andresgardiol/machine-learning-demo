import test from 'node:test';
import assert from 'node:assert/strict';
import { mainAction, applyMainAction, TABS_WITH_RUN } from '../src/ui/main-action.js';

test('por defecto la marcha es la acción principal en las seis pestañas', () => {
  assert.equal(TABS_WITH_RUN.length, 6);
  for (const tab of TABS_WITH_RUN) assert.equal(mainAction(tab, {}), 'run', tab);
  for (const tab of TABS_WITH_RUN) assert.equal(mainAction(tab), 'run', `${tab} sin estado`);
  assert.equal(mainAction('train', { panelView: 'training' }), 'run');
});

test('con un choque, Reiniciar en El problema y "Compará con los ejemplos" en Reglas a mano', () => {
  assert.equal(mainAction('drive', { crashed: true }), 'restart');
  // reglas-el-choque-ensena D1: con el reintento encendido o apagado, el caso del choque lleva a comparar.
  assert.equal(mainAction('rules', { crashed: true }), 'compare');
  assert.equal(mainAction('rules', { crashed: false }), 'run', 'al reiniciar, la marcha vuelve a ser la principal');
  // red-al-centro D5: en Inspeccionar, con el caso del choque a la vista, "Reintentar desde acá"; al reiniciar o
  // reintentar, la marcha vuelve a ser la principal.
  assert.equal(mainAction('inspect', { crashed: true }), 'retry');
  assert.equal(mainAction('inspect', { crashed: false }), 'run');
  assert.equal(mainAction('lab', { crashed: true }), 'run');
});

test('con la selección manual pendiente, Elegir al líder', () => {
  assert.equal(mainAction('train', { manualPending: true, panelView: 'training' }), 'chooseLeader');
  assert.equal(mainAction('train', { manualPending: false, panelView: 'training' }), 'run');
});

test('con la carrera terminada, Otra carrera', () => {
  assert.equal(mainAction('compete', { raceFinished: true }), 'another');
});

test('con el cartel de largada a la vista, el botón del cartel', () => {
  assert.equal(mainAction('compete', { startCardVisible: true }), 'startCard');
  assert.equal(mainAction('compete', { startCardVisible: false }), 'run');
});

test('Entrenar: la marcha de abajo de la escena es la principal en las tres vistas; Guardar como nuevo, secundaria', () => {
  for (const panelView of ['training', 'settings', 'brains']) {
    assert.equal(mainAction('train', { panelView }), 'run', panelView);
    assert.equal(mainAction('train', { panelView, manualPending: true }), 'chooseLeader', panelView);
  }
  for (const s of [{}, { manualPending: true }, { panelView: 'brains' }]) assert.notEqual(mainAction('train', s), 'saveAsNew');
});

test('con un diálogo abierto, el diálogo', () => {
  for (const tab of TABS_WITH_RUN) assert.equal(mainAction(tab, { dialogOpen: true, crashed: true }), 'dialog', tab);
});

test('mismo estado, mismo resultado', () => {
  const states = [{}, { crashed: true }, { manualPending: true }, { raceFinished: true }, { startCardVisible: true },
    { panelView: 'brains' }, { panelView: 'settings' }, { dialogOpen: true }];
  for (const tab of TABS_WITH_RUN) for (const s of states) {
    assert.equal(mainAction(tab, { ...s }), mainAction(tab, { ...s }), `${tab} ${JSON.stringify(s)}`);
  }
});

/** Botón falso: solo la lista de clases. */
function fakeButton(classes = []) {
  const set = new Set(classes);
  return {
    has: (c) => set.has(c),
    classList: { toggle(name, force) { if (force) set.add(name); else set.delete(name); return force; } },
  };
}

test('applyMainAction pone primary en uno solo y lo saca de los demás', () => {
  const buttons = { run: fakeButton(['tool']), restart: fakeButton(['tool', 'primary']), another: fakeButton(['tool', 'primary']) };
  applyMainAction(buttons, 'run');
  assert.deepEqual(Object.entries(buttons).filter(([, b]) => b.has('primary')).map(([k]) => k), ['run']);
  applyMainAction(buttons, 'restart');
  assert.deepEqual(Object.entries(buttons).filter(([, b]) => b.has('primary')).map(([k]) => k), ['restart']);
  assert.ok(buttons.run.has('tool'), 'no toca las otras clases');
  applyMainAction(buttons, null);
  assert.equal(Object.values(buttons).filter((b) => b.has('primary')).length, 0);
  // Un botón que todavía no existe se ignora.
  applyMainAction({ run: null, restart: buttons.restart }, 'restart');
  assert.ok(buttons.restart.has('primary'));
});

import test from 'node:test';
import assert from 'node:assert/strict';
import { createV2Preferences, V2_PREFIX, SHARED_LANGUAGE_KEY } from '../../src/v2/preferences.js';

function memoryStorage() {
  const m = new Map();
  return { getItem: (k) => (m.has(k) ? m.get(k) : null), setItem: (k, v) => m.set(k, String(v)), keys: () => [...m.keys()], map: m };
}

test('v2/preferences: lee los valores por defecto sin nada guardado', () => {
  const p = createV2Preferences(() => memoryStorage());
  assert.equal(p.language, null);
  assert.equal(p.guide, true);
  assert.equal(p.hints, true);
  assert.equal(p.shortcuts, true);
  assert.equal(p.notebookFolded, false);
  assert.equal(p.stage, null);
  assert.equal(p.sheet('evolucion'), null);
});

test('v2/preferences: escribe y vuelve a leer, con claves mlLab.v2.* y el idioma compartido', () => {
  const s = memoryStorage();
  const p = createV2Preferences(() => s);
  p.language = 'en';
  p.guide = false;
  p.notebookFolded = true;
  p.stage = 'evaluar';
  p.setSheet('evolucion', 'red-pista');
  assert.equal(p.language, 'en');
  assert.equal(p.guide, false);
  assert.equal(p.notebookFolded, true);
  assert.equal(p.stage, 'evaluar');
  assert.equal(p.sheet('evolucion'), 'red-pista');
  assert.equal(s.map.get(SHARED_LANGUAGE_KEY), 'en');
  for (const k of s.keys()) assert.ok(k === SHARED_LANGUAGE_KEY || k.startsWith(V2_PREFIX), `clave inesperada ${k}`);
});

test('v2/preferences: no toca las claves de la V1', () => {
  const s = memoryStorage();
  s.setItem('mlLab.guide', 'on');
  s.setItem('mlLab.hints', 'on');
  s.setItem('mlLab.rules.program', 'avanzar');
  const p = createV2Preferences(() => s);
  p.guide = false;
  p.hints = false;
  p.rulesProgram = 'girar izquierda';
  assert.equal(s.map.get('mlLab.guide'), 'on');
  assert.equal(s.map.get('mlLab.hints'), 'on');
  assert.equal(s.map.get('mlLab.rules.program'), 'avanzar');
});

test('v2/preferences: si el almacenamiento falla, sigue en memoria y lo informa', () => {
  const p = createV2Preferences(() => { throw new Error('bloqueado'); });
  assert.equal(p.guide, true);
  p.guide = false;
  p.setSheet('problema', 'escenario');
  assert.equal(p.guide, false);
  assert.equal(p.sheet('problema'), 'escenario');
  assert.equal(p.storageWorks, false);
  const q = createV2Preferences(() => null);
  q.notebookFolded = true;
  assert.equal(q.notebookFolded, true);
  assert.equal(q.storageWorks, false);
});

test('v2/preferences: rechaza valores inválidos', () => {
  const s = memoryStorage();
  const p = createV2Preferences(() => s);
  p.stage = 'otra';
  assert.equal(p.stage, null);
  assert.equal(p.setSheet('problema', 'con espacios'), false);
  assert.equal(p.setSheet('inexistente', 'hoja'), false);
  s.setItem(V2_PREFIX + 'sheet.problema', '<script>');
  assert.equal(p.sheet('problema'), null);
  s.setItem(SHARED_LANGUAGE_KEY, 'fr');
  assert.equal(p.language, null);
});

test('v2/preferences: el aviso de ayudas se muestra hasta que se cierra, y se recuerda en mlLab.v2.*', () => {
  const s = memoryStorage();
  const p = createV2Preferences(() => s);
  assert.equal(p.helpNoticeSeen, false);
  p.helpNoticeSeen = true;
  assert.equal(s.getItem(`${V2_PREFIX}helpNoticeSeen`), 'on');
  assert.equal(createV2Preferences(() => s).helpNoticeSeen, true);
});

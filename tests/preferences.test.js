import test from 'node:test';
import assert from 'node:assert/strict';
import { createPreferences, DEFAULT_PREFERENCES } from '../src/ui/preferences.js';

const memoryStorage = () => {
  const data = new Map();
  return { getItem: (k) => (data.has(k) ? data.get(k) : null), setItem: (k, v) => data.set(k, String(v)) };
};

const failingStorage = () => ({
  getItem() { throw new Error('SecurityError'); },
  setItem() { throw new Error('QuotaExceededError'); },
});

test('navegador sin almacenamiento: acceder al almacenamiento lanza y se obtienen los valores por defecto sin error', () => {
  const prefs = createPreferences(() => { throw new Error('SecurityError: localStorage no disponible'); });
  assert.doesNotThrow(() => { prefs.language = 'en'; prefs.guide = false; prefs.panelWidth = 480; prefs.carSpeed = 30; });
  assert.equal(prefs.language, null);
  assert.equal(prefs.guide, true);
  assert.deepEqual({ language: prefs.language, guide: prefs.guide, panelWidth: prefs.panelWidth, carSpeed: prefs.carSpeed, scenery: prefs.scenery }, DEFAULT_PREFERENCES);
});

test('almacenamiento que falla al leer y escribir: valores por defecto sin error', () => {
  const prefs = createPreferences(failingStorage);
  assert.doesNotThrow(() => { prefs.language = 'en'; prefs.guide = false; });
  assert.equal(prefs.language, null);
  assert.equal(prefs.guide, true);
});

test('almacenamiento ausente (undefined): valores por defecto sin error', () => {
  const prefs = createPreferences(() => undefined);
  assert.doesNotThrow(() => { prefs.guide = false; });
  assert.equal(prefs.language, null);
  assert.equal(prefs.guide, true);
});

test('segunda visita: el idioma inglés y la guía apagada se recuerdan', () => {
  const storage = memoryStorage();
  const first = createPreferences(() => storage);
  first.language = 'en';
  first.guide = false;
  const second = createPreferences(() => storage);
  assert.equal(second.language, 'en');
  assert.equal(second.guide, false);
});

test('valores guardados inválidos se ignoran', () => {
  const storage = memoryStorage();
  storage.setItem('mlLab.language', 'de');
  storage.setItem('mlLab.guide', 'maybe');
  const prefs = createPreferences(() => storage);
  assert.equal(prefs.language, null);
  assert.equal(prefs.guide, true);
});

test('ancho del panel: se recuerda entre visitas; sin valor guardado o con uno inválido es null', () => {
  const storage = memoryStorage();
  assert.equal(createPreferences(() => storage).panelWidth, null);
  createPreferences(() => storage).panelWidth = 452.6;
  assert.equal(createPreferences(() => storage).panelWidth, 453);
  storage.setItem('mlLab.panelWidth', 'ancho');
  assert.equal(createPreferences(() => storage).panelWidth, null);
});

test('ancho del panel con un almacenamiento que falla: null sin error', () => {
  const prefs = createPreferences(failingStorage);
  assert.doesNotThrow(() => { prefs.panelWidth = 500; });
  assert.equal(prefs.panelWidth, null);
});

test('velocidad del auto: se recuerda entre visitas; sin valor guardado es null', () => {
  const storage = memoryStorage();
  assert.equal(createPreferences(() => storage).carSpeed, null);
  createPreferences(() => storage).carSpeed = 28;
  assert.equal(createPreferences(() => storage).carSpeed, 28);
});

test('ancho del escenario: un valor válido se recuerda entre visitas', () => {
  const storage = memoryStorage();
  assert.equal(createPreferences(() => storage).stageWidth, null);
  createPreferences(() => storage).stageWidth = 512.4;
  assert.equal(storage.getItem('mlLab.stageWidth'), '512');
  assert.equal(createPreferences(() => storage).stageWidth, 512);
});

test('ancho del escenario: un valor guardado inválido es null', () => {
  const storage = memoryStorage();
  storage.setItem('mlLab.stageWidth', 'ancho');
  assert.equal(createPreferences(() => storage).stageWidth, null);
  storage.setItem('mlLab.stageWidth', '-40');
  assert.equal(createPreferences(() => storage).stageWidth, null);
  storage.setItem('mlLab.stageWidth', '0');
  assert.equal(createPreferences(() => storage).stageWidth, null);
});

test('ancho del escenario con un almacenamiento que falla o no existe: null sin error', () => {
  const failing = createPreferences(failingStorage);
  assert.doesNotThrow(() => { failing.stageWidth = 300; });
  assert.equal(failing.stageWidth, null);
  const throwing = createPreferences(() => { throw new Error('SecurityError'); });
  assert.doesNotThrow(() => { throwing.stageWidth = 300; });
  assert.equal(throwing.stageWidth, null);
});

// --- Programa de la pestaña Reglas a mano (reglas-a-mano, tarea 5.3) ----------------------------

test('programa de Reglas a mano: el texto se recuerda entre visitas; sin valor guardado es null', () => {
  const storage = memoryStorage();
  assert.equal(createPreferences(() => storage).rulesProgram, null);
  const text = 'cerca = 0,3\navanzar\nsi sensor3 > cerca entonces\n    girar izquierda';
  createPreferences(() => storage).rulesProgram = text;
  assert.equal(storage.getItem('mlLab.rules.program'), text);
  assert.equal(createPreferences(() => storage).rulesProgram, text);
  createPreferences(() => storage).rulesProgram = '';
  assert.equal(createPreferences(() => storage).rulesProgram, '');
});

test('programa de Reglas a mano: un texto de más de 20 000 caracteres se trata como ausente', () => {
  const storage = memoryStorage();
  storage.setItem('mlLab.rules.program', 'a'.repeat(20000));
  assert.equal(createPreferences(() => storage).rulesProgram.length, 20000);
  storage.setItem('mlLab.rules.program', 'a'.repeat(20001));
  assert.equal(createPreferences(() => storage).rulesProgram, null);
});

test('programa de Reglas a mano con un almacenamiento que falla o no existe: null sin error', () => {
  const failing = createPreferences(failingStorage);
  assert.doesNotThrow(() => { failing.rulesProgram = 'avanzar'; });
  assert.equal(failing.rulesProgram, null);
  const throwing = createPreferences(() => { throw new Error('SecurityError'); });
  assert.doesNotThrow(() => { throwing.rulesProgram = 'avanzar'; });
  assert.equal(throwing.rulesProgram, null);
});

test('paisaje: encendido por defecto, se recuerda apagado y vuelve a encenderse', () => {
  const storage = memoryStorage();
  const first = createPreferences(() => storage);
  assert.equal(first.scenery, true);
  first.scenery = false;
  assert.equal(storage.getItem('mlLab.scenery'), 'off');
  const second = createPreferences(() => storage);
  assert.equal(second.scenery, false);
  second.scenery = true;
  assert.equal(createPreferences(() => storage).scenery, true);
  // Un valor guardado que no se entiende vale como encendido; sin almacenamiento, también.
  storage.setItem('mlLab.scenery', 'quizás');
  assert.equal(createPreferences(() => storage).scenery, true);
  assert.equal(createPreferences(failingStorage).scenery, true);
});

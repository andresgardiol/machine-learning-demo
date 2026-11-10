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
  assert.doesNotThrow(() => { prefs.language = 'en'; prefs.guide = false; });
  assert.equal(prefs.language, null);
  assert.equal(prefs.guide, true);
  assert.deepEqual({ language: prefs.language, guide: prefs.guide }, DEFAULT_PREFERENCES);
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

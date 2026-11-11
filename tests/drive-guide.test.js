import test from 'node:test';
import assert from 'node:assert/strict';
import es from '../src/i18n/es.js';
import en from '../src/i18n/en.js';
import { createI18n } from '../src/ui/i18n.js';
import { DEFAULT_SETTINGS } from '../src/tabs/drive/settings.js';

test('guía de la pestaña 1: con la configuración por defecto habla de una calle de 3 carriles', () => {
  const i18n = createI18n({ dictionaries: { es, en }, language: 'es' });
  assert.equal(DEFAULT_SETTINGS.lanes, 3);
  assert.match(i18n.t('drive.guide.what', { lanes: DEFAULT_SETTINGS.lanes }), /calle de 3 carriles/);
  i18n.setLanguage('en');
  assert.match(i18n.t('drive.guide.what', { lanes: DEFAULT_SETTINGS.lanes }), /a 3-lane street/);
});

test('guía de la pestaña 1: con cuatro carriles elegidos habla de 4 carriles en el idioma activo', () => {
  const i18n = createI18n({ dictionaries: { es, en }, language: 'es' });
  assert.match(i18n.t('drive.guide.what', { lanes: 4 }), /calle de 4 carriles/);
  assert.match(i18n.t('drive.guide.what', { lanes: 2 }), /calle de 2 carriles/);
  i18n.setLanguage('en');
  assert.match(i18n.t('drive.guide.what', { lanes: 4 }), /a 4-lane street/);
});

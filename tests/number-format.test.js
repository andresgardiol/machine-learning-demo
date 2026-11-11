import test from 'node:test';
import assert from 'node:assert/strict';
import es from '../src/i18n/es.js';
import en from '../src/i18n/en.js';
import { createI18n, formatNumber } from '../src/ui/i18n.js';

const dictionaries = { es: { v: '{value} m', d: '{value} largos', 'd.one': '{value} largo' }, en: { v: '{value} m', d: '{value} lengths', 'd.one': '{value} length' } };

test('números: decimal en español con coma', () => {
  const i18n = createI18n({ dictionaries, language: 'es' });
  assert.equal(i18n.t('v', { value: 1.5 }), '1,5 m');
  assert.equal(formatNumber(1.5, 'es'), '1,5');
});

test('números: decimal en inglés con punto', () => {
  const i18n = createI18n({ dictionaries, language: 'en' });
  assert.equal(i18n.t('v', { value: 1.5 }), '1.5 m');
  assert.equal(formatNumber(1.5, 'en'), '1.5');
});

test('números: cambio de idioma con números a la vista pasa de coma a punto', () => {
  const i18n = createI18n({ dictionaries, language: 'es' });
  assert.equal(i18n.t('v', { value: 2.25 }), '2,25 m');
  i18n.setLanguage('en');
  assert.equal(i18n.t('v', { value: 2.25 }), '2.25 m');
});

test('números: un número grande se escribe sin separador de miles en ambos idiomas', () => {
  const i18n = createI18n({ dictionaries, language: 'es' });
  assert.equal(i18n.t('v', { value: 12345 }), '12345 m');
  i18n.setLanguage('en');
  assert.equal(i18n.t('v', { value: 12345 }), '12345 m');
});

test('números: hasta dos decimales; quien llama decide el redondeo', () => {
  assert.equal(formatNumber(1.23456, 'es'), '1,23');
  assert.equal(formatNumber(1.23456, 'en'), '1.23');
  assert.equal(formatNumber(3, 'es'), '3');
});

test('números: con valor exactamente 1 se sigue usando el singular', () => {
  const i18n = createI18n({ dictionaries: { es, en }, language: 'es' });
  assert.equal(i18n.t('drive.value.carLengths', { value: 1 }), '1 largo de auto');
  assert.equal(i18n.t('drive.value.carLengths', { value: 1.5 }), '1,5 largos de auto');
  i18n.setLanguage('en');
  assert.equal(i18n.t('drive.value.carLengths', { value: 1 }), '1 car length');
  assert.equal(i18n.t('drive.value.carLengths', { value: 1.5 }), '1.5 car lengths');
});

test('números: los parámetros que no son números no cambian', () => {
  const i18n = createI18n({ dictionaries: { es: { s: '{name}' }, en: { s: '{name}' } }, language: 'es' });
  assert.equal(i18n.t('s', { name: '1.5' }), '1.5');
});

import { formatFixed } from '../src/ui/i18n.js';

test('dos decimales fijos: 0,40 en español y 0.40 en inglés', () => {
  assert.equal(formatFixed(0.4, 2, 'es'), '0,40');
  assert.equal(formatFixed(0.4, 2, 'en'), '0.40');
});

test('dos decimales fijos: 1 da 1,00 y 1.00', () => {
  assert.equal(formatFixed(1, 2, 'es'), '1,00');
  assert.equal(formatFixed(1, 2, 'en'), '1.00');
});

test('dos decimales fijos: redondea, conserva el signo y no agrupa miles', () => {
  assert.equal(formatFixed(0.426, 2, 'es'), '0,43');
  assert.equal(formatFixed(-0.25, 2, 'en'), '-0.25');
  assert.equal(formatFixed(12345.5, 2, 'es'), '12345,50');
});

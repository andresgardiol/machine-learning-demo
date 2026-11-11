import test from 'node:test';
import assert from 'node:assert/strict';
import es from '../src/i18n/es.js';
import en from '../src/i18n/en.js';
import { createI18n, pickInitialLanguage, format } from '../src/ui/i18n.js';

test('paridad: cada clave en español existe en inglés y viceversa', () => {
  const esKeys = Object.keys(es).sort();
  const enKeys = Object.keys(en).sort();
  assert.deepEqual(esKeys.filter((k) => !(k in en)), [], 'claves que faltan en en.js');
  assert.deepEqual(enKeys.filter((k) => !(k in es)), [], 'claves que faltan en es.js');
  assert.deepEqual(esKeys, enKeys);
});

test('paridad: ningún texto está vacío y los parámetros coinciden entre idiomas', () => {
  const params = (s) => [...s.matchAll(/\{(\w+)\}/g)].map((m) => m[1]).sort();
  for (const key of Object.keys(es)) {
    assert.equal(typeof es[key], 'string', `es:${key}`);
    assert.equal(typeof en[key], 'string', `en:${key}`);
    assert.notEqual(es[key].trim(), '', `es:${key} vacío`);
    assert.notEqual(en[key].trim(), '', `en:${key} vacío`);
    assert.deepEqual(params(es[key]), params(en[key]), `parámetros distintos en ${key}`);
  }
});

test('idioma inicial: navegador en español abre en español', () => {
  assert.equal(pickInitialLanguage({ stored: null, browserLanguages: ['es'] }), 'es');
  assert.equal(pickInitialLanguage({ stored: null, browserLanguages: ['es-AR', 'en'] }), 'es');
});

test('idioma inicial: navegador en francés abre en inglés', () => {
  assert.equal(pickInitialLanguage({ stored: null, browserLanguages: ['fr-FR', 'es'] }), 'en');
  assert.equal(pickInitialLanguage({ stored: null, browserLanguages: [] }), 'en');
  assert.equal(pickInitialLanguage({ stored: null, browserLanguages: ['estonian-ish'] }), 'en');
});

test('idioma inicial: la preferencia recordada tiene prioridad sobre el navegador', () => {
  assert.equal(pickInitialLanguage({ stored: 'en', browserLanguages: ['es-ES'] }), 'en');
  assert.equal(pickInitialLanguage({ stored: 'es', browserLanguages: ['fr'] }), 'es');
  // una preferencia inválida se ignora
  assert.equal(pickInitialLanguage({ stored: 'de', browserLanguages: ['es'] }), 'es');
});

test('texto faltante: en inglés se muestra la versión en español', () => {
  const i18n = createI18n({ dictionaries: { es: { solo: 'Solo en español', ambos: 'Hola' }, en: { ambos: 'Hello' } }, language: 'en' });
  assert.equal(i18n.t('ambos'), 'Hello');
  assert.equal(i18n.t('solo'), 'Solo en español');
});

test('texto faltante: en español se muestra la versión en inglés', () => {
  const i18n = createI18n({ dictionaries: { es: {}, en: { only: 'Only English' } }, language: 'es' });
  assert.equal(i18n.t('only'), 'Only English');
});

test('traducción con parámetros', () => {
  const i18n = createI18n({ dictionaries: { es: { d: 'Recorriste {m} m' }, en: { d: 'You drove {m} m' } }, language: 'es' });
  assert.equal(i18n.t('d', { m: 120 }), 'Recorriste 120 m');
  i18n.setLanguage('en');
  assert.equal(i18n.t('d', { m: 120 }), 'You drove 120 m');
  assert.equal(format('{a} y {b}', { a: 1 }), '1 y {b}');
});

test('cambiar de idioma notifica a los suscriptores y volver restablece el idioma', () => {
  const i18n = createI18n({ dictionaries: { es: { k: 'sí' }, en: { k: 'yes' } }, language: 'es' });
  const seen = [];
  const off = i18n.onChange((lang) => seen.push(lang));
  i18n.setLanguage('en');
  i18n.setLanguage('en'); // sin cambio, sin aviso
  i18n.setLanguage('es');
  i18n.setLanguage('xx'); // no admitido, se ignora
  off();
  i18n.setLanguage('en');
  assert.deepEqual(seen, ['en', 'es']);
  assert.equal(i18n.language, 'en');
});

test('singular: con valor 1 se usa la variante ".one" en ambos idiomas; con otros valores, el plural', () => {
  const i18n = createI18n({ dictionaries: { es, en }, language: 'es' });
  assert.equal(i18n.t('drive.value.rays', { value: 1 }), '1 rayo');
  assert.equal(i18n.t('drive.value.rays', { value: 5 }), '5 rayos');
  assert.equal(i18n.t('drive.value.carLengths', { value: 1 }), '1 largo de auto');
  assert.equal(i18n.t('drive.value.carLengths', { value: 1.5 }), '1.5 largos de auto');
  i18n.setLanguage('en');
  assert.equal(i18n.t('drive.value.rays', { value: 1 }), '1 ray');
  assert.equal(i18n.t('drive.value.rays', { value: 2 }), '2 rays');
  assert.equal(i18n.t('drive.value.carLengths', { value: 1 }), '1 car length');
  // sin variante singular, el texto de siempre
  assert.equal(i18n.t('drive.value.meters', { value: 1 }), '1 m');
});

test('singular: si la variante solo existe en un idioma se usa la del otro, como con cualquier texto faltante', () => {
  const i18n = createI18n({ dictionaries: { es: { n: '{value} autos', 'n.one': '{value} auto' }, en: { n: '{value} cars' } }, language: 'en' });
  assert.equal(i18n.t('n', { value: 1 }), '1 auto');
  assert.equal(i18n.t('n', { value: 3 }), '3 cars');
});

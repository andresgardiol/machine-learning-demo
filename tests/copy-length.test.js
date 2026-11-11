// Largos máximos de los textos del panel y del tablero (design.md D12 y D14), en los dos idiomas:
// guías de inicio de hasta 240 caracteres, renglones de ayuda de hasta 120 y nombres de misiones de
// hasta 34, con sus parámetros reemplazados por los valores reales.
import test from 'node:test';
import assert from 'node:assert/strict';
import es from '../src/i18n/es.js';
import en from '../src/i18n/en.js';
import { createI18n } from '../src/ui/i18n.js';
import { MISSIONS as TRAIN_MISSIONS } from '../src/tabs/train/session.js';

const LANGS = { es, en };
const GUIDE_MAX = 240;
const HINT_MAX = 120;
const MISSION_MAX = 34;

/** Texto de `key` en `lang` con los parámetros reemplazados. */
function text(lang, key, params) {
  const i18n = createI18n({ dictionaries: LANGS, language: lang });
  assert.equal(typeof LANGS[lang][key], 'string', `${lang}:${key} no existe`);
  return i18n.t(key, params);
}

function assertMax(key, max, params) {
  for (const lang of Object.keys(LANGS)) {
    const t = text(lang, key, params);
    assert.ok(t.length <= max, `${lang}:${key} tiene ${t.length} caracteres (máximo ${max}): ${t}`);
  }
}

test('Entrenar: guía de inicio de hasta 240 caracteres', () => {
  assertMax('train.guide', GUIDE_MAX);
});

test('Entrenar: renglones de ayuda del tablero de hasta 120 caracteres', () => {
  for (const key of ['train.chart.hint.new', 'train.chart.hint.same', 'train.network.hint']) assertMax(key, HINT_MAX);
});

test('Entrenar: nombres de misiones de hasta 34 caracteres, con su meta real', () => {
  assert.equal(TRAIN_MISSIONS.length, 4);
  for (const m of TRAIN_MISSIONS) assertMax(`train.mission.${m.id}`, MISSION_MAX, { goal: m.goal });
});

// --- El problema --------------------------------------------------------------------------------
import { MISSIONS as DRIVE_MISSIONS } from '../src/tabs/drive/session.js';

test('El problema: guía de inicio de hasta 240 caracteres con 3 carriles, y renglón de teclas de hasta 120', () => {
  assertMax('drive.guide.what', GUIDE_MAX, { lanes: 3 });
  assertMax('drive.guide.keys', HINT_MAX);
});

test('El problema: renglones de ayuda del tablero de hasta 120 caracteres', () => {
  for (const key of ['drive.perception.hint', 'drive.action.hint']) assertMax(key, HINT_MAX);
});

test('El problema: nombres de misiones de hasta 34 caracteres, con su meta real', () => {
  assert.equal(DRIVE_MISSIONS.length, 3);
  for (const m of DRIVE_MISSIONS) assertMax(`drive.mission.${m.id}`, MISSION_MAX, { goal: m.goal });
});

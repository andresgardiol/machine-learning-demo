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

// La guía de Entrenar tiene un tope propio: con el interruptor del enfriamiento, una guía más larga
// hace desplazar el panel en 360 px (fitness-que-premia-superar, tarea 8.1).
// Tope por idioma: el largo de cada texto medido, redondeado hacia arriba a la decena.
const TRAIN_GUIDE_MAX = Object.freeze({ es: 190, en: 200 });

test('Entrenar: guía de inicio de hasta 190 caracteres en español y 200 en inglés', () => {
  for (const [lang, max] of Object.entries(TRAIN_GUIDE_MAX)) {
    const t = text(lang, 'train.guide');
    assert.ok(t.length <= max, `${lang}:train.guide tiene ${t.length} caracteres (máximo ${max}): ${t}`);
  }
});

test('Entrenar: guía de inicio con selección manual de hasta 240 caracteres', () => {
  assertMax('train.guide.manual', GUIDE_MAX);
});

test('Entrenar: renglones de ayuda del tablero de hasta 120 caracteres', () => {
  for (const key of ['train.chart.hint.new', 'train.chart.hint.same', 'train.network.hint']) assertMax(key, HINT_MAX);
});

test('Entrenar: nombres de misiones de hasta 34 caracteres, con su meta real', () => {
  assert.equal(TRAIN_MISSIONS.length, 4);
  for (const m of TRAIN_MISSIONS) assertMax(`train.mission.${m.id}`, MISSION_MAX, { goal: m.goal });
});

// --- fitness-que-premia-superar: misión, indicador e interruptor nuevos ---------------------------
// El tablero reparte su ancho entre cuatro indicadores: a 360 px, cada nombre tiene que entrar en un
// renglón de unos 80 px de letra chica (ver la verificación en el navegador de la tarea 8.1).
const STAT_NAME_MAX = 22;
const SWITCH_MAX = 34;

test('Entrenar: la misión de superar vehículos entra en un renglón, con su meta real', () => {
  const m = TRAIN_MISSIONS.find((x) => x.id === 'passed');
  assert.ok(m, 'existe la misión de superar vehículos');
  assertMax('train.mission.passed', MISSION_MAX, { goal: m.goal });
});

test('Entrenar: el nombre del indicador de superados es de hasta 22 caracteres', () => {
  assertMax('train.stats.passed', STAT_NAME_MAX);
});

test('Entrenar: el interruptor del enfriamiento entra en un renglón (hasta 34 caracteres)', () => {
  assertMax('train.setting.mutationCooling', SWITCH_MAX);
});

test('Entrenar: líneas de la ventaja (última generación y padre) de hasta 110 caracteres', () => {
  const params = { generation: 1000, value: 1194 };
  for (const key of ['train.last.best.metersAhead', 'train.parent.leader.metersAhead', 'train.parent.champion.metersAhead']) assertMax(key, 110, params);
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

// --- Selección manual: líneas de estado del padre ---------------------------------------------------
const PARENT_STATUS_MAX = 110;

test('Entrenar: líneas de estado del padre de hasta 110 caracteres, con valores de largo realista', () => {
  const params = { generation: 1000, value: 1194, name: 'N'.repeat(40) };
  const keys = ['train.parent.none', 'train.parent.pending'];
  for (const source of ['leader', 'champion']) for (const unit of ['meters', 'seconds', 'metersPerSecond']) keys.push(`train.parent.${source}.${unit}`);
  for (const key of keys) assertMax(key, PARENT_STATUS_MAX, params);
  // La del cerebro depende del largo del nombre: queda fuera del límite, pero tiene que existir en los dos idiomas.
  for (const lang of Object.keys(LANGS)) assert.ok(text(lang, 'train.parent.brain', params).includes(params.name));
});

// --- Reglas a mano ------------------------------------------------------------------------------
import { MISSIONS as RULES_MISSIONS } from '../src/tabs/rules/session.js';

test('Reglas a mano: guía de inicio de hasta 240 caracteres', () => {
  assertMax('rules.guide', GUIDE_MAX);
});

test('Reglas a mano: renglones de ayuda del tablero de hasta 120 caracteres', () => {
  for (const key of ['rules.program.hint', 'rules.io.hint']) assertMax(key, HINT_MAX);
});

test('Reglas a mano: nombres de misiones de hasta 34 caracteres, con su meta real', () => {
  assert.equal(RULES_MISSIONS.length, 3);
  for (const m of RULES_MISSIONS) assertMax(`rules.mission.${m.id}`, MISSION_MAX, { goal: m.goal });
});

// --- circuitos-y-paisaje: nombres de pista, indicador de vueltas e interruptor del paisaje ----------
// Los nombres van en el selector de pista del escenario (panel-de-entrenar-por-vistas D6): con el
// más largo, "Circuito de curvas · se alternan 4" entra en el escenario de 400 px (medido: 256 px).
const TRACK_NAME_MAX = 18;
// El interruptor del paisaje comparte el renglón de la cámara con +, − y "Seguir al auto (V)".
const SCENERY_MAX = 10;

test('circuitos: nombres de pista de hasta 18 caracteres', () => {
  for (const id of ['straight', 'oval', 'kidney', 'grandPrix']) assertMax(`track.${id}`, TRACK_NAME_MAX);
  assertMax('track.label', TRACK_NAME_MAX);
  assertMax('train.tracks', TRACK_NAME_MAX);
});

test('circuitos: el nombre del indicador de vueltas es de hasta 22 caracteres, en las tres pestañas', () => {
  assertMax('drive.stats.laps', STAT_NAME_MAX);
  assertMax('train.stats.laps', STAT_NAME_MAX);
});

test('circuitos: el interruptor del paisaje es de hasta 10 caracteres', () => {
  assertMax('camera.scenery', SCENERY_MAX);
});

test('circuitos: guía en un circuito, línea de las misiones y ayuda de la curva dentro de sus topes', () => {
  assertMax('drive.guide.what.circuit', GUIDE_MAX, { track: 'Circuito de curvas' });
  assertMax('drive.missions.circuit', HINT_MAX);
  assertMax('train.chart.hint.tracks', HINT_MAX);
});

// Pestañas de vista del panel de Entrenar (panel-de-entrenar-por-vistas D1): las tres, con un contador
// de cerebros de dos dígitos, entran en un renglón a 360 px. Medido en el navegador a 360 px: en
// español, con "Cerebros (14)", las tres ocupan 323 de los 328 px de la barra; en inglés, 324.
const VIEW_TABS_MAX = 34;

test('Entrenar: las tres pestañas de vista, con un contador de dos dígitos, suman hasta 34 caracteres', () => {
  for (const lang of Object.keys(LANGS)) {
    const names = [text(lang, 'train.view.training'), text(lang, 'train.view.settings'),
      text(lang, 'views.label.count', { name: text(lang, 'train.view.brains'), value: 99 })];
    const total = names.join('').length;
    assert.ok(total <= VIEW_TABS_MAX, `${lang}: las pestañas suman ${total} caracteres (máximo ${VIEW_TABS_MAX}): ${names.join(' | ')}`);
  }
});

// --- panel-de-entrenar-por-vistas: nombres de las pistas y textos de Entrenar (D6 y D8) -------------

test('nombres de las pistas: los cuatro, en orden, en español y en inglés', () => {
  const ids = ['straight', 'oval', 'kidney', 'grandPrix'];
  assert.deepEqual(ids.map((id) => text('es', `track.${id}`)), ['Calle recta', 'Óvalo', 'Óvalo con chicana', 'Circuito de curvas']);
  assert.deepEqual(ids.map((id) => text('en', `track.${id}`)), ['Straight street', 'Oval', 'Oval with chicane', 'Curves circuit']);
});

test('chicana: el tooltip del óvalo con chicana dice qué es', () => {
  assert.match(text('es', 'help.track.option.kidney.what'), /chicana: un zigzag corto que obliga a doblar a un lado y enseguida al otro/);
  assert.match(text('en', 'help.track.option.kidney.what'), /chicane: a short zigzag/);
});

test('Entrenar: una palabra para los ajustes, "el fitness" en masculino y misiones en imperativo', () => {
  assert.equal(text('es', 'train.basic.title'), 'Población y mutación');
  assert.equal(text('en', 'train.basic.title'), 'Population and mutation');
  assert.equal(text('es', 'train.resetSettings'), 'Restablecer ajustes');
  assert.equal(text('en', 'train.resetSettings'), 'Reset settings');
  assert.equal(text('es', 'train.view.settings'), 'Ajustes');
  assert.equal(text('es', 'train.selectionMode.auto'), 'El fitness');
  assert.equal(text('es', 'train.mission.fitness'), 'Probá otra función de fitness');
  assert.equal(text('en', 'train.mission.fitness'), 'Try another fitness function');
  assert.equal(text('en', 'train.stats.passed'), 'Leader has passed');
  // Ningún texto visible de Entrenar usa "la fitness" ni nombra un bloque o botón "Configuración".
  for (const [key, value] of Object.entries(es)) {
    if (!key.startsWith('train.') && !key.startsWith('help.train.')) continue;
    assert.doesNotMatch(value, /\b[Ll]a fitness\b/, key);
    if (key === 'train.basic.title' || key === 'train.resetSettings') assert.doesNotMatch(value, /onfiguración/, key);
  }
});

// Mesa de trabajo de Reglas a mano (reglas-mesa-de-trabajo, tareas 4.3 y 5.1): la barra sin el grupo de
// sensores, su "Restablecer" que no toca los sensores y la comparación que escribe una barra.
import test from 'node:test';
import assert from 'node:assert/strict';
import { RULES_BAR, scenarioReset, comparisonFor, insertAt } from '../src/tabs/rules/workbench.js';
import { barGroupsShown, BAR_GROUPS } from '../src/tabs/shared/scenario-bar.js';
import { DEFAULT_SETTINGS } from '../src/tabs/shared/street-settings.js';
import { parseProgram } from '../src/core/rules.js';
import { DENSE_SELECTOR } from '../src/ui/audit.js';

test('la barra de Reglas a mano no muestra el grupo de sensores y conserva el orden de los demás', () => {
  assert.deepEqual(barGroupsShown(RULES_BAR), ['track', 'traffic', 'car']);
  assert.ok(RULES_BAR.aside.includes('sensors'));
  // Entrenar (sin configuración) sigue con los cuatro grupos.
  assert.deepEqual(barGroupsShown(), BAR_GROUPS.map((g) => g.id));
});

test('restablecer el escenario de Reglas a mano deja los sensores como estaban', () => {
  const changed = { ...DEFAULT_SETTINGS, lanes: 4, density: 0.9, track: 'oval', sensorCount: 7, sensorRange: 2, sensorSpread: 120 };
  const r = scenarioReset(changed);
  assert.equal(r.lanes, DEFAULT_SETTINGS.lanes);
  assert.equal(r.density, DEFAULT_SETTINGS.density);
  assert.equal(r.track, DEFAULT_SETTINGS.track);
  assert.deepEqual([r.sensorCount, r.sensorRange, r.sensorSpread], [7, 2, 120]);
  assert.deepEqual(changed.sensorCount, 7); // no cambia lo recibido
});

test('comparisonFor: sensor3 con 0,49 en español y en inglés', () => {
  assert.equal(comparisonFor('sensor3', 0.49, 'es'), 'sensor3 > 0,49');
  assert.equal(comparisonFor({ sensor: 3 }, 0.49, 'en'), 'sensor3 > 0.49');
});

test('comparisonFor: velocidad en inglés es speed', () => {
  assert.equal(comparisonFor('velocidad', 0.5, 'en'), 'speed > 0.50');
  assert.equal(comparisonFor('speed', 0.5, 'es'), 'velocidad > 0,50');
});

test('comparisonFor: dos decimales, sin "-0,00"', () => {
  assert.equal(comparisonFor('sensor1', 1, 'es'), 'sensor1 > 1,00');
  assert.equal(comparisonFor('sensor1', 0.126, 'es'), 'sensor1 > 0,13');
  assert.equal(comparisonFor('speed', -0.004, 'es'), 'velocidad > 0,00');
  assert.equal(comparisonFor('speed', -0.25, 'en'), 'speed > -0.25');
});

test('comparisonFor: lo que escribe es una condición válida del lenguaje en cada idioma', () => {
  for (const [lang, rule] of [['es', 'si {c} entonces avanzar'], ['en', 'if {c} then forward']]) {
    const text = rule.replace('{c}', comparisonFor('sensor3', 0.49, lang));
    const p = parseProgram(text, { sensors: 5 });
    assert.equal(p.ok, true, `${lang}: ${text}`);
    assert.equal(p.rules, 1);
  }
});

test('insertAt: espacio antes solo si hace falta, y nunca dos', () => {
  assert.deepEqual(insertAt('si ', 3, 'sensor3 > 0,49'), { text: 'si sensor3 > 0,49 ', cursor: 18, insert: 'sensor3 > 0,49 ', from: 3, to: 3 });
  assert.equal(insertAt('si', 2, 'x > 1').text, 'si x > 1 ');
  assert.equal(insertAt('', 0, 'x > 1').text, 'x > 1 ');
  assert.equal(insertAt('avanzar\n', 8, 'x > 1').text, 'avanzar\nx > 1 ');
  assert.equal(insertAt('si  ', 4, 'x > 1').text, 'si  x > 1 ');
  assert.ok(!insertAt('si ', 3, 'x > 1').text.includes('  '));
});

test('insertAt: el cursor queda después del espacio final', () => {
  const a = insertAt('si  entonces', 3, 'x > 1');
  assert.equal(a.text, 'si x > 1 entonces');
  assert.equal(a.text.slice(0, a.cursor), 'si x > 1 ');
  const b = insertAt('si ', 3, 'x > 1');
  assert.equal(b.cursor, b.text.length);
});

test('insertAt: reemplaza la selección; mismas entradas, mismo resultado', () => {
  assert.equal(insertAt('si zzz entonces', 3, 'x > 1', 6).text, 'si x > 1 entonces');
  assert.deepEqual(insertAt('si ', 3, 'x > 1'), insertAt('si ', 3, 'x > 1'));
});

test('barras densas del auditor: las de "Dos alturas" de jerarquia-visual, con las de Reglas a mano', () => {
  const list = DENSE_SELECTOR.split(', ');
  for (const s of ['.topbar', '.inspect-controls', '.inspect-playbar', '.inspect-layer-head', '.compete-list', '.inspect-card-head',
    '.inspect-scene', '.library-item', '.inspect-rows', '.lab-tt', '.inspect-brain-head']) assert.ok(list.includes(s), s);
  // Filas de percepción y renglón de interruptores de la barra de marcha de Reglas a mano.
  for (const s of ['.sensor-rows', '.speed-row', '.rules-runbar-second']) assert.ok(list.includes(s), s);
  assert.equal(list.length, 14);
});

// Estado del programa en edición (design.md D6 y D7, tarea 5.1).
import test from 'node:test';
import assert from 'node:assert/strict';
import es from '../src/i18n/es.js';
import en from '../src/i18n/en.js';
import { createProgramState } from '../src/tabs/rules/program.js';
import { knownTexts } from '../src/tabs/rules/examples.js';

const known = knownTexts({ es, en });

test('un texto válido pasa a ser el programa válido', () => {
  const p = createProgramState({ text: 'avanzar', sensors: 5 });
  assert.equal(p.valid.statements.length, 1);
  const r = p.update('avanzar\nsi sensor3 > 0,5 entonces girar izquierda');
  assert.deepEqual(r, { ok: true, validChanged: true, behaviorChanged: true });
  assert.equal(p.valid.rules, 1);
  assert.equal(p.rules, 1);
  assert.deepEqual(p.errors, []);
  assert.equal(p.showsRunning, true);
});

test('un texto con error conserva el programa válido anterior y expone los errores', () => {
  const p = createProgramState({ text: 'avanzar', sensors: 5 });
  const before = p.valid;
  const r = p.update('avanzar\nsi sensor3 > 0,5 girar izquierda');
  assert.deepEqual(r, { ok: false, validChanged: false, behaviorChanged: false });
  assert.equal(p.valid, before);
  assert.deepEqual(p.errors, [{ line: 2, code: 'missingThen', details: {} }]);
  assert.equal(p.showsRunning, false);
  assert.equal(p.text, 'avanzar\nsi sensor3 > 0,5 girar izquierda');
  // corregir: los errores desaparecen y el programa nuevo pasa a regir
  p.update('avanzar\nsi sensor3 > 0,5 entonces girar izquierda');
  assert.deepEqual(p.errors, []);
  assert.equal(p.rules, 1);
});

test('sin ningún válido anterior, valid es null', () => {
  const p = createProgramState({ text: 'abanzar', sensors: 5 });
  assert.equal(p.valid, null);
  assert.equal(p.rules, 0);
  assert.deepEqual(p.errors, [{ line: 1, code: 'unknownWord', details: { word: 'abanzar', suggestion: 'avanzar' } }]);
});

test('el programa vacío es válido y pasa a regir', () => {
  const p = createProgramState({ text: 'avanzar', sensors: 5 });
  p.update('');
  assert.deepEqual(p.valid.statements, []);
  assert.equal(p.showsRunning, true);
});

test('cambiar la cantidad de sensores vuelve a analizar; si deja de valer, valid pasa a null', () => {
  const p = createProgramState({ text: 'si sensor5 > 0,5 entonces girar izquierda', sensors: 5 });
  assert.ok(p.valid);
  const r = p.setSensors(3);
  assert.equal(r.ok, false);
  assert.equal(p.valid, null);
  assert.deepEqual(p.errors, [{ line: 1, code: 'unknownSensor', details: { sensor: 5, count: 3 } }]);
  // volver a 5 sensores: el error desaparece y el programa vuelve a manejar
  p.setSensors(5);
  assert.ok(p.valid);
  assert.deepEqual(p.errors, []);
  // un texto con error que pasa a ser válido con más sensores
  const q = createProgramState({ text: 'si sensor7 > 0,5 entonces avanzar', sensors: 5 });
  assert.equal(q.valid, null);
  q.setSensors(7);
  assert.ok(q.valid);
});

test('constants lista las del programa válido', () => {
  const p = createProgramState({ text: 'cerca = 0,2\nborde = 0,7\navanzar', sensors: 5 });
  assert.deepEqual(p.constants.map((c) => c.name), ['cerca', 'borde']);
  p.update('cerca = 0,2\navanzar'); // se borra la definición de borde
  assert.deepEqual(p.constants.map((c) => c.name), ['cerca']);
  p.update('cerca = 0,2\nlejos = '); // con error: siguen las del último válido
  assert.deepEqual(p.constants.map((c) => c.name), ['cerca']);
});

test('isOwn es falso para el programa inicial y los ejemplos en los dos idiomas, y verdadero para otro texto', () => {
  assert.equal(known.length, 8);
  for (const text of known) assert.equal(createProgramState({ text, sensors: 20 }).isOwn(known), false);
  const p = createProgramState({ text: es['rules.program.initial'], sensors: 5 });
  p.update(`${es['rules.program.initial']}\navanzar`);
  assert.equal(p.isOwn(known), true);
  p.update(es['rules.program.initial'].replace('0,2', '0,3'));
  assert.equal(p.isOwn(known), true);
  p.update(`${es['rules.program.initial']}\n`); // un salto de línea final no lo vuelve propio
  assert.equal(p.isOwn(known), false);
  assert.equal(createProgramState({ text: '', sensors: 5 }).isOwn(known), true);
});

test('un comentario agregado corre las líneas pero no cambia lo que hace el programa', () => {
  const p = createProgramState({ text: 'avanzar\nsi sensor3 > 0,5 entonces girar izquierda', sensors: 5 });
  const r = p.update('# nuevo\navanzar\nsi sensor3 > 0,5 entonces girar izquierda');
  assert.deepEqual(r, { ok: true, validChanged: true, behaviorChanged: false });
  assert.deepEqual(p.update('# nuevo\navanzar\nsi sensor3 > 0,5 entonces girar izquierda'), { ok: true, validChanged: false, behaviorChanged: false });
});

// Controlador de reglas (spec `controladores`) y lenguaje sin navegador (spec `reglas`).
import test from 'node:test';
import assert from 'node:assert/strict';
import { parseProgram, createRulesController } from '../src/core/rules.js';
import { createWorld } from '../src/core/world.js';
import { constantController, isController } from '../src/core/controller.js';

const program = (text, sensors = 5) => {
  const r = parseProgram(text, { sensors });
  assert.equal(r.ok, true, JSON.stringify(r.errors));
  return r.program;
};
const perception = (sensors = [0, 0, 0, 0, 0], speed = 0) => ({ sensors, speed });

test('Programa convertido en controles: `avanzar` y una regla que gira a la derecha que se cumple', () => {
  const c = createRulesController({ program: program('avanzar\nsi sensor1 > 0,5 entonces girar derecha') });
  assert.deepEqual(c.control(perception([0.8, 0, 0, 0, 0])), { forward: true, reverse: false, left: false, right: true });
  assert.deepEqual(c.controls, { forward: true, reverse: false, left: false, right: true });
  assert.deepEqual(c.activeLines, [1, 2]);
});

test('Mismo trato que cualquier controlador: el mundo lo acepta sin cambios y lo maneja', () => {
  const c = createRulesController({ program: program('avanzar') });
  assert.equal(isController(c), true);
  const world = createWorld({ seed: 2, controller: c });
  assert.equal(world.controller, c);
  for (let i = 0; i < 60; i += 1) world.step();
  assert.ok(world.progress > 0);
});

test('Decisión repetible: la misma percepción da los mismos controles', () => {
  const c = createRulesController({ program: program('si sensor3 > 0,5 entonces retroceder\nsi velocidad < 0,2 entonces avanzar') });
  const p = perception([0, 0, 0.7, 0, 0], 0.1);
  const first = c.control(p);
  c.control(perception([1, 1, 1, 1, 1], 1));
  assert.deepEqual(c.control(p), first);
  assert.deepEqual(first, { forward: true, reverse: true, left: false, right: false });
});

test('Reemplazar el programa en marcha: desde el paso siguiente maneja el nuevo, sin reiniciar', () => {
  const c = createRulesController({ program: program('avanzar') });
  const world = createWorld({ seed: 2, controller: c });
  for (let i = 0; i < 60; i += 1) world.step();
  const steps = world.steps;
  const progress = world.progress;
  c.setProgram(program('girar izquierda'));
  world.step();
  assert.equal(world.steps, steps + 1); // no se reinició
  assert.ok(world.progress > progress - 1);
  assert.deepEqual(c.controls, { forward: false, reverse: false, left: true, right: false });
  assert.equal(c.program.statements[0].control, 'left');
});

test('Sin programa válido: no acciona ningún control', () => {
  const c = createRulesController();
  assert.equal(c.program, null);
  assert.deepEqual(c.control(perception([1, 1, 1, 1, 1], 1)), { forward: false, reverse: false, left: false, right: false });
  assert.deepEqual(c.activeLines, []);
  const d = createRulesController({ program: program('avanzar') });
  d.control(perception());
  d.setProgram(null);
  assert.deepEqual(d.control(perception()), { forward: false, reverse: false, left: false, right: false });
});

test('Sensor de más: para un auto de 5 sensores, `sensor9` no se acepta y se informa que tiene 5', () => {
  const r = parseProgram('si sensor9 > 0,5 entonces avanzar', { sensors: 5 });
  assert.equal(r.ok, false);
  assert.deepEqual(r.errors, [{ line: 1, code: 'unknownSensor', details: { sensor: 9, count: 5 } }]);
});

test('Programa que maneja en una simulación sin navegador: `avanzar` avanza igual que un controlador constante', () => {
  const rules = createWorld({ seed: 3, controller: createRulesController({ program: program('avanzar') }) });
  const constant = createWorld({ seed: 3, controller: constantController({ forward: true }) });
  for (let i = 0; i < 300; i += 1) {
    rules.step();
    constant.step();
  }
  assert.deepEqual(rules.snapshot(), constant.snapshot());
  assert.ok(rules.progress > 50);
  assert.equal(rules.snapshot().car.angle, 0); // en línea recta
});

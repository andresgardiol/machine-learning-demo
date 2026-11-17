// Misión en curso (tarjeta-de-consigna D2): la primera sin cumplir, todas cumplidas o ninguna.
import test from 'node:test';
import assert from 'node:assert/strict';
import { currentMission } from '../src/ui/current-mission.js';

const list = (...done) => done.map((d, i) => ({ id: `m${i}`, done: d }));

test('sin cumplir ninguna, devuelve la primera', () => {
  const ms = list(false, false, false);
  assert.equal(currentMission(ms), ms[0]);
});

test('con la primera cumplida, devuelve la segunda aunque la tercera también esté cumplida', () => {
  const ms = list(true, false, true);
  assert.equal(currentMission(ms), ms[1]);
});

test('con todas cumplidas, devuelve allDone', () => {
  assert.deepEqual(currentMission(list(true, true, true)), { allDone: true });
});

test('sin misiones disponibles en el modo, devuelve null', () => {
  assert.equal(currentMission(list(false, false), { available: false }), null);
  assert.equal(currentMission(list(true, true), { available: false }), null);
});

test('con la lista vacía, devuelve null', () => {
  assert.equal(currentMission([]), null);
  assert.equal(currentMission([], { available: true }), null);
});

test('la misma lista da el mismo resultado', () => {
  const ms = list(true, false, false);
  assert.equal(currentMission(ms), currentMission(ms));
  assert.deepEqual(currentMission(list(true, true)), currentMission(list(true, true)));
});

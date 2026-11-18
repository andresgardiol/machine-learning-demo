// A mano primero en Compuertas (red-al-centro D8, tarea 7.4).
import test from 'node:test';
import assert from 'node:assert/strict';
import { createHandFirst, handFirstNow, HAND_TRIES } from '../src/tabs/lab/hand-first.js';
import { mainAction } from '../src/ui/main-action.js';

test('estado por defecto: en Compuertas no hay acción principal; en Puntos y Tu manejo, Reproducir', () => {
  const h = createHandFirst();
  assert.equal(handFirstNow('gates', h), true);
  assert.equal(mainAction('lab', { handFirst: true }), null);
  assert.equal(handFirstNow('points', h), false);
  assert.equal(handFirstNow('driving', h), false);
  assert.equal(mainAction('lab', { handFirst: false }), 'run');
  assert.equal(h.touched, false);
});

test('resuelta a mano: Reproducir pasa a principal en el cambio que deja la tabla en 4 de 4', () => {
  const h = createHandFirst();
  h.change({ gesture: 'g1', solved: false });
  assert.equal(h.touched, true);
  assert.equal(h.done, false);
  h.change({ gesture: 'g2', solved: true });
  assert.equal(h.reason, 'solved');
  assert.equal(handFirstNow('gates', h), false);
});

test(`${HAND_TRIES} cambios sin resolver; un arrastre es un solo cambio`, () => {
  const h = createHandFirst();
  for (let k = 0; k < 10; k++) h.change({ gesture: 'arrastre', solved: false });
  assert.equal(h.changes, 1);
  for (let k = 0; k < HAND_TRIES - 2; k++) h.change({ gesture: null, solved: false });
  assert.equal(h.done, false);
  h.change({ gesture: null, solved: false });
  assert.equal(h.reason, 'tries');
});

test('ver una solución; restablecer los datos vuelve a empezar a mano', () => {
  const h = createHandFirst();
  h.showSolution();
  assert.equal(h.reason, 'solution');
  h.reset();
  assert.equal(h.done, false);
  assert.equal(h.touched, false);
});

test('determinismo: el mismo recorrido cambia en el mismo cambio', () => {
  const recorrido = [false, false, false, true];
  const run = () => { const h = createHandFirst(); return recorrido.findIndex((s, k) => { h.change({ gesture: `g${k}`, solved: s }); return h.done; }); };
  assert.equal(run(), 3);
  assert.equal(run(), run());
});

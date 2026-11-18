// La franja de cambios aparece solo con cambios y no corre la red durante un arrastre (red-al-centro D3, tarea 6.2).
import test from 'node:test';
import assert from 'node:assert/strict';
import { stripState } from '../src/tabs/shared/changes-strip.js';

test('sin cambios no se ve; con cambios, sí', () => {
  assert.equal(stripState({ count: 0, dragging: false, wasShown: false, reserve: false }), 'none');
  assert.equal(stripState({ count: 3, dragging: false, wasShown: false, reserve: true }), 'shown');
});

test('el primer cambio en medio de un arrastre: la franja espera a que se suelte', () => {
  assert.equal(stripState({ count: 1, dragging: true, wasShown: false, reserve: true }), 'none');
  assert.equal(stripState({ count: 1, dragging: false, wasShown: false, reserve: true }), 'shown');
});

test('después de aparecer, sin cambios en este cerebro pero sí en la sesión, reserva su alto sin verse', () => {
  assert.equal(stripState({ count: 0, dragging: false, wasShown: true, reserve: true }), 'reserved');
  assert.equal(stripState({ count: 0, dragging: false, wasShown: true, reserve: false }), 'none');
  // Ya a la vista, un arrastre no la saca.
  assert.equal(stripState({ count: 2, dragging: true, wasShown: true, reserve: true }), 'shown');
});

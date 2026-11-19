import test from 'node:test';
import assert from 'node:assert/strict';
import { isSmallTarget, hasLetters, overflows, tooManyPrimary, MIN_TARGET } from '../../src/v2/audit.js';

test('v2/auditoría: objetivos de menos de 24×24 px; los deslizadores cuentan por el ancho', () => {
  assert.equal(MIN_TARGET, 24);
  assert.equal(isSmallTarget({ width: 23.9, height: 30 }), true);
  assert.equal(isSmallTarget({ width: 30, height: 20 }), true);
  assert.equal(isSmallTarget({ width: 24, height: 24 }), false);
  assert.equal(isSmallTarget({ width: 200, height: 16 }, { range: true }), false);
});

test('v2/auditoría: textos con letras', () => {
  assert.equal(hasLetters('Pausar'), true);
  assert.equal(hasLetters('142'), false);
  assert.equal(hasLetters('50 %'), false);
  assert.equal(hasLetters('−0,21'), false);
});

test('v2/auditoría: zonas que desbordan', () => {
  assert.equal(overflows({ scrollHeight: 680, clientHeight: 639 }), true);
  assert.equal(overflows({ scrollHeight: 639, clientHeight: 639 }), false);
  assert.equal(overflows({ scrollHeight: 10, clientHeight: 10, scrollWidth: 120, clientWidth: 100 }), true);
});

test('v2/auditoría: más de una acción principal', () => {
  assert.equal(tooManyPrimary(0), false);
  assert.equal(tooManyPrimary(1), false);
  assert.equal(tooManyPrimary(2), true);
});

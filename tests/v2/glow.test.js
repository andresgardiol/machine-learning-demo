import test from 'node:test';
import assert from 'node:assert/strict';
import { raySegments, withAlpha, createGlow } from '../../src/v2/render/glow.js';

test('v2/brillo: los rayos llegan hasta lo que detectan, o hasta su alcance', () => {
  const o = { x: 0, y: 0 };
  const segs = raySegments([{ origin: o, end: { x: 0, y: 10 }, hit: { x: 0, y: 4 } }, { origin: o, end: { x: 5, y: 5 }, hit: null }]);
  assert.deepEqual(segs.map((s) => s.to), [{ x: 0, y: 4 }, { x: 5, y: 5 }]);
});

test('v2/brillo: color con transparencia', () => {
  assert.equal(withAlpha('#fff3b0', 0.5), 'rgba(255,243,176,0.5)');
  assert.equal(withAlpha('rojo', 0.2), 'rgba(255,255,255,0.2)');
});

test('v2/brillo: el auto chocado no lleva brillo (la forma del choque no cambia)', () => {
  let llamadas = 0;
  const ctx = new Proxy({}, { get: () => () => { llamadas += 1; }, set: () => true });
  createGlow({ colors: () => ({ sensor: '#8fd3ff', headlight: '#fff3b0' }) }).draw(ctx, { car: { crashed: true, position: { x: 0, y: 0 }, angle: 0 }, rays: [], zoom: 10 });
  assert.equal(llamadas, 0);
});

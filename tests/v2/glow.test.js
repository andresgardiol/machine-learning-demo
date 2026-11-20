import test from 'node:test';
import assert from 'node:assert/strict';
import { raySegments, withAlpha, createGlow, exceptCar } from '../../src/v2/render/glow.js';

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

test('v2/brillo: el recorte de los rayos deja afuera exactamente el rectángulo del auto (vehiculos-ilustrados D9)', async () => {
  const { CAR_LENGTH, CAR_WIDTH } = await import('../../src/core/constants.js');
  const pts = [];
  const rects = [];
  const ctx = { rect: (...a) => rects.push(a), moveTo: (x, y) => pts.push([x, y]), lineTo: (x, y) => pts.push([x, y]), closePath() {} };
  exceptCar(ctx, { position: { x: 10, y: -3 }, angle: Math.PI / 2 }, 1000);
  assert.equal(rects.length, 1, 'el cuadrado de afuera');
  assert.equal(pts.length, 4, 'las cuatro esquinas del auto');
  // Girado 90°: el largo queda en y, el ancho en x.
  const xs = pts.map((p) => p[0]); const ys = pts.map((p) => p[1]);
  assert.ok(Math.abs(Math.max(...xs) - Math.min(...xs) - CAR_WIDTH) < 1e-9);
  assert.ok(Math.abs(Math.max(...ys) - Math.min(...ys) - CAR_LENGTH) < 1e-9);
});

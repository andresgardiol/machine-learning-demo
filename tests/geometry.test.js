import test from 'node:test';
import assert from 'node:assert/strict';
import {
  segmentIntersection, rectCorners, contoursTouch, normalize, length, fromAngle, leftOf, outline,
} from '../src/core/geometry.js';

const near = (a, b, eps = 1e-9) => assert.ok(Math.abs(a - b) < eps, `${a} no es ${b}`);

test('segmentos que se cruzan: devuelve el punto y los parámetros', () => {
  const hit = segmentIntersection({ x: 0, y: 0 }, { x: 10, y: 10 }, { x: 0, y: 10 }, { x: 10, y: 0 });
  assert.ok(hit);
  near(hit.point.x, 5); near(hit.point.y, 5);
  near(hit.t, 0.5); near(hit.u, 0.5);
});

test('segmentos que no se cruzan (las rectas sí, los segmentos no)', () => {
  const hit = segmentIntersection({ x: 0, y: 0 }, { x: 1, y: 1 }, { x: 0, y: 10 }, { x: 10, y: 0 });
  assert.equal(hit, null);
});

test('segmentos paralelos: sin intersección', () => {
  assert.equal(segmentIntersection({ x: 0, y: 0 }, { x: 10, y: 0 }, { x: 0, y: 1 }, { x: 10, y: 1 }), null);
  assert.equal(segmentIntersection({ x: 0, y: 0 }, { x: 10, y: 0 }, { x: 5, y: 0 }, { x: 15, y: 0 }), null);
});

test('segmentos que se tocan en un extremo cuentan como cruce', () => {
  const hit = segmentIntersection({ x: 0, y: 0 }, { x: 5, y: 5 }, { x: 5, y: 5 }, { x: 10, y: 0 });
  assert.ok(hit);
  assert.equal(hit.t, 1);
  assert.ok(hit.u === 0); // === trata -0 y 0 como iguales
});

test('rectángulo: 2 m x 4 m hacia +x tiene sus esquinas en su lugar', () => {
  const c = rectCorners({ x: 0, y: 0 }, 0, 4, 2);
  assert.deepEqual(c.map((p) => [p.x, p.y]), [[2, 1], [2, -1], [-2, -1], [-2, 1]]);
});

test('rectángulo rotado 90 grados apunta hacia +y', () => {
  const c = rectCorners({ x: 10, y: 10 }, Math.PI / 2, 4, 2);
  near(c[0].x, 9); near(c[0].y, 12);
  near(c[1].x, 11); near(c[1].y, 12);
});

test('contornos que se cruzan se tocan', () => {
  const a = rectCorners({ x: 0, y: 0 }, 0, 4, 2);
  const b = rectCorners({ x: 3, y: 0 }, 0, 4, 2);
  assert.equal(contoursTouch(a, b), true);
});

test('contornos separados no se tocan', () => {
  const a = rectCorners({ x: 0, y: 0 }, 0, 4, 2);
  const b = rectCorners({ x: 4.5, y: 0 }, 0, 4, 2);
  assert.equal(contoursTouch(a, b), false);
});

test('contornos que justo se tocan por un lado cuentan como contacto', () => {
  const a = rectCorners({ x: 0, y: 0 }, 0, 4, 2);
  const b = rectCorners({ x: 4, y: 0 }, 0, 4, 2);
  assert.equal(contoursTouch(a, b), true);
});

test('un contorno dentro de otro se toca', () => {
  const big = rectCorners({ x: 0, y: 0 }, 0, 10, 10);
  const small = rectCorners({ x: 0, y: 0 }, 0, 1, 1);
  assert.equal(contoursTouch(big, small), true);
  assert.equal(contoursTouch(small, big), true);
});

test('vectores auxiliares', () => {
  assert.deepEqual(normalize({ x: 3, y: 4 }), { x: 0.6, y: 0.8 });
  assert.deepEqual(normalize({ x: 0, y: 0 }), { x: 0, y: 0 });
  assert.equal(length({ x: 3, y: 4 }), 5);
  near(fromAngle(Math.PI).x, -1);
  assert.deepEqual(leftOf({ x: 1, y: 0 }), { x: -0, y: 1 });
  assert.equal(outline(rectCorners({ x: 0, y: 0 }, 0, 4, 2)).length, 4);
});

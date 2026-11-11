import test from 'node:test';
import assert from 'node:assert/strict';
import {
  retarget, advanceBlend, blendTarget, NO_BLEND, FOCUS_BLEND_SECONDS, FOCUS_JUMP_METERS,
} from '../src/render/camera.js';

const close = (a, b, eps = 1e-9) => assert.ok(Math.abs(a - b) < eps, `${a} ≈ ${b}`);

test('cambio de foco cercano: el objetivo de la cámara no salta en el instante del cambio', () => {
  const from = { x: 120, y: 2 };
  const to = { x: 126, y: -2 };
  const blend = retarget(NO_BLEND, from, to);
  assert.deepEqual(blendTarget(to, blend), from);
  assert.equal(blend.remaining, FOCUS_BLEND_SECONDS);
  assert.equal(FOCUS_BLEND_SECONDS, 0.3);
});

test('la diferencia se reduce de forma continua hasta cero en 0,3 segundos', () => {
  let blend = retarget(NO_BLEND, { x: 100, y: 0 }, { x: 110, y: 4 });
  const sizes = [Math.hypot(blend.offset.x, blend.offset.y)];
  for (let i = 0; i < 18; i++) { // 18 cuadros de 1/60 s = 0,3 s
    blend = advanceBlend(blend, 1 / 60);
    sizes.push(Math.hypot(blend.offset.x, blend.offset.y));
  }
  for (let i = 1; i < sizes.length; i++) assert.ok(sizes[i] < sizes[i - 1] || sizes[i] === 0, `cuadro ${i}`);
  close(sizes[9], sizes[0] / 2, 1e-6); // a mitad de camino queda la mitad
  assert.equal(sizes[sizes.length - 1], 0);
  assert.deepEqual(blend, NO_BLEND);
  assert.deepEqual(blendTarget({ x: 3, y: 4 }, blend), { x: 3, y: 4 });
});

test('un salto de más de 50 metros es inmediato', () => {
  assert.equal(FOCUS_JUMP_METERS, 50);
  assert.deepEqual(retarget(NO_BLEND, { x: 0, y: 0 }, { x: 51, y: 0 }), NO_BLEND);
  assert.notDeepEqual(retarget(NO_BLEND, { x: 0, y: 0 }, { x: 49, y: 0 }), NO_BLEND);
});

test('dos cambios seguidos: el segundo parte de donde estaba la cámara', () => {
  const a = { x: 0, y: 0 };
  const b = { x: 10, y: 0 };
  const c = { x: 15, y: 3 };
  let blend = retarget(NO_BLEND, a, b);
  blend = advanceBlend(blend, 0.1);
  const before = blendTarget(b, blend);
  blend = retarget(blend, b, c);
  const after = blendTarget(c, blend);
  close(after.x, before.x);
  close(after.y, before.y);
  assert.equal(blend.remaining, FOCUS_BLEND_SECONDS);
});

test('sin cambio de foco no hay retraso, a cualquier velocidad de la simulación', () => {
  assert.deepEqual(advanceBlend(NO_BLEND, 0.016), NO_BLEND);
  assert.deepEqual(blendTarget({ x: 500, y: 1 }, NO_BLEND), { x: 500, y: 1 });
  // Un cuadro largo termina la transición de una vez.
  assert.deepEqual(advanceBlend(retarget(NO_BLEND, { x: 0, y: 0 }, { x: 5, y: 0 }), 1), NO_BLEND);
});

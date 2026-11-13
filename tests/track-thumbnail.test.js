// Miniaturas del trazado de cada pista (panel-de-entrenar-por-vistas D5 y D11), sin DOM.
import test from 'node:test';
import assert from 'node:assert/strict';
import { TRACK_IDS } from '../src/core/circuits.js';
import { thumbnail, THUMB_SIZE } from '../src/render/track-thumbnail.js';

test('miniaturas: una por pista, dentro del recuadro de 40×28; la calle recta es un segmento vertical', () => {
  for (const id of TRACK_IDS) {
    const { points, closed } = thumbnail(id);
    assert.equal(closed, id !== 'straight', id);
    for (const p of points) {
      assert.ok(p.x >= 0 && p.x <= THUMB_SIZE.width && p.y >= 0 && p.y <= THUMB_SIZE.height, `${id}: ${p.x},${p.y}`);
    }
    if (closed) assert.deepEqual(points[0], points[points.length - 1]);
  }
  const straight = thumbnail('straight').points;
  assert.equal(straight.length, 2);
  assert.equal(straight[0].x, straight[1].x);
  // Hacia arriba, como en el escenario: el segundo punto queda más arriba que el primero.
  assert.ok(straight[1].y < straight[0].y);
});

test('miniaturas: los circuitos salen con la recta de salida vertical y hacia arriba, como en el escenario', () => {
  for (const id of ['oval', 'kidney', 'grandPrix']) {
    const [a, b] = thumbnail(id).points;
    assert.ok(Math.abs(a.x - b.x) < 0.2, `${id}: la salida no es vertical (${a.x} → ${b.x})`);
    assert.ok(b.y < a.y, `${id}: la salida no va hacia arriba`);
  }
  assert.strictEqual(thumbnail('oval'), thumbnail('oval')); // se calcula una sola vez
});

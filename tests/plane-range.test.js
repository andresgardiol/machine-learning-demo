// Rango del plano (laboratorio-empieza-por-compuertas D2): [−1, 1] como siempre y [−0,5; 1,5] con compuertas.
import test from 'node:test';
import assert from 'node:assert/strict';
import { planeGeometry, planeToPx, pxToPlane, nudgeProbe, planeGrid } from '../src/render/plane-view.js';
import { neuronGrid } from '../src/core/backprop.js';
import { createNetwork } from '../src/core/network.js';
import { createRandom } from '../src/core/random.js';

test('con [−1, 1] (por defecto) la conversión no cambia', () => {
  const g = planeGeometry(400, 300);
  assert.deepEqual(g, planeGeometry(400, 300, [-1, 1]));
  assert.deepEqual(planeToPx(g, -1, 1), { x: 50, y: 0 });
  assert.deepEqual(planeToPx(g, 0, 0), { x: 200, y: 150 });
  assert.deepEqual(planeToPx(g, 1, -1), { x: 350, y: 300 });
  assert.deepEqual(pxToPlane(g, 200, 150), { x: 0, y: 0 });
  assert.deepEqual(pxToPlane(g, 0, 400), { x: -1, y: -1 }, 'tope en −1 y 1');
  // Una geometría vieja sin rango (sin lo ni hi) sigue valiendo [−1, 1].
  assert.deepEqual(planeToPx({ ox: 50, oy: 0, side: 300 }, 1, 1), { x: 350, y: 0 });
});

test('con [−0,5; 1,5] los cuatro casos quedan adentro, a un cuarto del borde', () => {
  const g = planeGeometry(400, 400, [-0.5, 1.5]);
  assert.deepEqual(planeToPx(g, 0, 0), { x: 100, y: 300 });
  assert.deepEqual(planeToPx(g, 1, 1), { x: 300, y: 100 });
  assert.deepEqual(planeToPx(g, 0, 1), { x: 100, y: 100 });
  assert.deepEqual(pxToPlane(g, 300, 300), { x: 1, y: 0 });
  assert.deepEqual(pxToPlane(g, -20, 999), { x: -0.5, y: -0.5 }, 'tope en −0,5');
  assert.deepEqual(pxToPlane(g, 999, -20), { x: 1.5, y: 1.5 }, 'tope en 1,5');
  assert.deepEqual(nudgeProbe({ x: 1.48, y: -0.48 }, 'ArrowRight', false, [-0.5, 1.5]), { x: 1.5, y: -0.48 });
  assert.deepEqual(nudgeProbe({ x: 1, y: -0.48 }, 'ArrowDown', false, [-0.5, 1.5]), { x: 1, y: -0.5 });
});

test('la grilla del fondo y los mapas recorren el rango pedido', () => {
  // Una red sin capas ocultas con peso 1 en x y nada más: el fondo sube de izquierda a derecha.
  const net = createNetwork({ inputs: 2, hidden: [], outputs: 1, random: createRandom(1) });
  net.layers[0] = { weights: [[1, 0]], biases: [0] };
  const n = 4;
  const sig = (x) => 1 / (1 + Math.exp(-x));
  const a = planeGrid(net, n, null, [-0.5, 1.5]);
  // Centros de las columnas: −0,25, 0,25, 0,75 y 1,25.
  [-0.25, 0.25, 0.75, 1.25].forEach((x, c) => assert.ok(Math.abs(a[c] - sig(x)) < 1e-6));
  const b = neuronGrid(net, n, null, [-0.5, 1.5]);
  assert.deepEqual(Array.from(b.layers[1][0]), Array.from(a));
  assert.deepEqual(Array.from(planeGrid(net, n)), Array.from(neuronGrid(net, n).layers[1][0]), 'por defecto, [−1, 1] en los dos');
});

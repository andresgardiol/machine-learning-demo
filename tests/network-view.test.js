import test from 'node:test';
import assert from 'node:assert/strict';
import { layoutNetwork, weightStyle, levelLook, activity, LAYOUT, OUTPUT_KEYS } from '../src/render/network-view.js';

const ZONE = { width: 340, height: 240 };

test('red de 6 entradas, 6 ocultas y 4 salidas: tres columnas de 6, 6 y 4 nodos, 36 y 24 líneas', () => {
  const l = layoutNetwork({ sizes: [6, 6, 4], ...ZONE });
  assert.deepEqual(l.columns.map((c) => c.nodes.length), [6, 6, 4]);
  assert.deepEqual(l.links, [36, 24]);
  // Columnas de izquierda a derecha.
  assert.ok(l.columns[0].x < l.columns[1].x && l.columns[1].x < l.columns[2].x);
  // Los nodos de una columna van de arriba abajo, sin superponerse.
  for (const c of l.columns) for (let i = 1; i < c.nodes.length; i++) assert.ok(c.nodes[i].y - c.nodes[i - 1].y > 2 * l.radius);
});

test('cambio de forma: con dos capas ocultas el diagrama tiene cuatro columnas', () => {
  const l = layoutNetwork({ sizes: [6, 6, 8, 4], ...ZONE });
  assert.equal(l.columns.length, 4);
  assert.deepEqual(l.links, [36, 48, 32]);
  const none = layoutNetwork({ sizes: [6, 4], ...ZONE });
  assert.equal(none.columns.length, 2);
  assert.deepEqual(none.links, [24]);
});

test('rótulos con 5 sensores: sensores 1 a 5 y la velocidad; salidas: los cuatro controles', () => {
  const l = layoutNetwork({ sizes: [6, 6, 4], ...ZONE });
  assert.deepEqual(l.inputLabels.map((x) => (x.kind === 'speed' ? 'speed' : x.n)), [1, 2, 3, 4, 5, 'speed']);
  assert.deepEqual(l.outputLabels.map((x) => x.key), ['forward', 'left', 'right', 'reverse']);
  assert.deepEqual([...OUTPUT_KEYS], ['forward', 'left', 'right', 'reverse']);
  // Cada rótulo está a la altura de su nodo.
  for (const lab of [...l.inputLabels]) assert.equal(lab.y, l.columns[0].nodes[lab.index].y);
  for (const lab of l.outputLabels) assert.equal(lab.y, l.columns[2].nodes[lab.index].y);
});

test('muchas entradas: con 60 sensores los rótulos se resumen sin superponerse y la velocidad conserva el suyo', () => {
  const l = layoutNetwork({ sizes: [61, 6, 4], ...ZONE });
  const sensors = l.inputLabels.filter((x) => x.kind === 'sensor');
  assert.ok(sensors.length < 60 && sensors.length >= 5, `rótulos de sensores: ${sensors.length}`);
  assert.equal(sensors[0].n, 1);
  const ys = l.inputLabels.map((x) => x.y);
  for (let i = 1; i < ys.length; i++) assert.ok(ys[i] - ys[i - 1] >= LAYOUT.minLabelGap, `rótulos ${i - 1} y ${i}`);
  assert.equal(l.inputLabels[l.inputLabels.length - 1].kind, 'speed');
  assert.equal(l.outputLabels.length, 4);
});

test('red máxima (101 entradas, tres capas de 16): cabe completa en su zona', () => {
  const l = layoutNetwork({ sizes: [101, 16, 16, 16, 4], ...ZONE });
  assert.equal(l.columns.length, 5);
  assert.equal(l.columns[0].nodes.length, 101);
  for (const c of l.columns) {
    for (const n of c.nodes) {
      assert.ok(n.x - l.radius >= 0 && n.x + l.radius <= ZONE.width, `x ${n.x}`);
      assert.ok(n.y - l.radius >= 0 && n.y + l.radius <= ZONE.height, `y ${n.y}`);
    }
  }
  for (const lab of [...l.inputLabels, ...l.outputLabels]) assert.ok(lab.y >= 0 && lab.y <= ZONE.height && lab.x >= 0 && lab.x <= ZONE.width);
  assert.deepEqual(l.links, [1616, 256, 256, 64]);
});

test('pesos visibles: 0,9 positivo y marcado; -0,1 negativo, punteado y tenue', () => {
  const strong = weightStyle(0.9);
  const weak = weightStyle(-0.1);
  assert.deepEqual(strong, { sign: 'positive', level: 4, dashed: false });
  assert.deepEqual(weak, { sign: 'negative', level: 1, dashed: true });
  assert.ok(levelLook(strong.level).width > levelLook(weak.level).width);
  assert.ok(levelLook(strong.level).alpha > 0.8 && levelLook(weak.level).alpha < 0.4);
  assert.equal(weightStyle(0).level, 0);
  assert.equal(weightStyle(-3).level, 4);
});

test('sesgo -0,8: aspecto de valor negativo y bien marcado', () => {
  assert.deepEqual(weightStyle(-0.8), { sign: 'negative', level: 4, dashed: true });
});

test('actividad: entre 0 y 1 según el valor del nodo', () => {
  assert.equal(activity(0), 0);
  assert.equal(activity(1), 1);
  assert.equal(activity(0.8), 0.8);
  assert.equal(activity(-0.5), 0.5);
  assert.equal(activity(7), 1);
});

import test from 'node:test';
import assert from 'node:assert/strict';
import { layoutInspector, hitNeuron, neighborOf, INSPECTOR_LAYOUT } from '../src/render/inspector-layout.js';
import { linkRole, contributionBucket } from '../src/render/network-inspector.js';
import { LAYOUT } from '../src/render/network-view.js';

const ZONE = { width: 700, height: 560 };

test('red de 6, 6 y 4: tres columnas de izquierda a derecha, con lugar arriba para los encabezados', () => {
  const l = layoutInspector({ sizes: [6, 6, 4], ...ZONE });
  assert.deepEqual(l.columns.map((c) => c.nodes.length), [6, 6, 4]);
  assert.ok(l.columns[0].x < l.columns[1].x && l.columns[1].x < l.columns[2].x);
  assert.equal(l.columns[0].x, INSPECTOR_LAYOUT.labelLeft);
  assert.equal(l.columns[2].x, ZONE.width - INSPECTOR_LAYOUT.labelRight);
  for (const c of l.columns) {
    for (const n of c.nodes) assert.ok(n.y - l.radius >= INSPECTOR_LAYOUT.header, 'ninguna neurona bajo los encabezados');
    for (let i = 1; i < c.nodes.length; i++) assert.ok(c.nodes[i].y - c.nodes[i - 1].y > 2 * l.radius);
  }
  assert.ok(l.radius <= INSPECTOR_LAYOUT.maxRadius);
});

test('la red más grande (21, 16, 16, 16, 4): cinco columnas sin encimarse, rótulos de entradas de a saltos y la velocidad', () => {
  const l = layoutInspector({ sizes: [21, 16, 16, 16, 4], ...ZONE });
  assert.equal(l.columns.length, 5);
  for (const c of l.columns) for (let i = 1; i < c.nodes.length; i++) assert.ok(c.nodes[i].y - c.nodes[i - 1].y > 2 * l.radius);
  const speed = l.inputLabels.at(-1);
  assert.equal(speed.kind, 'speed');
  for (let k = 1; k < l.inputLabels.length; k++) assert.ok(l.inputLabels[k].y - l.inputLabels[k - 1].y >= LAYOUT.minLabelGap);
  assert.deepEqual(l.outputLabels.map((x) => x.key), ['forward', 'left', 'right', 'reverse']);
});

test('capa resumida: una columna angosta de cuadritos pegados y las demás ganan lugar', () => {
  const open = layoutInspector({ sizes: [6, 16, 16, 4], ...ZONE });
  const col = layoutInspector({ sizes: [6, 16, 16, 4], ...ZONE, collapsed: [false, true, false, false] });
  const c1 = col.columns[1];
  assert.equal(c1.collapsed, true);
  assert.equal(c1.nodes.length, 16);
  for (let i = 1; i < 16; i++) assert.ok(Math.abs(c1.nodes[i].y - c1.nodes[i - 1].y - c1.side) < 1e-9, 'pegados');
  // El hueco entre las dos capas abiertas creció.
  assert.ok(col.columns[3].x - col.columns[2].x > open.columns[3].x - open.columns[2].x);
});

test('entradas y salidas resumidas: sin rótulos dibujados (se leen al posar el cursor o con el foco)', () => {
  const l = layoutInspector({ sizes: [6, 6, 4], ...ZONE, collapsed: [true, false, true] });
  assert.deepEqual(l.inputLabels, []);
  assert.deepEqual(l.outputLabels, []);
  assert.ok(l.columns[0].x < INSPECTOR_LAYOUT.labelLeft);
});

test('detección: el clic sobre una neurona la encuentra; en un lugar vacío, nada', () => {
  const l = layoutInspector({ sizes: [6, 6, 4], ...ZONE });
  const n = l.columns[1].nodes[3];
  assert.deepEqual(hitNeuron(l, { x: n.x + 1, y: n.y - 1 }), { layer: 1, neuron: 3 });
  assert.deepEqual(hitNeuron(l, { x: n.x + l.radius + 2, y: n.y }), { layer: 1, neuron: 3 });
  assert.equal(hitNeuron(l, { x: (l.columns[0].x + l.columns[1].x) / 2, y: 5 }), null);
});

test('detección acercada: la tolerancia se mide en píxeles de pantalla', () => {
  const l = layoutInspector({ sizes: [6, 6, 4], ...ZONE });
  const n = l.columns[1].nodes[0];
  const off = { x: n.x + l.radius + 3, y: n.y };
  assert.ok(hitNeuron(l, off, 1));
  assert.equal(hitNeuron(l, off, 4), null);
});

test('detección en una capa resumida: el cuadrito que contiene el punto', () => {
  const l = layoutInspector({ sizes: [6, 16, 4], ...ZONE, collapsed: [false, true, false] });
  const sq = l.columns[1].nodes[9];
  assert.deepEqual(hitNeuron(l, { x: sq.x, y: sq.y + l.columns[1].side * 0.4 }), { layer: 1, neuron: 9 });
});

test('foco con flechas: arriba y abajo en la capa, izquierda y derecha entre capas', () => {
  const sizes = [21, 16, 4];
  assert.deepEqual(neighborOf(sizes, { layer: 1, neuron: 0 }, 'ArrowUp'), { layer: 1, neuron: 0 });
  assert.deepEqual(neighborOf(sizes, { layer: 1, neuron: 0 }, 'ArrowDown'), { layer: 1, neuron: 1 });
  assert.deepEqual(neighborOf(sizes, { layer: 1, neuron: 15 }, 'ArrowRight'), { layer: 2, neuron: 3 });
  assert.deepEqual(neighborOf(sizes, { layer: 0, neuron: 20 }, 'ArrowLeft'), { layer: 0, neuron: 20 });
  assert.deepEqual(neighborOf(sizes, { layer: 2, neuron: 1 }, 'End'), { layer: 2, neuron: 3 });
  assert.equal(neighborOf(sizes, { layer: 2, neuron: 1 }, 'KeyA'), null);
});

test('papel de cada conexión: destacada la de la neurona elegida, atenuada la que queda fuera del filtro', () => {
  const emphasis = new Set(['1:2']);
  const top = [null, [new Set([0]), new Set([1]), new Set([2])]];
  assert.equal(linkRole({ layer: 1, neuron: 2, input: 5, emphasis, top }), 'emphasized');
  assert.equal(linkRole({ layer: 1, neuron: 0, input: 0, emphasis, top }), 'normal');
  assert.equal(linkRole({ layer: 1, neuron: 0, input: 3, emphasis, top }), 'filtered');
  assert.equal(linkRole({ layer: 1, neuron: 0, input: 3, emphasis, top: null }), 'normal');
  assert.deepEqual([0, 0.1, -0.5].map(contributionBucket), [0, 1, 2]);
});

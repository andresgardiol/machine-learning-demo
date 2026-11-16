import test from 'node:test';
import assert from 'node:assert/strict';
import { layoutInspector, hitNeuron, neighborOf, INSPECTOR_LAYOUT } from '../src/render/inspector-layout.js';
import { flowCounts, insideLevel, sameTarget, FLOW } from '../src/render/network-inspector.js';
import { LAYOUT } from '../src/render/network-view.js';

const ZONE = { width: 700, height: 560 };

test('red de 6, 6 y 4: tres columnas de izquierda a derecha, con lugar arriba para los encabezados', () => {
  const l = layoutInspector({ sizes: [6, 6, 4], ...ZONE });
  assert.deepEqual(l.columns.map((c) => c.nodes.length), [6, 6, 4]);
  assert.ok(l.columns[0].x < l.columns[1].x && l.columns[1].x < l.columns[2].x);
  // El lugar de los rótulos va del borde de la neurona hacia afuera (vista-de-la-red D3).
  assert.equal(l.columns[0].x, INSPECTOR_LAYOUT.labelLeft + l.radius);
  assert.equal(l.columns[2].x, ZONE.width - INSPECTOR_LAYOUT.labelRight - l.radius);
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

test('flujo (D10): como mucho 150 marcas, repartidas según |producto|, ninguna sin señal', () => {
  const c = flowCounts([0.6, -0.3, 0, 0.1]);
  assert.ok(c.reduce((a, b) => a + b, 0) <= FLOW.marks);
  assert.equal(c[2], 0);
  assert.ok(c[0] > c[1] && c[1] > c[3] && c[3] > 0);
  const many = flowCounts(Array.from({ length: 900 }, (_, k) => (k % 3 === 0 ? 0 : 0.01 * (k % 7))));
  assert.ok(many.reduce((a, b) => a + b, 0) <= FLOW.marks);
  assert.deepEqual(flowCounts([0, 0]), [0, 0]);
});

test('neurona por dentro (D4): solo relleno, valor, curva y detalle según el radio', () => {
  assert.deepEqual([8, 12, 23, 24, 37.6, 39, 40, 44].map(insideLevel), ['fill', 'value', 'value', 'curve', 'curve', 'curve', 'detail', 'detail']);
});

test('mismo blanco: neurona con neurona, conexión con conexión', () => {
  assert.ok(sameTarget({ layer: 1, neuron: 2 }, { layer: 1, neuron: 2 }));
  assert.ok(!sameTarget({ layer: 1, neuron: 2 }, { layer: 1, neuron: 2, input: 0 }));
  assert.ok(sameTarget({ layer: 1, neuron: 2, input: 0 }, { layer: 1, neuron: 2, input: 0 }));
  assert.ok(!sameTarget(null, { layer: 1, neuron: 2 }));
});

// --- vista-de-la-red D3 y D5 -------------------------------------------------------------------
import { hitTarget, hitLink, segmentDistance, linkEnds } from '../src/render/inspector-layout.js';

test('red chica (6, 6, 4) en 708 × 648: cada neurona mide al menos 30 px de radio, sin pasar de 44', () => {
  const l = layoutInspector({ sizes: [6, 6, 4], width: 708, height: 648 });
  assert.ok(l.radius >= 30, `radio ${l.radius}`);
  assert.ok(l.radius <= 44);
});

test('resumir la capa de 21 entradas agranda las neuronas de las otras capas', () => {
  const open = layoutInspector({ sizes: [21, 8, 8, 4], width: 708, height: 648 });
  const sum = layoutInspector({ sizes: [21, 8, 8, 4], width: 708, height: 648, collapsed: [true, false, false, false] });
  assert.ok(sum.radius > open.radius * 1.5, `${open.radius} → ${sum.radius}`);
});

test('la zona más grande agranda las neuronas, hasta el máximo', () => {
  const a = layoutInspector({ sizes: [6, 16, 4], width: 600, height: 500 });
  const b = layoutInspector({ sizes: [6, 16, 4], width: 900, height: 800 });
  assert.ok(b.radius > a.radius);
  const huge = layoutInspector({ sizes: [2, 2, 1], width: 2000, height: 2000 });
  assert.equal(huge.radius, INSPECTOR_LAYOUT.maxRadius);
});

test('sin encimarse: en toda forma que permite la aplicación, ninguna neurona toca a su vecina ni los rótulos', () => {
  const zones = [[600, 420], [708, 648], [1000, 760], [520, 380]];
  const shapes = [[6, 4], [6, 6, 4], [6, 8, 8, 4], [21, 16, 16, 16, 4], [101, 16, 16, 16, 4], [2, 1], [2, 8, 8, 8, 1], [21, 1, 4], [3, 16, 1]];
  for (const [width, height] of zones) for (const sizes of shapes) {
    const masks = [sizes.map(() => false), sizes.map((_, i) => i === 0), sizes.map((_, i) => i === 1), sizes.map((_, i) => i === sizes.length - 1)];
    for (const collapsed of masks) {
      const l = layoutInspector({ sizes, width, height, collapsed });
      const r = l.radius;
      l.columns.forEach((c, k) => {
        if (c.collapsed) return;
        for (let i = 1; i < c.nodes.length; i++) assert.ok(c.nodes[i].y - c.nodes[i - 1].y > 2 * r, `vertical ${sizes} ${width}`);
        for (const n of c.nodes) assert.ok(n.y - r >= INSPECTOR_LAYOUT.header - 1e-9 && n.y + r <= height, `alto ${sizes}`);
        const next = l.columns[k + 1];
        if (next) assert.ok(next.x - c.x > (next.collapsed ? r + INSPECTOR_LAYOUT.collapsedWidth / 2 : 2 * r), `horizontal ${sizes} ${width}`);
      });
      // Lugar para los rótulos fuera de la neurona.
      if (!collapsed[0]) assert.ok(l.columns[0].x - r >= INSPECTOR_LAYOUT.labelLeft - 1e-9, `rótulos de entradas ${sizes}`);
      if (!collapsed.at(-1)) assert.ok(width - (l.columns.at(-1).x + r) >= INSPECTOR_LAYOUT.labelRight - 1e-9, `rótulos de salidas ${sizes}`);
    }
  }
});

test('distancia a un segmento: perpendicular adentro, al extremo afuera', () => {
  assert.equal(segmentDistance({ x: 5, y: 3 }, { x: 0, y: 0 }, { x: 10, y: 0 }), 3);
  assert.equal(segmentDistance({ x: -4, y: 3 }, { x: 0, y: 0 }, { x: 10, y: 0 }), 5);
});

test('neurona antes que línea: el clic sobre una neurona por la que pasan líneas elige la neurona', () => {
  const l = layoutInspector({ sizes: [6, 6, 4], width: 708, height: 648 });
  const n = l.columns[1].nodes[2];
  assert.deepEqual(hitTarget(l, { x: n.x + 2, y: n.y }), { kind: 'neuron', layer: 1, neuron: 2 });
});

test('línea más cercana: a menos de 6 px de varias, la más cercana; con una neurona elegida, primero las suyas', () => {
  const l = layoutInspector({ sizes: [6, 6, 4], width: 708, height: 648 });
  const a = l.columns[0].nodes[0];
  const b = l.columns[1].nodes[0];
  const mid = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 + 1 };
  assert.deepEqual(hitTarget(l, mid), { kind: 'link', layer: 1, neuron: 0, input: 0 });
  // Un punto en el cruce de dos líneas: sin elegir, la más cercana; con la neurona de la otra elegida, la suya.
  const p0 = l.columns[0].nodes[0];
  const q0 = l.columns[1].nodes[1];
  const p1 = l.columns[0].nodes[1];
  const q1 = l.columns[1].nodes[0];
  const cross = { x: (p0.x + q0.x) / 2, y: (p0.y + q0.y) / 2 }; // las dos líneas se cruzan en el medio
  const near0 = { x: cross.x, y: cross.y - 0.5 };
  const free = hitLink(l, near0);
  assert.ok(free);
  const other = free.neuron === 1 ? { layer: 1, neuron: 0 } : { layer: 1, neuron: 1 };
  const mine = hitLink(l, near0, 1, other);
  assert.equal(mine.neuron, other.neuron);
  void p1; void q1;
  // Lejos de toda línea y neurona: nada.
  assert.equal(hitTarget(l, { x: 2, y: 2 }), null);
});

test('entre capas resumidas: un clic sobre la línea elige la conexión; sobre el cuadrito, la neurona', () => {
  const l = layoutInspector({ sizes: [21, 11, 11, 4], width: 708, height: 560, collapsed: [true, true, true, true] });
  const a = linkEnds(l.columns[1], 1)[3];
  const b = linkEnds(l.columns[2], -1)[7];
  assert.ok(a.x > l.columns[1].x && b.x < l.columns[2].x, 'las puntas van al borde de los cuadritos que se miran');
  const mid = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
  const hit = hitTarget(l, mid);
  assert.equal(hit.kind, 'link');
  assert.equal(hit.layer, 2);
  // La línea más cercana al punto medio de 3 → 7 es esa (o, si se cruzan justo ahí, una a la misma distancia).
  const d = segmentDistance(mid, linkEnds(l.columns[1], 1)[hit.input], linkEnds(l.columns[2], -1)[hit.neuron]);
  assert.ok(d < 1e-9);
  const sq = l.columns[1].nodes[5];
  assert.deepEqual(hitTarget(l, { x: sq.x, y: sq.y }), { kind: 'neuron', layer: 1, neuron: 5 });
  const mixed = layoutInspector({ sizes: [21, 11, 11, 4], width: 708, height: 560, collapsed: [true, false, false, false] });
  assert.equal(linkEnds(mixed.columns[1], -1), mixed.columns[1].nodes, 'en una capa abierta, el centro de la neurona');
  const p = linkEnds(mixed.columns[0], 1)[10];
  const q = mixed.columns[1].nodes[4];
  assert.equal(hitLink(mixed, { x: p.x + (q.x - p.x) * 0.5, y: p.y + (q.y - p.y) * 0.5 })?.layer, 1, 'de un cuadrito a una neurona abierta');
});

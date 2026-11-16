// punto-de-prueba: el punto de prueba del plano del Laboratorio (sin DOM).
import test from 'node:test';
import assert from 'node:assert/strict';
import { planeGeometry, planeToPx, pxToPlane, nudgeProbe, probeLabelBox, probeAnswer, PROBE } from '../src/render/plane-view.js';
import { createNetwork } from '../src/core/network.js';
import { createRandom } from '../src/core/random.js';

test('el plano es el cuadrado más grande que entra, centrado', () => {
  assert.deepEqual(planeGeometry(400, 300), { ox: 50, oy: 0, side: 300 });
  assert.deepEqual(planeGeometry(300, 340), { ox: 0, oy: 20, side: 300 });
});

test('de coordenadas a píxeles y de vuelta: el centro, las esquinas y un punto cualquiera', () => {
  const g = planeGeometry(400, 300);
  assert.deepEqual(planeToPx(g, 0, 0), { x: 200, y: 150 });
  assert.deepEqual(planeToPx(g, -1, 1), { x: 50, y: 0 });
  assert.deepEqual(planeToPx(g, 1, -1), { x: 350, y: 300 });
  for (const [x, y] of [[0.3, -0.45], [-0.8, 0.95], [1, -1], [0, 0]]) {
    const p = planeToPx(g, x, y);
    assert.deepEqual(pxToPlane(g, p.x, p.y), { x, y });
  }
});

test('dentro del plano: más allá del borde queda en el borde, entre −1 y 1', () => {
  const g = planeGeometry(400, 300);
  assert.deepEqual(pxToPlane(g, -500, -40), { x: -1, y: 1 });
  assert.deepEqual(pxToPlane(g, 900, 900), { x: 1, y: -1 });
  assert.deepEqual(pxToPlane(g, 200, 150), { x: 0, y: 0 });
});

test('flechas: 0,05 por tecla, 0,01 con Mayúsculas, sin salir de −1 a 1', () => {
  assert.deepEqual(nudgeProbe({ x: 0, y: 0 }, 'ArrowRight'), { x: 0.05, y: 0 });
  assert.deepEqual(nudgeProbe({ x: 0, y: 0 }, 'ArrowUp', true), { x: 0, y: 0.01 });
  assert.deepEqual(nudgeProbe({ x: 0.3, y: -0.45 }, 'ArrowDown'), { x: 0.3, y: -0.5 });
  assert.deepEqual(nudgeProbe({ x: -0.98, y: 0 }, 'ArrowLeft'), { x: -1, y: 0 });
  assert.deepEqual(nudgeProbe({ x: 1, y: 1 }, 'ArrowUp'), { x: 1, y: 1 });
  assert.equal(nudgeProbe({ x: 0, y: 0 }, 'Enter'), null);
  let p = { x: 0, y: 0 };
  for (let k = 0; k < 6; k++) p = nudgeProbe(p, 'ArrowRight');
  assert.deepEqual(p, { x: 0.3, y: 0 }, 'sin errores de redondeo acumulados');
});

test('el rótulo no tapa el marcador ni sale del plano, también en las cuatro esquinas', () => {
  const g = planeGeometry(320, 300);
  const W = 120;
  const H = 22;
  for (const [x, y] of [[0, 0], [-1, 1], [1, 1], [-1, -1], [1, -1], [0.95, 0], [0, 0.98], [-0.97, -0.2]]) {
    const p = planeToPx(g, x, y);
    const b = probeLabelBox(g, p.x, p.y, W, H);
    assert.ok(b.x >= g.ox - 1e-9 && b.y >= g.oy - 1e-9 && b.x + W <= g.ox + g.side + 1e-9 && b.y + H <= g.oy + g.side + 1e-9, `dentro, en (${x}, ${y})`);
    const r = PROBE.radius;
    const covers = p.x + r > b.x && p.x - r < b.x + W && p.y + r > b.y && p.y - r < b.y + H;
    assert.ok(!covers, `no tapa el marcador en (${x}, ${y})`);
  }
});

test('respuesta del punto: la clase y la seguridad; mismo punto, misma respuesta', () => {
  const net = createNetwork({ inputs: 2, hidden: [4], outputs: 1, activation: 'tanh', random: createRandom(3) });
  const a = probeAnswer(net, 0.3, -0.45);
  const b = probeAnswer(net, 0.3, -0.45);
  assert.deepEqual(a, b);
  assert.ok(a.confidence >= 0.5 && a.confidence <= 1);
  assert.equal(a.cls, a.value > 0.5 ? 'a' : 'b');
});

test('blanco cómodo: el área de agarre mide 24 px o más', () => {
  assert.ok(PROBE.grab >= 24);
  assert.ok(PROBE.radius * 2 <= PROBE.grab);
});

test('el punto se conserva al cambiar la forma de los datos, reiniciar los pesos o cambiar la red', async () => {
  const { createLabSession } = await import('../src/tabs/lab/session.js');
  const session = createLabSession();
  assert.deepEqual(session.probe, { x: 0, y: 0 }, 'empieza en el centro');
  assert.equal(session.setProbe({ x: 0.3, y: -0.45 }), true);
  const examples = session.data.examples.length;
  session.setPoints({ shape: 'spiral' });
  session.resetWeights();
  session.setLayers(2);
  assert.deepEqual(session.probe, { x: 0.3, y: -0.45 });
  assert.equal(session.setProbe({ x: 3, y: -9 }), true);
  assert.deepEqual(session.probe, { x: 1, y: -1 }, 'dentro del plano');
  assert.equal(session.setProbe({ x: 1, y: -1 }), false, 'sin cambio');
  session.setPoints({ shape: 'circle' });
  assert.equal(session.data.examples.length, examples, 'el punto no es un ejemplo: los datos no cambian por él');
});

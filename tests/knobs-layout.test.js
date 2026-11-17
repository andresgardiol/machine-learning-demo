// Perillas sobre la red (laboratorio-empieza-por-compuertas D5): cuáles se ven y dónde van.
import test from 'node:test';
import assert from 'node:assert/strict';
import { layoutInspector, knobTargets, placeKnobs, connectionCount, KNOBS } from '../src/render/inspector-layout.js';

/** Todas las formas que arma el Laboratorio (2 entradas, 0 a 3 capas de 1 a 8, una salida) con hasta 16 conexiones. */
function labShapes(max = KNOBS.allMax) {
  const out = [];
  const rec = (h) => {
    const s = [2, ...h, 1];
    if (connectionCount(s) <= max) out.push(s);
    if (h.length < 3) for (let n = 1; n <= 8; n++) rec([...h, n]);
  };
  rec([]);
  return out;
}
// Lo que mide la zona de la red a 1440×900 y a 1366×768 (medido en el navegador: 600 × 532 y 600 × 400).
const ZONES = [[600, 532], [600, 400]];
const overlap = (a, b) => a.x - a.w / 2 < b.x + b.w / 2 && b.x - b.w / 2 < a.x + a.w / 2 && a.y - a.h / 2 < b.y + b.h / 2 && b.y - b.h / 2 < a.y + a.h / 2;
const hitsCircle = (b, c, r) => {
  const dx = Math.max(Math.abs(c.x - b.x) - b.w / 2, 0);
  const dy = Math.max(Math.abs(c.y - b.y) - b.h / 2, 0);
  return dx * dx + dy * dy < r * r;
};
const distToSegment = (p, a, b) => {
  const vx = b.x - a.x; const vy = b.y - a.y;
  const t = Math.max(0, Math.min(1, ((p.x - a.x) * vx + (p.y - a.y) * vy) / (vx * vx + vy * vy)));
  return Math.hypot(p.x - (a.x + vx * t), p.y - (a.y + vy * t));
};

test('cuáles: 2 → 2 → 1 sin elegir nada, seis pesos y tres sesgos (más las dos entradas si se piden)', () => {
  const k = knobTargets([2, 2, 1], null);
  assert.equal(k.filter((x) => x.kind === 'weight').length, 6);
  assert.equal(k.filter((x) => x.kind === 'bias').length, 3);
  assert.equal(knobTargets([2, 2, 1], null, { inputs: true }).filter((x) => x.kind === 'input').length, 2);
});

test('cuáles: 2 → 8 → 8 → 1 solo las ocho que entran a la neurona elegida y su sesgo; sin elegir, ninguna', () => {
  assert.equal(connectionCount([2, 8, 8, 1]), 88);
  const k = knobTargets([2, 8, 8, 1], { layer: 2, neuron: 3 });
  assert.equal(k.length, 9);
  assert.ok(k.every((x) => x.layer === 2 && x.neuron === 3));
  assert.deepEqual(knobTargets([2, 8, 8, 1], null), []);
  assert.deepEqual(knobTargets([2, 8, 8, 1], { layer: 0, neuron: 1 }), [], 'una entrada no tiene pesos que le lleguen');
});

test('orden del foco: de la primera capa a la última, cada neurona con sus pesos y después su sesgo', () => {
  const k = knobTargets([2, 2, 1], null, { inputs: true }).map((x) => `${x.kind[0]}${x.layer}${x.neuron}${x.input ?? ''}`);
  assert.deepEqual(k, ['i00', 'i01', 'w100', 'w101', 'b10', 'w110', 'w111', 'b11', 'w200', 'w201', 'b20']);
});

test(`no se tapan: en las ${labShapes().length} formas de hasta 16 conexiones, a 600 × 532 y 600 × 400`, () => {
  for (const [W, H] of ZONES) {
    for (const sizes of labShapes()) {
      const L = layoutInspector({ sizes, width: W, height: H, knobs: true });
      const centers = L.columns.map((c) => c.nodes);
      const { knobs, crowded } = placeKnobs(knobTargets(sizes, null, { inputs: true }), { centers, radius: L.radius, bounds: { left: 0, top: 34, right: W, bottom: H } });
      const where = `${sizes.join('-')} a ${W}×${H}`;
      assert.equal(crowded, false, where);
      knobs.forEach((a, i) => {
        // Ninguna pastilla tapa a otra.
        for (let k = i + 1; k < knobs.length; k++) assert.ok(!overlap(a, knobs[k]), `${where}: ${JSON.stringify(a)} y ${JSON.stringify(knobs[k])}`);
        // Ni a una neurona.
        for (const c of centers.flat()) assert.ok(!hitsCircle(a, c, L.radius), `${where}: tapa una neurona`);
        // Dentro de la zona, debajo de los encabezados.
        assert.ok(a.x - a.w / 2 >= 0 && a.x + a.w / 2 <= W && a.y - a.h / 2 >= 34 && a.y + a.h / 2 <= H, `${where}: afuera`);
        // Cada peso sobre su conexión; cada sesgo y cada entrada, junto a su neurona.
        if (a.kind === 'weight') assert.ok(distToSegment(a, centers[a.layer - 1][a.input], centers[a.layer][a.neuron]) < 0.5, `${where}: fuera de su línea`);
        else assert.ok(Math.hypot(a.x - centers[a.layer][a.neuron].x, a.y - centers[a.layer][a.neuron].y) < L.radius + 40, `${where}: lejos de su neurona`);
      });
    }
  }
});

test('el 30 % desde el destino es el primer lugar: con la red de las compuertas, todos los pesos quedan ahí', () => {
  for (const sizes of [[2, 1], [2, 2, 1]]) {
    const L = layoutInspector({ sizes, width: 600, height: 532, knobs: true });
    const { knobs } = placeKnobs(knobTargets(sizes, null, { inputs: true }), { centers: L.columns.map((c) => c.nodes), radius: L.radius });
    for (const k of knobs.filter((x) => x.kind === 'weight')) assert.equal(k.at, 0.3, sizes.join('-'));
  }
});

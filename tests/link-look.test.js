import test from 'node:test';
import assert from 'node:assert/strict';
import { linkLook, densityFloor, densityWidthRange, maxWeightOf, maxProductOf, LINK_LOOK } from '../src/render/link-look.js';
import { traceNetwork } from '../src/core/network-trace.js';
import { createChanges } from '../src/core/network-changes.js';
import { EXAMPLE_BRAINS } from '../src/data/example-brains.js';

const example = EXAMPLE_BRAINS[0].network; // cerebro de ejemplo de la calle (6, 6, 4)
const inputs = [0.47, 0.02, 0, 0, 0.12, 1];

test('red de pesos chicos: la de mayor peso con el grosor máximo y las demás en proporción, no todas en el mínimo', () => {
  const max = maxWeightOf(example);
  assert.ok(max <= 0.3, `mayor peso ${max}`);
  const widths = [];
  for (const layer of example.layers) for (const row of layer.weights) for (const w of row) widths.push(linkLook({ weight: w, maxWeight: max }).width);
  assert.equal(widths.length, 60);
  assert.equal(Math.max(...widths), LINK_LOOK.minWidth + LINK_LOOK.widthRange);
  for (const w of widths) assert.ok(w >= 1.5, 'al menos 1,5 px');
  const atMin = widths.filter((w) => w < LINK_LOOK.minWidth + 0.5).length;
  assert.ok(atMin < 15, `${atMin} de 60 cerca del mínimo`);
  // Proporción: la mitad del peso, la mitad del rango.
  assert.equal(linkLook({ weight: max / 2, maxWeight: max }).width, LINK_LOOK.minWidth + LINK_LOOK.widthRange / 2);
});

test('sin señal: el piso de brillo, no desaparece; con la mayor señal: la más brillante', () => {
  const quiet = linkLook({ weight: 0.2, maxWeight: 0.3, product: 0, maxProduct: 0.5, density: 36 });
  assert.equal(quiet.alpha, densityFloor(36));
  assert.ok(quiet.alpha > 0.3);
  const loud = linkLook({ weight: 0.2, maxWeight: 0.3, product: -0.5, maxProduct: 0.5, density: 36 });
  assert.equal(loud.alpha, 1);
  const none = linkLook({ weight: 0.2, maxWeight: 0.3, product: null, density: 36 });
  assert.equal(none.alpha, densityFloor(36), 'sin cuenta, todo en el piso');
  const trace = traceNetwork(example, inputs);
  const maxP = maxProductOf(trace);
  let best = null;
  for (let l = 1; l < trace.layers.length; l++) trace.layers[l].neurons.forEach((n, j) => n.products.forEach((p, i) => {
    const a = linkLook({ weight: n.weights[i], maxWeight: 0.3, product: p, maxProduct: maxP, density: 36 }).alpha;
    if (!best || a > best.a) best = { a, p: Math.abs(p) };
  }));
  assert.equal(best.p, maxP);
});

test('piso según la densidad: 0,35 hasta 48 conexiones, 0,12 desde 256, y en medio baja', () => {
  assert.equal(densityFloor(36), 0.35);
  assert.equal(densityFloor(48), 0.35);
  assert.equal(densityFloor(256), 0.12);
  assert.equal(densityFloor(336), 0.12);
  const mid = densityFloor(152);
  assert.ok(mid < 0.35 && mid > 0.12);
});

test('peso cero: línea fina, gris y continua, distinta de las demás', () => {
  const z = linkLook({ weight: 0, maxWeight: 0.3, product: 0, maxProduct: 1, density: 36 });
  assert.equal(z.sign, 'zero');
  assert.equal(z.width, 1);
  assert.equal(z.dashed, false);
  const neg = linkLook({ weight: -0.01, maxWeight: 0.3 });
  assert.equal(neg.sign, 'negative');
  assert.equal(neg.dashed, true);
  assert.ok(neg.width >= 1.5);
});

test('peso cambiado a mano mayor que todos: pasa a ser la más gruesa y las demás se afinan', () => {
  const changes = createChanges(example);
  const before = linkLook({ weight: example.layers[0].weights[0][0], maxWeight: maxWeightOf(example) }).width;
  changes.set({ kind: 'weight', layer: 1, neuron: 2, input: 3, value: 0.9 });
  const max = maxWeightOf(changes.applied().network);
  assert.equal(max, 0.9);
  assert.equal(linkLook({ weight: 0.9, maxWeight: max }).width, LINK_LOOK.minWidth + LINK_LOOK.widthRange);
  const after = linkLook({ weight: example.layers[0].weights[0][0], maxWeight: max }).width;
  assert.ok(after < before);
});

test('papel: lo relacionado no baja de 0,8; lo demás queda en 0,15 de su brillo; fuera del filtro, 0,12', () => {
  const base = { weight: 0.1, maxWeight: 0.3, product: 0, maxProduct: 1, density: 36 };
  assert.equal(linkLook({ ...base, role: 'related' }).alpha, 0.8);
  assert.ok(Math.abs(linkLook({ ...base, role: 'unrelated' }).alpha - 0.35 * 0.15) < 1e-12);
  assert.equal(linkLook({ ...base, role: 'filtered' }).alpha, 0.12);
  // De más atrás (D9): 0,35 + 0,65 × importancia.
  assert.ok(Math.abs(linkLook({ ...base, role: 'related', importance: 0.5 }).alpha - 0.675) < 1e-12);
  // El papel no cambia el grosor ni el signo.
  assert.equal(linkLook({ ...base, role: 'unrelated' }).width, linkLook(base).width);
});

test('mismo aspecto, misma red: misma cuenta, mismo grosor y brillo', () => {
  const a = traceNetwork(example, inputs);
  const b = traceNetwork(example, inputs);
  const looks = (t) => t.layers.slice(1).flatMap((L) => L.neurons.flatMap((n) => n.products.map((p, i) => linkLook({ weight: n.weights[i], maxWeight: maxWeightOf(example), product: p, maxProduct: maxProductOf(t), density: 36 }))));
  assert.deepEqual(looks(a), looks(b));
});

test('grosor entre capas densas: con 256 conexiones o más la más gruesa mide 4 px o menos y la más fina al menos 1,5', () => {
  for (const density of [256, 400, 912]) {
    assert.ok(linkLook({ weight: 1, maxWeight: 1, density }).width <= 4);
    assert.ok(linkLook({ weight: 1e-6, maxWeight: 1, density }).width >= 1.5);
    assert.ok(linkLook({ weight: -0.01, maxWeight: 1, density }).width >= 1.5);
  }
  assert.equal(densityWidthRange(256), 2.5);
});

test('grosor con 48 conexiones o menos: la más gruesa sigue en 7 px; entre medio, lineal', () => {
  for (const density of [0, 12, 36, 48]) assert.equal(linkLook({ weight: 0.4, maxWeight: 0.4, density }).width, 7);
  const mid = linkLook({ weight: 1, maxWeight: 1, density: 152 }).width;
  assert.ok(Math.abs(mid - 5.5) < 1e-9, `${mid}`);
  assert.ok(linkLook({ weight: 1, maxWeight: 1, density: 144 }).width < 7);
});

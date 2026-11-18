// Vista previa de la mutación (entrenar-mutacion-a-la-vista D1 a D3), sin DOM.
import test from 'node:test';
import assert from 'node:assert/strict';
import { mutationPreview, networkCardMode, PREVIEW_MS } from '../src/tabs/train/preview.js';
import { createNetwork, copyNetwork } from '../src/core/network.js';
import { createRandom } from '../src/core/random.js';
import { createTraining } from '../src/core/training.js';

const leader = () => createNetwork({ inputs: 6, hidden: [6], outputs: 4, random: createRandom(21) });

test('el mismo pedido da el mismo hijo', () => {
  const net = leader();
  const a = mutationPreview(net, { strength: 40, rate: 100 });
  const b = mutationPreview(net, { strength: 40, rate: 100 });
  assert.deepEqual(a.network, b.network);
  assert.equal(a.diff.meanChange, b.diff.meanChange);
  assert.equal(PREVIEW_MS, 2000);
});

test('fuerza 0: la misma red y un diff vacío', () => {
  const net = leader();
  const p = mutationPreview(net, { strength: 0, rate: 100 });
  assert.deepEqual(p.network.layers, net.layers);
  assert.equal(p.diff.changedWeights.size + p.diff.changedBiases.size, 0);
  assert.equal(p.diff.meanChange, 0);
});

test('no modifica la red del líder', () => {
  const net = leader();
  const before = copyNetwork(net);
  mutationPreview(net, { strength: 80, rate: 100 });
  assert.deepEqual(net, before);
});

test('una fuerza mayor da un promedio mayor (5 % y 80 %)', () => {
  const net = leader();
  const low = mutationPreview(net, { strength: 5, rate: 100 }).diff.meanChange;
  const high = mutationPreview(net, { strength: 80, rate: 100 }).diff.meanChange;
  assert.ok(low > 0 && high > low * 10, `${low} y ${high}`);
});

test('la probabilidad de los ajustes también cuenta: con 10 % cambian menos', () => {
  const net = leader();
  const all = mutationPreview(net, { strength: 40, rate: 100 }).diff;
  const few = mutationPreview(net, { strength: 40, rate: 10 }).diff;
  assert.ok(few.changedWeights.size + few.changedBiases.size < all.changedWeights.size + all.changedBiases.size);
});

test('la tarjeta de la red: la vista previa primero, después la muestra del corte, después en vivo', () => {
  assert.equal(networkCardMode({ preview: true, cut: true }), 'preview');
  assert.equal(networkCardMode({ preview: true, cut: false }), 'preview');
  assert.equal(networkCardMode({ preview: false, cut: true }), 'cut', 'al terminar la vista previa durante el corte, vuelve la muestra');
  assert.equal(networkCardMode({ preview: false, cut: false }), 'live', 'sin corte, vuelve la red en vivo');
});

test('el entrenamiento no cambia: con vistas previas en el medio, el mismo historial', () => {
  const run = (previews) => {
    const t = createTraining({ seed: 9, config: { population: 30 } });
    for (let g = 0; g < 4; g++) {
      for (let s = 0; s < 200; s++) {
        if (previews && s % 20 === 0) mutationPreview(t.networks[t.leaderIndex], { strength: 5 + s / 4, rate: 100 });
        if (t.step()) break;
      }
      if (t.completed === g) t.finishGeneration();
    }
    return t.history.map((r) => ({ generation: r.generation, best: r.best, average: r.average }));
  };
  assert.deepEqual(run(true), run(false));
});

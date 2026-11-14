import test from 'node:test';
import assert from 'node:assert/strict';
import { listBrains, defaultKey, resolveChoice, trainedScenario, trainedTracks, workingCopy, shapeText, DEFAULT_EXAMPLE } from '../src/tabs/inspect/brains.js';
import { EXAMPLE_BRAINS } from '../src/data/example-brains.js';

const example = (id) => EXAMPLE_BRAINS.find((b) => b.id === id);
const withId = (b, id, updatedAt = b.updatedAt) => ({ ...structuredClone(b), id, name: id, updatedAt });

test('sin haber entrenado ni guardado nada: el ejemplo de la calle con tráfico nuevo, en la calle recta', () => {
  const c = listBrains({ library: [], examples: EXAMPLE_BRAINS });
  assert.equal(defaultKey(c), `example:${DEFAULT_EXAMPLE}`);
  assert.equal(DEFAULT_EXAMPLE, 'street-new');
  assert.equal(trainedScenario(example('street-new')).track, 'straight');
});

test('con un entrenamiento hecho: el del entrenamiento en curso, y si no, el del anterior', () => {
  const oval = withId(example('oval'), 'autosave-1');
  const prev = withId(example('street-same'), 'autosave-0');
  const saved = withId(example('all-tracks'), 'prudente');
  const both = listBrains({ library: [{ origin: 'saved', brain: saved }, { origin: 'autosave', slot: 'current', brain: oval }, { origin: 'autosave', slot: 'previous', brain: prev }], examples: EXAMPLE_BRAINS });
  assert.equal(defaultKey(both), 'brain:autosave-1');
  assert.equal(trainedScenario(oval).track, 'oval');
  const onlyPrev = listBrains({ library: [{ origin: 'autosave', slot: 'previous', brain: prev }], examples: EXAMPLE_BRAINS });
  assert.equal(defaultKey(onlyPrev), 'brain:autosave-0');
  const onlySaved = listBrains({ library: [{ origin: 'saved', brain: saved }], examples: EXAMPLE_BRAINS });
  assert.equal(defaultKey(onlySaved), `example:${DEFAULT_EXAMPLE}`, 'un cerebro guardado no es "el último entrenamiento"');
});

test('candidatos: primero tus cerebros, después los de ejemplo, con su nombre', () => {
  const saved = withId(example('oval'), 'prudente');
  const c = listBrains({ library: [{ origin: 'saved', brain: saved }, { origin: 'autosave', slot: 'current', brain: withId(example('oval'), 'a') }], examples: EXAMPLE_BRAINS });
  assert.deepEqual(c.map((x) => x.kind), ['brain', 'brain', 'example', 'example', 'example', 'example']);
  assert.equal(c[0].name, 'prudente');
  assert.equal(c[1].nameKey, 'library.autosave.current');
  assert.equal(c[2].nameKey, 'compete.example.street-new');
});

test('elegido que sigue: se conserva; si cambió, se avisa; si se eliminó, el de por defecto', () => {
  const b = withId(example('oval'), 'p', '2026-11-13T10:00:00.000Z');
  const c1 = listBrains({ library: [{ origin: 'saved', brain: b }], examples: EXAMPLE_BRAINS });
  const sig = c1[0].signature;
  assert.deepEqual(resolveChoice(c1, { key: 'brain:p', signature: sig }), { key: 'brain:p', updated: false, removed: false });
  const c2 = listBrains({ library: [{ origin: 'saved', brain: { ...b, updatedAt: '2026-11-13T11:00:00.000Z' } }], examples: EXAMPLE_BRAINS });
  assert.deepEqual(resolveChoice(c2, { key: 'brain:p', signature: sig }), { key: 'brain:p', updated: true, removed: false });
  const c3 = listBrains({ library: [], examples: EXAMPLE_BRAINS });
  assert.deepEqual(resolveChoice(c3, { key: 'brain:p', signature: sig }), { key: `example:${DEFAULT_EXAMPLE}`, updated: false, removed: true });
  assert.deepEqual(resolveChoice(c3, {}), { key: `example:${DEFAULT_EXAMPLE}`, updated: false, removed: false });
});

test('dónde entrenó: la pista con más generaciones, y todas las pistas en el orden del catálogo', () => {
  const b = structuredClone(example('oval'));
  b.training.scenarios = [
    { track: 'straight', lanes: 2, density: 30, irregularity: 10, trafficMode: 'new', generations: 5 },
    { track: 'kidney', lanes: 3, density: 50, irregularity: 0, trafficMode: 'new', generations: 20 },
  ];
  assert.deepEqual(trainedScenario(b), { track: 'kidney', lanes: 3, density: 50, irregularity: 0 });
  assert.deepEqual(trainedTracks(b), ['straight', 'kidney']);
  assert.deepEqual(trainedTracks(example('all-tracks')), ['straight', 'oval', 'kidney', 'grandPrix']);
});

test('copia de trabajo: cambiarla no cambia el cerebro', () => {
  const b = example('oval');
  const copy = workingCopy(b);
  copy.network.layers[0].weights[0][0] = 99;
  assert.notEqual(b.network.layers[0].weights[0][0], 99);
});

test('forma de la red: 5 sensores y una capa oculta de 6 → 6 entradas, 6 ocultas y 4 salidas', () => {
  assert.deepEqual(shapeText(example('oval').network), { inputs: 6, hidden: [6], outputs: 4 });
});

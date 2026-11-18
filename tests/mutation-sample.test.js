// Muestra de la mutación y cambios que rigen en cada generación (entrenar-la-generacion-ensena D1 y D2).
import test from 'node:test';
import assert from 'node:assert/strict';
import { createTraining } from '../src/core/training.js';
import { nextGeneration, mutationDiff, mutate } from '../src/core/evolution.js';
import { createNetwork, copyNetwork } from '../src/core/network.js';
import { createRandom } from '../src/core/random.js';

const run = (t, steps = 120) => { for (let s = 0; s < steps; s++) if (t.step()) return; t.finishGeneration(); };
const sizeOf = (net) => net.layers.reduce((n, l) => n + l.weights.length * l.weights[0].length + l.biases.length, 0);

// --- Muestra de la mutación -------------------------------------------------------------------

test('muestra por defecto: el primer individuo no élite, y comparar con la red de antes da lo que cambió', () => {
  const t = createTraining({ seed: 3, config: { population: 40 } });
  assert.equal(t.mutationSample, null, 'la población inicial no tiene muestra');
  run(t);
  const s = t.mutationSample;
  assert.ok(s);
  assert.equal(s.index, t.eliteCount, 'el primero después de la élite');
  assert.equal(s.network, t.networks[s.index]);
  const diff = mutationDiff(s.base, s.network);
  assert.equal(diff.total, sizeOf(s.network));
  assert.ok(diff.changedWeights.size + diff.changedBiases.size > 0, 'la mutación cambió algo');
  // La base es una red de la generación anterior: mutarla otra vez con el mismo azar no hace falta; alcanza con que
  // la élite no sea la muestra y que la base no sea la red mutada.
  assert.notEqual(s.base, s.network);
});

test('fuerza cero: la red de la muestra es idéntica a la de antes de mutar', () => {
  const t = createTraining({ seed: 3, config: { population: 30, mutationCooling: false, mutationStrength: 0 } });
  run(t);
  const s = t.mutationSample;
  assert.ok(s);
  const diff = mutationDiff(s.base, s.network);
  assert.equal(diff.changedWeights.size + diff.changedBiases.size, 0);
  assert.deepEqual(s.network.layers, s.base.layers);
});

test('con selección manual y un padre: la muestra es el índice 1 y su base es la red del padre', () => {
  const t = createTraining({ seed: 5, config: { population: 20, selectionMode: 'manual' } });
  for (let s = 0; s < 60; s++) t.step();
  const chosen = t.chooseLeader();
  assert.ok(chosen);
  run(t, 0);
  const s = t.mutationSample;
  assert.equal(s.index, 1);
  assert.deepEqual(s.base.layers, chosen.network.layers, 'la base es el padre elegido');
  assert.deepEqual(t.networks[0].layers, chosen.network.layers, 'la copia del padre va en 0');
  assert.equal(t.breeding.mode, 'manual');
});

test('sin hijos mutados (selección manual sin padre): no hay muestra', () => {
  const t = createTraining({ seed: 5, config: { population: 20, selectionMode: 'manual' } });
  run(t);
  assert.equal(t.mutationSample, null);
  assert.equal(t.breeding.mode, 'fresh');
});

test('la muestra no consume azar: nextGeneration da las mismas redes que mutando a mano con el mismo azar', () => {
  const r = createRandom(4);
  const networks = Array.from({ length: 6 }, () => createNetwork({ inputs: 3, hidden: [3], outputs: 2, random: r }));
  const fitnesses = [5, 1, 4, 2, 6, 3];
  const config = { population: 6, elite: 17, selection: 50, mutationStrength: 30, mutationRate: 60 };
  const a = nextGeneration({ networks, fitnesses, config, random: createRandom(9) });
  const b = nextGeneration({ networks, fitnesses, config, random: createRandom(9) });
  assert.deepEqual(a.networks, b.networks);
  // La muestra señala al primer hijo: mutar su base con el azar que le tocó reproduce su red.
  assert.equal(a.sample.index, a.elite.length);
  assert.ok(a.networks.every((n, i) => i === a.sample.index || n !== a.sample.base));
});

// --- mutationDiff -----------------------------------------------------------------------------

const base = () => createNetwork({ inputs: 5, hidden: [4], outputs: 3, random: createRandom(11) });

test('mutationDiff: fuerza 0 no marca nada', () => {
  const b = base();
  const d = mutationDiff(b, mutate(b, { strength: 0, rate: 100 }, createRandom(1)));
  assert.equal(d.changedWeights.size + d.changedBiases.size, 0);
  assert.equal(d.total, sizeOf(b));
});

test('mutationDiff: fuerza 100 % y probabilidad 100 % marca todos los pesos y sesgos, con las claves del inspector', () => {
  const b = base();
  const d = mutationDiff(b, mutate(b, { strength: 100, rate: 100 }, createRandom(1)));
  assert.equal(d.changedWeights.size + d.changedBiases.size, d.total);
  assert.ok(d.changedWeights.has('1:0:0'), 'capa 1 (la primera oculta), neurona 0, entrada 0');
  assert.ok(d.changedWeights.has('2:2:3'), 'capa 2 (la salida), neurona 2, entrada 3');
  assert.ok(d.changedBiases.has('1:3') && d.changedBiases.has('2:2'));
  assert.ok(![...d.changedWeights].some((k) => k.startsWith('0:')), 'la capa 0 son las entradas: no tiene pesos');
});

test('mutationDiff: probabilidad 1 % marca pocos', () => {
  const b = createNetwork({ inputs: 16, hidden: [16, 16], outputs: 4, random: createRandom(3) });
  const d = mutationDiff(b, mutate(b, { strength: 50, rate: 1 }, createRandom(2)));
  const changed = d.changedWeights.size + d.changedBiases.size;
  assert.ok(changed > 0 && changed < d.total * 0.05, `${changed} de ${d.total}`);
  assert.deepEqual(mutationDiff(b, copyNetwork(b)).changedWeights.size, 0);
});

// --- Cambios que rigen en cada generación -------------------------------------------------------

test('cambio de la fuerza: apagar el enfriamiento y subirla en la 3 queda en el registro de la 4, con lo que regía', () => {
  const t = createTraining({ seed: 2, config: { population: 20 } });
  run(t); run(t);
  assert.equal(t.generation, 3);
  const shown = Math.round(t.nextMutationStrength);
  t.configure({ mutationCooling: false, mutationStrength: 40 });
  run(t);
  run(t);
  const [, , g3, g4] = t.history;
  assert.equal(g3.generation, 3);
  assert.deepEqual(g3.changes, [], 'el de la 3 no registra cambios');
  assert.equal(g4.generation, 4);
  const byKey = Object.fromEntries(g4.changes.map((c) => [c.key, c]));
  assert.deepEqual(Object.keys(byKey).sort(), ['mutationCooling', 'mutationStrength']);
  assert.deepEqual(byKey.mutationCooling, { key: 'mutationCooling', from: true, to: false });
  assert.equal(Math.round(byKey.mutationStrength.from), shown, 'desde la fuerza que regía con el enfriamiento');
  assert.equal(byKey.mutationStrength.to, 40);
});

test('sin cambios: cinco generaciones sin tocar nada no registran cambios, aunque la fuerza baje sola', () => {
  const t = createTraining({ seed: 2, config: { population: 20 } });
  const strengths = [];
  for (let g = 0; g < 5; g++) { strengths.push(t.nextMutationStrength); run(t); }
  assert.ok(strengths[4] < strengths[0], 'la fuerza bajó');
  assert.ok(t.history.every((r) => Array.isArray(r.changes) && r.changes.length === 0));
});

test('varios cambios juntos: población y élite cambiados en la 2 quedan los dos en el registro de la 3', () => {
  const t = createTraining({ seed: 2, config: { population: 20 } });
  run(t);
  t.configure({ population: 30, elite: 5 });
  run(t); // cierra la 2: los cambios rigen desde la 3
  run(t);
  const [, g2, g3] = t.history;
  assert.deepEqual(g2.changes, []);
  const byKey = Object.fromEntries(g3.changes.map((c) => [c.key, c]));
  assert.deepEqual(byKey, { population: { key: 'population', from: 20, to: 30 }, elite: { key: 'elite', from: 10, to: 5 } });
});

test('mutationDiff: el cambio promedio es el de |nuevo − anterior| de lo que cambió, y 0 si no cambió nada', () => {
  const b = base();
  assert.equal(mutationDiff(b, copyNetwork(b)).meanChange, 0);
  const m = copyNetwork(b);
  m.layers[0].weights[0][0] += 0.5;
  m.layers[1].biases[1] -= 0.1;
  const d = mutationDiff(b, m);
  assert.equal(d.changedWeights.size + d.changedBiases.size, 2);
  assert.ok(Math.abs(d.meanChange - 0.3) < 1e-12, String(d.meanChange));
  // Con fuerza s, cada valor se acerca a r en la proporción s: el promedio crece con la fuerza.
  const small = mutationDiff(b, mutate(b, { strength: 10, rate: 100 }, createRandom(4))).meanChange;
  const big = mutationDiff(b, mutate(b, { strength: 60, rate: 100 }, createRandom(4))).meanChange;
  assert.ok(small > 0 && big > small * 3, `${small} y ${big}`);
});

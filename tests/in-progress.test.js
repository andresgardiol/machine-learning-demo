// vista-de-la-red D19: lo que está en curso es del tamaño del paso.
import test from 'node:test';
import assert from 'node:assert/strict';
import { inProgress } from '../src/render/network-inspector.js';
import { createPassCursor } from '../src/core/pass-cursor.js';
import { EXAMPLE_BRAINS } from '../src/data/example-brains.js';

const net = EXAMPLE_BRAINS[0].network; // 6, 6, 4
const sizes = net.sizes;
// Las entradas ya leídas: la cuenta va por la primera capa oculta.
const fresh = () => { const c = createPassCursor(net); c.reset(); c.advance('layer'); return c; };

test('de a neuronas: la neurona de cursor.next y solo sus conexiones de entrada', () => {
  const c = fresh();
  c.advance('neuron'); // la primera neurona de la oculta, hecha
  const { current, links } = inProgress({ sizes, cursor: c, stepSize: 'neuron' });
  assert.deepEqual(current, { kind: 'neuron', layer: c.next.layer, neuron: c.next.neuron });
  assert.equal(links.size, sizes[current.layer - 1]);
  for (const k of links) assert.ok(k.startsWith(`${current.layer}:${current.neuron}:`));
});

test('de a operaciones por la tercera entrada: solo esa conexión está en curso', () => {
  const c = fresh();
  for (let k = 0; k < 4; k++) c.advance('operation'); // m0 a0 m1 a1: va por la tercera
  const { current, links } = inProgress({ sizes, cursor: c, stepSize: 'operation' });
  assert.deepEqual(current, { kind: 'connection', layer: 1, neuron: 0, input: 2 });
  assert.deepEqual([...links], ['1:0:2']);
  c.advance('operation'); // m2: falta sumarla, sigue en curso
  assert.deepEqual(inProgress({ sizes, cursor: c, stepSize: 'operation' }).current, { kind: 'connection', layer: 1, neuron: 0, input: 2 });
});

test('de a operaciones en el sesgo, la activación o una entrada: la neurona', () => {
  const c = fresh();
  for (let k = 0; k < 12; k++) c.advance('operation'); // las seis entradas, multiplicadas y sumadas
  assert.deepEqual(inProgress({ sizes, cursor: c, stepSize: 'operation' }).current, { kind: 'neuron', layer: 1, neuron: 0 });
  const start = createPassCursor(net);
  assert.deepEqual(inProgress({ sizes, cursor: start, stepSize: 'operation' }).current, { kind: 'neuron', layer: 0, neuron: 0 });
});

test('sin detalle fino (un cursor sin terms, como el del Laboratorio): la neurona, como hasta ahora', () => {
  const c = fresh();
  c.advance('operation');
  const coarse = { done: false, next: { layer: 1, neuron: 0, op: 'products' }, opsDone: () => 1 };
  const { current, links } = inProgress({ sizes, cursor: coarse, stepSize: 'operation' });
  assert.deepEqual(current, { kind: 'neuron', layer: 1, neuron: 0 });
  assert.equal(links.size, 6);
});

test('mientras se anima una operación: solo su conexión', () => {
  const c = fresh();
  c.complete();
  const { links } = inProgress({ sizes, cursor: c, stepSize: 'operation', animation: { items: [{ layer: 1, neuron: 2, op: 'multiply', input: 4, p: 0.3 }] } });
  assert.deepEqual([...links], ['1:2:4']);
});

test('de a capas: la capa entera y todas las conexiones que le entran', () => {
  const c = fresh();
  const { current, links } = inProgress({ sizes, cursor: c, stepSize: 'layer' });
  assert.deepEqual(current, { kind: 'layer', layer: 1 });
  assert.equal(links.size, 36);
  c.advance('layer');
  const second = inProgress({ sizes, cursor: c, stepSize: 'layer' });
  assert.deepEqual(second.current, { kind: 'layer', layer: 2 });
  assert.equal(second.links.size, 24);
});

test('pasar de neuronas a capas con una capa a medio hacer: la marca pasa a la capa entera', () => {
  const c = fresh();
  c.advance('neuron');
  c.advance('neuron');
  assert.equal(inProgress({ sizes, cursor: c, stepSize: 'neuron' }).current.kind, 'neuron');
  const asLayer = inProgress({ sizes, cursor: c, stepSize: 'layer' });
  assert.deepEqual(asLayer.current, { kind: 'layer', layer: 1 });
  assert.equal(asLayer.links.size, 36);
});

test('de a cuadros, o con la cuenta completa: nada en curso y nada relacionado por el recorrido', () => {
  const c = fresh();
  assert.deepEqual(inProgress({ sizes, cursor: c, stepSize: 'frame' }), { current: null, links: new Set() });
  c.complete();
  assert.equal(inProgress({ sizes, cursor: c, stepSize: 'neuron' }).current, null);
  assert.equal(inProgress({ sizes, cursor: null, stepSize: 'layer' }).current, null);
  const items = [{ layer: 1, neuron: 0, op: 'products', p: 0.5 }];
  assert.equal(inProgress({ sizes, cursor: c, stepSize: 'frame', animation: { items } }).links.size, 0, 'ni durante la animación del cuadro');
});

test('mientras se anima un paso: cuentan las conexiones que entran a cada neurona que se anima', () => {
  const c = fresh();
  c.complete();
  const items = Array.from({ length: 4 }, (_, j) => ({ layer: 2, neuron: j, op: 'products', p: 0.5 }));
  const { current, links } = inProgress({ sizes, cursor: c, stepSize: 'layer', animation: { items } });
  assert.equal(current, null);
  assert.equal(links.size, 24);
});

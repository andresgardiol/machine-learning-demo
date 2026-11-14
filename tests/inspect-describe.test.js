import test from 'node:test';
import assert from 'node:assert/strict';
import es from '../src/i18n/es.js';
import en from '../src/i18n/en.js';
import { createI18n, formatValue } from '../src/ui/i18n.js';
import { describeStep, whereText, shownTerms, MAX_TERMS } from '../src/tabs/inspect/describe.js';
import { traceNetwork } from '../src/core/network-trace.js';
import { createPassCursor } from '../src/core/pass-cursor.js';
import { createNetwork } from '../src/core/network.js';
import { createRandom } from '../src/core/random.js';

const tools = (language) => {
  const i18n = createI18n({ dictionaries: { es, en }, language });
  return { t: (k, p) => i18n.t(k, p), fmt: (v) => formatValue(v, language) };
};

// Red de 3 entradas con números de la propuesta: 0,48 × 0,81 = 0,39; 0,30 × −0,70 = −0,21; 0,95 × 0,62 = 0,59.
const small = {
  sizes: [3, 1, 4], activation: 'tanh',
  layers: [
    { weights: [[0.81, -0.70, 0.62]], biases: [-0.12] },
    { weights: [[1], [-1], [0.5], [-0.5]], biases: [0, 0, 0, 0] },
  ],
};
const inputs = [0.48, 0.30, 0.95];
const op = (opName) => ({ layer: 1, neuron: 0, op: opName });

test('productos con tres entradas: cada uno como valor por peso igual a producto', () => {
  const trace = traceNetwork(small, inputs);
  const { t, fmt } = tools('es');
  assert.equal(describeStep({ t, fmt, size: 'operation', last: op('products'), trace, sizes: small.sizes }),
    '0,48 × 0,81 = 0,39 · 0,30 × −0,70 = −0,21 · 0,95 × 0,62 = 0,59');
  const e = tools('en');
  assert.equal(describeStep({ ...e, size: 'operation', last: op('products'), trace, sizes: small.sizes }),
    '0.48 × 0.81 = 0.39 · 0.30 × −0.70 = −0.21 · 0.95 × 0.62 = 0.59');
});

test('suma, sesgo y activación con su nombre', () => {
  const trace = traceNetwork(small, inputs);
  const { t, fmt } = tools('es');
  assert.equal(describeStep({ t, fmt, size: 'operation', last: op('sum'), trace, sizes: small.sizes }), '0,39 − 0,21 + 0,59 = 0,77');
  assert.equal(describeStep({ t, fmt, size: 'operation', last: op('bias'), trace, sizes: small.sizes }), '0,77 + (−0,12) = 0,65');
  assert.equal(describeStep({ t, fmt, size: 'operation', last: op('activation'), trace, sizes: small.sizes }), 'tanh(0,65) = 0,57');
});

test('salida: si el total es mayor que cero y a qué acción dice sí o no', () => {
  const trace = traceNetwork(small, inputs);
  const es1 = tools('es');
  const en1 = tools('en');
  const out = (neuron) => ({ layer: 2, neuron, op: 'activation' });
  assert.match(describeStep({ ...es1, size: 'operation', last: out(0), trace, sizes: small.sizes }), /^0,57 es mayor que 0: sí, Avanzar$/);
  assert.match(describeStep({ ...es1, size: 'operation', last: out(1), trace, sizes: small.sizes }), /^−0,57 no es mayor que 0: no, Izquierda$/);
  assert.match(describeStep({ ...en1, size: 'operation', last: out(1), trace, sizes: small.sizes }), /^−0.57 is not greater than 0: no, Left$/);
});

test('21 entradas: los productos más grandes y cuántos más hay, sin pasar de dos renglones', () => {
  const net = createNetwork({ inputs: 21, hidden: [16], outputs: 4, activation: 'sigmoid', random: createRandom(4) });
  const trace = traceNetwork(net, Array.from({ length: 21 }, (_, i) => (i % 7) / 7));
  for (const lang of ['es', 'en']) {
    const tl = tools(lang);
    const p = describeStep({ ...tl, size: 'operation', last: op('products'), trace, sizes: net.sizes });
    assert.match(p, lang === 'es' ? /y 17 más$/ : /and 17 more$/);
    assert.equal(p.split(' · ').length, 5, 'cuatro términos y "y 17 más"');
    assert.ok(p.length <= 130, `${lang}: ${p.length} caracteres`);
    const s = describeStep({ ...tl, size: 'operation', last: op('sum'), trace, sizes: net.sizes });
    assert.match(s, lang === 'es' ? /y 17 más = / : /and 17 more = /);
  }
  const { shown, more } = shownTerms(trace.layers[1].neurons[0].products);
  assert.equal(shown.length + more, 21);
  assert.equal(shownTerms([1, 2, 3, 4, 5, 6]).shown.length, MAX_TERMS);
  assert.deepEqual(shownTerms([1, -9, 3, 0, 5, 6, 7]).shown, [1, 4, 5, 6]);
});

test('de a neuronas o capas: un resumen de lo hecho', () => {
  const trace = traceNetwork(small, inputs);
  const { t, fmt } = tools('es');
  assert.equal(describeStep({ t, fmt, size: 'neuron', last: op('activation'), trace, sizes: small.sizes }), 'Oculta 1 · neurona 1 = 0,57');
  assert.equal(describeStep({ t, fmt, size: 'layer', last: op('activation'), trace, sizes: small.sizes }), 'Oculta 1: 1 de 1 neuronas encendidas');
  assert.equal(describeStep({ t, fmt, size: 'neuron', last: { layer: 2, neuron: 2, op: 'activation' }, trace, sizes: small.sizes }), 'Salidas · Derecha = sí');
  const e = tools('en');
  assert.equal(describeStep({ ...e, size: 'layer', last: { layer: 2, neuron: 3, op: 'activation' }, trace, sizes: small.sizes }), 'Outputs: 2 of 4 actions on yes');
});

test('lugar de la cuenta: el cuadro, la capa, la neurona y la operación, con palabras', () => {
  const cursor = createPassCursor([6, 6, 4]);
  cursor.advance('neuron'); cursor.advance('neuron');
  cursor.advance('operation'); cursor.advance('operation');
  const { t } = tools('es');
  assert.equal(whereText({ t, frame: 132, sizes: [6, 6, 4], cursor, realTimePlaying: false }), 'Cuadro 132 · Oculta 1 · neurona 3 · Suma');
  assert.equal(whereText({ t, frame: 132, sizes: [6, 6, 4], cursor, realTimePlaying: true }), 'Cuadro 132');
  const e = tools('en');
  assert.equal(whereText({ ...e, frame: 7, sizes: [6, 6, 4], cursor, realTimePlaying: false }), 'Frame 7 · Hidden 1 · neuron 3 · Sum');
});

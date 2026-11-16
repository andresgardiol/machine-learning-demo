import test from 'node:test';
import assert from 'node:assert/strict';
import es from '../src/i18n/es.js';
import en from '../src/i18n/en.js';
import { createI18n, formatValue } from '../src/ui/i18n.js';
import { describeStep, describeOperation, whereText, shownTerms, MAX_TRACK } from '../src/tabs/inspect/describe.js';
import { createChanges } from '../src/core/network-changes.js';
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

/** Cursor llevado hasta después de la operación que cumple `pred`. */
function cursorAt(sizes, pred) {
  const c = createPassCursor(sizes);
  while (!c.done) { c.advance('operation'); if (pred(c.position)) return c; }
  throw new Error('no llegó');
}
const strip = (d) => d.tokens.map((k) => k.text).join(' ');

test('una operación es una sola cuenta: multiplicar la tercera entrada, con el nombre de cada número', () => {
  const trace = traceNetwork(small, inputs);
  const { t, fmt } = tools('es');
  const c = cursorAt(small.sizes, (p) => p.layer === 1 && p.op === 'multiply' && p.input === 2);
  const d = describeOperation({ t, fmt, last: c.position, trace, sizes: small.sizes, cursor: c });
  assert.equal(d.place, 'Oculta 1 · neurona 1 · Multiplicar');
  assert.equal(d.step, 'Paso 5 de 8 de esta neurona');
  assert.equal(strip(d), '0,95 × 0,62 = 0,59');
  assert.deepEqual(d.tokens.filter((k) => k.kind === 'num').map((k) => k.name), ['valor de Velocidad', 'peso de la conexión', 'aporte de Velocidad']);
  assert.deepEqual(d.tokens.filter((k) => k.result).map((k) => k.text), ['0,59'], 'un solo resultado, marcado');
  assert.ok(d.tokens.filter((k) => k.kind === 'num').length <= 3, 'dos números como mucho y un resultado');
  // Por dónde va la neurona: las dos primeras hechas, la tercera en curso.
  assert.deepEqual(d.track.marks.map((m) => m.state), ['done', 'done', 'current', 'pending', 'pending']);
  assert.match(d.spoken, /^Multiplicar: valor de Velocidad, 0,95 por peso de la conexión, 0,62 igual a aporte de Velocidad, 0,59\./);
});

test('sumar: la suma hasta acá más el aporte; en la primera entrada arranca en cero y la frase lo dice', () => {
  const trace = traceNetwork(small, inputs);
  const { t, fmt } = tools('es');
  const first = cursorAt(small.sizes, (p) => p.layer === 1 && p.op === 'add' && p.input === 0);
  const d0 = describeOperation({ t, fmt, last: first.position, trace, sizes: small.sizes, cursor: first });
  assert.equal(strip(d0), '0,00 + 0,39 = 0,39');
  assert.match(d0.say, /arranca en 0/);
  const third = cursorAt(small.sizes, (p) => p.layer === 1 && p.op === 'add' && p.input === 1);
  const d1 = describeOperation({ t, fmt, last: third.position, trace, sizes: small.sizes, cursor: third });
  assert.equal(strip(d1), '0,39 + (−0,21) = 0,18');
  assert.deepEqual(d1.tokens.filter((k) => k.kind === 'num').map((k) => k.name), ['suma hasta acá', 'aporte de Sensor 2', 'suma hasta acá']);
});

test('sesgo, una sola vez: la suma de todos los aportes más el sesgo, igual al total de la cuenta', () => {
  const trace = traceNetwork(small, inputs);
  const { t, fmt } = tools('es');
  const c = cursorAt(small.sizes, (p) => p.layer === 1 && p.op === 'bias');
  const d = describeOperation({ t, fmt, last: c.position, trace, sizes: small.sizes, cursor: c });
  assert.equal(strip(d), '0,77 + (−0,12) = 0,65');
  assert.equal(d.tokens.at(-1).text, fmt(trace.layers[1].neurons[0].total), 'el total es el de traceNetwork');
  assert.match(d.say, /una sola vez/);
});

test('activación con tanh: la función con su nombre, el total y la salida, cada número con su nombre', () => {
  const trace = traceNetwork(small, inputs);
  for (const lang of ['es', 'en']) {
    const { t, fmt } = tools(lang);
    const c = cursorAt(small.sizes, (p) => p.layer === 1 && p.op === 'activation');
    const d = describeOperation({ t, fmt, last: c.position, trace, sizes: small.sizes, cursor: c });
    assert.equal(strip(d), lang === 'es' ? 'tanh ( 0,65 ) = 0,57' : 'tanh ( 0.65 ) = 0.57');
    assert.deepEqual(d.tokens.filter((k) => k.name).map((k) => k.name), lang === 'es' ? ['activación', 'total', 'salida'] : ['activation', 'total', 'output']);
    assert.match(d.say, /−1/);
  }
});

test('salida: si el total es mayor que cero y a qué acción dice sí o no', () => {
  const trace = traceNetwork(small, inputs);
  const { t, fmt } = tools('es');
  const at = (j) => cursorAt(small.sizes, (p) => p.layer === 2 && p.neuron === j && p.op === 'activation');
  const yes = describeOperation({ t, fmt, last: at(0).position, trace, sizes: small.sizes, cursor: at(0) });
  assert.equal(strip(yes), '0,57 > 0,00 → sí');
  assert.equal(yes.tokens.at(-1).name, 'salida: Avanzar');
  assert.match(yes.say, /sí a Avanzar/);
  const no = describeOperation({ t, fmt, last: at(1).position, trace, sizes: small.sizes, cursor: at(1) });
  assert.match(no.say, /no a Izquierda/);
});

test('leer una entrada: el valor con su nombre y qué significa; una entrada no calcula', () => {
  const sizes = [6, 6, 4];
  const net = createNetwork({ inputs: 6, hidden: [6], outputs: 4, activation: 'tanh', random: createRandom(2) });
  const trace = traceNetwork(net, [0, 0.04, 0.5, 0.9, 1, 0.6]);
  const { t, fmt } = tools('es');
  const read = (i, manual = null) => {
    const c = cursorAt(sizes, (p) => p.layer === 0 && p.neuron === i);
    return describeOperation({ t, fmt, last: c.position, trace, sizes, cursor: c, manual });
  };
  const second = read(1);
  assert.equal(second.place, 'Entradas · Sensor 2 · Leer');
  assert.equal(strip(second), '0,04');
  assert.equal(second.tokens[0].name, 'valor de Sensor 2');
  assert.match(second.say, /casi al final de su alcance/);
  assert.match(second.say, /no calcula/);
  assert.match(read(0).say, /no ve nada dentro de su alcance/);
  assert.match(read(4).say, /muy cerca/);
  assert.match(read(5).say, /velocidad del auto, respecto de la máxima: 60 %/);
  assert.match(read(2, [null, null, 0.5, null, null, null]).say, /lo pusiste vos/);
  assert.equal(read(2).track.marks.map((m) => m.state).join(), 'done,done,done,current,pending,pending');
});

test('conexión apagada y neurona apagada: la frase lo dice', () => {
  const net = createNetwork({ inputs: 3, hidden: [2], outputs: 4, activation: 'tanh', random: createRandom(5) });
  const changes = createChanges(net, [
    { kind: 'connectionOff', layer: 1, neuron: 0, input: 1, value: true },
    { kind: 'neuronOff', layer: 1, neuron: 1, value: true },
  ]);
  const trace = traceNetwork(net, [0.5, 0.5, 0.5], changes);
  const { t, fmt } = tools('es');
  const c = cursorAt(net.sizes, (p) => p.layer === 1 && p.neuron === 0 && p.op === 'multiply' && p.input === 1);
  const d = describeOperation({ t, fmt, last: c.position, trace, sizes: net.sizes, cursor: c });
  assert.equal(d.tokens.at(-1).text, '0,00');
  assert.match(d.say, /conexión de Sensor 2 está apagada/);
  const off = cursorAt(net.sizes, (p) => p.layer === 1 && p.neuron === 1 && p.op === 'activation');
  const e = describeOperation({ t, fmt, last: off.position, trace, sizes: net.sizes, cursor: off });
  assert.equal(e.tokens.at(-1).text, '0,00');
  assert.match(e.say, /neurona está apagada/);
});

test('21 entradas: cada paso sigue siendo una sola cuenta y el recorrido se resume en un renglón', () => {
  const net = createNetwork({ inputs: 21, hidden: [16], outputs: 4, activation: 'sigmoid', random: createRandom(4) });
  const trace = traceNetwork(net, Array.from({ length: 21 }, (_, i) => (i % 7) / 7));
  for (const lang of ['es', 'en']) {
    const tl = tools(lang);
    const c = cursorAt(net.sizes, (p) => p.layer === 1 && p.op === 'multiply' && p.input === 3);
    const d = describeOperation({ ...tl, last: c.position, trace, sizes: net.sizes, cursor: c });
    assert.equal(d.tokens.filter((k) => k.kind === 'num').length, 3);
    assert.equal(d.track.marks.length, 3, 'entradas, sesgo y activación');
    assert.equal(d.track.marks[0].label, lang === 'es' ? 'Entradas 3 de 21' : 'Inputs 3 of 21');
    assert.equal(d.track.marks[0].state, 'current');
  }
  assert.ok(MAX_TRACK >= 6);
  const { shown, more } = shownTerms(trace.layers[1].neurons[0].products);
  assert.equal(shown.length + more, 21);
});

test('lector de pantalla: de a operaciones, la cuenta en una oración con los nombres', () => {
  const trace = traceNetwork(small, inputs);
  const { t, fmt } = tools('es');
  const c = cursorAt(small.sizes, (p) => p.layer === 1 && p.op === 'bias');
  assert.match(describeStep({ t, fmt, size: 'operation', last: c.position, trace, sizes: small.sizes, cursor: c }),
    /^Sesgo: suma hasta acá, 0,77 más sesgo de la neurona, \(−0,12\) igual a total, 0,65\./);
});

test('las frases de a operaciones entran en un renglón: como mucho 100 caracteres', () => {
  const sizes = [6, 6, 4];
  const net = createNetwork({ inputs: 6, hidden: [6], outputs: 4, activation: 'tanh', random: createRandom(2) });
  const trace = traceNetwork(net, [0, 0.04, 0.5, 0.9, 1, 0.6]);
  for (const lang of ['es', 'en']) {
    const tl = tools(lang);
    const c = createPassCursor(sizes);
    while (!c.done) {
      c.advance('operation');
      const d = describeOperation({ ...tl, last: c.position, trace, sizes, cursor: c });
      assert.ok(d.say.length <= 100, `${lang} ${c.position.op}: ${d.say.length} «${d.say}»`);
    }
  }
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
  const { t } = tools('es');
  cursor.advance('operation');
  assert.equal(whereText({ t, frame: 132, sizes: [6, 6, 4], cursor, realTimePlaying: false }), 'Cuadro 132 · Entradas · Sensor 1 · Leer');
  cursor.advance('layer'); cursor.advance('neuron');
  for (let k = 0; k < 5; k++) cursor.advance('operation'); // m0 a0 m1 a1 m2: multiplicó la tercera entrada
  assert.equal(whereText({ t, frame: 132, sizes: [6, 6, 4], cursor, realTimePlaying: false }), 'Cuadro 132 · Oculta 1 · neurona 2 · Sensor 3 · Multiplicar');
  assert.equal(whereText({ t, frame: 132, sizes: [6, 6, 4], cursor, realTimePlaying: true }), 'Cuadro 132');
  const e = tools('en');
  assert.equal(whereText({ ...e, frame: 7, sizes: [6, 6, 4], cursor, realTimePlaying: false }), 'Frame 7 · Hidden 1 · neuron 2 · Sensor 3 · Multiply');
  for (let k = 0; k < 8; k++) cursor.advance('operation'); // hasta el sesgo
  assert.equal(whereText({ t, frame: 132, sizes: [6, 6, 4], cursor, realTimePlaying: false }), 'Cuadro 132 · Oculta 1 · neurona 2 · Sesgo');
});

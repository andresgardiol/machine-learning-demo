import test from 'node:test';
import assert from 'node:assert/strict';
import { createLabSession, rateToSlider, sliderToRate, normalizeHidden } from '../src/tabs/lab/session.js';
import { createLabPlayback, PACES, isRunning } from '../src/tabs/lab/playback.js';
import { describeLearningStep, whereText, topTerms, neuronName } from '../src/tabs/lab/describe.js';
import { createLabMissions } from '../src/tabs/lab/missions.js';
import { createLearningAnimation, stepDuration } from '../src/tabs/lab/step-animation.js';
import { shortcutFor } from '../src/tabs/lab/shortcuts.js';
import { exampleDetail } from '../src/core/learning-cursor.js';
import { createNetwork } from '../src/core/network.js';
import { createRandom } from '../src/core/random.js';
import { setCharacterShortcuts } from '../src/ui/shortcuts.js';
import { EXAMPLE_BRAINS } from '../src/data/example-brains.js';
import { createI18n, formatValue } from '../src/ui/i18n.js';
import es from '../src/i18n/es.js';
import en from '../src/i18n/en.js';
import { planeGrid, cellShade } from '../src/render/plane-view.js';

const brainFor = (key) => EXAMPLE_BRAINS.find((b) => `example:${b.id}` === key) ?? null;
// El Laboratorio abre con compuertas; estas pruebas son de puntos: los eligen, como haría la persona.
const session = () => { const s = createLabSession({ brainFor }); s.setKind('points'); return s; };

// --- Sesión ------------------------------------------------------------------------------------------
test('sesión por defecto: puntos en círculo, 200, ruido 10 %, 30 % apartados, una capa de 4 con tanh, tasa 0,1', () => {
  const s = session();
  assert.equal(s.kind, 'points');
  assert.deepEqual(s.settings.points, { shape: 'circle', count: 200, noise: 10 });
  assert.equal(s.settings.holdout, 30);
  assert.deepEqual(s.run.network.sizes, [2, 4, 1]);
  assert.equal(s.run.network.activation, 'tanh');
  assert.equal(s.settings.rate, 0.1);
  assert.equal(s.split.practice.length, 140);
});

test('siempre igual: dos sesiones nuevas tienen los mismos puntos, la misma red y las mismas curvas', () => {
  const a = session();
  const b = session();
  assert.deepEqual(a.data.examples, b.data.examples);
  assert.deepEqual(a.run.network, b.run.network);
  a.run.runEpochs(5); b.run.runEpochs(5);
  assert.deepEqual(a.run.history, b.run.history);
});

test('cambiar la forma: datos nuevos, pesos al azar y curvas vacías, con la misma red', () => {
  const s = session();
  s.run.runEpochs(3);
  assert.ok(s.setPoints({ shape: 'spiral' }));
  assert.equal(s.run.epoch, 0);
  assert.equal(s.run.history.length, 0);
  assert.equal(s.data.shape, 'spiral');
  assert.deepEqual(s.run.network.sizes, [2, 4, 1]);
});

test('reiniciar pesos: otros pesos cada vez, la misma serie para todos', () => {
  const a = session();
  const b = session();
  const nets = [];
  for (let k = 0; k < 3; k++) { a.resetWeights(); b.resetWeights(); nets.push(JSON.stringify(a.run.network)); assert.deepEqual(a.run.network, b.run.network); }
  assert.equal(new Set(nets).size, 3);
});

test('armar la red: capas de 0 a 3, cada una con su ajuste de neuronas; cambiar arma una red nueva', () => {
  const s = session();
  assert.ok(s.setLayers(2));
  assert.deepEqual(s.run.network.sizes, [2, 4, 4, 1]);
  assert.ok(s.setNeurons(1, 7));
  assert.deepEqual(s.run.network.sizes, [2, 4, 7, 1]);
  assert.ok(s.setLayers(0));
  assert.deepEqual(s.run.network.sizes, [2, 1]);
  assert.ok(s.setActivation('relu'));
  assert.equal(s.run.network.activation, 'relu');
  assert.equal(s.setActivation('step'), false);
  s.resetNetwork();
  assert.deepEqual(s.run.network.sizes, [2, 4, 1]);
  assert.equal(s.run.network.activation, 'tanh');
  assert.deepEqual(normalizeHidden([0, 20, 5, 3, 2]), [4, 8, 5]);
});

test('sin capas ocultas con el círculo: los aciertos no pasan de lo que logra una recta', () => {
  const s = session();
  s.setLayers(0);
  s.run.runEpochs(150);
  assert.ok(s.run.history.at(-1).heldOut.accuracy < 0.8, String(s.run.history.at(-1).heldOut.accuracy));
});

test('tasa: se aplica en marcha sin empezar de nuevo; el deslizador es logarítmico de 0,001 a 3', () => {
  const s = session();
  s.run.runEpochs(3);
  assert.ok(s.setRate(0.5));
  assert.equal(s.run.epoch, 3);
  assert.equal(s.run.rate, 0.5);
  assert.equal(sliderToRate(0), 0.001);
  assert.equal(sliderToRate(1), 3);
  assert.ok(Math.abs(sliderToRate(rateToSlider(0.1)) - 0.1) < 1e-12);
});

test('parte apartada: se separa de nuevo y el aprendizaje empieza desde cero', () => {
  const s = session();
  s.run.runEpochs(2);
  assert.ok(s.setHoldout(50));
  assert.equal(s.split.heldOut.length, 100);
  assert.equal(s.run.epoch, 0);
});

test('tu manejo: ejemplos del maestro por defecto, red de 6 entradas y 4 salidas; volver a puntos conserva sus ajustes', () => {
  const s = session();
  s.setPoints({ shape: 'xor', noise: 30 });
  assert.ok(s.setKind('driving'));
  assert.equal(s.data.kind, 'driving');
  assert.equal(s.data.examples.length, 3600);
  assert.deepEqual(s.run.network.sizes, [6, 4, 4]);
  assert.equal(s.teacherKey, 'example:street-new');
  s.setKind('points');
  assert.deepEqual(s.settings.points, { shape: 'xor', count: 200, noise: 30 });
});

test('cambiar de maestro y de pista toma los ejemplos de nuevo', () => {
  const s = session();
  s.setKind('driving');
  const before = s.data.examples;
  assert.ok(s.setTeacher('example:oval'));
  assert.notDeepEqual(s.data.examples, before);
  assert.ok(s.setDriving({ track: 'oval' }));
  assert.equal(s.data.track, 'oval');
  assert.equal(s.run.epoch, 0);
});

test('lo grabado: pasa a ser los ejemplos; borrar vuelve al maestro; volver al maestro lo conserva', () => {
  const s = session();
  s.setKind('driving');
  const rec = { kind: 'driving', sensors: { count: 5, range: 3, spread: 90 }, inputs: 6, outputs: 4, examples: Array.from({ length: 300 }, (_, k) => ({ inputs: [1, 1, 1, 1, 1, 0.5], targets: [1, k % 2, 0, 0], attempt: 0, step: k })) };
  s.useRecorded(rec);
  assert.equal(s.source, 'recorded');
  assert.equal(s.data.examples.length, 300);
  assert.ok(s.fewRecorded); // 5 s
  s.setTeacher('example:street-new');
  assert.equal(s.source, 'teacher');
  assert.ok(s.recorded);
  assert.ok(s.chooseRecorded());
  assert.equal(s.data.examples.length, 300);
  s.clearRecorded();
  assert.equal(s.source, 'teacher');
  assert.equal(s.data.examples.length, 3600);
});

// --- Reproducción ------------------------------------------------------------------------------------
test('reproducción: arranca en pausa de a épocas a 10 por segundo; al reproducir, ritmos por tamaño', () => {
  const p = createLabPlayback();
  assert.equal(p.size, 'epoch');
  assert.equal(p.playing, false);
  assert.equal(p.tick(), 0);
  assert.equal(p.rate, 10);
  p.play();
  let n = 0;
  for (let k = 0; k < 60; k++) n += p.tick();
  assert.equal(n, 10);
  p.setSize('neuron');
  assert.equal(p.kind, 'step');
  p.setPace(0);
  assert.equal(p.rate, 1);
  assert.deepEqual([PACES.epoch[0], PACES.epoch.at(-1), PACES.example.at(-1), PACES.step.at(-1)], [1, 60, 200, 20]);
  assert.ok(isRunning('epoch') && isRunning('example') && !isRunning('phase'));
  p.pause();
  assert.equal(p.tick(), 0);
});

// --- Operación en curso --------------------------------------------------------------------------
function textFor(lang) {
  const i18n = createI18n({ dictionaries: { es, en }, language: lang });
  return { t: (k, p) => i18n.t(k, p), fmt: (v) => formatValue(v, lang) };
}
test('operación en curso: error, culpa y corrección con sus números, en los dos idiomas', () => {
  const net = createNetwork({ inputs: 2, hidden: [3], outputs: 1, activation: 'tanh', random: createRandom(2) });
  const detail = exampleDetail(net, { inputs: [0.5, -0.3], targets: [0] }, 0.3);
  for (const lang of ['es', 'en']) {
    const { t, fmt } = textFor(lang);
    const ctx = { kind: 'points', sizes: net.sizes };
    const err = describeLearningStep({ t, fmt, detail, ctx, last: { phase: 'error', layer: 2, neuron: 0 } });
    assert.ok(err.includes(`${fmt(detail.forward.outputs[0])} − 0 = ${fmt(detail.forward.outputs[0])}`), err);
    const blame = describeLearningStep({ t, fmt, detail, ctx, last: { phase: 'backward', layer: 1, neuron: 1 } });
    assert.ok(blame.includes(fmt(detail.backward.terms[1][1].slope)) && blame.includes(fmt(detail.backward.deltas[1][1])), blame);
    const upd = describeLearningStep({ t, fmt, detail, ctx, last: { phase: 'update', layer: 1, neuron: 0 } });
    assert.ok(upd.includes(fmt(detail.corrections.weights[1][0][0].after)), upd);
    assert.ok(upd.length < 200, upd);
  }
});
test('operación en curso: con muchas conexiones, las más grandes y cuántas más', () => {
  assert.deepEqual(topTerms([0.1, -0.9, 0.2, 0.05, 0.5, -0.3]), { shown: [1, 4, 5], more: 3 });
  const net = createNetwork({ inputs: 6, hidden: [8, 8], outputs: 4, activation: 'tanh', random: createRandom(2) });
  const detail = exampleDetail(net, { inputs: [1, 0.5, 0.2, 0.9, 1, 0.3], targets: [1, 0, 1, 0] }, 0.1);
  const { t, fmt } = textFor('es');
  const text = describeLearningStep({ t, fmt, detail, ctx: { kind: 'driving', sizes: net.sizes }, last: { phase: 'backward', layer: 1, neuron: 0 } });
  assert.ok(text.includes('y 5 más'), text);
  assert.ok(!text.includes('+ −'), text);
});
test('por dónde va y nombres según los datos', () => {
  const { t } = textFor('es');
  assert.equal(neuronName(t, { kind: 'points', sizes: [2, 4, 1] }, 0, 1), 'y');
  assert.equal(neuronName(t, { kind: 'points', sizes: [2, 4, 1] }, 2, 0), 'Color');
  assert.equal(neuronName(t, { kind: 'driving', sizes: [6, 4, 4] }, 2, 2), es['network.output.right']);
  const s = session();
  s.run.advance('phase'); s.run.advance('phase'); s.run.advance('neuron'); s.run.advance('neuron');
  const w = whereText({ t, run: s.run, ctx: { kind: 'points', sizes: s.run.network.sizes }, running: false });
  assert.match(w, /Época 1 · ejemplo 1 de 140 · vuelta · Oculta 1 · neurona 1/);
});

// --- Misiones, animación y atajos ----------------------------------------------------------------
test('misiones: seguir una corrección entera, memorizar y guardar; no se cumplen de a ejemplos', () => {
  const m = createLabMissions({ completed: new Set() });
  m.stepped('example', '1:0', [{ phase: 'forward' }, { phase: 'error' }, { phase: 'backward' }, { phase: 'update' }]);
  assert.equal(m.isDone('follow'), false);
  for (const phase of ['forward', 'error', 'backward', 'update']) m.stepped('phase', '1:1', [{ phase }]);
  assert.equal(m.isDone('follow'), true);
  m.warned(); m.saved();
  assert.deepEqual(m.missions.map((x) => x.done), [true, true, true]);
});
test('animación de la vuelta: un tramo por capa, de las salidas hacia atrás, y se completa al pedir otro paso', () => {
  const units = [{ phase: 'backward', layer: 2, neuron: 0 }, { phase: 'backward', layer: 1, neuron: 0 }, { phase: 'backward', layer: 1, neuron: 1 }];
  const a = createLearningAnimation(units, { start: 0, duration: 400 });
  assert.equal(a.slots.length, 2);
  const s0 = a.state(100);
  assert.deepEqual(s0.items.map((x) => `${x.layer}:${x.neuron}`), ['2:0']);
  assert.ok(s0.hidden.has('backward:1:1'));
  const s1 = a.state(300);
  assert.deepEqual(s1.items.map((x) => `${x.layer}:${x.neuron}`), ['1:0', '1:1']);
  a.finish();
  assert.equal(a.state(310).done, true);
  assert.equal(stepDuration('neuron', { intervalMs: 100 }), 80);
});
test('atajos: espacio, N, R y V; grabando no actúan; con los atajos apagados tampoco', () => {
  const key = (code) => ({ code, key: code, target: {}, ctrlKey: false, metaKey: false, altKey: false });
  assert.equal(shortcutFor(key('Space')), 'play');
  assert.equal(shortcutFor(key('KeyN')), 'step');
  assert.equal(shortcutFor(key('KeyR')), 'restart');
  assert.equal(shortcutFor(key('KeyV')), 'view');
  assert.equal(shortcutFor(key('Space'), { recording: true }), null);
  setCharacterShortcuts(false);
  assert.equal(shortcutFor(key('KeyN')), null);
  setCharacterShortcuts(true);
});

// --- Plano ------------------------------------------------------------------------------------------
test('plano: el fondo sigue a la red; al aprender cada punto queda sobre el fondo de su color', () => {
  const s = session();
  s.run.runEpochs(150);
  const g = planeGrid(s.run.network, 50);
  // El centro y una esquina, de colores distintos.
  assert.equal(cellShade(g[25 * 50 + 25]).cls, 'a');
  assert.equal(cellShade(g[0]).cls, 'b');
  assert.ok(cellShade(0.99).alpha > 0.9 && cellShade(0.5).alpha < 0.01);
});

test('curvas: con miles de épocas se dibujan como mucho unos 300 puntos, con la última y la marcada', async () => {
  const { chartPoints, CHART_MAX_POINTS } = await import('../src/tabs/lab/index.js');
  const h = Array.from({ length: 5000 }, (_, k) => ({ epoch: k + 1 }));
  const p = chartPoints(h, 4321);
  assert.ok(p.length <= CHART_MAX_POINTS + 2);
  assert.equal(p.at(-1).epoch, 5000);
  assert.ok(p.some((e) => e.epoch === 4321));
  assert.equal(chartPoints(h.slice(0, 50)).length, 50);
});

test('filtro de conexiones del Laboratorio (vista-de-la-red D21): con 1, cada neurona conserva una sola conexión de entrada, la de mayor peso', async () => {
  const { topConnections } = await import('../src/core/network-changes.js');
  const { createNetwork } = await import('../src/core/network.js');
  const { createRandom } = await import('../src/core/random.js');
  const net = createNetwork({ inputs: 2, hidden: [4], outputs: 1, activation: 'tanh', random: createRandom(5) });
  const top = topConnections(net, null, 1);
  for (let l = 1; l < net.sizes.length; l++) {
    top[l].forEach((set, j) => {
      assert.equal(set.size, 1);
      const row = net.layers[l - 1].weights[j].map(Math.abs);
      assert.ok(set.has(row.indexOf(Math.max(...row))));
    });
  }
  // Sigue a los pesos: si otra conexión pasa a ser la mayor, el filtro la toma.
  const before = [...topConnections(net, null, 1)[1][0]][0];
  net.layers[0].weights[0][1 - before] = 10;
  assert.equal([...topConnections(net, null, 1)[1][0]][0], 1 - before);
  assert.equal(topConnections(net, null, 'all'), null);
});

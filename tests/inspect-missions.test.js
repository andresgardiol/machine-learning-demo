import test from 'node:test';
import assert from 'node:assert/strict';
import { createInspectMissions, MISSION_IDS, OFF_SECONDS } from '../src/tabs/inspect/missions.js';
import es from '../src/i18n/es.js';
import en from '../src/i18n/en.js';

const op = (layer, neuron, o, input) => (input === undefined ? { layer, neuron, op: o } : { layer, neuron, op: o, input });

test('tres misiones, ninguna cumplida al empezar', () => {
  const m = createInspectMissions();
  assert.deepEqual(m.missions, MISSION_IDS.map((id) => ({ id, done: false })));
});

const SIZES = [2, 3, 4];
/** Las seis operaciones de la neurona j de la capa 1 (dos entradas). */
const neuronOps = (j) => [op(1, j, 'multiply', 0), op(1, j, 'add', 0), op(1, j, 'multiply', 1), op(1, j, 'add', 1), op(1, j, 'bias'), op(1, j, 'activation')];

test('seguir una cuenta: todas las operaciones de una misma neurona (2n + 2), de a una', () => {
  const m = createInspectMissions();
  const ops = neuronOps(0);
  for (const o of ops.slice(0, 5)) m.stepped('operation', [o], SIZES);
  assert.equal(m.isDone('follow'), false);
  m.stepped('operation', [op(1, 1, 'activation')], SIZES);
  assert.equal(m.isDone('follow'), false, 'otra neurona no cuenta');
  m.stepped('operation', [op(0, 0, 'read')], SIZES);
  assert.equal(m.isDone('follow'), false, 'leer una entrada no cuenta');
  m.stepped('operation', [ops[5]], SIZES);
  assert.equal(m.isDone('follow'), true);
});

test('seguir una cuenta: de a neuronas no cuenta, ni empezar otro cuadro a mitad', () => {
  const m = createInspectMissions();
  m.stepped('neuron', neuronOps(0), SIZES);
  const ops = neuronOps(1);
  m.stepped('operation', [ops[0]], SIZES);
  m.newFrame();
  for (const o of ops.slice(1)) m.stepped('operation', [o], SIZES);
  assert.equal(m.isDone('follow'), false);
});

test('cambiar una decisión: con una entrada a mano y alguna acción distinta', () => {
  const m = createInspectMissions();
  m.manualDecision({ manual: true, outputs: [1, 0, 0, 0], real: [1, 0, 0, 0] });
  assert.equal(m.isDone('decision'), false);
  m.manualDecision({ manual: false, outputs: [1, 1, 0, 0], real: [1, 0, 0, 0] });
  assert.equal(m.isDone('decision'), false);
  m.manualDecision({ manual: true, outputs: [1, 1, 0, 0], real: [1, 0, 0, 0] });
  assert.equal(m.isDone('decision'), true);
});

test('apagar una neurona: reproducir al menos tres segundos con una apagada', () => {
  const m = createInspectMissions();
  m.played(60 * OFF_SECONDS - 1, true);
  assert.equal(m.isDone('off'), false);
  m.played(1, false);
  m.played(60 * OFF_SECONDS - 1, true);
  assert.equal(m.isDone('off'), false, 'encenderla reinicia la cuenta');
  m.played(1, true);
  assert.equal(m.isDone('off'), true);
});

test('las cumplidas se conservan (hasta cerrar la app) y no bloquean nada', () => {
  const completed = new Set();
  createInspectMissions({ completed }).played(200, true);
  assert.equal(createInspectMissions({ completed }).isDone('off'), true);
});

test('textos: guía de hasta 240 caracteres y misiones de hasta 34, en los dos idiomas', () => {
  for (const dict of [es, en]) {
    assert.ok(dict['inspect.guide'].length <= 240, dict['inspect.guide']);
    for (const id of MISSION_IDS) assert.ok(dict[`inspect.mission.${id}`].length <= 34, dict[`inspect.mission.${id}`]);
  }
  assert.match(es['inspect.guide'], /red del cerebro que maneja.*círculo es una neurona.*línea, un peso/s);
});

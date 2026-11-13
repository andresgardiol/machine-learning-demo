// Barra de escenario (panel-de-entrenar-por-vistas D11, D12 y D17): la lógica sin DOM.
import test from 'node:test';
import assert from 'node:assert/strict';
import { BAR_KEYS, BAR_GROUPS, barEffect, createSliderGesture, trackAfterKey } from '../src/tabs/shared/scenario-bar.js';
import { barSettings, barPatch, BAR_DEFAULTS, RESTART_GENERATION_KEYS, DEFAULT_SETTINGS, normalizeSettings } from '../src/tabs/train/settings.js';
import { DEFAULT_SETTINGS as DRIVE_DEFAULTS } from '../src/tabs/shared/street-settings.js';
import { SCENARIO_KEYS } from '../src/core/training.js';
import es from '../src/i18n/es.js';
import en from '../src/i18n/en.js';

test('orden: pista, tráfico, sensores y auto, con sus ajustes', () => {
  assert.deepEqual(BAR_GROUPS.map((g) => g.id), ['track', 'traffic', 'sensors', 'car']);
  assert.deepEqual(BAR_KEYS, ['track', 'lanes', 'density', 'irregularity', 'sensorCount', 'sensorRange', 'sensorSpread', 'maxSpeed']);
});

test('El problema y Reglas a mano: velocidad, densidad e irregularidad en marcha; pista, carriles y sensores reinician el intento', () => {
  for (const tab of ['drive', 'rules']) {
    for (const k of ['maxSpeed', 'density', 'irregularity']) assert.equal(barEffect(tab, k), 'live', `${tab} ${k}`);
    for (const k of ['track', 'lanes', 'sensorCount', 'sensorRange', 'sensorSpread']) assert.equal(barEffect(tab, k), 'restartAttempt', `${tab} ${k}`);
  }
  assert.equal(barEffect('drive', 'population'), null);
});

test('Entrenar: pista, tráfico y velocidad vuelven a empezar la generación; los sensores piden un entrenamiento nuevo', () => {
  for (const k of ['track', 'lanes', 'density', 'irregularity', 'maxSpeed']) assert.equal(barEffect('train', k), 'restartGeneration', k);
  for (const k of ['sensorCount', 'sensorRange', 'sensorSpread']) assert.equal(barEffect('train', k), 'newTraining', k);
  // Las claves que vuelven a empezar la generación son las que el núcleo aplica en ese momento.
  assert.deepEqual([...RESTART_GENERATION_KEYS].sort(), [...SCENARIO_KEYS].sort());
});

test('Arrastre de un deslizador: final falso mientras se arrastra y verdadero una sola vez, al soltar', () => {
  const calls = [];
  const g = createSliderGesture((value, info) => calls.push([value, info.final, info.first]));
  g.input(55);
  g.input(60);
  g.input(70);
  assert.equal(g.active, true);
  g.change(70);
  assert.deepEqual(calls, [[55, false, true], [60, false, false], [70, false, false], [70, true, false]]);
  assert.equal(calls.filter((c) => c[1]).length, 1);
  // Con el teclado: cada tecla es un gesto entero (input y change).
  calls.length = 0;
  g.input(75);
  g.change(75);
  assert.deepEqual(calls, [[75, false, true], [75, true, false]]);
  assert.equal(g.active, false);
});

test('Teclado: las flechas recorren las pistas en orden y dan la vuelta; Inicio y Fin van a los extremos', () => {
  assert.equal(trackAfterKey('straight', 'ArrowRight'), 'oval');
  assert.equal(trackAfterKey('oval', 'ArrowDown'), 'kidney');
  assert.equal(trackAfterKey('grandPrix', 'ArrowRight'), 'straight');
  assert.equal(trackAfterKey('straight', 'ArrowLeft'), 'grandPrix');
  assert.equal(trackAfterKey('kidney', 'ArrowUp'), 'oval');
  assert.equal(trackAfterKey('oval', 'Home'), 'straight');
  assert.equal(trackAfterKey('oval', 'End'), 'grandPrix');
  assert.equal(trackAfterKey('oval', 'Enter'), null);
});

test('Entrenar: la barra muestra una sola pista y elegir una deja solo esa', () => {
  assert.equal(barSettings(DEFAULT_SETTINGS).track, 'straight');
  assert.deepEqual(barPatch('track', 'oval'), { tracks: ['oval'] });
  assert.deepEqual(barPatch('density', 70), { density: 70 });
  const s = normalizeSettings({ ...DEFAULT_SETTINGS, ...barPatch('track', 'grandPrix') });
  assert.deepEqual([...s.tracks], ['grandPrix']);
  assert.equal(barSettings(s).track, 'grandPrix');
  assert.deepEqual([...BAR_DEFAULTS.tracks], ['straight']);
});

test('Estado por defecto: calle recta, 3 carriles, densidad 50 %, 5 sensores de 3 largos y 90 grados, 20 m/s', () => {
  for (const s of [DRIVE_DEFAULTS, barSettings(DEFAULT_SETTINGS)]) {
    assert.equal(s.track, 'straight');
    assert.equal(s.lanes, 3);
    assert.equal(s.density, 50);
    assert.deepEqual([s.sensorCount, s.sensorRange, s.sensorSpread], [5, 3, 90]);
    assert.equal(s.maxSpeed, 20);
  }
});

test('textos de la barra en los dos idiomas: nombres cortos de pista y rótulos de los grupos', () => {
  const keys = ['bar.title', 'bar.group.track', 'bar.group.traffic', 'bar.group.sensors', 'bar.group.car', 'bar.reset',
    ...BAR_KEYS.filter((k) => k !== 'track').map((k) => `bar.${k}`),
    ...['straight', 'oval', 'kidney', 'grandPrix'].map((id) => `track.short.${id}`)];
  for (const k of keys) {
    assert.ok(es[k], `es ${k}`);
    assert.ok(en[k], `en ${k}`);
  }
  assert.deepEqual(['straight', 'oval', 'kidney', 'grandPrix'].map((id) => es[`track.short.${id}`]), ['Calle', 'Óvalo', 'Chicana', 'Curvas']);
  assert.equal(es['bar.title'], 'Escenario');
  // El tooltip de cada pista empieza con su nombre completo.
  for (const id of ['straight', 'oval', 'kidney', 'grandPrix']) {
    assert.ok(es[`help.track.option.${id}.what`].startsWith(es[`track.${id}`]), id);
    assert.ok(en[`help.track.option.${id}.what`].startsWith(en[`track.${id}`]), id);
  }
});

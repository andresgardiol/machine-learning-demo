// La barra en Competir (pestana-competir D12) y la descripción de una carrera (D11).
import test from 'node:test';
import assert from 'node:assert/strict';
import { barEffect, BAR_KEYS } from '../src/tabs/shared/scenario-bar.js';
import { raceDescription, goalText } from '../src/tabs/shared/stage-text.js';
import es from '../src/i18n/es.js';
import en from '../src/i18n/en.js';
import { format } from '../src/ui/i18n.js';

test('Competir: la pista, el tráfico y la velocidad empiezan otra carrera; los sensores no aplican', () => {
  for (const k of ['track', 'lanes', 'density', 'irregularity', 'maxSpeed']) assert.equal(barEffect('compete', k), 'newRace', k);
  for (const k of ['sensorCount', 'sensorRange', 'sensorSpread']) assert.equal(barEffect('compete', k), null, k);
  assert.equal(barEffect('compete', 'population'), null);
  assert.equal(BAR_KEYS.length, 8);
});

const tFor = (dict) => (key, params) => format(dict[key] ?? `[${key}]`, params);

test('descripción de una carrera: pista, meta, cuántos corren, quién va primero y a quién se sigue', () => {
  const t = tFor(es);
  const text = raceDescription({ t, track: 'straight', lanes: 3, goal: { kind: 'meters', value: 1000 }, count: 3, phase: 'running', leader: 'Vos', winner: null, followed: 'Vos' });
  assert.equal(text, 'Calle recta de 3 carriles, con tráfico. Carrera a 1000 m. Corren 3. Va primero Vos. La cámara sigue a Vos.');
  const oval = raceDescription({ t, track: 'oval', lanes: 3, goal: { kind: 'laps', value: 2 }, count: 4, phase: 'waiting', leader: null, winner: null, followed: 'Vos' });
  assert.match(oval, /Carrera a 2 vueltas\. Corren 4\. Esperando la largada\./);
  assert.match(raceDescription({ t, track: 'kidney', lanes: 3, goal: { kind: 'laps', value: 1 }, count: 2, phase: 'finished', leader: null, winner: 'Calle, tráfico nuevo', followed: null }), /a 1 vuelta\..*ganó Calle, tráfico nuevo\./);
  assert.match(raceDescription({ t, track: 'oval', lanes: 3, goal: { kind: 'laps', value: 2 }, count: 2, phase: 'finished', leader: null, winner: null, followed: null }), /no llegó nadie/);
});

test('descripción de una carrera en inglés', () => {
  const t = tFor(en);
  const text = raceDescription({ t, track: 'straight', lanes: 3, goal: { kind: 'meters', value: 1000 }, count: 3, phase: 'paused', leader: 'You', winner: null, followed: 'You' });
  assert.equal(text, 'Straight street with 3 lanes and traffic. Race to 1000 m. 3 racing. In the lead: You. The race is paused. Camera on: You.');
  assert.equal(goalText(t, { kind: 'laps', value: 1 }), 'Race over 1 lap.');
  for (const s of [text]) assert.doesNotMatch(s, /\[stage/);
});

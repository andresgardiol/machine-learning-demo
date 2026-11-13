// Cuenta regresiva al largar con "Vos" (pestana-competir D5): estados y qué la corta.
import test from 'node:test';
import assert from 'node:assert/strict';
import { createCountdown, COUNTDOWN_FROM, GO_SECONDS } from '../src/tabs/compete/countdown.js';
import { mainAction } from '../src/tabs/compete/shortcuts.js';
import es from '../src/i18n/es.js';
import en from '../src/i18n/en.js';

test('3, 2, 1, un segundo de reloj cada uno; después el "¡Ya!" medio segundo y termina', () => {
  const c = createCountdown();
  assert.deepEqual(c.at(0), { state: 'idle', number: null });
  c.start(10);
  assert.equal(COUNTDOWN_FROM, 3);
  assert.deepEqual(c.at(10), { state: 'counting', number: 3 });
  assert.deepEqual(c.at(10.99), { state: 'counting', number: 3 });
  assert.deepEqual(c.at(11), { state: 'counting', number: 2 });
  assert.deepEqual(c.at(12.5), { state: 'counting', number: 1 });
  assert.equal(c.at(13).state, 'go');
  assert.equal(c.at(13 + GO_SECONDS - 0.01).state, 'go');
  assert.equal(c.at(13 + GO_SECONDS).state, 'done');
});

test('cortar la cuenta (reiniciar, otra carrera, un cambio de la barra o salir) la deja como antes de largar', () => {
  const c = createCountdown();
  c.start(0);
  assert.equal(c.running, true);
  c.cancel();
  assert.equal(c.running, false);
  assert.equal(c.at(1).state, 'idle');
});

test('durante la cuenta, la acción principal no hace nada: ni pausa ni saltea', () => {
  assert.equal(mainAction('counting'), 'counting');
  assert.equal(mainAction('waiting'), 'start');
});

test('textos de la cuenta en los dos idiomas', () => {
  for (const dict of [es, en]) {
    for (const k of ['compete.main.counting', 'compete.countdown.announce', 'compete.countdown.go', 'help.compete.main.counting.what', 'help.compete.main.counting.why']) assert.equal(typeof dict[k], 'string', k);
  }
  assert.equal(es['compete.countdown.go'], '¡Ya!');
});

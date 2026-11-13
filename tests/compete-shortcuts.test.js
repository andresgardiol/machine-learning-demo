// Atajos de Competir (pestana-competir D14): espacio, R y N; respetan el interruptor "Atajos" y no
// actúan al escribir en un campo. Los interruptores de sensores y de ver como la máquina no llevan atajo.
import test from 'node:test';
import assert from 'node:assert/strict';
import { shortcutFor, SHORTCUTS, mainAction } from '../src/tabs/compete/shortcuts.js';
import { setCharacterShortcuts } from '../src/input/keyboard.js';

const fakeElement = ({ tag = 'SECTION', type = null, focusVisible = false } = {}) => ({
  tagName: tag, type,
  getAttribute: () => null,
  matches: (sel) => (sel === ':focus-visible' ? focusVisible : /button|input/i.test(sel) && ['BUTTON', 'INPUT'].includes(tag)),
  closest: () => null,
});
const ev = (code, target, mods = {}) => ({ code, target, ...mods });
const stage = fakeElement();

test('espacio es la acción principal, R reinicia y N larga otra carrera; E y V no son atajos de la pestaña', () => {
  assert.deepEqual({ ...SHORTCUTS }, { Space: 'main', KeyR: 'restart', KeyN: 'another' });
  assert.equal(shortcutFor(ev('Space', stage)), 'main');
  assert.equal(shortcutFor(ev('KeyR', stage)), 'restart');
  assert.equal(shortcutFor(ev('KeyN', stage)), 'another');
  assert.equal(shortcutFor(ev('KeyE', stage)), null);
  assert.equal(shortcutFor(ev('KeyV', stage)), null);
});

test('la acción principal: largar, pausar, reanudar y, con la carrera terminada, otra carrera', () => {
  assert.equal(mainAction('waiting'), 'start');
  assert.equal(mainAction('running'), 'pause');
  assert.equal(mainAction('paused'), 'resume');
  assert.equal(mainAction('finished'), 'another');
});

test('con los atajos apagados ninguna tecla de carácter es un atajo; las flechas no son atajos', () => {
  setCharacterShortcuts(false);
  try {
    for (const code of ['Space', 'KeyR', 'KeyN']) assert.equal(shortcutFor(ev(code, stage)), null, code);
  } finally {
    setCharacterShortcuts(true);
  }
  assert.equal(shortcutFor(ev('ArrowUp', stage)), null);
});

test('no actúan al escribir en un campo, con un control enfocado con el teclado ni con Ctrl, Cmd o Alt', () => {
  const field = fakeElement({ tag: 'INPUT', type: 'text' });
  assert.equal(shortcutFor(ev('KeyR', field)), null);
  assert.equal(shortcutFor(ev('Space', field)), null);
  assert.equal(shortcutFor(ev('Space', fakeElement({ tag: 'BUTTON', focusVisible: true }))), null);
  for (const mod of ['ctrlKey', 'metaKey', 'altKey']) assert.equal(shortcutFor(ev('KeyN', stage, { [mod]: true })), null);
});

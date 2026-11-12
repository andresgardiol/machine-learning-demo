// Atajos de la pestaña Reglas a mano (tarea 5.4): barra espaciadora y R, salvo con Ctrl o Cmd y
// mientras se escribe en el editor.
import test from 'node:test';
import assert from 'node:assert/strict';
import { shortcutFor, SHORTCUTS } from '../src/tabs/rules/shortcuts.js';

/** Elemento de mentira con lo que mira la protección común de los atajos. */
const fakeElement = ({ tag = 'SECTION', focusVisible = false } = {}) => ({
  tagName: tag,
  getAttribute: () => null,
  matches: (sel) => (sel === ':focus-visible' ? focusVisible : /button|textarea/i.test(sel) && ['BUTTON', 'TEXTAREA'].includes(tag)),
  closest: () => null,
});
const ev = (code, target, mods = {}) => ({ code, target, ...mods });
const stage = fakeElement();

test('la barra espaciadora pausa y R reinicia', () => {
  assert.deepEqual(SHORTCUTS, { KeyR: 'restart', Space: 'pause' });
  assert.equal(shortcutFor(ev('Space', stage)), 'pause');
  assert.equal(shortcutFor(ev('KeyR', stage)), 'restart');
  assert.equal(shortcutFor(ev('KeyE', stage)), null);
});

test('con Ctrl, Cmd o Alt no devuelven nada', () => {
  for (const mod of ['ctrlKey', 'metaKey', 'altKey']) {
    assert.equal(shortcutFor(ev('KeyR', stage, { [mod]: true })), null, mod);
    assert.equal(shortcutFor(ev('Space', stage, { [mod]: true })), null, mod);
  }
});

test('Escribir una letra que es un atajo: con el foco en el editor (un textarea) no se accionan', () => {
  const editor = fakeElement({ tag: 'TEXTAREA' });
  assert.equal(shortcutFor(ev('KeyR', editor)), null);
  assert.equal(shortcutFor(ev('Space', editor)), null);
});

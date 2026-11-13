// Atajos de una tecla desactivables (panel-de-entrenar-por-vistas D9, spec accesibilidad).
import test from 'node:test';
import assert from 'node:assert/strict';
import { shortcutFrom, setCharacterShortcuts, characterShortcutsOn, isCharacterKey } from '../src/ui/shortcuts.js';
import { shortcutFor as trainShortcut } from '../src/tabs/train/shortcuts.js';
import { shortcutFor as driveShortcut } from '../src/tabs/drive/shortcuts.js';
import { shortcutFor as rulesShortcut } from '../src/tabs/rules/shortcuts.js';
import { createKeyboardController } from '../src/input/keyboard.js';
import { createPreferences, DEFAULT_SHORTCUTS } from '../src/ui/preferences.js';
import { createI18n } from '../src/ui/i18n.js';
import es from '../src/i18n/es.js';
import en from '../src/i18n/en.js';

const stage = { tagName: 'SECTION', matches: () => false, closest: () => null, getAttribute: () => null };
const key = (code) => ({ code, target: stage });

/** Corre `fn` con los atajos apagados y los vuelve a encender, pase lo que pase. */
function withShortcutsOff(fn) {
  setCharacterShortcuts(false);
  try { fn(); } finally { setCharacterShortcuts(true); }
}

test('Estado por defecto: los atajos están encendidos y funcionan como siempre', () => {
  assert.equal(DEFAULT_SHORTCUTS, true);
  assert.equal(characterShortcutsOn(), true);
  assert.equal(trainShortcut(key('Space')), 'pause');
  assert.equal(trainShortcut(key('KeyN')), 'next');
  assert.equal(driveShortcut(key('KeyR')), 'restart');
});

test('Atajos apagados: ninguna tecla de carácter es un atajo, en ninguna pestaña', () => {
  withShortcutsOff(() => {
    for (const code of ['Space', 'KeyN', 'KeyT', 'KeyE', 'KeyZ']) assert.equal(trainShortcut(key(code)), null, code);
    for (const code of ['Space', 'KeyR']) {
      assert.equal(driveShortcut(key(code)), null, code);
      assert.equal(rulesShortcut(key(code)), null, code);
    }
    assert.equal(shortcutFrom({ KeyV: 'reset' }, key('KeyV')), null);
  });
  assert.equal(trainShortcut(key('Space')), 'pause'); // Volver a encenderlos: vuelven de inmediato
});

test('teclas de carácter: barra espaciadora, letras y números; no las flechas, Tab, Enter ni Escape', () => {
  for (const code of ['Space', 'KeyA', 'KeyV', 'Digit1']) assert.equal(isCharacterKey(code), true, code);
  for (const code of ['ArrowUp', 'ArrowLeft', 'Tab', 'Enter', 'Escape', 'Home', undefined]) assert.equal(isCharacterKey(code), false, code);
  withShortcutsOff(() => {
    assert.equal(shortcutFrom({ Escape: 'close', ArrowUp: 'up' }, key('ArrowUp')), 'up');
    assert.equal(shortcutFrom({ Escape: 'close' }, key('Escape')), 'close');
  });
});

/** Ventana falsa para el controlador de teclado. */
function fakeWindow() {
  const handlers = {};
  return {
    addEventListener: (type, fn) => { handlers[type] = fn; },
    removeEventListener: () => {},
    press: (code) => handlers.keydown({ code, target: stage, preventDefault() {} }),
    release: (code) => handlers.keyup({ code, target: stage, preventDefault() {} }),
  };
}

test('Manejar con las flechas: con los atajos apagados, las flechas manejan y W A S D no', () => {
  withShortcutsOff(() => {
    const win = fakeWindow();
    const keyboard = createKeyboardController({ target: win, doc: null });
    win.press('KeyW');
    win.press('KeyA');
    assert.deepEqual(keyboard.control(), { forward: false, reverse: false, left: false, right: false });
    win.press('ArrowUp');
    win.press('ArrowLeft');
    assert.deepEqual(keyboard.control(), { forward: true, reverse: false, left: true, right: false });
  });
  const win = fakeWindow();
  const keyboard = createKeyboardController({ target: win, doc: null });
  win.press('KeyW');
  assert.equal(keyboard.control().forward, true); // encendidos, W maneja como siempre
});

test('Preferencia recordada: apagados siguen apagados al volver; sin almacenamiento, encendidos', () => {
  const data = new Map();
  const storage = { getItem: (k) => (data.has(k) ? data.get(k) : null), setItem: (k, v) => data.set(k, String(v)) };
  const prefs = createPreferences(() => storage);
  assert.equal(prefs.shortcuts, true);
  prefs.shortcuts = false;
  assert.equal(data.get('mlLab.shortcuts'), 'off');
  assert.equal(createPreferences(() => storage).shortcuts, false);
  prefs.shortcuts = true;
  assert.equal(createPreferences(() => storage).shortcuts, true);
  assert.equal(createPreferences(() => { throw new Error('SecurityError'); }).shortcuts, true);
});

test('Controles sin su atajo a la vista: con los atajos apagados, los rótulos no muestran la tecla', () => {
  const i18n = createI18n({ dictionaries: { es, en }, language: 'es' });
  let notified = 0;
  i18n.onChange(() => { notified += 1; });
  assert.equal(i18n.t('train.pause'), 'Pausar (espacio)');
  i18n.setShortcutLabels(false);
  assert.equal(notified, 1);
  const withKey = /\((espacio|space|[A-Z])\)/;
  for (const k of ['train.pause', 'train.resume', 'train.next', 'train.speed.max', 'train.choose', 'train.undo',
    'drive.pause', 'drive.resume', 'drive.restart', 'rules.pause', 'rules.resume', 'rules.restart', 'camera.reset']) {
    assert.doesNotMatch(i18n.t(k), withKey, k);
  }
  assert.equal(i18n.t('train.pause'), 'Pausar');
  assert.equal(i18n.t('train.speed.option', { n: 2 }), es['train.speed.option'].replace('{n}', '2')); // sin variante: igual
  i18n.setLanguage('en');
  assert.equal(i18n.t('train.pause'), 'Pause');
  i18n.setShortcutLabels(true);
  assert.equal(i18n.t('train.pause'), 'Pause (space)');
});

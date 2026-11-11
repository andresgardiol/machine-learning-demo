import test from 'node:test';
import assert from 'node:assert/strict';
import { shortcutFor as trainShortcut } from '../src/tabs/train/shortcuts.js';
import { shortcutFor as driveShortcut, isKeyboardFocusedControl } from '../src/tabs/drive/shortcuts.js';

// Título de una tarjeta del tablero alcanzado con Tab: un botón con foco visible que deja pasar los atajos.
const cardTitle = {
  tagName: 'BUTTON',
  matches: (sel) => (sel === ':focus-visible' ? true : sel.includes('button')),
  getAttribute: (name) => (name === 'data-shortcuts' ? 'pass' : null),
  closest: () => null,
};
const otherButton = { ...cardTitle, getAttribute: () => null };

test('atajo con el foco en un título de tarjeta: la barra espaciadora pausa en las dos pestañas', () => {
  assert.equal(isKeyboardFocusedControl(cardTitle), false);
  assert.equal(trainShortcut({ code: 'Space', target: cardTitle }), 'pause');
  assert.equal(trainShortcut({ code: 'KeyN', target: cardTitle }), 'next');
  assert.equal(driveShortcut({ code: 'Space', target: cardTitle }), 'pause');
});

test('atajo con el foco de teclado en otro botón: se sigue ignorando, como antes', () => {
  assert.equal(isKeyboardFocusedControl(otherButton), true);
  assert.equal(trainShortcut({ code: 'Space', target: otherButton }), null);
});

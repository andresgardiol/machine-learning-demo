// A quién le queda el foco después de un clic con el mouse en el panel (arreglo del campo del nombre
// del cerebro en Entrenar): los controles se lo devuelven al escenario, los campos de texto no.
import test from 'node:test';
import assert from 'node:assert/strict';
import { returnsFocusToStage } from '../src/ui/shortcuts.js';
import { shortcutFor as trainShortcut } from '../src/tabs/train/shortcuts.js';
import { shortcutFor as driveShortcut } from '../src/tabs/drive/shortcuts.js';

/** Elemento falso: closest devuelve el primer ancestro (o él mismo) cuya etiqueta está en el selector. */
function node(tag, { type, parent = null, control = null, contentEditable = false } = {}) {
  const n = {
    tagName: tag, type, parent, control, isContentEditable: contentEditable,
    closest(sel) {
      const tags = sel.split(',').map((s) => s.trim().toUpperCase());
      for (let x = n; x; x = x.parent) if (tags.includes(x.tagName)) return x;
      return null;
    },
    matches(sel) { return sel.split(',').map((s) => s.trim().toUpperCase()).includes(tag); },
    getAttribute: () => null,
  };
  return n;
}

test('un clic en el campo del nombre del cerebro (o su rótulo) deja el foco en el campo', () => {
  const name = node('INPUT', { type: 'text' });
  assert.equal(returnsFocusToStage(name), false);
  assert.equal(returnsFocusToStage(node('LABEL', { control: name })), false);
  assert.equal(returnsFocusToStage(node('TEXTAREA')), false);
  assert.equal(returnsFocusToStage(node('INPUT', {})), false); // sin tipo: texto
});

test('un clic en un botón, interruptor, deslizador o título plegable devuelve el foco al escenario', () => {
  assert.equal(returnsFocusToStage(node('BUTTON')), true);
  assert.equal(returnsFocusToStage(node('SPAN', { parent: node('BUTTON') })), true); // texto dentro de un interruptor
  assert.equal(returnsFocusToStage(node('INPUT', { type: 'range' })), true);
  assert.equal(returnsFocusToStage(node('INPUT', { type: 'checkbox' })), true);
  assert.equal(returnsFocusToStage(node('SUMMARY')), true);
  assert.equal(returnsFocusToStage(node('LABEL', { control: node('INPUT', { type: 'range' }) })), true);
  assert.equal(returnsFocusToStage(node('DIV')), false);
  assert.equal(returnsFocusToStage(null), false);
});

test('mientras se escribe en un campo de texto, los atajos no se disparan', () => {
  const field = node('INPUT', { type: 'text' });
  for (const code of ['Space', 'KeyN', 'KeyT', 'KeyE', 'KeyZ']) assert.equal(trainShortcut({ code, target: field }), null, code);
  for (const code of ['Space', 'KeyR']) assert.equal(driveShortcut({ code, target: field }), null, code);
});

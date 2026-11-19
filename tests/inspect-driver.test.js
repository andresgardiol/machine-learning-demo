import test from 'node:test';
import assert from 'node:assert/strict';
import { takesWheel, isDrivingKey, OWNS_ARROWS_SELECTOR } from '../src/tabs/inspect/driver.js';
import { setCharacterShortcuts, createKeyboardController } from '../src/input/keyboard.js';

/** Elemento simulado: `inside` son los selectores de sus antepasados (o de él mismo) que coinciden. */
const node = (tagName, { type, role, inside = false } = {}) => ({
  tagName, type,
  getAttribute: (k) => (k === 'role' ? role ?? null : null),
  closest: (sel) => (sel === OWNS_ARROWS_SELECTOR && inside ? {} : null),
});
const ev = (code, mods = {}) => ({ code, ctrlKey: false, metaKey: false, altKey: false, ...mods });

test('toman el volante: sin foco, el cuerpo, la escena, una zona y un botón común', () => {
  assert.equal(takesWheel(null), true);
  assert.equal(takesWheel({ tagName: 'BODY' }), true);
  assert.equal(takesWheel(node('DIV')), true); // la escena o una zona
  assert.equal(takesWheel(node('SECTION')), true);
  assert.equal(takesWheel(node('BUTTON')), true);
});

test('no toman el volante: la red, un deslizador, un separador, un grupo de opciones o un campo de texto', () => {
  assert.equal(takesWheel(node('BUTTON', { inside: true })), false); // neurona del diagrama
  assert.equal(takesWheel(node('DIV', { inside: true })), false); // pastilla, celda de la tabla
  assert.equal(takesWheel(node('INPUT', { type: 'range' })), false); // ritmo
  assert.equal(takesWheel(node('DIV', { role: 'slider' })), false);
  assert.equal(takesWheel(node('DIV', { role: 'separator' })), false);
  assert.equal(takesWheel(node('BUTTON', { role: 'radio', inside: true })), false);
  assert.equal(takesWheel(node('INPUT', { type: 'text' })), false);
  assert.equal(takesWheel(node('TEXTAREA')), false);
});

test('el selector cubre la red y los grupos que usan las flechas', () => {
  for (const s of ['.inspect-area', '[role="radiogroup"]', '[role="listbox"]', 'dialog', '[role="grid"]']) assert.ok(OWNS_ARROWS_SELECTOR.includes(s), s);
});

test('teclas de manejar: flechas siempre; W A S D solo con los atajos; con Ctrl, ninguna', () => {
  try {
    setCharacterShortcuts(true);
    assert.equal(isDrivingKey(ev('ArrowUp')), true);
    assert.equal(isDrivingKey(ev('KeyA')), true);
    assert.equal(isDrivingKey(ev('KeyN')), false);
    assert.equal(isDrivingKey(ev('ArrowLeft', { ctrlKey: true })), false);
    setCharacterShortcuts(false);
    assert.equal(isDrivingKey(ev('ArrowLeft')), true);
    assert.equal(isDrivingKey(ev('KeyW')), false);
    assert.equal(isDrivingKey(ev('KeyD')), false);
  } finally {
    setCharacterShortcuts(true);
  }
});

test('teclado con filtro propio: lo que el filtro rechaza no maneja', () => {
  const win = new EventTarget();
  const kb = createKeyboardController({ target: win, doc: null, accepts: (e) => takesWheel(e.target) });
  const send = (type, code, target) => {
    const e = new Event(type, { cancelable: true });
    Object.defineProperty(e, 'code', { value: code });
    Object.defineProperty(e, 'target', { value: target });
    win.dispatchEvent(e);
  };
  send('keydown', 'ArrowLeft', node('BUTTON', { role: 'radio', inside: true }));
  assert.equal(kb.control().left, false);
  send('keydown', 'ArrowLeft', node('DIV'));
  assert.equal(kb.control().left, true);
  kb.dispose();
});

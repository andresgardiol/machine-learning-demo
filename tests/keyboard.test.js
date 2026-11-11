import test from 'node:test';
import assert from 'node:assert/strict';
import { createKeyboardController, isTypingTarget } from '../src/input/keyboard.js';
import { isController } from '../src/core/controller.js';
import { createWorld } from '../src/core/world.js';

const NONE = { forward: false, reverse: false, left: false, right: false };
const body = { tagName: 'BODY' };
const textField = { tagName: 'INPUT', type: 'text' };

/** Evento de teclado simulado (Node no tiene KeyboardEvent). */
function key(type, code, { target = body, ...mods } = {}) {
  const e = new Event(type, { cancelable: true });
  Object.defineProperty(e, 'code', { value: code });
  Object.defineProperty(e, 'target', { value: target });
  for (const m of ['ctrlKey', 'metaKey', 'altKey', 'shiftKey', 'repeat']) Object.defineProperty(e, m, { value: Boolean(mods[m]) });
  return e;
}

function setup() {
  const win = new EventTarget();
  const doc = new EventTarget();
  doc.hidden = false;
  const kb = createKeyboardController({ target: win, doc });
  const press = (code, opts) => { const e = key('keydown', code, opts); win.dispatchEvent(e); return e; };
  const release = (code, opts) => { const e = key('keyup', code, opts); win.dispatchEvent(e); return e; };
  return { win, doc, kb, press, release };
}

test('el teclado cumple el contrato de controlador', () => {
  const { kb } = setup();
  assert.equal(isController(kb), true);
  assert.deepEqual(kb.control({ sensors: [0, 0, 0], speed: 0 }), NONE);
});

test('flecha arriba: el controlador devuelve avanzar', () => {
  const { kb, press } = setup();
  press('ArrowUp');
  assert.deepEqual(kb.control(), { ...NONE, forward: true });
});

test('tecla W: el controlador devuelve avanzar', () => {
  const { kb, press } = setup();
  press('KeyW');
  assert.deepEqual(kb.control(), { ...NONE, forward: true });
});

test('A, S y D, y las demás flechas, accionan su control', () => {
  for (const [code, action] of [['KeyA', 'left'], ['KeyS', 'reverse'], ['KeyD', 'right'], ['ArrowLeft', 'left'], ['ArrowDown', 'reverse'], ['ArrowRight', 'right']]) {
    const { kb, press } = setup();
    press(code);
    assert.deepEqual(kb.control(), { ...NONE, [action]: true }, code);
  }
});

test('dos teclas a la vez: flecha arriba y flecha izquierda devuelven avanzar e izquierda', () => {
  const { kb, press } = setup();
  press('ArrowUp');
  press('ArrowLeft');
  assert.deepEqual(kb.control(), { ...NONE, forward: true, left: true });
});

test('soltar la tecla: sin teclas presionadas no devuelve ningún control', () => {
  const { kb, press, release } = setup();
  press('ArrowUp');
  press('ArrowLeft');
  release('ArrowLeft');
  assert.deepEqual(kb.control(), { ...NONE, forward: true });
  release('ArrowUp');
  assert.deepEqual(kb.control(), NONE);
});

test('flecha y W juntas: soltar una deja avanzar con la otra', () => {
  const { kb, press, release } = setup();
  press('ArrowUp');
  press('KeyW');
  release('ArrowUp');
  assert.deepEqual(kb.control(), { ...NONE, forward: true });
  release('KeyW');
  assert.deepEqual(kb.control(), NONE);
});

test('escribir en un campo: la letra W dentro de un campo de texto no acelera el auto', () => {
  const { kb, press } = setup();
  const e = press('KeyW', { target: textField });
  assert.deepEqual(kb.control(), NONE);
  assert.equal(e.defaultPrevented, false, 'la letra se escribe normalmente');
  for (const target of [{ tagName: 'TEXTAREA' }, { tagName: 'DIV', isContentEditable: true }, { tagName: 'INPUT', type: 'search' }, { tagName: 'INPUT', type: 'number' }]) {
    press('ArrowUp', { target });
    assert.deepEqual(kb.control(), NONE, JSON.stringify(target));
  }
  const world = createWorld({ seed: 1, density: 0, controller: kb });
  for (let i = 0; i < 30; i++) world.step();
  assert.equal(world.car.speed, 0);
});

test('un botón o un deslizador no cuentan como campo de texto', () => {
  assert.equal(isTypingTarget({ tagName: 'BUTTON' }), false);
  assert.equal(isTypingTarget({ tagName: 'INPUT', type: 'range' }), false);
  assert.equal(isTypingTarget({ tagName: 'INPUT', type: 'checkbox' }), false);
  assert.equal(isTypingTarget({ tagName: 'INPUT' }), true);
});

test('flechas sin desplazar la página: el evento de la flecha se cancela', () => {
  const { press, release } = setup();
  for (const code of ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight']) {
    assert.equal(press(code).defaultPrevented, true, code);
    assert.equal(release(code).defaultPrevented, true, code);
  }
  assert.equal(press('KeyW').defaultPrevented, false, 'W no necesita cancelarse');
});

test('cambio de ventana con una tecla presionada: deja de devolver avanzar', () => {
  const { win, kb, press } = setup();
  press('ArrowUp');
  assert.equal(kb.control().forward, true);
  win.dispatchEvent(new Event('blur'));
  assert.deepEqual(kb.control(), NONE);
});

test('página oculta con una tecla presionada: suelta todos los controles', () => {
  const { doc, kb, press } = setup();
  press('ArrowUp');
  doc.hidden = true;
  doc.dispatchEvent(new Event('visibilitychange'));
  assert.deepEqual(kb.control(), NONE);
});

test('atajos del sistema (Ctrl, Cmd, Alt) no accionan controles', () => {
  const { kb, press } = setup();
  press('KeyW', { metaKey: true });
  press('KeyA', { ctrlKey: true });
  press('ArrowUp', { altKey: true });
  assert.deepEqual(kb.control(), NONE);
});

test('el teclado maneja el auto en el mundo: flecha arriba hace avanzar', () => {
  const { kb, press } = setup();
  const world = createWorld({ seed: 1, density: 0, controller: kb });
  press('ArrowUp');
  for (let i = 0; i < 30; i++) world.step();
  assert.ok(world.car.speed > 0);
  assert.ok(world.car.position.x > 0);
});

test('al desechar el controlador deja de escuchar', () => {
  const { kb, press } = setup();
  kb.dispose();
  press('ArrowUp');
  assert.deepEqual(kb.control(), NONE);
});

test('un deslizador enfocado con el teclado usa las flechas: el auto no gira y la flecha no se bloquea', () => {
  const { kb, press } = setup();
  const slider = { tagName: 'INPUT', type: 'range' };
  const e = press('ArrowLeft', { target: slider });
  assert.deepEqual(kb.control(), NONE);
  assert.equal(e.defaultPrevented, false);
});

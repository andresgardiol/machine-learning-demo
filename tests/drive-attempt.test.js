// Espera del intento en El problema (bienvenida-y-primer-manejo D2): qué tecla lo arranca y que esperar
// no cambia el resultado.
import test from 'node:test';
import assert from 'node:assert/strict';
import { startsAttempt, createAttemptGate } from '../src/tabs/drive/attempt.js';
import { setCharacterShortcuts } from '../src/input/keyboard.js';
import { createWorld } from '../src/core/world.js';
import { worldSpec, DEFAULT_SETTINGS } from '../src/tabs/drive/settings.js';

const stage = { tagName: 'SECTION', closest: () => null };
const key = (code, extra = {}) => ({ code, target: stage, ...extra });

test('las teclas de manejo arrancan el intento', () => {
  for (const code of ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'KeyW', 'KeyA', 'KeyS', 'KeyD']) {
    assert.equal(startsAttempt(key(code)), true, code);
  }
});

test('V, el zoom, R, la barra espaciadora y las teclas con modificadores no arrancan el intento', () => {
  for (const code of ['KeyV', 'Equal', 'Minus', 'NumpadAdd', 'KeyR', 'Space', 'Escape']) assert.equal(startsAttempt(key(code)), false, code);
  assert.equal(startsAttempt(key('ArrowUp', { ctrlKey: true })), false);
  assert.equal(startsAttempt(key('ArrowUp', { metaKey: true })), false);
  assert.equal(startsAttempt(key('ArrowUp', { altKey: true })), false);
});

test('escribir en un campo, ajustar un deslizador o estar dentro de un diálogo no arranca el intento', () => {
  assert.equal(startsAttempt(key('KeyW', { target: { tagName: 'INPUT', type: 'text' } })), false);
  assert.equal(startsAttempt(key('ArrowUp', { target: { tagName: 'TEXTAREA' } })), false);
  assert.equal(startsAttempt(key('ArrowUp', { target: { tagName: 'INPUT', type: 'range' } })), false);
  const inDialog = { tagName: 'BUTTON', closest: (sel) => (sel.includes('dialog') ? {} : null) };
  assert.equal(startsAttempt(key('ArrowUp', { target: inDialog })), false);
});

test('con los atajos apagados, W A S D no arrancan el intento y las flechas sí', () => {
  setCharacterShortcuts(false);
  try {
    assert.equal(startsAttempt(key('KeyW')), false);
    assert.equal(startsAttempt(key('ArrowUp')), true);
  } finally {
    setCharacterShortcuts(true);
  }
});

test('la compuerta no avanza el mundo hasta arrancar, y vuelve a esperar al reiniciar', () => {
  const world = createWorld({ ...worldSpec(DEFAULT_SETTINGS, 1), controller: { control: () => ({}) } });
  const gate = createAttemptGate();
  for (let i = 0; i < 50; i++) assert.equal(gate.advance(world), false);
  assert.equal(world.steps, 0);
  assert.equal(world.snapshot().time, 0, 'el reloj no avanzó');
  gate.start();
  assert.equal(gate.advance(world), true);
  assert.equal(world.steps, 1);
  gate.reset();
  assert.equal(gate.advance(world), false);
  assert.equal(world.steps, 1);
});

test('en pausa, arrancar el intento no mueve nada hasta reanudar', () => {
  const world = createWorld({ ...worldSpec(DEFAULT_SETTINGS, 1), controller: { control: () => ({ forward: true }) } });
  const gate = createAttemptGate();
  world.pause();
  gate.start();
  for (let i = 0; i < 30; i++) assert.equal(gate.advance(world), false);
  assert.equal(world.steps, 0);
  world.resume();
  assert.equal(gate.advance(world), true);
});

test('mismo tráfico con la misma semilla: esperar 0 o 300 cuadros antes de manejar da las mismas posiciones paso a paso', () => {
  // Las mismas teclas, contadas desde la primera: avanzar, y a ratos doblar.
  const keys = (i) => ({ forward: true, left: i % 90 > 60 && i % 90 < 70, right: i % 90 > 20 && i % 90 < 28 });
  const run = (waitFrames) => {
    let i = 0;
    const world = createWorld({ ...worldSpec(DEFAULT_SETTINGS, 7), controller: { control: () => keys(i) } });
    const gate = createAttemptGate();
    for (let f = 0; f < waitFrames; f++) gate.advance(world); // la persona todavía no tocó nada
    gate.start();
    const trace = [];
    for (; i < 600; i++) {
      gate.advance(world);
      const s = world.snapshot();
      trace.push([s.time, s.car.position.x, s.car.position.y, s.car.angle, world.vehiclesIn(-50, 400).map((v) => [v.id, v.position.x, v.position.y])]);
    }
    return trace;
  };
  assert.deepEqual(run(300), run(0));
});

test('con un diálogo modal abierto, una flecha no arranca el intento aunque el foco esté fuera del diálogo', () => {
  const docWith = (modal) => ({ querySelector: (sel) => (sel === 'dialog:modal' && modal ? {} : null) });
  const body = (doc) => ({ tagName: 'BODY', closest: () => null, ownerDocument: doc });
  assert.equal(startsAttempt(key('ArrowUp', { target: body(docWith(true)) })), false);
  assert.equal(startsAttempt(key('ArrowUp', { target: body(docWith(false)) })), true);
});

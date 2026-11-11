import test from 'node:test';
import assert from 'node:assert/strict';
import { DEFAULT_SETTINGS, SLIDERS, normalizeSettings, worldSpec } from '../src/tabs/drive/settings.js';
import { shortcutFor, isKeyboardFocusedControl } from '../src/tabs/drive/shortcuts.js';
import { createWorld } from '../src/core/world.js';

test('valores por defecto de la configuración avanzada: 3 carriles, 50 % y 50 %, 5 rayos, 3 largos, 90 grados', () => {
  assert.deepEqual(DEFAULT_SETTINGS, {
    maxSpeed: 15, lanes: 3, density: 50, irregularity: 50, sensorCount: 5, sensorRange: 3, sensorSpread: 90,
  });
});

test('restablecer: el mundo creado con los valores por defecto tiene 3 carriles, tráfico al 50 % y sensores 5/3/90', () => {
  const changed = normalizeSettings({ maxSpeed: 32, lanes: 4, density: 90, irregularity: 0, sensorCount: 9, sensorRange: 7, sensorSpread: 200 });
  const before = createWorld(worldSpec(changed, 1));
  assert.equal(before.track.lanes, 4);
  assert.equal(before.perception.sensors.length, 9);
  assert.equal(before.car.maxSpeed, 32);
  const w = createWorld(worldSpec({ ...DEFAULT_SETTINGS }, 1));
  assert.equal(w.car.maxSpeed, 15);
  assert.equal(w.track.lanes, 3);
  assert.equal(w.traffic.density, 50);
  assert.equal(w.traffic.irregularity, 50);
  assert.deepEqual(w.car.sensors, { count: 5, range: 3, spread: 90 });
});

test('cambiar la velocidad máxima a 30 m/s: el auto del mundo llega a 30', () => {
  const w = createWorld({ ...worldSpec({ ...DEFAULT_SETTINGS, maxSpeed: 30 }, 1), density: 0, controller: { control: () => ({ forward: true }) } });
  for (let i = 0; i < 120; i++) w.step();
  assert.equal(w.car.speed, 30);
});

test('cambiar los carriles a cuatro da una calle de cuatro carriles', () => {
  const w = createWorld(worldSpec({ ...DEFAULT_SETTINGS, lanes: 4 }, 1));
  assert.equal(w.track.lanes, 4);
});

test('cambiar la cantidad de sensores a nueve da nueve lecturas', () => {
  const w = createWorld(worldSpec({ ...DEFAULT_SETTINGS, sensorCount: 9 }, 1));
  assert.equal(w.rays.length, 9);
  assert.equal(w.perception.sensors.length, 9);
});

test('ajustes fuera de rango se ajustan al límite y los carriles no admitidos vuelven a 3', () => {
  assert.deepEqual(normalizeSettings({ maxSpeed: 99, lanes: 7, density: 140, irregularity: -5, sensorCount: 150, sensorRange: 0, sensorSpread: 400 }), {
    lanes: 3, maxSpeed: 40, density: 100, irregularity: 0, sensorCount: 100, sensorRange: 1, sensorSpread: 360,
  });
  assert.equal(normalizeSettings({ maxSpeed: 3 }).maxSpeed, 12);
});

test('los deslizadores cubren los rangos de la spec', () => {
  const byKey = Object.fromEntries(SLIDERS.map((s) => [s.key, [s.min, s.max]]));
  assert.deepEqual(byKey, {
    maxSpeed: [12, 40], density: [0, 100], irregularity: [0, 100], sensorCount: [1, 100], sensorRange: [1, 25], sensorSpread: [10, 360],
  });
});

// --- Atajos -------------------------------------------------------------------------

/** Elemento falso con matches/closest mínimos. */
function fakeElement({ tag = 'DIV', type, focusVisible = false, inDialog = false } = {}) {
  return {
    tagName: tag, type,
    matches(sel) {
      if (sel === ':focus-visible') return focusVisible;
      return ['BUTTON', 'INPUT', 'SUMMARY', 'A', 'SELECT', 'TEXTAREA'].includes(tag);
    },
    closest(sel) { return inDialog && sel.includes('dialog') ? {} : null; },
  };
}
const ev = (code, target, mods = {}) => ({ code, target, ...mods });

test('atajos: R reinicia y la barra espaciadora pausa desde el escenario', () => {
  const stage = fakeElement({ tag: 'SECTION' });
  assert.equal(shortcutFor(ev('KeyR', stage)), 'restart');
  assert.equal(shortcutFor(ev('Space', stage)), 'pause');
  assert.equal(shortcutFor(ev('KeyX', stage)), null);
});

test('atajos: se ignoran con modificadores (Cmd+R recarga la página)', () => {
  const stage = fakeElement({ tag: 'SECTION' });
  assert.equal(shortcutFor(ev('KeyR', stage, { metaKey: true })), null);
  assert.equal(shortcutFor(ev('KeyR', stage, { ctrlKey: true })), null);
});

test('atajos: se ignoran en un control alcanzado con el teclado, pero no en uno tocado con el mouse', () => {
  const tabbed = fakeElement({ tag: 'BUTTON', focusVisible: true });
  const clicked = fakeElement({ tag: 'BUTTON', focusVisible: false });
  assert.equal(isKeyboardFocusedControl(tabbed), true);
  assert.equal(shortcutFor(ev('Space', tabbed)), null);
  assert.equal(shortcutFor(ev('Space', clicked)), 'pause');
});

test('atajos: se ignoran al escribir en un campo de texto y dentro de un diálogo', () => {
  assert.equal(shortcutFor(ev('KeyR', fakeElement({ tag: 'INPUT', type: 'text' }))), null);
  assert.equal(shortcutFor(ev('KeyR', fakeElement({ tag: 'SECTION', inDialog: true }))), null);
});

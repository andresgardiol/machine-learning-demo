// Volante suave del teclado (manejo-amable-y-competir-sin-cortes D1, tarea 2.1).
import test from 'node:test';
import assert from 'node:assert/strict';
import { createSteering, STEER_RAMP_STEPS } from '../src/input/steering.js';
import { createKeyboardController } from '../src/input/keyboard.js';
import { createWorld } from '../src/core/world.js';

const run = (s, pattern) => pattern.map((on) => s.step({ left: on, right: false }).left);

test('sube en 18 cuadros (0,3 s)', () => {
  assert.equal(STEER_RAMP_STEPS, 18);
  const s = createSteering();
  run(s, Array(9).fill(true));
  assert.equal(s.levels.left, 0.5);
  run(s, Array(9).fill(true));
  assert.equal(s.levels.left, 1);
});

test('toque corto: 6 cuadros dan izquierda en uno o dos', () => {
  const out = run(createSteering(), Array(6).fill(true));
  const n = out.filter(Boolean).length;
  assert.ok(n >= 1 && n <= 2, `${n}`);
});

test('mantener apretada 1 s: desde el cuadro 18, todos los cuadros', () => {
  const out = run(createSteering(), Array(60).fill(true));
  assert.ok(out.slice(17).every(Boolean));
  assert.ok(out.slice(0, 17).filter(Boolean).length < 17);
});

test('soltar: en el mismo cuadro deja de doblar, y al volver a apretar empieza de 0', () => {
  const s = createSteering();
  run(s, Array(30).fill(true));
  assert.deepEqual(run(s, [false]), [false]);
  assert.equal(s.levels.left, 0);
  assert.deepEqual(run(s, [true]), [false]); // 1/18: el acumulador no llega
  assert.equal(s.levels.left, 1 / 18);
});

test('cada lado lleva su nivel: la flecha opuesta empieza de 0', () => {
  const s = createSteering();
  for (let k = 0; k < 20; k++) s.step({ left: true, right: false });
  s.step({ left: false, right: true });
  assert.deepEqual(s.levels, { left: 0, right: 1 / 18 });
});

/** Teclado con una ventana falsa. */
function keyboard() {
  const win = new EventTarget();
  const kb = createKeyboardController({ target: win, doc: null });
  const ev = (type, code) => { const e = new Event(type, { cancelable: true }); Object.defineProperty(e, 'code', { value: code }); Object.defineProperty(e, 'target', { value: { tagName: 'BODY' } }); win.dispatchEvent(e); };
  return { kb, press: (c) => ev('keydown', c), release: (c) => ev('keyup', c) };
}

test('en pausa el nivel no sube: solo avanza cuando la simulación consulta al controlador', () => {
  const { kb, press } = keyboard();
  const world = createWorld({ seed: 1, track: 'straight', density: 0, controller: kb });
  press('ArrowUp'); press('ArrowLeft');
  world.pause();
  for (let k = 0; k < 30; k++) world.step();
  assert.equal(kb.display().left, 0);
  // Mostrar no avanza el volante.
  for (let k = 0; k < 30; k++) kb.display();
  world.resume();
  world.step();
  assert.equal(kb.display().left, 1 / 18);
});

test('determinismo: la misma secuencia de teclas, cuadro por cuadro, da los mismos controles y el mismo auto', () => {
  const secuencia = (k) => (k < 120 ? ['ArrowUp'] : []).concat(k >= 30 && k < 36 ? ['ArrowLeft'] : k >= 60 && k < 100 ? ['ArrowRight'] : []);
  const correr = () => {
    const { kb, press, release } = keyboard();
    const world = createWorld({ seed: 1, track: 'straight', density: 50, controller: kb });
    const out = [];
    let down = new Set();
    for (let k = 0; k < 150; k++) {
      const want = new Set(secuencia(k));
      for (const c of down) if (!want.has(c)) release(c);
      for (const c of want) if (!down.has(c)) press(c);
      down = want;
      world.step();
      out.push([kb.last.left, kb.last.right, world.car.angle, world.car.position.x, world.car.position.y]);
    }
    return out;
  };
  assert.deepEqual(correr(), correr());
});

import test from 'node:test';
import assert from 'node:assert/strict';
import { createPlayback, FRAME_PACES, STEP_PACES, DEFAULT_PACE } from '../src/tabs/inspect/playback.js';
import { createStepAnimation, displayCursor, stepDuration, STEP_DURATION, AUTO_FRACTION } from '../src/tabs/inspect/step-animation.js';
import { shortcutFor, SHORTCUTS } from '../src/tabs/inspect/shortcuts.js';
import { setCharacterShortcuts } from '../src/input/keyboard.js';
import { createPassCursor } from '../src/core/pass-cursor.js';
import { createNetwork } from '../src/core/network.js';
import { createRandom } from '../src/core/random.js';
import { createWorld } from '../src/core/world.js';
import { createTraceController } from '../src/core/network-trace.js';

const ticks = (pb, n) => { let total = 0; for (let k = 0; k < n; k++) total += pb.tick(); return total; };

// --- Ritmo ------------------------------------------------------------------------------------

test('estado por defecto: reproduciendo, de a cuadros y en tiempo real (un cuadro por paso fijo)', () => {
  const pb = createPlayback();
  assert.equal(pb.playing, true);
  assert.equal(pb.size, 'frame');
  assert.equal(pb.realTime, true);
  assert.equal(ticks(pb, 60), 60);
});

test('cámara lenta: a un cuarto, el auto avanza cuatro veces más lento, sin saltos (15 cuadros por segundo, de a uno)', () => {
  const pb = createPlayback();
  pb.setPace(FRAME_PACES.findIndex((p) => p.id === 'quarter'));
  const per = [];
  for (let k = 0; k < 60; k++) per.push(pb.tick());
  assert.equal(per.reduce((a, b) => a + b, 0), 15);
  assert.ok(per.every((n) => n <= 1), 'nunca dos cuadros juntos');
});

test('ritmos de a cuadros: de tiempo real a uno por segundo', () => {
  assert.deepEqual(FRAME_PACES.map((p) => p.id), ['perSecond1', 'perSecond2', 'tenth', 'quarter', 'half', 'realTime']);
  const pb = createPlayback();
  pb.setPace(0);
  assert.equal(ticks(pb, 600), 10);
  pb.setPace(99);
  assert.equal(pb.realTime, true);
});

test('de a neuronas a 5 pasos por segundo: cinco pasos por segundo; el ritmo se recuerda aparte del de cuadros', () => {
  const pb = createPlayback();
  pb.setPace(FRAME_PACES.findIndex((p) => p.id === 'half'));
  pb.setSize('neuron');
  assert.equal(pb.paceIndex, DEFAULT_PACE.other);
  assert.equal(STEP_PACES[pb.paceIndex], 5);
  assert.equal(ticks(pb, 120), 10);
  pb.setPace(STEP_PACES.indexOf(10));
  pb.setSize('frame');
  assert.equal(FRAME_PACES[pb.paceIndex].id, 'half', 'el de cuadros se conserva');
  pb.setSize('operation');
  assert.equal(STEP_PACES[pb.paceIndex], 10, 'el de los demás tamaños también');
  assert.equal(pb.intervalMs, 100);
});

test('en pausa no avanza', () => {
  const pb = createPlayback();
  pb.pause();
  assert.equal(ticks(pb, 60), 0);
  pb.play();
  assert.equal(ticks(pb, 60), 60);
});

// --- Avance: reproducir de a operaciones deja al auto donde reproducir de a cuadros ----------

test('reproducir de a operaciones deja al auto exactamente donde lo deja reproducir de a cuadros tras los mismos cuadros', () => {
  const net = createNetwork({ inputs: 6, hidden: [6], outputs: 4, activation: 'tanh', random: createRandom(3) });
  const mk = () => createWorld({ seed: 1, track: 'straight', density: 50, cars: [{ controller: createTraceController(net, 5), sensors: { count: 5, range: 3, spread: 90 }, maxSpeed: 20 }] });
  const FRAMES = 40;
  const a = mk();
  for (let k = 0; k < FRAMES; k++) a.step();
  // De a operaciones: el cursor recorre la cuenta; al completarla, el paso siguiente mueve el auto.
  const b = mk();
  const cursor = createPassCursor(net);
  let frames = 0;
  while (frames < FRAMES) {
    if (cursor.done) { b.step(); frames += 1; cursor.reset(); continue; }
    cursor.advance('operation');
  }
  assert.deepEqual(b.snapshot(), a.snapshot());
});

// --- Paso animado -----------------------------------------------------------------------------

test('duraciones: 300 ms una operación; 450 una neurona o una capa; al reproducir, como mucho el 80 % del intervalo', () => {
  assert.equal(stepDuration('operation'), STEP_DURATION.operation);
  assert.equal(STEP_DURATION.operation, 300);
  assert.equal(stepDuration('neuron'), 450);
  assert.equal(stepDuration('layer'), 450);
  assert.equal(stepDuration('operation', { intervalMs: 100 }), 100 * AUTO_FRACTION);
  assert.equal(stepDuration('operation', { intervalMs: 1000 }), 300);
});

test('al ritmo elegido: a 10 pasos por segundo cada animación termina antes del paso siguiente', () => {
  const cursor = createPassCursor([6, 6, 4]);
  const interval = 100;
  const d = stepDuration('operation', { intervalMs: interval });
  const r = cursor.advance('operation');
  const anim = createStepAnimation(r, cursor.at, { start: 0, duration: d });
  assert.equal(anim.state(d / 2).done, false);
  assert.equal(anim.state(interval - 1).done, true);
});

test('una operación: la marca viaja de 0 a 1 en la duración', () => {
  const cursor = createPassCursor([6, 6, 4]);
  const r = cursor.advance('operation');
  const anim = createStepAnimation(r, cursor.at, { start: 1000, duration: 300 });
  const s = anim.state(1150);
  assert.equal(s.items.length, 1);
  assert.deepEqual({ ...s.items[0], p: Number(s.items[0].p.toFixed(2)) }, { layer: 1, neuron: 0, op: 'products', p: 0.5 });
  assert.equal(anim.state(1300).done, true);
});

test('una neurona: las cuatro operaciones, en orden, en un solo movimiento', () => {
  const cursor = createPassCursor([6, 6, 4]);
  const r = cursor.advance('neuron');
  const anim = createStepAnimation(r, cursor.at, { start: 0, duration: 400 });
  assert.deepEqual([50, 150, 250, 350].map((t) => anim.state(t).items[0].op), ['products', 'sum', 'bias', 'activation']);
  // Mientras se anima, la vista la ve sin terminar.
  const view = displayCursor(cursor, anim.state(150));
  assert.equal(view.opsDone(1, 0), 1);
  assert.equal(cursor.opsDone(1, 0), 4);
});

test('una capa: todas sus neuronas a la vez, como una ola', () => {
  const cursor = createPassCursor([6, 6, 4]);
  const r = cursor.advance('layer');
  const anim = createStepAnimation(r, cursor.at, { start: 0, duration: 400 });
  const s = anim.state(100);
  assert.equal(s.items.length, 6);
  assert.ok(s.items.every((it) => it.op === 'sum'));
});

test('un cuadro: una ola que cruza la red, capa por capa', () => {
  const cursor = createPassCursor([6, 6, 6, 4]);
  const r = cursor.advance('frame');
  const anim = createStepAnimation(r, cursor.at, { start: 0, duration: 600 });
  assert.deepEqual(anim.layers.map((L) => L.layer), [1, 2, 3]);
  assert.ok(anim.state(50).items.every((it) => it.layer === 1));
  const late = displayCursor(cursor, anim.state(50));
  assert.equal(late.opsDone(3, 0), 0, 'las salidas todavía no se ven calculadas');
  assert.ok(anim.state(550).items.every((it) => it.layer === 3));
});

test('no frena a la persona: completar al instante', () => {
  const cursor = createPassCursor([6, 6, 4]);
  const anim = createStepAnimation(cursor.advance('neuron'), cursor.at, { start: 0, duration: 450 });
  anim.finish();
  assert.equal(anim.state(10).done, true);
  assert.equal(displayCursor(cursor, null), cursor);
});

// --- Atajos ---------------------------------------------------------------------------------

test('atajos: espacio reproduce o pausa, N da un paso, R reinicia y V restablece la vista', () => {
  const ev = (code) => ({ code, target: { tagName: 'DIV', matches: () => false, closest: () => null } });
  assert.deepEqual(SHORTCUTS, { Space: 'play', KeyN: 'step', KeyR: 'restart', KeyV: 'view' });
  assert.equal(shortcutFor(ev('Space')), 'play');
  assert.equal(shortcutFor(ev('KeyN')), 'step');
  assert.equal(shortcutFor(ev('KeyR')), 'restart');
  assert.equal(shortcutFor(ev('KeyV')), 'view');
  assert.equal(shortcutFor({ code: 'KeyN', target: { tagName: 'INPUT', type: 'text' } }), null, 'no mientras se escribe');
  setCharacterShortcuts(false);
  try {
    for (const code of ['Space', 'KeyN', 'KeyR', 'KeyV']) assert.equal(shortcutFor(ev(code)), null, `${code} apagado`);
  } finally {
    setCharacterShortcuts(true);
  }
});

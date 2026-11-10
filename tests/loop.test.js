import test from 'node:test';
import assert from 'node:assert/strict';
import { createStepper, createLoop, MAX_STEPS_PER_FRAME } from '../src/ui/loop.js';
import { createWorld } from '../src/core/world.js';

/** Programador de cuadros falso: los cuadros se disparan a mano con una marca de tiempo. */
function fakeFrames() {
  let pending = null;
  let nextId = 1;
  return {
    requestFrame(cb) { pending = { id: nextId++, cb }; return pending.id; },
    cancelFrame(id) { if (pending?.id === id) pending = null; },
    fire(timestamp) { const p = pending; pending = null; p?.cb(timestamp); return Boolean(p); },
    get pending() { return pending !== null; },
  };
}

function fakeDocument() {
  const doc = new EventTarget();
  doc.hidden = false;
  doc.setHidden = (value) => { doc.hidden = value; doc.dispatchEvent(new Event('visibilitychange')); };
  return doc;
}

/** Corre `seconds` de tiempo real a `hz` cuadros por segundo y devuelve los pasos ejecutados. */
function runAt(hz, seconds, world) {
  const frames = fakeFrames();
  let steps = 0;
  const loop = createLoop({
    step: () => { steps += 1; world?.step(); }, render: () => {},
    requestFrame: frames.requestFrame, cancelFrame: frames.cancelFrame, doc: fakeDocument(),
  });
  loop.start();
  const total = Math.round(hz * seconds);
  for (let i = 0; i <= total; i++) frames.fire((i * 1000) / hz);
  return steps;
}

test('60 Hz y 144 Hz ejecutan la misma cantidad de pasos en el mismo tiempo', () => {
  assert.equal(runAt(60, 10), 600);
  assert.equal(runAt(144, 10), 600);
  assert.equal(runAt(30, 10), 600);
});

test('misma evolución en pantallas de 60 Hz y 144 Hz: estado final idéntico tras diez segundos', () => {
  // avanza hasta un tercio de la velocidad máxima y la sostiene: el auto se mueve sin alcanzar al tráfico
  const cruise = { control: (p) => ({ forward: p.speed < 0.3, left: false, right: false, reverse: false }) };
  const make = () => createWorld({ seed: 7, controller: cruise });
  const a = make();
  const b = make();
  runAt(60, 10, a);
  runAt(144, 10, b);
  assert.equal(a.steps, 600);
  assert.equal(b.steps, 600);
  assert.equal(a.crashed, false);
  assert.ok(a.car.position.x > 30, 'el auto avanzó');
  assert.ok(a.vehicles.length + a.vehiclesIn(a.progress, a.progress + 200).length > 0, 'hay tráfico');
  assert.deepEqual(a.snapshot(), b.snapshot());
  assert.deepEqual(a.vehiclesIn(0, 500).map((v) => [v.id, v.position]), b.vehiclesIn(0, 500).map((v) => [v.id, v.position]));
});

test('un cuadro muy largo ejecuta como máximo 5 pasos y descarta el resto', () => {
  const stepper = createStepper();
  assert.equal(stepper.advance(3), MAX_STEPS_PER_FRAME);
  assert.equal(stepper.accumulator, 0);
  assert.equal(stepper.advance(1 / 60), 1);
});

test('regreso tras una pausa larga: la página oculta varios segundos no provoca un salto', () => {
  const frames = fakeFrames();
  const doc = fakeDocument();
  let steps = 0;
  const loop = createLoop({ step: () => { steps += 1; }, render: () => {}, requestFrame: frames.requestFrame, cancelFrame: frames.cancelFrame, doc });
  loop.start();
  for (let i = 0; i <= 60; i++) frames.fire((i * 1000) / 60); // 1 s visible
  assert.equal(steps, 60);
  doc.setHidden(true);
  assert.equal(frames.pending, false, 'oculta: no se piden cuadros');
  doc.setHidden(false); // vuelve 8 s después
  assert.equal(frames.pending, true);
  frames.fire(9000);
  assert.equal(steps, 60, 'el primer cuadro al volver no ejecuta pasos atrasados');
  frames.fire(9000 + 1000 / 60);
  assert.equal(steps, 61, 'y luego continúa al ritmo normal');
  loop.dispose();
});

test('una falla dentro del bucle lo detiene y se informa una sola vez', () => {
  const frames = fakeFrames();
  const errors = [];
  const loop = createLoop({
    step: () => { throw new Error('boom'); }, render: () => {}, onError: (e) => errors.push(e.message),
    requestFrame: frames.requestFrame, cancelFrame: frames.cancelFrame, doc: fakeDocument(),
  });
  loop.start();
  frames.fire(0);
  frames.fire(100);
  assert.deepEqual(errors, ['boom']);
  assert.equal(loop.running, false);
  assert.equal(frames.pending, false);
});

import test from 'node:test';
import assert from 'node:assert/strict';
import { createLoop, SPEEDS, FRAME_BUDGET_MS, MAX_STEPS_PER_FRAME, speedOf } from '../src/ui/loop.js';
import { createWorld } from '../src/core/world.js';

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

/** Reloj falso en milisegundos que solo avanza cuando se le pide (por ejemplo, en cada paso). */
function fakeClock() {
  let t = 0;
  const now = () => t;
  now.advance = (ms) => { t += ms; };
  return now;
}

/** Bucle con cuadros, documento y reloj falsos. `stepCost` es lo que tarda cada paso (ms). */
function setup({ speed = 1, stepCost = 0, onStep = () => {} } = {}) {
  const cost = { ms: stepCost };
  const frames = fakeFrames();
  const doc = fakeDocument();
  const now = fakeClock();
  let steps = 0;
  const loop = createLoop({
    step: () => { steps += 1; now.advance(cost.ms); onStep(); }, render: () => {},
    requestFrame: frames.requestFrame, cancelFrame: frames.cancelFrame, doc, now, speed,
  });
  loop.start();
  let frame = 0;
  /** Dispara cuadros a 60 Hz; devuelve los pasos de cada uno. */
  const fire = (count) => {
    const perFrame = [];
    for (let i = 0; i < count; i++) {
      const before = steps;
      frames.fire((frame * 1000) / 60);
      frame += 1;
      perFrame.push(steps - before);
    }
    return perFrame;
  };
  return { loop, frames, doc, now, fire, cost, get steps() { return steps; } };
}

const cruise = { control: (p) => ({ forward: p.speed < 0.6, left: p.sensors[2] > 0.5, right: false, reverse: false }) };

// --- 11.1 Factores 1, 2, 4 y 8 -------------------------------------------------------------------

test('velocidades admitidas: 1, 2, 4, 8 y máxima; cualquier otro valor es 1', () => {
  assert.deepEqual([...SPEEDS], [1, 2, 4, 8, 'max']);
  assert.equal(speedOf(3), 1);
  assert.equal(speedOf('8'), 1);
  assert.equal(speedOf(8), 8);
  const { loop } = setup();
  assert.equal(loop.speed, 1);
  loop.setSpeed(16);
  assert.equal(loop.speed, 1);
});

test('factores fijos: en un segundo real se ejecutan 60, 120, 240 y 480 pasos', () => {
  for (const [speed, expected] of [[1, 60], [2, 120], [4, 240], [8, 480]]) {
    const s = setup({ speed });
    s.fire(61); // el primer cuadro solo toma la marca de tiempo
    assert.equal(s.steps, expected, `velocidad ${speed}`);
  }
});

test('mismo resultado acelerado: seiscientos pasos a velocidad 8 dejan el mismo estado que a velocidad normal', () => {
  const normal = createWorld({ seed: 3, controller: cruise });
  const fast = createWorld({ seed: 3, controller: cruise });
  const a = setup({ speed: 1, onStep: () => normal.step() });
  const b = setup({ speed: 8, onStep: () => fast.step() });
  a.fire(601);
  b.fire(76);
  assert.equal(a.steps, 600);
  assert.equal(b.steps, 600);
  assert.equal(normal.steps, 600);
  assert.ok(normal.progress > 50, 'el auto avanzó');
  assert.deepEqual(fast.snapshot(), normal.snapshot());
  assert.deepEqual(fast.vehiclesIn(0, 500), normal.vehiclesIn(0, 500));
});

test('factor fijo: el tope de pasos por cuadro se multiplica por el factor', () => {
  const s = setup({ speed: 8 });
  s.fire(1);
  s.frames.fire(5000); // un cuadro de 5 s: como mucho 5 × 8 pasos
  assert.equal(s.steps, MAX_STEPS_PER_FRAME * 8);
});

test('factor fijo en un equipo lento: el presupuesto por cuadro lo degrada en vez de trabar la página', () => {
  const s = setup({ speed: 8, stepCost: 4 }); // cada paso tarda 4 ms: entran 3 por cuadro
  const perFrame = s.fire(31).slice(1);
  for (const n of perFrame) assert.equal(n, 3);
  assert.ok(s.loop.achievedFactor < 8 && Math.abs(s.loop.achievedFactor - 3) < 1e-9);
});

test('cambiar de velocidad en marcha no cambia los pasos ya hechos', () => {
  const s = setup({ speed: 1 });
  s.fire(31);
  assert.equal(s.steps, 30);
  s.loop.setSpeed(4);
  assert.equal(s.loop.speed, 4);
  s.fire(30);
  assert.equal(s.steps, 30 + 120);
});

// --- 11.2 Velocidad máxima ------------------------------------------------------------------------

test('máxima: ejecuta al menos un paso por cuadro aunque un paso tarde más que el presupuesto', () => {
  const s = setup({ speed: 'max', stepCost: 50 });
  const perFrame = s.fire(10);
  assert.deepEqual(perFrame, new Array(10).fill(1));
});

test('máxima: respeta el presupuesto de tiempo por cuadro', () => {
  const s = setup({ speed: 'max', stepCost: 0.5 });
  const perFrame = s.fire(10);
  // Con 12 ms de presupuesto y pasos de 0,5 ms entran 24 por cuadro, sin importar el tiempo transcurrido.
  assert.equal(FRAME_BUDGET_MS, 12);
  for (const n of perFrame) assert.equal(n, 24);
});

test('máxima: informa el factor logrado (tiempo simulado sobre tiempo real), suavizado', () => {
  const s = setup({ speed: 'max', stepCost: 0.5 });
  assert.equal(s.loop.achievedFactor, null);
  s.fire(1);
  assert.equal(s.loop.achievedFactor, null, 'sin tiempo transcurrido todavía no hay medida');
  s.fire(60);
  // 24 pasos (0,4 s simulados) por cuadro de 1/60 s: 24 veces la velocidad real.
  assert.ok(Math.abs(s.loop.achievedFactor - 24) < 1e-9, String(s.loop.achievedFactor));
  // Si los pasos pasan a tardar 2 ms, entran 6 por cuadro (factor 6): el indicador baja de a poco.
  s.cost.ms = 2;
  s.fire(1);
  assert.ok(Math.abs(s.loop.achievedFactor - (24 + (6 - 24) * 0.2)) < 1e-9, String(s.loop.achievedFactor));
  s.fire(100);
  assert.ok(Math.abs(s.loop.achievedFactor - 6) < 1e-6, String(s.loop.achievedFactor));
});

test('máxima: se detiene con la página oculta y continúa desde el mismo estado al volver', () => {
  const s = setup({ speed: 'max', stepCost: 1 });
  s.fire(5);
  const done = s.steps;
  s.doc.setHidden(true);
  assert.equal(s.frames.pending, false, 'oculta: no se piden cuadros');
  s.now.advance(10000);
  assert.equal(s.steps, done, 'no avanzó mientras estaba oculta');
  s.doc.setHidden(false);
  assert.equal(s.frames.pending, true);
  s.fire(1);
  assert.equal(s.steps, done + 12, 'continúa al volver');
});

test('máxima: pausar responde en el cuadro siguiente', () => {
  // Con 12 ms de trabajo por cuadro, la interfaz atiende el teclado en cada cuadro; detener el bucle
  // corta la simulación antes del cuadro siguiente.
  const s = setup({ speed: 'max', stepCost: 1 });
  s.fire(3);
  const done = s.steps;
  s.loop.stop();
  assert.equal(s.frames.pending, false);
  s.fire(3);
  assert.equal(s.steps, done);
});

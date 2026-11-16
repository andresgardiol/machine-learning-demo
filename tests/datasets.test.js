import test from 'node:test';
import assert from 'node:assert/strict';
import {
  pointsDataset, drivingExamples, createRecorder, splitDataset, summary, idealLabel, POINT_SHAPES, normalizePoints,
} from '../src/core/datasets.js';
import { carForBrain } from '../src/core/brain.js';
import { EXAMPLE_BRAINS } from '../src/data/example-brains.js';
import { constantController } from '../src/core/controller.js';
import { STEP } from '../src/core/constants.js';

const wrong = (data) => data.examples.filter((ex) => idealLabel(data.shape, { x: ex.inputs[0], y: ex.inputs[1] }) !== ex.targets[0]).length;

test('puntos: dos grupos sin ruido se separan con una recta', () => {
  const d = pointsDataset({ shape: 'blobs', count: 200, noise: 0 });
  assert.equal(d.examples.length, 200);
  assert.equal(wrong(d), 0);
});

test('puntos: círculo sin ruido, un color en el centro y el otro alrededor', () => {
  const d = pointsDataset({ shape: 'circle', count: 200, noise: 0 });
  assert.equal(wrong(d), 0);
  for (const ex of d.examples) {
    const r = Math.hypot(...ex.inputs);
    assert.ok(ex.targets[0] === 1 ? r < 0.5 : r > 0.6);
  }
});

test('puntos: cruzado sin ruido, cada color en dos cuadrantes opuestos', () => {
  const d = pointsDataset({ shape: 'xor', count: 200, noise: 0 });
  assert.equal(wrong(d), 0);
  const quadrants = (label) => new Set(d.examples.filter((e) => e.targets[0] === label).map((e) => `${Math.sign(e.inputs[0])}${Math.sign(e.inputs[1])}`));
  assert.deepEqual([...quadrants(1)].sort(), ['-1-1', '11']);
  assert.deepEqual([...quadrants(0)].sort(), ['-11', '1-1']);
});

test('puntos: espiral sin ruido, cada color forma un brazo', () => {
  const d = pointsDataset({ shape: 'spiral', count: 200, noise: 0 });
  // Cada brazo: el radio crece con el orden de sus puntos, y los dos brazos están enfrentados.
  for (const label of [0, 1]) {
    const arm = d.examples.filter((e) => e.targets[0] === label).map((e) => Math.hypot(...e.inputs));
    for (let k = 1; k < arm.length; k++) assert.ok(arm[k] >= arm[k - 1] - 1e-9);
  }
  const a = d.examples.filter((e) => e.targets[0] === 1);
  const b = d.examples.filter((e) => e.targets[0] === 0);
  for (let k = 0; k < a.length; k++) {
    assert.ok(Math.abs(a[k].inputs[0] + b[k].inputs[0]) < 1e-9 && Math.abs(a[k].inputs[1] + b[k].inputs[1]) < 1e-9);
  }
});

test('puntos: la espiral da una vuelta y cuarto por brazo', async () => {
  const { SPIRAL_TURNS } = await import('../src/core/datasets.js');
  assert.equal(SPIRAL_TURNS, 1.25);
  const d = pointsDataset({ shape: 'spiral', count: 200, noise: 0 });
  // El ángulo recorrido por un brazo, siguiendo sus puntos en orden: 1,25 × 2π.
  const arm = d.examples.filter((e) => e.targets[0] === 1).map((e) => Math.atan2(e.inputs[0], e.inputs[1]));
  let total = 0;
  for (let k = 1; k < arm.length; k++) {
    let da = arm[k] - arm[k - 1];
    if (da > Math.PI) da -= 2 * Math.PI;
    if (da < -Math.PI) da += 2 * Math.PI;
    total += da;
  }
  assert.ok(Math.abs(total - 1.25 * 2 * Math.PI) < 1e-6, String(total / (2 * Math.PI)));
});

test('puntos: mitad de cada color, con uno de diferencia como mucho', () => {
  for (const shape of POINT_SHAPES) {
    for (const count of [20, 21, 200, 499]) {
      const d = pointsDataset({ shape, count: normalizePoints({ count }).count });
      const ones = d.examples.filter((e) => e.targets[0] === 1).length;
      assert.ok(Math.abs(ones - (d.examples.length - ones)) <= 1, `${shape} ${count}`);
      for (const e of d.examples) for (const v of e.inputs) assert.ok(v >= -1 && v <= 1);
    }
  }
});

test('puntos: con ruido algunos quedan del lado del otro color, más cuanto más ruido', () => {
  for (const shape of ['blobs', 'circle', 'xor']) {
    const counts = [0, 10, 30, 50].map((noise) => wrong(pointsDataset({ shape, count: 500, noise })));
    assert.equal(counts[0], 0);
    assert.ok(counts[1] <= counts[2] && counts[2] < counts[3], `${shape}: ${counts}`);
    assert.ok(counts[2] > 0, `${shape}: ${counts}`);
  }
});

test('puntos: misma semilla, mismos puntos', () => {
  assert.deepEqual(pointsDataset({ shape: 'spiral', count: 100, noise: 20, seed: 4 }), pointsDataset({ shape: 'spiral', count: 100, noise: 20, seed: 4 }));
  assert.notDeepEqual(pointsDataset({ count: 100, noise: 20, seed: 4 }).examples, pointsDataset({ count: 100, noise: 20, seed: 5 }).examples);
});

// --- Manejo --------------------------------------------------------------------------------------
const teacher = () => carForBrain(EXAMPLE_BRAINS.find((b) => b.id === 'street-new'));

test('manejo: un ejemplo por paso, con 6 entradas y 4 respuestas con 5 sensores', () => {
  const t = teacher();
  const d = drivingExamples({ controller: t.controller, sensors: t.sensors, seconds: 10, density: 50 });
  assert.equal(d.examples.length, 600);
  for (const e of d.examples.slice(0, 5)) { assert.equal(e.inputs.length, 6); assert.equal(e.targets.length, 4); }
});

test('manejo: la respuesta es lo que se apretó (avanza y dobla a la derecha: sí, no, sí, no)', () => {
  const d = drivingExamples({ controller: constantController({ forward: true, right: true }), seconds: 1, density: 0 });
  assert.deepEqual(d.examples[0].targets, [1, 0, 1, 0]);
});

test('manejo: hasta el choque, y vuelve a empezar con otro tráfico', () => {
  // Doblar siempre a la izquierda choca enseguida con el borde.
  const d = drivingExamples({ controller: constantController({ forward: true, left: true }), seconds: 20, density: 0 });
  assert.equal(d.examples.length, Math.round(20 / STEP));
  assert.ok(d.crashes >= 1 && d.attempts >= 2);
  // Los pasos de cada intento empiezan en 0 y son seguidos.
  for (let k = 1; k < d.examples.length; k++) {
    const a = d.examples[k - 1]; const b = d.examples[k];
    assert.ok(b.attempt === a.attempt ? b.step === a.step + 1 : b.step === 0 && b.attempt === a.attempt + 1);
  }
});

test('maestro por defecto: 60 s en la calle recta en una fracción de segundo, siempre los mismos', () => {
  const t0 = process.hrtime.bigint();
  const t = teacher();
  const a = drivingExamples({ controller: t.controller, sensors: t.sensors, seconds: 60, density: 50, lanes: 3 });
  const ms = Number(process.hrtime.bigint() - t0) / 1e6;
  const t2 = teacher();
  const b = drivingExamples({ controller: t2.controller, sensors: t2.sensors, seconds: 60, density: 50, lanes: 3 });
  assert.deepEqual(a.examples, b.examples);
  assert.equal(a.examples.length, 3600);
  assert.ok(ms < 1000, `${ms} ms`);
});

test('grabador: junta ejemplos por intento', () => {
  const r = createRecorder();
  const p = { sensors: [1, 1, 1, 1, 1], speed: 0.5 };
  r.add(p, { forward: true }); r.add(p, { forward: true, left: true });
  r.newAttempt();
  r.add(p, { reverse: true });
  const d = r.dataset();
  assert.equal(d.examples.length, 3);
  assert.deepEqual(d.examples[1].targets, [1, 1, 0, 0]);
  assert.equal(d.examples[2].attempt, 1);
  assert.equal(d.examples[2].step, 0);
  r.clear();
  assert.equal(r.count, 0);
});

// --- Separación -------------------------------------------------------------------------------------
test('separación de puntos: 30 % de 200 son 140 y 60, con los dos colores en cada grupo', () => {
  const s = splitDataset(pointsDataset({ count: 200 }), { holdout: 30, seed: 1 });
  assert.equal(s.practice.length, 140);
  assert.equal(s.heldOut.length, 60);
  assert.equal(s.heldOut.filter((e) => e.targets[0] === 1).length, 30);
  assert.equal(s.held.filter(Boolean).length, 60);
});

test('separación reproducible', () => {
  const d = pointsDataset({ count: 200 });
  assert.deepEqual(splitDataset(d, { holdout: 30, seed: 3 }).held, splitDataset(d, { holdout: 30, seed: 3 }).held);
});

test('separación de manejo: tramos seguidos de al menos 2 s que suman 18 s de 60', () => {
  const t = teacher();
  const d = drivingExamples({ controller: t.controller, sensors: t.sensors, seconds: 60, density: 50 });
  const s = splitDataset(d, { holdout: 30, seed: 1 });
  assert.equal(s.heldOut.length, Math.round(18 / STEP));
  // Tramos: corridas seguidas de apartados.
  let run = 0;
  const runs = [];
  for (const h of [...s.held, false]) { if (h) run += 1; else if (run > 0) { runs.push(run); run = 0; } }
  assert.ok(runs.every((n) => n >= Math.round(2 / STEP)), String(runs));
});

test('resumen de un manejo: qué parte avanza, dobla a cada lado y retrocede', () => {
  const t = teacher();
  const d = drivingExamples({ controller: t.controller, sensors: t.sensors, seconds: 20, density: 50 });
  const s = summary(d, splitDataset(d, { holdout: 30 }));
  assert.equal(s.count, 1200);
  assert.equal(s.practice + s.heldOut, 1200);
  for (const k of ['forward', 'left', 'right', 'reverse']) assert.ok(s.controls[k] >= 0 && s.controls[k] <= 1);
  assert.ok(s.controls.forward > 0.5);
  const p = summary(pointsDataset({ count: 200 }));
  assert.equal(p.shares[0], 0.5);
});

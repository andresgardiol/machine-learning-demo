// La cinta del manejo (manejo-amable-y-competir-sin-cortes D2, tarea 3.2).
import test from 'node:test';
import assert from 'node:assert/strict';
import { createTape, tapeColumns, tapeRows, TAPE_FRAMES, TAPE_MIN_HEIGHT } from '../src/tabs/drive/tape.js';

const frame = (k, controls = {}) => ({ sensors: [k / 1000, 0.5, 0, 0, 1], speed: 0.5, controls });

test('guarda los últimos 600 cuadros (10 s)', () => {
  const t = createTape();
  assert.equal(TAPE_FRAMES, 600);
  for (let k = 0; k < 700; k++) t.push(frame(k));
  assert.equal(t.length, 600);
  assert.equal(t.frames[0].sensors[0], 0.1);
});

test('al chocar se congela; al reiniciar se vacía', () => {
  const t = createTape();
  t.push(frame(1)); t.freeze();
  assert.equal(t.push(frame(2)), false);
  assert.equal(t.length, 1);
  t.clear();
  assert.equal(t.frozen, false);
  assert.equal(t.length, 0);
});

test('una columna por cuadro si el lienzo tiene 600 px o más', () => {
  const frames = Array.from({ length: 30 }, (_, k) => frame(k, { forward: true, left: k === 29 }));
  const { columns, perColumn } = tapeColumns(frames, 640);
  assert.equal(perColumn, 1);
  assert.equal(columns.length, 30);
  assert.equal(columns.at(-1).controls.left, true);
});

test('lienzo angosto: cada columna junta cuadros, la percepción promedia y la acción se enciende si estuvo en alguno', () => {
  const frames = Array.from({ length: 600 }, (_, k) => frame(k, { left: k === 598 }));
  const { columns, perColumn } = tapeColumns(frames, 300);
  assert.equal(perColumn, 2);
  assert.equal(columns.length, 300);
  const last = columns.at(-1);
  assert.equal(last.controls.left, true);
  assert.equal(last.sensors[0], (598 + 599) / 2 / 1000);
  assert.equal(columns.at(-2).controls.left, false);
});

test('filas: los sensores con nombre hasta 12; con 30, sin nombre, y las acciones conservan su alto', () => {
  const five = tapeRows(5, 200);
  assert.equal(five.named, true);
  assert.equal(five.rows.filter((r) => r.kind === 'sensor').length, 5);
  const thirty = tapeRows(30, 200);
  assert.equal(thirty.named, false);
  assert.equal(thirty.rows.filter((r) => r.kind === 'sensor').length, 30);
  const actionH = (r) => r.rows.filter((x) => x.kind === 'action').map((x) => x.h);
  assert.deepEqual(actionH(thirty), actionH(five));
  const last = thirty.rows.at(-1);
  assert.ok(Math.abs(last.y + last.h - 200) < 1e-9, 'llena el alto');
  assert.equal(tapeRows(5, 40).height, TAPE_MIN_HEIGHT);
});

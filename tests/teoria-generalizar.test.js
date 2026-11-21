// Cuenta de «Generalizar o memorizar» (seccion-teoria D12, capítulo 8; tarea 16.1).
import test from 'node:test';
import assert from 'node:assert/strict';
import {
  DATOS, ANGULOS, puntos, recta, aciertos, mejorRecta, memorizador, comparar, PARTES_APARTADAS, zona,
} from '../src/teoria/capitulos/generalizar/cuenta.js';

test('generalizar: los puntos del capítulo, la mitad apartados', () => {
  const p = puntos();
  assert.equal(p.todos.length, DATOS.count);
  assert.deepEqual([p.vistos.length, p.apartados.length], [40, 40]);
  assert.deepEqual(puntos(), p, 'misma semilla, mismos puntos');
});

test('generalizar: la recta y el memorizador con los números del capítulo', () => {
  const c = comparar();
  assert.deepEqual(c.recta, { angulo: 120, vistos: 35, apartados: 38 });
  assert.deepEqual(c.memorizador, { vistos: 40, apartados: 31 });
  assert.equal(c.mejorEnApartados, 'recta');
});

test('generalizar: el memorizador acierta todo lo visto y la recta elegida es la mejor candidata', () => {
  const { vistos } = puntos();
  assert.equal(aciertos(memorizador(vistos).contestar, vistos), vistos.length);
  const r = mejorRecta(vistos);
  for (const a of ANGULOS) assert.ok(aciertos(recta(a).contestar, vistos) <= r.aciertos, `${a}°`);
  assert.equal(ANGULOS.length, 24);
  assert.equal(recta(0).contestar([0.5, 0]), 1);
  assert.equal(recta(180).contestar([0.5, 0]), 0);
});

test('generalizar: el desafío, cuántos apartar', () => {
  assert.deepEqual(PARTES_APARTADAS, [10, 15, 20, 25, 30, 35, 40, 45, 50]);
  const porParte = Object.fromEntries(PARTES_APARTADAS.map((h) => [h, comparar({ holdout: h }).mejorEnApartados]));
  // Con pocos apartados no se ve diferencia; desde 25 % la recta acierta más.
  assert.deepEqual(porParte, { 10: 'empate', 15: 'empate', 20: 'empate', 25: 'recta', 30: 'recta', 35: 'recta', 40: 'recta', 45: 'recta', 50: 'recta' });
});

test('generalizar: la zona de cada respuesta', () => {
  const z = zona(recta(0).contestar, 4);
  assert.deepEqual(z, [[0, 0, 1, 1], [0, 0, 1, 1], [0, 0, 1, 1], [0, 0, 1, 1]]);
  const { vistos } = puntos();
  const m = zona(memorizador(vistos).contestar, 10);
  assert.equal(m.length, 10);
  assert.ok(m.flat().every((v) => v === 0 || v === 1));
});

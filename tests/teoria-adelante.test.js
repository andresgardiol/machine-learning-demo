// Cuenta de «La cuenta hacia adelante» (seccion-teoria D12, capítulo 3; tarea 11.1).
import test from 'node:test';
import assert from 'node:assert/strict';
import { recorrido, despuesDePasos, redXor, salidaDe, redDelAuto, LECTURAS_AUTO, ESCENAS } from '../src/teoria/capitulos/adelante/cuenta.js';
import { computeNetwork } from '../src/core/network.js';

test('adelante: la red se recorre de a una neurona, primero las ocultas y después la salida', () => {
  const pasos = recorrido(redXor(), [1, 0]);
  assert.deepEqual(pasos.map((p) => [p.orden, p.capa, p.neurona, p.salidaDeLaRed]), [[0, 1, 0, false], [1, 1, 1, false], [2, 2, 0, true]]);
  // Oculta 0 (OR): 1·1 + 1·0 − 0,5 = 0,5 → 1. Oculta 1 (AND): 1·1 + 1·0 − 1,5 = −0,5 → 0.
  assert.deepEqual(pasos[0].recibe, [1, 0]);
  assert.deepEqual(pasos[0].productos, [1, 0]);
  assert.deepEqual([pasos[0].sesgo, pasos[0].suma, pasos[0].salida], [-0.5, 0.5, 1]);
  assert.deepEqual([pasos[1].suma, pasos[1].salida], [-0.5, 0]);
  // La salida recibe lo que dieron las ocultas: 1·1 + (−1)·0 − 0,5 = 0,5 → 1.
  assert.deepEqual(pasos[2].recibe, [1, 0]);
  assert.deepEqual(pasos[2].productos, [1, -0]);
  assert.deepEqual([pasos[2].suma, pasos[2].salida], [0.5, 1]);
  for (const p of pasos) assert.equal(p.suma, p.sesgo + p.productos.reduce((a, b) => a + b, 0));
});

test('adelante: el botón Paso muestra las neuronas ya calculadas', () => {
  const r = redXor();
  assert.deepEqual(despuesDePasos(r, [1, 1], 0).salidas, [null, null, null]);
  assert.deepEqual(despuesDePasos(r, [1, 1], 2).salidas, [1, 1, null]);
  assert.equal(despuesDePasos(r, [1, 1], 2).siguiente.capa, 2);
  const fin = despuesDePasos(r, [1, 1], 9);
  assert.deepEqual([fin.hechas, fin.total, fin.siguiente], [3, 3, null]);
  assert.throws(() => despuesDePasos(r, [1, 1], -1), RangeError);
});

test('adelante: la predicción del tramo 4 y la solución del desafío', () => {
  const r = redXor();
  assert.equal(salidaDe(r, ESCENAS.prediccion.entradas), ESCENAS.prediccion.salida);
  assert.equal(salidaDe(r, ESCENAS.desafio.inicio), 0, 'el desafío no arranca resuelto');
  assert.equal(salidaDe(r, ESCENAS.desafio.solucion), 1);
});

test('adelante: la red del auto, cinco entradas y cuatro salidas, con pesos fijos', () => {
  const r = redDelAuto();
  assert.deepEqual(r.sizes, [5, 6, 4]);
  assert.deepEqual(redDelAuto(), r, 'la misma semilla da los mismos pesos');
  const pasos = recorrido(r, LECTURAS_AUTO);
  assert.equal(pasos.length, 10);
  const salidas = pasos.filter((p) => p.salidaDeLaRed).map((p) => p.salida);
  assert.deepEqual(salidas, computeNetwork(r, [...LECTURAS_AUTO]));
  assert.deepEqual(salidas, [1, 1, 1, 0]);
});

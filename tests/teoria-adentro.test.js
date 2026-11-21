// Cuenta de «Qué quedó adentro» (seccion-teoria D12, capítulo 9; tarea 17.1).
import test from 'node:test';
import assert from 'node:assert/strict';
import { red, apagar, respuestas, casosQueFallan, mapaDeOculta, mapaDeSalida, redConPeso, numeros, ESCENAS } from '../src/teoria/capitulos/adentro/cuenta.js';
import { RED_XOR } from '../src/teoria/capitulos/xor/cuenta.js';

test('adentro: la red entera da el XOR', () => {
  assert.deepEqual(casosQueFallan([]), []);
  assert.deepEqual(respuestas([]).map((r) => r.salida), [0, 1, 1, 0]);
  assert.deepEqual(numeros(), structuredClone({ ocultas: RED_XOR.ocultas, salida: RED_XOR.salida }));
});

test('adentro: qué falla con cada parte apagada', () => {
  assert.deepEqual(casosQueFallan([0]), [[0, 1], [1, 0]]);
  assert.deepEqual(casosQueFallan([1]), [[1, 1]]);
  assert.deepEqual(casosQueFallan([0, 1]), [[0, 1], [1, 0]]);
  // Una oculta apagada vale cero.
  assert.ok(respuestas([1]).every((r) => r.ocultas[1] === 0));
  assert.deepEqual(apagar([1]).offNeurons, [[false, false], [false, true], [false]]);
  assert.throws(() => apagar([2]), RangeError);
});

test('adentro: la predicción y la solución del desafío', () => {
  assert.deepEqual(casosQueFallan(ESCENAS.prediccion.apagar), ESCENAS.prediccion.fallan);
  assert.deepEqual(casosQueFallan(ESCENAS.desafio.solucion), [ESCENAS.desafio.caso]);
  // La otra oculta no lo resuelve.
  assert.notDeepEqual(casosQueFallan([0]), [ESCENAS.desafio.caso]);
});

test('adentro: el mapa de cada oculta, la del OR y la del AND', () => {
  // Grilla de 4 × 4 de −0,5 a 1,5: centros en −0,25, 0,25, 0,75 y 1,25 (fila 0 arriba).
  assert.deepEqual(mapaDeOculta(0, { n: 4 }), [[1, 1, 1, 1], [0, 1, 1, 1], [0, 0, 1, 1], [0, 0, 0, 1]]);
  assert.deepEqual(mapaDeOculta(1, { n: 4 }), [[0, 0, 1, 1], [0, 0, 0, 1], [0, 0, 0, 0], [0, 0, 0, 0]]);
  assert.ok(mapaDeOculta(1, { n: 4, apagadas: [1] }).flat().every((v) => v === 0));
  assert.deepEqual(mapaDeOculta(0, { n: 4, r: red() }), mapaDeOculta(0, { n: 4 }));
});

test('adentro: el mapa de la salida y la red con un peso cambiado', () => {
  // La red entera da 1 en la franja entre las dos rectas (x + y entre 0,5 y 1,5). Centros de la grilla
  // de 4 × 4: −0,25, 0,25, 0,75 y 1,25; fila 0 arriba.
  assert.deepEqual(mapaDeSalida({ n: 4 }), [[1, 1, 0, 0], [0, 1, 1, 0], [0, 0, 1, 1], [0, 0, 0, 1]]);
  // Sin la oculta del AND, la salida es el mapa de la oculta del OR.
  assert.deepEqual(mapaDeSalida({ n: 4, apagadas: [1] }), mapaDeOculta(0, { n: 4 }));
  assert.ok(mapaDeSalida({ n: 4, apagadas: [0] }).flat().every((v) => v === 0));
  // El peso de la segunda oculta a la salida vale −1: con él, la red es la del capítulo.
  assert.equal(RED_XOR.salida.pesos[1], -1);
  assert.deepEqual(numeros(redConPeso(-1)), numeros());
  assert.deepEqual(casosQueFallan([], redConPeso(-1)), []);
  // Con ese peso en −0,5 o más arriba, el caso [1, 1] pasa a dar 1: la red deja de ser un XOR.
  assert.deepEqual(casosQueFallan([], redConPeso(-0.6)), []);
  assert.deepEqual(casosQueFallan([], redConPeso(-0.4)), [[1, 1]]);
  assert.deepEqual(casosQueFallan([], redConPeso(1)), [[1, 1]]);
  assert.throws(() => redConPeso(Number.NaN), TypeError);
});

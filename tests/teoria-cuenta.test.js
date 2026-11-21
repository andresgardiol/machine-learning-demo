// Cuenta de la figura de «Una neurona» (seccion-teoria; viene de teoria-prototipos D3, tarea 3.1).
import test from 'node:test';
import assert from 'node:assert/strict';
import {
  TABLA_AND, crearNeurona, fijarPesos, fijarSesgo, leerNeurona, calcular, rectaDelPlano, tramoEnCaja,
} from '../src/teoria/capitulos/neurona/cuenta.js';

test('cuenta: la neurona es una red real de dos entradas y una salida con escalón', () => {
  const red = crearNeurona();
  assert.deepEqual(red.sizes, [2, 1]);
  assert.equal(red.activation, 'step');
  assert.deepEqual(leerNeurona(red), { pesos: [0, 0], sesgo: 0 });
});

test('cuenta: fijar pesos y sesgo cambia la red', () => {
  const red = crearNeurona({ pesos: [0.5, -2], sesgo: 1 });
  assert.deepEqual(leerNeurona(red), { pesos: [0.5, -2], sesgo: 1 });
  assert.equal(fijarPesos(red, [3, 4]), red);
  assert.equal(fijarSesgo(red, -0.25), red);
  assert.deepEqual(leerNeurona(red), { pesos: [3, 4], sesgo: -0.25 });
  assert.throws(() => fijarPesos(red, [Number.NaN, 1]), TypeError);
  assert.throws(() => fijarSesgo(red, Infinity), TypeError);
});

test('cuenta: la suma es w1·x1 + w2·x2 + sesgo', () => {
  const red = crearNeurona({ pesos: [2, -3], sesgo: 0.5 });
  const c = calcular(red, [1, 1]);
  assert.deepEqual(c.entradas, [1, 1]);
  assert.deepEqual(c.productos, [2, -3]);
  assert.equal(c.sesgo, 0.5);
  assert.equal(c.suma, -0.5);
  assert.equal(calcular(red, [1, 0]).suma, 2.5);
  assert.equal(calcular(red, [0, 0]).suma, 0.5);
});

test('cuenta: el escalón da 1 solo con suma mayor que 0', () => {
  const red = crearNeurona({ pesos: [1, 0], sesgo: -1 });
  assert.equal(calcular(red, [2, 0]).salida, 1); // suma 1
  assert.equal(calcular(red, [1, 0]).salida, 0); // suma 0: no se enciende
  assert.equal(calcular(red, [0, 0]).salida, 0); // suma −1
});

test('cuenta: la recta del plano sale de los pesos y el sesgo', () => {
  // 1·x + 2·y − 2 = 0  →  y = −0,5·x + 1
  assert.deepEqual(rectaDelPlano({ pesos: [1, 2], sesgo: -2 }), { tipo: 'funcion', pendiente: -0.5, ordenada: 1, normal: [1, 2] });
  // w1 = 0: horizontal, 4·y − 2 = 0  →  y = 0,5
  assert.deepEqual(rectaDelPlano({ pesos: [0, 4], sesgo: -2 }), { tipo: 'funcion', pendiente: 0, ordenada: 0.5, normal: [0, 4] });
  // w2 = 0: vertical, 2·x − 1 = 0  →  x = 0,5
  assert.deepEqual(rectaDelPlano({ pesos: [2, 0], sesgo: -1 }), { tipo: 'vertical', x: 0.5, normal: [2, 0] });
  // los dos en 0: no hay recta; todo el plano da lo mismo
  assert.deepEqual(rectaDelPlano({ pesos: [0, 0], sesgo: 0.3 }), { tipo: 'ninguna', salida: 1 });
  assert.deepEqual(rectaDelPlano({ pesos: [0, 0], sesgo: 0 }), { tipo: 'ninguna', salida: 0 });
  assert.deepEqual(rectaDelPlano({ pesos: [0, 0], sesgo: -1 }), { tipo: 'ninguna', salida: 0 });
  // sin −0 en los resultados
  assert.ok(Object.is(rectaDelPlano({ pesos: [0, 3], sesgo: 0 }).pendiente, 0));
  assert.ok(Object.is(rectaDelPlano({ pesos: [5, 0], sesgo: 0 }).x, 0));
});

test('cuenta: los puntos de la recta dan suma 0 y la normal apunta al lado que se enciende', () => {
  const valores = { pesos: [1.5, -0.75], sesgo: 0.2 };
  const red = crearNeurona(valores);
  const { pendiente, ordenada, normal } = rectaDelPlano(valores);
  for (const x of [-1, 0, 0.4, 2]) assert.ok(Math.abs(calcular(red, [x, pendiente * x + ordenada]).suma) < 1e-12);
  const [nx, ny] = normal;
  assert.equal(calcular(red, [0.4 + nx, pendiente * 0.4 + ordenada + ny]).salida, 1);
  assert.equal(calcular(red, [0.4 - nx, pendiente * 0.4 + ordenada - ny]).salida, 0);
});

test('cuenta: el tramo de la recta dentro de la caja', () => {
  const caja = { xMin: 0, xMax: 1, yMin: 0, yMax: 1 };
  assert.deepEqual(tramoEnCaja(rectaDelPlano({ pesos: [1, 1], sesgo: -1 }), caja), [[0, 1], [1, 0]]);
  assert.deepEqual(tramoEnCaja(rectaDelPlano({ pesos: [0, 2], sesgo: -1 }), caja), [[0, 0.5], [1, 0.5]]);
  assert.deepEqual(tramoEnCaja(rectaDelPlano({ pesos: [2, 0], sesgo: -1 }), caja), [[0.5, 0], [0.5, 1]]);
  assert.equal(tramoEnCaja(rectaDelPlano({ pesos: [1, 0], sesgo: -5 }), caja), null);
  assert.equal(tramoEnCaja(rectaDelPlano({ pesos: [1, 1], sesgo: -5 }), caja), null);
  assert.equal(tramoEnCaja(rectaDelPlano({ pesos: [0, 0], sesgo: 1 }), caja), null);
});

test('cuenta: hay pesos que resuelven el AND de la tabla de verdad', () => {
  const valores = { pesos: [1, 1], sesgo: -1.5 };
  const red = crearNeurona(valores);
  for (const { entradas, salida } of TABLA_AND) assert.equal(calcular(red, [...entradas]).salida, salida, `AND(${entradas})`);
  // y la recta deja el (1, 1) de un lado y los otros tres del otro
  assert.deepEqual(rectaDelPlano(valores), { tipo: 'funcion', pendiente: -1, ordenada: 1.5, normal: [1, 1] });
});

// Cuenta de «Una recta no alcanza» (seccion-teoria D9, capítulo 2; tarea 7.1).
import test from 'node:test';
import assert from 'node:assert/strict';
import {
  TABLA_XOR, RED_XOR, crearRed, leerRed, calcularRed, rectasOcultas, aciertosDeUnaNeurona, aciertosDeLaRed,
  respuestasOcultas, crearNeurona, fijarPesos, fijarSesgo, calcular,
} from '../src/teoria/capitulos/xor/cuenta.js';
import { computeNetwork } from '../src/core/network.js';

test('xor: la tabla da 1 solo cuando las entradas son distintas', () => {
  for (const { entradas: [a, b], salida } of TABLA_XOR) assert.equal(salida, a !== b ? 1 : 0);
});

test('xor: una neurona nunca pasa de 3 de 4 en una grilla de pesos y sesgos', () => {
  // Grilla de las perillas: de −2 a 2, de a 0,1, en los dos pesos y el sesgo.
  const valores = Array.from({ length: 41 }, (_, k) => Math.round((-2 + k * 0.1) * 10) / 10);
  const red = crearNeurona();
  let mejor = 0;
  for (const w1 of valores) for (const w2 of valores) for (const b of valores) {
    fijarPesos(red, [w1, w2]);
    fijarSesgo(red, b);
    const bien = TABLA_XOR.filter(({ entradas, salida }) => calcular(red, [...entradas]).salida === salida).length;
    mejor = Math.max(mejor, bien);
  }
  assert.equal(mejor, 3);
  assert.equal(aciertosDeUnaNeurona({ pesos: [1, 1], sesgo: -0.5 }).bien, 3, 'un OR acierta tres');
});

test('xor: existe una red 2-2-1 que da 4 de 4', () => {
  const red = crearRed(RED_XOR);
  assert.deepEqual(red.sizes, [2, 2, 1]);
  assert.equal(red.activation, 'step');
  const r = aciertosDeLaRed(red);
  assert.equal(r.bien, 4);
  assert.equal(r.total, 4);
  // Lo mismo que calcula el núcleo de la app.
  for (const p of r.puntos) assert.deepEqual(computeNetwork(red, p.entradas), [p.salida]);
});

test('xor: la cuenta de la red, neurona por neurona', () => {
  const red = crearRed(RED_XOR);
  const c = calcularRed(red, [1, 0]);
  assert.deepEqual(c.sumasOcultas, [0.5, -0.5]);
  assert.deepEqual(c.ocultas, [1, 0]);
  assert.equal(c.suma, 0.5);
  assert.equal(c.salida, 1);
  assert.deepEqual(leerRed(red), structuredClone({ ocultas: RED_XOR.ocultas, salida: RED_XOR.salida }));
  assert.throws(() => crearRed({ ocultas: [RED_XOR.ocultas[0]], salida: RED_XOR.salida }), TypeError);
  assert.throws(() => crearRed({ ocultas: RED_XOR.ocultas, salida: { pesos: [1, Number.NaN], sesgo: 0 } }), TypeError);
});

test('xor: las rectas de las ocultas y la zona que queda entre las dos', () => {
  const red = crearRed(RED_XOR);
  const [r1, r2] = rectasOcultas(red);
  // x + y = 0,5 y x + y = 1,5: dos rectas paralelas.
  assert.deepEqual([r1.tipo, r1.pendiente, r1.ordenada], ['funcion', -1, 0.5]);
  assert.deepEqual([r2.tipo, r2.pendiente, r2.ordenada], ['funcion', -1, 1.5]);
  // Entre las dos (la primera encendida, la segunda apagada) quedan justo los puntos de entradas distintas.
  const entre = respuestasOcultas(red).filter((p) => p.ocultas[0] === 1 && p.ocultas[1] === 0).map((p) => p.entradas);
  assert.deepEqual(entre, [[0, 1], [1, 0]]);
});

test('xor: mismos valores, mismo resultado', () => {
  assert.deepEqual(aciertosDeLaRed(crearRed(RED_XOR)), aciertosDeLaRed(crearRed(RED_XOR)));
});

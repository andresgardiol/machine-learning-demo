// Cuenta de «Repartir la culpa» (seccion-teoria D12, capítulo 6; tarea 14.1). Cuentas deterministas de
// una ida y una vuelta: ninguna prueba mide si la red aprende.
import test from 'node:test';
import assert from 'node:assert/strict';
import {
  EJEMPLOS, RED_INICIAL, TASA, crearRedSuave, valoresDe, idaYVuelta, pesoQueMasCambia, errorMedio, unaEpoca,
  curvaDeEpocas, DESAFIO, conPeso, aciertos, avanceDelDesafio,
} from '../src/teoria/capitulos/culpa/cuenta.js';
import { forwardSoft, exampleError, learnExample } from '../src/core/backprop.js';
import { copyNetwork } from '../src/core/network.js';

const cerca = (a, b, tol = 1e-12) => Math.abs(a - b) < tol;
const sig = (t) => 1 / (1 + Math.exp(-t));

test('culpa: la ida, neurona por neurona', () => {
  const r = idaYVuelta(crearRedSuave(), DESAFIO.ejemplo);
  // Oculta 0: 2 − 1,5·1 + 0,5·0 = 0,5. Oculta 1: −0,5 + 0,5·1 − 2·0 = 0.
  assert.ok(cerca(r.ida.ocultas[0].suma, 0.5));
  assert.ok(cerca(r.ida.ocultas[1].suma, 0));
  assert.ok(cerca(r.ida.ocultas[0].salida, sig(0.5)));
  const suma = -0.5 + 1 * sig(0.5) - 1 * sig(0);
  assert.ok(cerca(r.ida.salida.suma, suma));
  assert.ok(cerca(r.ida.salida.salida, sig(suma)));
});

test('culpa: la culpa de la salida y la de cada oculta', () => {
  const r = idaYVuelta(crearRedSuave(), DESAFIO.ejemplo);
  assert.ok(cerca(r.culpaSalida, r.ida.salida.salida - 1), 'respuesta menos correcta');
  assert.ok(cerca(r.error.diferencia, r.culpaSalida));
  assert.ok(cerca(r.error.medida, -Math.log(r.ida.salida.salida)));
  RED_INICIAL.salida.pesos.forEach((w, j) => {
    const o = r.culpaOcultas[j];
    const v = r.ida.ocultas[j].salida;
    assert.equal(o.pesoQueLasUne, w);
    assert.ok(cerca(o.llega, r.culpaSalida * w));
    assert.ok(cerca(o.pendiente, v * (1 - v)));
    assert.ok(cerca(o.culpa, o.llega * o.pendiente));
  });
});

test('culpa: cada peso cambia −tasa × culpa × lo que traía, y el que más cambia', () => {
  const r = idaYVuelta(crearRedSuave(), DESAFIO.ejemplo);
  assert.equal(r.correcciones.length, 9);
  const w = (capa, neurona, entrada) => r.correcciones.find((c) => c.capa === capa && c.neurona === neurona && c.entrada === entrada);
  assert.ok(cerca(w(2, 0, 0).cambio, -TASA * r.culpaSalida * r.ida.ocultas[0].salida));
  assert.ok(cerca(w(1, 1, 0).cambio, -TASA * r.culpaOcultas[1].culpa * 1));
  assert.equal(w(1, 0, 1).cambio, 0, 'una entrada en 0 no lleva corrección');
  const mas = pesoQueMasCambia(r.correcciones);
  assert.deepEqual([mas.capa, mas.neurona, mas.entrada], [2, 0, 0]);
  // La red corregida es la de la app: lo mismo que learnExample, bit a bit.
  const app = copyNetwork(crearRedSuave());
  learnExample(app, [...DESAFIO.ejemplo.inputs], [...DESAFIO.ejemplo.targets], TASA);
  assert.deepEqual(r.redCorregida, app);
  assert.deepEqual(valoresDe(crearRedSuave()), structuredClone(RED_INICIAL), 'la red de entrada no cambia');
});

test('culpa: una época es una pasada por los cuatro ejemplos, uno detrás del otro', () => {
  const red = crearRedSuave();
  let paso = red;
  for (const e of EJEMPLOS) paso = idaYVuelta(paso, e).redCorregida;
  const epoca = unaEpoca(red);
  assert.deepEqual(epoca.red, paso);
  assert.equal(epoca.antes, errorMedio(red));
  assert.equal(epoca.despues, errorMedio(paso));
  const curva = curvaDeEpocas(red, 3);
  assert.equal(curva.length, 4);
  assert.equal(curva[1], epoca.despues);
  assert.deepEqual(curvaDeEpocas(red, 3), curva, 'determinista');
});

test('culpa: el desafío, mover el peso en el sentido de su corrección baja el error', () => {
  const red = crearRedSuave();
  const { ejemplo, solucion } = DESAFIO;
  const errorCon = (r) => exampleError(forwardSoft(r, [...ejemplo.inputs]).outputs, ejemplo.targets).loss;
  const c = idaYVuelta(red, ejemplo).correcciones.find((x) => x.capa === solucion.capa && x.neurona === solucion.neurona && x.entrada === solucion.entrada);
  assert.ok(c.cambio > 0);
  const antes = errorCon(red);
  assert.ok(errorCon(conPeso(red, solucion, c.antes + solucion.paso)) < antes, 'en el sentido de la culpa, baja');
  assert.ok(errorCon(conPeso(red, solucion, c.antes - solucion.paso)) > antes, 'en contra, sube');
});

test('culpa: los aciertos de la red de partida y el avance del desafío', () => {
  // La red de partida acierta uno solo de los cuatro casos: [0, 1].
  assert.deepEqual(aciertos(crearRedSuave()), { bien: 1, total: 4 });
  // El desafío: el peso arranca en 1 y hay que subirlo 0,5, de a 0,1.
  assert.equal(RED_INICIAL.salida.pesos[0], 1);
  assert.deepEqual(avanceDelDesafio(1), { bien: 0, total: 5 });
  assert.deepEqual(avanceDelDesafio(1.2), { bien: 2, total: 5 });
  assert.deepEqual(avanceDelDesafio(1 + DESAFIO.solucion.paso), { bien: 5, total: 5 });
  assert.deepEqual(avanceDelDesafio(2), { bien: 5, total: 5 });
  assert.deepEqual(avanceDelDesafio(0.5), { bien: 0, total: 5 }, 'en contra de la corrección no avanza');
  assert.throws(() => avanceDelDesafio(Number.NaN), TypeError);
});

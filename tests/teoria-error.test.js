// Cuenta de «Medir el error» (seccion-teoria D12, capítulo 4; tarea 12.1).
import test from 'node:test';
import assert from 'node:assert/strict';
import {
  EJEMPLOS, MAPA, responder, errorDeUnaSalida, errorDeUnEjemplo, errorMedio, curvaDelError, barrido, DESAFIO, avanceHacia,
} from '../src/teoria/capitulos/error/cuenta.js';

const cerca = (a, b, tol = 1e-9) => Math.abs(a - b) < tol;

test('error: la salida suave es la sigmoide de la suma y el escalón decide del mismo lado', () => {
  const r = responder({ pesos: [1, -1], sesgo: 0 }, [0.8, 0.3]);
  assert.ok(cerca(r.suma, 0.5));
  assert.ok(cerca(r.salida, 1 / (1 + Math.exp(-0.5))));
  assert.equal(r.escalon, 1);
  assert.equal(responder({ pesos: [0, 0], sesgo: 0 }, [1, 1]).salida, 0.5);
});

test('error: el error de un ejemplo es la entropía cruzada de la app', () => {
  assert.ok(cerca(errorDeUnaSalida(0.5, 1), Math.log(2)));
  assert.ok(cerca(errorDeUnaSalida(0.9, 1), -Math.log(0.9)));
  assert.ok(cerca(errorDeUnaSalida(0.9, 0), -Math.log(0.1)));
  // Predicción posible del tramo 4: equivocarse con seguridad cuesta más que equivocarse dudando.
  assert.ok(errorDeUnaSalida(0.05, 1) > errorDeUnaSalida(0.4, 1));
  const e = errorDeUnEjemplo({ pesos: [1, -1], sesgo: 0 }, { inputs: [0.8, 0.3], targets: [1] });
  assert.ok(cerca(e.diferencia, e.salida - 1));
  assert.ok(cerca(e.error, -Math.log(e.salida)));
  assert.equal(e.acierta, true);
});

test('error: el error medio de los ejemplos y sus aciertos', () => {
  assert.equal(EJEMPLOS.length, 8);
  const cero = errorMedio({ pesos: [0, 0], sesgo: 0 });
  assert.ok(cerca(cero.medio, Math.log(2)), 'sin pesos todo da 0,5: log 2');
  assert.equal(cero.aciertos, 0, 'exactamente 0,5 no es acierto');
  const fondo = errorMedio({ pesos: [4.3, -4.65], sesgo: 0 });
  assert.ok(cerca(fondo.medio, 0.5208, 1e-3));
  assert.equal(fondo.aciertos, 6, 'los dos ejemplos con ruido quedan mal');
  assert.throws(() => errorMedio({ pesos: [0, 0], sesgo: 0 }, []), RangeError);
});

test('error: la curva del error contra un peso tiene su fondo dentro del mapa', () => {
  const curva = curvaDelError({ pesos: [0, -4.65], sesgo: 0 });
  assert.equal(curva.length, 121);
  assert.deepEqual([curva[0].peso, curva.at(-1).peso], [MAPA.desde, MAPA.hasta]);
  const fondo = curva.reduce((a, b) => (b.error < a.error ? b : a));
  assert.equal(fondo.peso, 4.3);
  // Baja hasta el fondo y sube después.
  const i = curva.indexOf(fondo);
  for (let k = 1; k <= i; k++) assert.ok(curva[k].error < curva[k - 1].error, `baja en ${curva[k].peso}`);
  for (let k = i + 1; k < curva.length; k++) assert.ok(curva[k].error > curva[k - 1].error, `sube en ${curva[k].peso}`);
  assert.deepEqual(barrido({ desde: 0, hasta: 0.3, paso: 0.1 }), [0, 0.1, 0.2, 0.3]);
});

test('error: el desafío arranca alto y tiene una solución conocida', () => {
  assert.ok(errorMedio(DESAFIO.inicio).medio > DESAFIO.meta);
  assert.ok(errorMedio(DESAFIO.solucion).medio < DESAFIO.meta);
});

test('error: el avance del desafío va por tramos y solo se completa por debajo de la meta', () => {
  const camino = { inicio: 1, meta: 0.6 };
  assert.deepEqual(avanceHacia(1, camino), { bien: 0, total: 4 });
  assert.deepEqual(avanceHacia(1.4, camino), { bien: 0, total: 4 }, 'si sube, no avanza');
  assert.deepEqual(avanceHacia(0.89, camino), { bien: 1, total: 4 });
  assert.deepEqual(avanceHacia(0.75, camino), { bien: 2, total: 4 });
  assert.deepEqual(avanceHacia(0.6, camino), { bien: 3, total: 4 }, 'justo en la meta todavía falta');
  assert.deepEqual(avanceHacia(0.59, camino), { bien: 4, total: 4 });
  assert.equal(avanceHacia(0.59, { ...camino, marcas: 5 }).bien, 5);
  assert.throws(() => avanceHacia(1, { inicio: 0.5, meta: 0.6 }), RangeError);
  // El desafío del capítulo: arranca en 0 de 4 y su solución conocida lo completa.
  const con = (v) => avanceHacia(errorMedio(v).medio, { inicio: errorMedio(DESAFIO.inicio).medio, meta: DESAFIO.meta });
  assert.equal(con(DESAFIO.inicio).bien, 0);
  assert.deepEqual(con(DESAFIO.solucion), { bien: 4, total: 4 });
});

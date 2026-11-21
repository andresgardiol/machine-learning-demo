// Cuenta de «Corregir un poco cada vez» (seccion-teoria D12, capítulo 5; tarea 13.1). Cuentas
// deterministas de pasos de corrección: ninguna prueba mide si algo aprende.
import test from 'node:test';
import assert from 'node:assert/strict';
import { pendiente, unPaso, trayectoria, mapaDelError, ESCENAS } from '../src/teoria/capitulos/corregir/cuenta.js';
import { errorMedio } from '../src/teoria/capitulos/error/cuenta.js';

const FONDO = 4.3; // fondo de la curva de ESCENAS.curva (w2 = −4,65, sesgo 0)

test('corregir: la pendiente es la de la curva del error', () => {
  const v = { pesos: [1, -2], sesgo: 0 };
  const p = pendiente(v);
  const h = 1e-5;
  for (const i of [0, 1]) {
    const mas = { ...v, pesos: v.pesos.map((w, k) => (k === i ? w + h : w)) };
    const menos = { ...v, pesos: v.pesos.map((w, k) => (k === i ? w - h : w)) };
    const numerica = (errorMedio(mas).medio - errorMedio(menos).medio) / (2 * h);
    assert.ok(Math.abs(p.pesos[i] - numerica) < 1e-6, `peso ${i}`);
  }
});

test('corregir: un paso va en contra de la pendiente, por la tasa, y no mueve lo que no se pide', () => {
  const v = { pesos: [-2, -4.65], sesgo: 0 };
  const paso = unPaso(v, 4, { mover: [0] });
  assert.ok(paso.pendiente.pesos[0] < 0, 'a la izquierda del fondo la curva baja');
  assert.ok(Math.abs(paso.despues.pesos[0] - (-2 - 4 * paso.pendiente.pesos[0])) < 1e-12);
  assert.equal(paso.despues.pesos[1], -4.65);
  assert.equal(paso.despues.sesgo, 0);
  assert.ok(paso.error.despues < paso.error.antes);
  assert.deepEqual(unPaso(v, 0).despues, v, 'con tasa 0 no se mueve');
  assert.throws(() => unPaso(v, -1), RangeError);
});

test('corregir: con tasa chica baja de a poco sin pasarse del fondo', () => {
  const { inicio, mover, tasas } = ESCENAS.curva;
  const t = trayectoria(inicio, tasas.chica, 8, { mover });
  for (let k = 1; k < t.length; k++) {
    assert.ok(t[k].error < t[k - 1].error, `paso ${k}`);
    assert.ok(t[k].pesos[0] > t[k - 1].pesos[0] && t[k].pesos[0] < FONDO, `paso ${k}`);
  }
});

test('corregir: con tasa alta el primer paso se pasa del fondo de largo y después vuelve', () => {
  const { inicio, mover, tasas } = ESCENAS.curva;
  const t = trayectoria(inicio, tasas.alta, 4, { mover });
  assert.ok(t[1].pesos[0] > FONDO + 4, `se pasó a ${t[1].pesos[0]}`);
  assert.ok(Math.abs(t[2].pesos[0] - FONDO) < 0.1, 'el segundo paso vuelve cerca del fondo');
});

test('corregir: con tasa muy alta rebota de un lado al otro, cada vez más lejos', () => {
  const { inicio, mover, tasas } = ESCENAS.curva;
  const t = trayectoria(inicio, tasas.muyAlta, 8, { mover });
  const lado = t.map((p) => Math.sign(p.pesos[0] - FONDO));
  for (let k = 3; k < t.length; k++) assert.notEqual(lado[k], lado[k - 1], `paso ${k} cambia de lado`);
  const lejos = t.map((p) => Math.abs(p.pesos[0] - FONDO));
  for (let k = 4; k < t.length; k++) assert.ok(lejos[k] > lejos[k - 2], `paso ${k} más lejos que dos pasos antes`);
  assert.ok(t.at(-1).error > t[2].error, 'el error sube');
});

test('corregir: el mapa del error y su fondo', () => {
  const m = mapaDelError({ n: 25 });
  assert.equal(m.ejes.length, 25);
  assert.deepEqual([m.ejes[0], m.ejes.at(-1)], [-6, 6]);
  assert.deepEqual(m.minimo.pesos, [4.5, -5]);
  // Fila 0 arriba: w2 = 6. La esquina de abajo a la derecha es (6, −6).
  assert.equal(m.valores[0][0], errorMedio({ pesos: [-6, 6], sesgo: 0 }).medio);
  assert.equal(m.valores[24][24], errorMedio({ pesos: [6, -6], sesgo: 0 }).medio);
});

test('corregir: el desafío tiene una solución conocida y no se resuelve con cualquier tasa', () => {
  const { inicio, pasos, meta, solucion } = ESCENAS.desafio;
  assert.ok(errorMedio(inicio).medio > meta);
  assert.ok(trayectoria(inicio, solucion.tasa, pasos).at(-1).error < meta);
  assert.ok(trayectoria(inicio, 6, pasos).at(-1).error > meta);
  assert.ok(trayectoria(inicio, 1, pasos).at(-1).error > meta);
});

test('corregir: mismo punto de partida, mismo camino', () => {
  assert.deepEqual(trayectoria(ESCENAS.desafio.inicio, 8, 10), trayectoria(ESCENAS.desafio.inicio, 8, 10));
});

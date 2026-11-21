// Estado de la figura por tramo (seccion-teoria D4, tarea 2.1): entrar, cambiar, volver y restablecer.
import test from 'node:test';
import assert from 'node:assert/strict';
import { crearEstadoPorTramo } from '../src/teoria/estado-figura.js';
import { TRAMOS } from '../src/teoria/capitulos/neurona/guion.js';

const nuevo = () => crearEstadoPorTramo(TRAMOS.map((t) => t.estado));
const guion = (i) => structuredClone(TRAMOS[i].estado);

test('estado: al entrar a un tramo sin tocar, la figura muestra el estado del guion', () => {
  const e = nuevo();
  assert.equal(e.total, TRAMOS.length);
  TRAMOS.forEach((t, i) => assert.deepEqual(e.entrar(i), { estado: guion(i), cambiado: false }, t.id));
});

test('estado: lo cambiado en un tramo queda en ese tramo y no pasa a otro', () => {
  const e = nuevo();
  // Tramo 2 (índice 1): la persona mueve el peso izquierdo.
  const r = e.cambiar(1, { pesos: [2, -1] });
  assert.equal(r.cambiado, true);
  assert.deepEqual(r.estado, { ...guion(1), pesos: [2, -1] });
  // Desplaza un poco sin salir del tramo: sigue igual.
  assert.deepEqual(e.entrar(1).estado.pesos, [2, -1]);
  // Pasa al tramo 3: los valores del tramo 3, sin aviso.
  assert.deepEqual(e.entrar(2), { estado: guion(2), cambiado: false });
  // Vuelve al tramo 2: como lo había dejado, con aviso.
  assert.deepEqual(e.entrar(1), { estado: { ...guion(1), pesos: [2, -1] }, cambiado: true });
  assert.deepEqual(TRAMOS.map((_, i) => e.cambiado(i)), [false, true, false, false, false, false]);
});

test('estado: cada cambio se suma a lo que ya había en el tramo', () => {
  const e = nuevo();
  e.cambiar(2, { pesos: [0.5, -1] });
  e.cambiar(2, { sesgo: -0.4 });
  e.cambiar(2, { vista: 'sesgo', entradas: [0.1, 0.2], pesos: [0.5, -1], sesgo: -0.4 });
  assert.deepEqual(e.entrar(2).estado, { vista: 'sesgo', entradas: [0.1, 0.2], pesos: [0.5, -1], sesgo: -0.4 });
});

test('estado: restablecer devuelve el tramo al guion y apaga el aviso', () => {
  const e = nuevo();
  e.cambiar(1, { pesos: [2, -1] });
  e.cambiar(2, { sesgo: 1 });
  assert.deepEqual(e.restablecer(1), { estado: guion(1), cambiado: false });
  assert.equal(e.cambiado(1), false);
  assert.equal(e.cambiado(2), true, 'restablecer un tramo no toca los otros');
});

test('estado: volver a mano a los valores del guion cuenta como sin cambios', () => {
  const e = nuevo();
  e.cambiar(1, { pesos: [2, -1] });
  assert.equal(e.cambiar(1, { pesos: [1, -1] }).cambiado, false);
});

test('estado: lo que se devuelve es una copia; el guion no se toca', () => {
  const e = nuevo();
  const { estado } = e.entrar(0);
  estado.pesos[0] = 99;
  assert.deepEqual(e.entrar(0).estado, guion(0));
  const valores = { pesos: [2, -1] };
  e.cambiar(0, valores);
  valores.pesos[0] = 7;
  assert.deepEqual(e.entrar(0).estado.pesos, [2, -1]);
});

test('estado: la predicción cambia la base del tramo y olvida sus cambios', () => {
  const e = nuevo();
  const i = TRAMOS.findIndex((t) => t.prediccion);
  e.cambiar(i, { sesgo: 1 });
  assert.deepEqual(e.fijarBase(i, TRAMOS[i].prediccion.despues), { estado: structuredClone(TRAMOS[i].prediccion.despues), cambiado: false });
  assert.deepEqual(e.base(i), structuredClone(TRAMOS[i].prediccion.despues));
  e.cambiar(i, { sesgo: 0 });
  assert.deepEqual(e.restablecer(i).estado, structuredClone(TRAMOS[i].prediccion.despues));
});

test('estado: un tramo que no existe es un error', () => {
  const e = nuevo();
  for (const i of [-1, TRAMOS.length, 1.5, '1', undefined]) {
    assert.throws(() => e.entrar(i), RangeError, String(i));
    assert.throws(() => e.cambiar(i, {}), RangeError, String(i));
  }
  assert.throws(() => crearEstadoPorTramo([]), TypeError);
});

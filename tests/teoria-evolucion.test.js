// Cuenta de «Aprender por evolución» (seccion-teoria D12, capítulo 7; tarea 15.1). Cuentas con semilla:
// ninguna prueba mide si la población mejora en general; el desafío se comprueba con su solución.
import test from 'node:test';
import assert from 'node:assert/strict';
import {
  POBLACION, ESCALA, poblacionAlAzar, puntuar, siguienteGeneracion, pesosDe, individuo, DESAFIO,
} from '../src/teoria/capitulos/evolucion/cuenta.js';
import { errorMedio, MAPA } from '../src/teoria/capitulos/error/cuenta.js';

const pesosDeTodos = (p) => p.map((ind) => pesosDe(ind));

test('evolución: doce neuronas al azar, con semilla, dentro del mapa y con el sesgo fijo', () => {
  const p = poblacionAlAzar();
  assert.equal(p.length, POBLACION);
  assert.equal(ESCALA, MAPA.hasta);
  for (const ind of p) {
    for (const w of pesosDe(ind)) assert.ok(w >= MAPA.desde && w <= MAPA.hasta);
    assert.equal(ind.layers[0].biases[0], 0);
  }
  assert.deepEqual(pesosDeTodos(poblacionAlAzar()), pesosDeTodos(p), 'misma semilla, mismas neuronas');
  assert.notDeepEqual(pesosDeTodos(poblacionAlAzar({ tanda: 1 })), pesosDeTodos(p), 'otra tanda, otras');
});

test('evolución: el puntaje es menos el error medio, y el orden va de mejor a peor', () => {
  const p = poblacionAlAzar();
  const { puntajes, orden } = puntuar(p);
  for (const x of puntajes) assert.equal(x.fitness, -errorMedio({ pesos: x.pesos, sesgo: 0 }).medio);
  for (let k = 1; k < orden.length; k++) assert.ok(puntajes[orden[k - 1]].fitness >= puntajes[orden[k]].fitness);
  assert.deepEqual(pesosDe(individuo([3, -3])), [3, -3]);
});

test('evolución: con fuerza 0 la generación siguiente no cambia: cada hijo es copia de un padre', () => {
  const p = poblacionAlAzar();
  const { poblacion: hijos, padres, elite } = siguienteGeneracion(p, { padres: 3, fuerza: 0 });
  assert.equal(hijos.length, POBLACION);
  assert.equal(padres.length, 3);
  assert.deepEqual(elite, [0]);
  const deLosPadres = padres.map((i) => JSON.stringify(pesosDe(p[i])));
  for (const h of hijos) assert.ok(deLosPadres.includes(JSON.stringify(pesosDe(h))), 'ningún valor nuevo');
  // Con mutación, aparecen valores nuevos, siempre dentro del mapa y con el sesgo fijo.
  const mutados = siguienteGeneracion(p, { padres: 3, fuerza: 30 }).poblacion;
  assert.ok(mutados.slice(1).some((h) => !deLosPadres.includes(JSON.stringify(pesosDe(h)))));
  for (const h of mutados) {
    assert.equal(h.layers[0].biases[0], 0);
    for (const w of pesosDe(h)) assert.ok(w >= MAPA.desde && w <= MAPA.hasta);
  }
});

test('evolución: los padres elegidos a mano son los que pasan', () => {
  const p = poblacionAlAzar();
  const r = siguienteGeneracion(p, { elegidos: [5, 2], fuerza: 0, elite: 1 });
  assert.deepEqual(r.padres, [5, 2]);
  assert.deepEqual(pesosDe(r.poblacion[0]), pesosDe(p[5]), 'la élite es el primero elegido');
  assert.throws(() => siguienteGeneracion(p, { elegidos: [] }), RangeError);
  assert.throws(() => siguienteGeneracion(p, { elegidos: [1, 1] }), RangeError);
  assert.throws(() => siguienteGeneracion(p, { elegidos: [0, 1, 2, 3, 4, 5, 6] }), RangeError);
});

test('evolución: misma semilla y misma generación, mismo resultado', () => {
  const p = poblacionAlAzar();
  const a = siguienteGeneracion(p, { padres: 3, fuerza: 30, generacion: 2 });
  const b = siguienteGeneracion(p, { padres: 3, fuerza: 30, generacion: 2 });
  assert.deepEqual(pesosDeTodos(a.poblacion), pesosDeTodos(b.poblacion));
});

test('evolución: el desafío tiene una solución conocida', () => {
  const mejor = (p) => Math.min(...puntuar(p).puntajes.map((x) => x.error));
  let p = poblacionAlAzar();
  assert.ok(mejor(p) > DESAFIO.meta, 'la primera tanda no lo resuelve');
  const { padres, fuerza, elite } = DESAFIO.solucion;
  for (let g = 1; g <= DESAFIO.generaciones; g++) {
    const elegidos = puntuar(p).orden.slice(0, padres);
    p = siguienteGeneracion(p, { elegidos, fuerza, elite, generacion: g }).poblacion;
  }
  assert.ok(mejor(p) < DESAFIO.meta);
});

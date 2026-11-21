// Direcciones de la teoría (seccion-teoria D1, tarea 1.4).
import test from 'node:test';
import assert from 'node:assert/strict';
import { leerRuta, direccionDe, mismaVista, PORTADA } from '../src/teoria/rutas.js';
import { CAPITULOS } from '../src/teoria/capitulos/indice.js';

test('rutas: portada, historia, capítulo y tramo', () => {
  assert.deepEqual(leerRuta(''), PORTADA);
  assert.deepEqual(leerRuta('#'), PORTADA);
  assert.deepEqual(leerRuta('#historia'), { vista: 'historia', tramo: 1 });
  assert.deepEqual(leerRuta('#historia/4'), { vista: 'historia', tramo: 4 });
  assert.deepEqual(leerRuta('#neurona'), { vista: 'capitulo', id: 'neurona', tramo: 1 });
  assert.deepEqual(leerRuta('neurona'), { vista: 'capitulo', id: 'neurona', tramo: 1 }, 'sin el #');
  assert.deepEqual(leerRuta('#neurona/3'), { vista: 'capitulo', id: 'neurona', tramo: 3 });
});

test('rutas: una dirección desconocida es la portada', () => {
  for (const hash of ['#nada', '#Neurona', '#neurona/0', '#neurona/-1', '#neurona/3/2', '#neurona/tres',
    '#neurona/', '#neurona/1.5', '#historia/x', '#/neurona', '#%E0%A4%A', '#neurona/9999']) {
    assert.deepEqual(leerRuta(hash), PORTADA, hash);
  }
});

test('rutas: un capítulo que todavía no se puede abrir es la portada', () => {
  for (const cap of CAPITULOS.filter((c) => !c.disponible)) {
    assert.deepEqual(leerRuta(`#${cap.id}`), PORTADA, cap.id);
    assert.deepEqual(leerRuta(`#${cap.id}/2`), PORTADA, cap.id);
  }
  // Cuando esté disponible, la misma dirección lo abre.
  assert.deepEqual(leerRuta('#xor/2', { disponibles: ['neurona', 'xor'] }), { vista: 'capitulo', id: 'xor', tramo: 2 });
});

test('rutas: la dirección de cada ruta, ida y vuelta', () => {
  assert.equal(direccionDe(PORTADA), '');
  assert.equal(direccionDe({ vista: 'historia', tramo: 1 }), '#historia');
  assert.equal(direccionDe({ vista: 'historia', tramo: 2 }), '#historia/2');
  assert.equal(direccionDe({ vista: 'capitulo', id: 'neurona', tramo: 1 }), '#neurona');
  assert.equal(direccionDe({ vista: 'capitulo', id: 'neurona', tramo: 3 }), '#neurona/3');
  for (const hash of ['#historia', '#historia/5', '#neurona', '#neurona/6']) assert.equal(direccionDe(leerRuta(hash)), hash);
  assert.equal(direccionDe(leerRuta('#neurona/1')), '#neurona');
});

test('rutas: misma vista en otro tramo', () => {
  assert.ok(mismaVista(leerRuta('#neurona'), leerRuta('#neurona/4')));
  assert.ok(mismaVista(leerRuta('#historia'), leerRuta('#historia/2')));
  assert.ok(!mismaVista(leerRuta('#neurona'), leerRuta('#historia')));
  assert.ok(!mismaVista(leerRuta('#xor', { disponibles: ['xor'] }), leerRuta('#neurona')));
});

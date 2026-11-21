// "Seguir leyendo" y la portada (seccion-teoria; tareas 19.1 a 19.3): qué sigue en el temario sale del
// índice, y los textos del bloque y de la portada están en los dos idiomas.
import test from 'node:test';
import assert from 'node:assert/strict';
import { CAPITULOS, siguienteDe } from '../src/teoria/capitulos/indice.js';
import { direccionDe, leerRuta } from '../src/teoria/rutas.js';
import es from '../src/teoria/contenido/es/comun.js';
import en from '../src/teoria/contenido/en/comun.js';

const texto = (v) => typeof v === 'string' && v.trim().length > 0;

test('seguir: desde la historia se empieza por el capítulo 0, y de cada capítulo se pasa al siguiente', () => {
  assert.equal(siguienteDe('historia').id, CAPITULOS[0].id);
  assert.equal(siguienteDe('historia').numero, 0);
  CAPITULOS.forEach((c, i) => {
    const sigue = siguienteDe(c.id);
    if (i === CAPITULOS.length - 1) assert.equal(sigue, null, 'el último capítulo no tiene siguiente');
    else assert.equal(sigue.id, CAPITULOS[i + 1].id, c.id);
  });
  // Lo que pide la spec: al terminar el capítulo 3, "Siguiente: 4. Medir el error".
  const tras3 = siguienteDe(CAPITULOS.find((c) => c.numero === 3).id);
  assert.deepEqual([tras3.numero, es.capitulos[tras3.id].titulo], [4, 'Medir el error']);
  assert.equal(siguienteDe('nada'), null);
});

test('seguir: lo que sigue se puede abrir, y su dirección es la del capítulo', () => {
  for (const desde of ['historia', ...CAPITULOS.map((c) => c.id)]) {
    const sigue = siguienteDe(desde);
    if (!sigue) continue;
    assert.equal(sigue.disponible, true, desde);
    const direccion = direccionDe({ vista: 'capitulo', id: sigue.id, tramo: 1 });
    assert.deepEqual(leerRuta(direccion), { vista: 'capitulo', id: sigue.id, tramo: 1 }, desde);
  }
});

test('seguir: los textos del bloque y de la portada, en los dos idiomas', () => {
  for (const [idioma, c] of [['es', es], ['en', en]]) {
    for (const k of ['rotulo', 'siguiente', 'empezar', 'capitulo', 'temario']) assert.ok(texto(c.seguir[k]), `${idioma}: seguir.${k}`);
    assert.match(c.seguir.capitulo, /\{n\}.*\{titulo\}/, idioma);
    // Cada capítulo que puede ser "siguiente" tiene título y frase.
    for (const cap of CAPITULOS) assert.ok(texto(c.capitulos[cap.id].titulo) && texto(c.capitulos[cap.id].frase), `${idioma}: ${cap.id}`);
    // La portada dice de qué teoría se trata; el enlace de la barra sigue siendo corto.
    assert.ok(texto(c.portada.sobre) && texto(c.portada.vieneDeAca), idioma);
    assert.ok(c.portada.titulo.split(' ').length >= 4, `${idioma}: el título dice más que "Teoría"`);
    assert.ok(c.comun.volver.length <= 8, `${idioma}: el enlace de vuelta es corto`);
  }
  assert.equal(es.portada.titulo, 'La teoría detrás de la práctica');
  assert.equal(en.portada.titulo, 'The theory behind the practice');
});
